"use strict";
/**
 * Queue Worker
 * Background job processor for handling queued tasks
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueWorker = exports.QueueWorker = void 0;
const job_queue_service_1 = require("../services/job-queue-service");
const pdf_analyzer_1 = require("../services/pdf-analyzer");
const pdf_fixer_1 = require("../services/pdf-fixer");
const notification_service_1 = require("../services/notification-service");
const email_notification_service_1 = require("../services/email-notification-service");
const admin = __importStar(require("firebase-admin"));
class QueueWorker {
    constructor() {
        this.isRunning = false;
        this.pollInterval = 5000; // 5 seconds
        this.maxConcurrent = 3;
        this.currentJobs = 0;
    }
    /**
     * Start the worker
     */
    async start() {
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
    stop() {
        this.isRunning = false;
        console.log('🛑 Queue worker stopped');
    }
    /**
     * Poll for jobs
     */
    async poll() {
        while (this.isRunning) {
            try {
                // Check if we can process more jobs
                if (this.currentJobs < this.maxConcurrent) {
                    const job = await job_queue_service_1.jobQueueService.getNextJob();
                    if (job) {
                        // Process job in background
                        this.processJob(job).catch(error => {
                            console.error(`Error processing job ${job.id}:`, error);
                        });
                    }
                }
                // Wait before next poll
                await this.sleep(this.pollInterval);
            }
            catch (error) {
                console.error('Error in worker poll loop:', error);
                await this.sleep(this.pollInterval);
            }
        }
    }
    /**
     * Process a single job
     */
    async processJob(job) {
        this.currentJobs++;
        try {
            console.log(`📋 Processing job ${job.id} (${job.type})`);
            await job_queue_service_1.jobQueueService.startJob(job.id);
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
            await job_queue_service_1.jobQueueService.completeJob(job.id);
            console.log(`✅ Job ${job.id} completed`);
        }
        catch (error) {
            console.error(`❌ Job ${job.id} failed:`, error.message);
            await job_queue_service_1.jobQueueService.failJob(job.id, error, true);
        }
        finally {
            this.currentJobs--;
        }
    }
    /**
     * Handle PDF analysis job
     */
    async handlePdfAnalysis(job) {
        const { fileBuffer, jobId } = job.payload;
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 10, 'Loading PDF');
        const analysis = await pdf_analyzer_1.pdfAnalyzer.analyzeDocument(fileBuffer);
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 90, 'Saving results');
        // Save analysis to Firestore
        await admin.firestore().collection('jobs').doc(jobId).update({
            analysis,
            analyzedAt: new Date(),
        });
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 100, 'Complete');
    }
    /**
     * Handle PDF fix job
     */
    async handlePdfFix(job) {
        const { fileBuffer, fixTypes, options, jobId } = job.payload;
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 10, 'Loading PDF');
        const fixedBuffer = await pdf_fixer_1.pdfFixer.processPdf(fileBuffer, fixTypes, options);
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 70, 'Analyzing fixed PDF');
        const analysis = await pdf_analyzer_1.pdfAnalyzer.analyzeDocument(fixedBuffer);
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 90, 'Uploading fixed PDF');
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
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 100, 'Complete');
    }
    /**
     * Handle email job
     */
    async handleEmail(job) {
        const { type, data } = job.payload;
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 50, 'Sending email');
        switch (type) {
            case 'proof-ready':
                await email_notification_service_1.emailService.sendProofReadyNotification(data);
                break;
            case 'reminder':
                await email_notification_service_1.emailService.sendReminderNotification(data);
                break;
            case 'issue-alert':
                await email_notification_service_1.emailService.sendIssueAlert(data);
                break;
            case 'revision':
                await email_notification_service_1.emailService.sendRevisionNotification(data);
                break;
            case 'approval':
                await email_notification_service_1.emailService.sendApprovalConfirmation(data);
                break;
            default:
                throw new Error(`Unknown email type: ${type}`);
        }
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 100, 'Email sent');
    }
    /**
     * Handle notification job
     */
    async handleNotification(job) {
        const { userId, type, title, message, options } = job.payload;
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 50, 'Sending notification');
        await notification_service_1.notificationService.sendNotification(userId, type, title, message, options);
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 100, 'Notification sent');
    }
    /**
     * Handle file processing job
     */
    async handleFileProcessing(job) {
        // Placeholder for file processing
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 50, 'Processing file');
        await this.sleep(1000);
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 100, 'File processed');
    }
    /**
     * Handle report generation job
     */
    async handleReportGeneration(job) {
        // Placeholder for report generation
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 50, 'Generating report');
        await this.sleep(1000);
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 100, 'Report generated');
    }
    /**
     * Handle backup job
     */
    async handleBackup(job) {
        // Placeholder for backup
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 50, 'Creating backup');
        await this.sleep(1000);
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 100, 'Backup complete');
    }
    /**
     * Handle cleanup job
     */
    async handleCleanup(job) {
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 25, 'Cleaning old jobs');
        await job_queue_service_1.jobQueueService.cleanupOldJobs(30);
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 50, 'Cleaning old notifications');
        await notification_service_1.notificationService.cleanupOldNotifications(90);
        await job_queue_service_1.jobQueueService.updateProgress(job.id, 100, 'Cleanup complete');
    }
    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.QueueWorker = QueueWorker;
// Export singleton
exports.queueWorker = new QueueWorker();
// Auto-start worker in production
if (process.env.NODE_ENV === 'production') {
    exports.queueWorker.start();
}
//# sourceMappingURL=queue-worker.js.map