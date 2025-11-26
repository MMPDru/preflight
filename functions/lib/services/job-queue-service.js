"use strict";
/**
 * Job Queue Service
 * Manages background job processing with priority scheduling and retry logic
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobQueueService = void 0;
class JobQueueService {
    constructor(db) {
        this.processing = new Map();
        this.db = db;
    }
    /**
     * Add a job to the queue
     */
    async addJob(type, payload, options) {
        const now = new Date();
        const job = {
            id: this.db.collection('queue-jobs').doc().id,
            type,
            payload,
            priority: options?.priority || 5,
            status: 'queued',
            attempts: 0,
            maxAttempts: options?.maxAttempts || 3,
            dependencies: options?.dependencies || [],
            createdAt: now,
            estimatedDuration: options?.estimatedDuration,
        };
        await this.db.collection('queue-jobs').doc(job.id).set(job);
        // Log event
        await this.logEvent({
            id: this.db.collection('workflow-events').doc().id,
            type: 'job-queued',
            jobId: job.id,
            data: { type, priority: job.priority },
            timestamp: now,
        });
        return job;
    }
    /**
     * Get next job to process
     */
    async getNextJob() {
        // Get jobs that are queued and have no unmet dependencies
        const snapshot = await this.db
            .collection('queue-jobs')
            .where('status', '==', 'queued')
            .orderBy('priority', 'desc')
            .orderBy('createdAt', 'asc')
            .limit(10)
            .get();
        for (const doc of snapshot.docs) {
            const job = doc.data();
            // Check if already being processed
            if (this.processing.get(job.id)) {
                continue;
            }
            // Check dependencies
            if (job.dependencies && job.dependencies.length > 0) {
                const dependenciesMet = await this.checkDependencies(job.dependencies);
                if (!dependenciesMet) {
                    continue;
                }
            }
            // Mark as processing
            this.processing.set(job.id, true);
            return job;
        }
        return null;
    }
    /**
     * Check if all dependencies are completed
     */
    async checkDependencies(dependencies) {
        for (const depId of dependencies) {
            const depDoc = await this.db.collection('queue-jobs').doc(depId).get();
            if (!depDoc.exists) {
                return false;
            }
            const depJob = depDoc.data();
            if (depJob.status !== 'completed') {
                return false;
            }
        }
        return true;
    }
    /**
     * Start processing a job
     */
    async startJob(jobId) {
        const now = new Date();
        await this.db.collection('queue-jobs').doc(jobId).update({
            status: 'processing',
            startedAt: now,
        });
        await this.logEvent({
            id: this.db.collection('workflow-events').doc().id,
            type: 'job-started',
            jobId,
            data: {},
            timestamp: now,
        });
    }
    /**
     * Update job progress
     */
    async updateProgress(jobId, progress, message) {
        await this.db.collection('queue-jobs').doc(jobId).update({
            progress,
        });
        // Publish progress update (would use WebSocket in production)
        const progressUpdate = {
            jobId,
            progress,
            message,
        };
        // Store in separate collection for real-time updates
        await this.db.collection('job-progress').doc(jobId).set(progressUpdate);
    }
    /**
     * Complete a job successfully
     */
    async completeJob(jobId, result) {
        const now = new Date();
        const jobDoc = await this.db.collection('queue-jobs').doc(jobId).get();
        const job = jobDoc.data();
        const actualDuration = job.startedAt ? now.getTime() - job.startedAt.getTime() : 0;
        await this.db.collection('queue-jobs').doc(jobId).update({
            status: 'completed',
            completedAt: now,
            result,
            actualDuration,
            progress: 100,
        });
        this.processing.delete(jobId);
        await this.logEvent({
            id: this.db.collection('workflow-events').doc().id,
            type: 'job-completed',
            jobId,
            data: { duration: actualDuration },
            timestamp: now,
        });
    }
    /**
     * Fail a job
     */
    async failJob(jobId, error, recoverable = true) {
        const now = new Date();
        const jobDoc = await this.db.collection('queue-jobs').doc(jobId).get();
        const job = jobDoc.data();
        const jobError = {
            message: error.message,
            stack: error.stack,
            timestamp: now,
            recoverable,
        };
        const attempts = job.attempts + 1;
        const shouldRetry = recoverable && attempts < job.maxAttempts;
        await this.db.collection('queue-jobs').doc(jobId).update({
            status: shouldRetry ? 'retrying' : 'failed',
            attempts,
            error: jobError,
        });
        this.processing.delete(jobId);
        if (shouldRetry) {
            // Requeue with exponential backoff
            const backoffMs = Math.min(1000 * Math.pow(2, attempts), 60000);
            setTimeout(async () => {
                await this.db.collection('queue-jobs').doc(jobId).update({
                    status: 'queued',
                });
            }, backoffMs);
        }
        await this.logEvent({
            id: this.db.collection('workflow-events').doc().id,
            type: 'job-failed',
            jobId,
            data: { error: error.message, attempts, willRetry: shouldRetry },
            timestamp: now,
        });
    }
    /**
     * Cancel a job
     */
    async cancelJob(jobId) {
        await this.db.collection('queue-jobs').doc(jobId).update({
            status: 'cancelled',
            completedAt: new Date(),
        });
        this.processing.delete(jobId);
    }
    /**
     * Get job status
     */
    async getJobStatus(jobId) {
        const doc = await this.db.collection('queue-jobs').doc(jobId).get();
        return doc.exists ? doc.data() : null;
    }
    /**
     * Get job progress
     */
    async getJobProgress(jobId) {
        const doc = await this.db.collection('job-progress').doc(jobId).get();
        return doc.exists ? doc.data() : null;
    }
    /**
     * Get queue statistics
     */
    async getQueueStats() {
        const snapshot = await this.db.collection('queue-jobs').get();
        const stats = {
            queued: 0,
            processing: 0,
            completed: 0,
            failed: 0,
            byType: {},
        };
        snapshot.forEach(doc => {
            const job = doc.data();
            switch (job.status) {
                case 'queued':
                    stats.queued++;
                    break;
                case 'processing':
                    stats.processing++;
                    break;
                case 'completed':
                    stats.completed++;
                    break;
                case 'failed':
                    stats.failed++;
                    break;
            }
            stats.byType[job.type] = (stats.byType[job.type] || 0) + 1;
        });
        return stats;
    }
    /**
     * Clean up old completed jobs
     */
    async cleanupOldJobs(olderThanDays = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        const snapshot = await this.db
            .collection('queue-jobs')
            .where('status', 'in', ['completed', 'failed', 'cancelled'])
            .where('completedAt', '<', cutoffDate)
            .get();
        const batch = this.db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        return snapshot.size;
    }
    /**
     * Retry a failed job
     */
    async retryJob(jobId) {
        await this.db.collection('queue-jobs').doc(jobId).update({
            status: 'queued',
            attempts: 0,
            error: null,
        });
    }
    /**
     * Log workflow event
     */
    async logEvent(event) {
        await this.db.collection('workflow-events').doc(event.id).set(event);
    }
}
exports.JobQueueService = JobQueueService;
//# sourceMappingURL=job-queue-service.js.map