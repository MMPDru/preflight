/**
 * Queue Worker
 * Background job processor for handling queued tasks
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {
    getJobQueueService,
    getNotificationService,
    getPdfAnalyzer,
    getPdfFixer,
    getEmailService
} from '../services/service-instances';
import type { QueueJob } from '../types/workflow-types';

export class QueueWorker {
    private isRunning = false;
    private pollInterval = 5000; // 5 seconds
    private maxConcurrent = 3;
    private currentJobs = 0;

    /**
     * Start the worker
     */
    async start(): Promise<void> {
        if (this.isRunning) {
            console.log('Worker already running');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Queue worker started');

        // Start polling loop
        this.poll();
    }

    /**
     * Stop the worker
     */
    stop(): void {
        this.isRunning = false;
        console.log('🛑 Queue worker stopped');
    }

    /**
     * Poll for jobs
     */
    private async poll(): Promise<void> {
        while (this.isRunning) {
            try {
                // Check if we can process more jobs
                if (this.currentJobs < this.maxConcurrent) {
                    const job = await getJobQueueService().getNextJob();

                    if (job) {
                        // Process job in background
                        this.processJob(job).catch(error => {
                            console.error(`Error processing job ${job.id}:`, error);
                        });
                    }
                }

                // Wait before next poll
                await this.sleep(this.pollInterval);
            } catch (error) {
                console.error('Error in worker poll loop:', error);
                await this.sleep(this.pollInterval);
            }
        }
    }

    /**
     * Process a single job
     */
    private async processJob(job: QueueJob): Promise<void> {
        this.currentJobs++;

        try {
            console.log(`📋 Processing job ${job.id} (${job.type})`);

            await getJobQueueService().startJob(job.id);

            // Route to appropriate handler
            switch (job.type) {
                case 'pdf-analysis':
                    await this.handlePdfAnalysis(job);
                    break;
                case 'pdf-fix':
                    await this.handlePdfFix(job);
                    break;
                case 'email':
                    await this.handleEmail(job);
                    break;
                case 'notification':
                    await this.handleNotification(job);
                    break;
                case 'file-processing':
                    await this.handleFileProcessing(job);
                    break;
                case 'report-generation':
                    await this.handleReportGeneration(job);
                    break;
                case 'backup':
                    await this.handleBackup(job);
                    break;
                case 'cleanup':
                    await this.handleCleanup(job);
                    break;
                default:
                    throw new Error(`Unknown job type: ${job.type}`);
            }

            await getJobQueueService().completeJob(job.id);
            console.log(`✅ Job ${job.id} completed`);
        } catch (error: any) {
            console.error(`❌ Job ${job.id} failed:`, error.message);
            await getJobQueueService().failJob(job.id, error, true);
        } finally {
            this.currentJobs--;
        }
    }

    /**
     * Handle PDF analysis job
     */
    private async handlePdfAnalysis(job: QueueJob): Promise<void> {
        const { fileBuffer, jobId } = job.payload;

        await getJobQueueService().updateProgress(job.id, 10, 'Loading PDF');

        const analysis = await getPdfAnalyzer().analyzeDocument(fileBuffer);

        await getJobQueueService().updateProgress(job.id, 90, 'Saving results');

        // Save analysis to Firestore
        await admin.firestore().collection('jobs').doc(jobId).update({
            analysis,
            analyzedAt: new Date(),
        });

        await getJobQueueService().updateProgress(job.id, 100, 'Complete');
    }

    /**
     * Handle PDF fix job
     */
    private async handlePdfFix(job: QueueJob): Promise<void> {
        const { fileBuffer, fixTypes, options, jobId } = job.payload;

        await getJobQueueService().updateProgress(job.id, 10, 'Loading PDF');

        const fixedBuffer = await getPdfFixer().processPdf(fileBuffer, fixTypes, options);

        await getJobQueueService().updateProgress(job.id, 70, 'Analyzing fixed PDF');

        const analysis = await getPdfAnalyzer().analyzeDocument(fixedBuffer);

        await getJobQueueService().updateProgress(job.id, 90, 'Uploading fixed PDF');

        // Upload to Firebase Storage
        const bucket = admin.storage().bucket();
        const fileName = `fixed/${jobId}_fixed.pdf`;
        const file = bucket.file(fileName);

        await file.save(fixedBuffer, {
            metadata: {
                contentType: 'application/pdf',
            },
        });

        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Update job
        await admin.firestore().collection('jobs').doc(jobId).update({
            fixedUrl: url,
            fixedAnalysis: analysis,
            fixedAt: new Date(),
        });

        await getJobQueueService().updateProgress(job.id, 100, 'Complete');
    }

    /**
     * Handle email job
     */
    private async handleEmail(job: QueueJob): Promise<void> {
        const { type, data } = job.payload;

        await getJobQueueService().updateProgress(job.id, 50, 'Sending email');

        switch (type) {
            case 'proof-ready':
                await getEmailService().sendProofReadyNotification(data);
                break;
            case 'reminder':
                await getEmailService().sendReminderNotification(data);
                break;
            case 'issue-alert':
                await getEmailService().sendIssueAlert(data);
                break;
            case 'revision':
                await getEmailService().sendRevisionNotification(data);
                break;
            case 'approval':
                await getEmailService().sendApprovalConfirmation(data);
                break;
            default:
                throw new Error(`Unknown email type: ${type}`);
        }

        await getJobQueueService().updateProgress(job.id, 100, 'Email sent');
    }

    /**
     * Handle notification job
     */
    private async handleNotification(job: QueueJob): Promise<void> {
        const { userId, type, title, message, options } = job.payload;

        await getJobQueueService().updateProgress(job.id, 50, 'Sending notification');

        await getNotificationService().sendNotification(userId, type, title, message, options);

        await getJobQueueService().updateProgress(job.id, 100, 'Notification sent');
    }

    /**
     * Handle file processing job
     */
    private async handleFileProcessing(job: QueueJob): Promise<void> {
        // Placeholder for file processing
        await getJobQueueService().startJob(job.id);
        await getJobQueueService().updateProgress(job.id, 50, 'Processing file');
        await this.sleep(1000);
        await getJobQueueService().completeJob(job.id, { message: 'File processed' });
    }

    /**
     * Handle report generation job
     */
    private async handleReportGeneration(job: QueueJob): Promise<void> {
        // Placeholder for report generation
        await getJobQueueService().updateProgress(job.id, 50, 'Generating report');
        await this.sleep(1000);
        await getJobQueueService().updateProgress(job.id, 100, 'Report generated');
    }

    /**
     * Handle backup job
     */
    private async handleBackup(job: QueueJob): Promise<void> {
        // Placeholder for backup
        await getJobQueueService().updateProgress(job.id, 50, 'Creating backup');
        await this.sleep(1000);
        await getJobQueueService().updateProgress(job.id, 100, 'Backup complete');
    }

    /**
     * Handle cleanup job
     */
    private async handleCleanup(job: QueueJob): Promise<void> {
        await getJobQueueService().updateProgress(job.id, 25, 'Cleaning old jobs');
        await getJobQueueService().cleanupOldJobs(30);

        await getJobQueueService().updateProgress(job.id, 50, 'Cleaning old notifications');
        await getNotificationService().cleanupOldNotifications(90);

        await getJobQueueService().updateProgress(job.id, 100, 'Cleanup complete');
    }

    /**
     * Sleep helper
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton
export const queueWorker = new QueueWorker();

// Note: Worker must be manually started via queueWorker.start()
// or through a Cloud Function trigger
