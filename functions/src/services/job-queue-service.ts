import Bull from 'bull';
import { preflightEngine } from '../../../src/lib/pdf-preflight-engine';
import { autoFixEngine } from '../../../src/lib/pdf-autofix-engine';
import { emailService } from './email-notification-service';
import * as admin from 'firebase-admin';

// Types
export interface JobData {
    jobId: string;
    fileName: string;
    fileUrl: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    autoFix: boolean;
    notifyOnComplete: boolean;
}

export interface PreflightJobData extends JobData {
    type: 'preflight';
}

export interface AutoFixJobData extends JobData {
    type: 'autofix';
    preflightReport: any;
}

export interface ProofGenerationJobData extends JobData {
    type: 'proof-generation';
    pdfBytes: Uint8Array;
}

export interface EmailJobData {
    type: 'email';
    emailType: 'proof-ready' | 'reminder' | 'issue-alert' | 'revision' | 'approval';
    data: any;
}

export class JobQueueService {
    private preflightQueue: Bull.Queue<PreflightJobData>;
    private autoFixQueue: Bull.Queue<AutoFixJobData>;
    private proofQueue: Bull.Queue<ProofGenerationJobData>;
    private emailQueue: Bull.Queue<EmailJobData>;
    private db = admin.firestore();

    constructor(redisUrl: string = 'redis://localhost:6379') {
        // Initialize queues
        this.preflightQueue = new Bull('preflight', redisUrl, {
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000
                },
                removeOnComplete: 100,
                removeOnFail: 50
            }
        });

        this.autoFixQueue = new Bull('autofix', redisUrl, {
            defaultJobOptions: {
                attempts: 2,
                backoff: {
                    type: 'exponential',
                    delay: 3000
                }
            }
        });

        this.proofQueue = new Bull('proof-generation', redisUrl, {
            defaultJobOptions: {
                attempts: 2,
                timeout: 60000 // 1 minute timeout
            }
        });

        this.emailQueue = new Bull('email', redisUrl, {
            defaultJobOptions: {
                attempts: 5,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                }
            }
        });

        // Set up processors
        this.setupProcessors();

        // Set up event listeners
        this.setupEventListeners();

        console.log('✅ Job queue service initialized');
    }

    /**
     * Set up job processors
     */
    private setupProcessors() {
        // Preflight processor
        this.preflightQueue.process(async (job) => {
            console.log(`🔍 Processing preflight job: ${job.data.jobId}`);

            try {
                // Update job status
                await this.updateJobStatus(job.data.jobId, 'analyzing');

                // Download PDF
                const pdfBytes = await this.downloadFile(job.data.fileUrl);

                // Load PDF
                await preflightEngine.loadPDF(pdfBytes.buffer);

                // Run analysis
                const report = await preflightEngine.analyze(job.data.fileName);

                // Save report to Firestore
                await this.db.collection('preflightReports').doc(job.data.jobId).set({
                    ...report,
                    jobId: job.data.jobId,
                    customerId: job.data.customerId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // Update job status
                await this.updateJobStatus(job.data.jobId, 'analyzed', { reportId: job.data.jobId });

                // If auto-fix is enabled and there are fixable issues
                if (job.data.autoFix && report.issues.some(i => i.autoFixable)) {
                    await this.queueAutoFix({
                        ...job.data,
                        type: 'autofix',
                        preflightReport: report
                    });
                }

                // Send notification if issues found
                if (report.issues.length > 0) {
                    await this.queueEmail({
                        type: 'email',
                        emailType: 'issue-alert',
                        data: {
                            customerName: job.data.customerName,
                            customerEmail: job.data.customerEmail,
                            jobName: job.data.fileName,
                            issues: report.issues.slice(0, 5), // Top 5 issues
                            fixRecommendations: report.issues
                                .filter(i => i.autoFixable)
                                .map(i => i.recommendation)
                        }
                    });
                }

                return { success: true, report };
            } catch (error: any) {
                console.error('❌ Preflight job failed:', error);
                await this.updateJobStatus(job.data.jobId, 'failed', { error: error.message });
                throw error;
            }
        });

        // Auto-fix processor
        this.autoFixQueue.process(async (job) => {
            console.log(`🔧 Processing auto-fix job: ${job.data.jobId}`);

            try {
                await this.updateJobStatus(job.data.jobId, 'fixing');

                // Download PDF
                const pdfBytes = await this.downloadFile(job.data.fileUrl);

                // Load PDF
                await autoFixEngine.loadPDF(pdfBytes);

                // Apply auto-fixes
                const result = await autoFixEngine.autoFix(job.data.preflightReport);

                // Upload fixed PDF
                const fixedUrl = await this.uploadFile(
                    result.pdfBytes,
                    `fixed/${job.data.jobId}_fixed.pdf`
                );

                // Save fix report
                await this.db.collection('autoFixReports').doc(job.data.jobId).set({
                    jobId: job.data.jobId,
                    fixedIssues: result.fixedIssues,
                    remainingIssues: result.remainingIssues,
                    fixedFileUrl: fixedUrl,
                    report: result.report,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                await this.updateJobStatus(job.data.jobId, 'fixed', { fixedUrl });

                // Queue proof generation
                await this.queueProofGeneration({
                    ...job.data,
                    type: 'proof-generation',
                    pdfBytes: result.pdfBytes,
                    fileUrl: fixedUrl
                });

                return { success: true, result };
            } catch (error: any) {
                console.error('❌ Auto-fix job failed:', error);
                await this.updateJobStatus(job.data.jobId, 'fix-failed', { error: error.message });
                throw error;
            }
        });

        // Proof generation processor
        this.proofQueue.process(async (job) => {
            console.log(`📄 Processing proof generation: ${job.data.jobId}`);

            try {
                await this.updateJobStatus(job.data.jobId, 'generating-proof');

                // Generate high-res proof images (simplified)
                const proofUrl = job.data.fileUrl; // In production, generate preview images

                // Create proof record
                await this.db.collection('proofs').doc(job.data.jobId).set({
                    jobId: job.data.jobId,
                    customerId: job.data.customerId,
                    fileName: job.data.fileName,
                    proofUrl,
                    status: 'pending-approval',
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                await this.updateJobStatus(job.data.jobId, 'proof-ready', { proofUrl });

                // Send proof ready notification
                if (job.data.notifyOnComplete) {
                    await this.queueEmail({
                        type: 'email',
                        emailType: 'proof-ready',
                        data: {
                            customerName: job.data.customerName,
                            customerEmail: job.data.customerEmail,
                            jobName: job.data.fileName,
                            proofUrl: `${process.env.FRONTEND_URL}/proof/${job.data.jobId}`
                        }
                    });
                }

                return { success: true, proofUrl };
            } catch (error: any) {
                console.error('❌ Proof generation failed:', error);
                await this.updateJobStatus(job.data.jobId, 'proof-failed', { error: error.message });
                throw error;
            }
        });

        // Email processor
        this.emailQueue.process(async (job) => {
            console.log(`📧 Processing email: ${job.data.emailType}`);

            try {
                switch (job.data.emailType) {
                    case 'proof-ready':
                        await emailService.sendProofReadyNotification(job.data.data);
                        break;
                    case 'reminder':
                        await emailService.sendReminderNotification(job.data.data);
                        break;
                    case 'issue-alert':
                        await emailService.sendIssueAlert(job.data.data);
                        break;
                    case 'revision':
                        await emailService.sendRevisionNotification(job.data.data);
                        break;
                    case 'approval':
                        await emailService.sendApprovalConfirmation(job.data.data);
                        break;
                }

                return { success: true };
            } catch (error: any) {
                console.error('❌ Email job failed:', error);
                throw error;
            }
        });
    }

    /**
     * Set up event listeners
     */
    private setupEventListeners() {
        // Preflight queue events
        this.preflightQueue.on('completed', (job, result) => {
            console.log(`✅ Preflight job completed: ${job.data.jobId}`);
        });

        this.preflightQueue.on('failed', (job, error) => {
            console.error(`❌ Preflight job failed: ${job?.data.jobId}`, error);
        });

        // Auto-fix queue events
        this.autoFixQueue.on('completed', (job, result) => {
            console.log(`✅ Auto-fix job completed: ${job.data.jobId}`);
        });

        this.autoFixQueue.on('failed', (job, error) => {
            console.error(`❌ Auto-fix job failed: ${job?.data.jobId}`, error);
        });

        // Email queue events
        this.emailQueue.on('completed', (job) => {
            console.log(`✅ Email sent: ${job.data.emailType}`);
        });

        this.emailQueue.on('failed', (job, error) => {
            console.error(`❌ Email failed: ${job?.data.emailType}`, error);
        });
    }

    /**
     * Queue preflight analysis
     */
    async queuePreflight(data: PreflightJobData): Promise<Bull.Job<PreflightJobData>> {
        const priority = this.getPriorityValue(data.priority);

        return await this.preflightQueue.add(data, {
            priority,
            jobId: data.jobId
        });
    }

    /**
     * Queue auto-fix
     */
    async queueAutoFix(data: AutoFixJobData): Promise<Bull.Job<AutoFixJobData>> {
        const priority = this.getPriorityValue(data.priority);

        return await this.autoFixQueue.add(data, {
            priority,
            jobId: data.jobId
        });
    }

    /**
     * Queue proof generation
     */
    async queueProofGeneration(data: ProofGenerationJobData): Promise<Bull.Job<ProofGenerationJobData>> {
        const priority = this.getPriorityValue(data.priority);

        return await this.proofQueue.add(data, {
            priority,
            jobId: data.jobId
        });
    }

    /**
     * Queue email
     */
    async queueEmail(data: EmailJobData): Promise<Bull.Job<EmailJobData>> {
        return await this.emailQueue.add(data);
    }

    /**
     * Get priority value
     */
    private getPriorityValue(priority: string): number {
        const priorities: Record<string, number> = {
            urgent: 1,
            high: 2,
            medium: 3,
            low: 4
        };
        return priorities[priority] || 3;
    }

    /**
     * Update job status in Firestore
     */
    private async updateJobStatus(jobId: string, status: string, data: any = {}): Promise<void> {
        await this.db.collection('jobs').doc(jobId).update({
            status,
            ...data,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    /**
     * Download file from URL
     */
    private async downloadFile(url: string): Promise<Uint8Array> {
        // In production, download from Firebase Storage or S3
        // For now, return placeholder
        return new Uint8Array();
    }

    /**
     * Upload file to storage
     */
    private async uploadFile(bytes: Uint8Array, path: string): Promise<string> {
        // In production, upload to Firebase Storage or S3
        // For now, return placeholder URL
        return `https://storage.example.com/${path}`;
    }

    /**
     * Get queue statistics
     */
    async getQueueStats(): Promise<any> {
        const [
            preflightCounts,
            autoFixCounts,
            proofCounts,
            emailCounts
        ] = await Promise.all([
            this.preflightQueue.getJobCounts(),
            this.autoFixQueue.getJobCounts(),
            this.proofQueue.getJobCounts(),
            this.emailQueue.getJobCounts()
        ]);

        return {
            preflight: preflightCounts,
            autoFix: autoFixCounts,
            proof: proofCounts,
            email: emailCounts
        };
    }

    /**
     * Pause queue
     */
    async pauseQueue(queueName: string): Promise<void> {
        const queue = this.getQueue(queueName);
        await queue.pause();
        console.log(`⏸️ Queue paused: ${queueName}`);
    }

    /**
     * Resume queue
     */
    async resumeQueue(queueName: string): Promise<void> {
        const queue = this.getQueue(queueName);
        await queue.resume();
        console.log(`▶️ Queue resumed: ${queueName}`);
    }

    /**
     * Get queue by name
     */
    private getQueue(name: string): Bull.Queue {
        switch (name) {
            case 'preflight':
                return this.preflightQueue;
            case 'autofix':
                return this.autoFixQueue;
            case 'proof':
                return this.proofQueue;
            case 'email':
                return this.emailQueue;
            default:
                throw new Error(`Unknown queue: ${name}`);
        }
    }

    /**
     * Clean completed jobs
     */
    async cleanQueues(): Promise<void> {
        await Promise.all([
            this.preflightQueue.clean(24 * 3600 * 1000), // 24 hours
            this.autoFixQueue.clean(24 * 3600 * 1000),
            this.proofQueue.clean(24 * 3600 * 1000),
            this.emailQueue.clean(24 * 3600 * 1000)
        ]);
        console.log('🧹 Queues cleaned');
    }
}

// Export singleton
let queueService: JobQueueService | null = null;

export function initializeJobQueue(redisUrl?: string): JobQueueService {
    if (!queueService) {
        queueService = new JobQueueService(redisUrl);
    }
    return queueService;
}

export function getJobQueue(): JobQueueService {
    if (!queueService) {
        throw new Error('Job queue not initialized');
    }
    return queueService;
}
