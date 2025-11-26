/**
 * Job Queue Service
 * Manages background job processing with priority scheduling and retry logic
 */
import { firestore } from 'firebase-admin';
import type { QueueJob, JobType, JobProgress } from '../types/workflow-types';
export declare class JobQueueService {
    private db;
    private processing;
    constructor(db: firestore.Firestore);
    /**
     * Add a job to the queue
     */
    addJob(type: JobType, payload: any, options?: {
        priority?: number;
        maxAttempts?: number;
        dependencies?: string[];
        estimatedDuration?: number;
    }): Promise<QueueJob>;
    /**
     * Get next job to process
     */
    getNextJob(): Promise<QueueJob | null>;
    /**
     * Check if all dependencies are completed
     */
    private checkDependencies;
    /**
     * Start processing a job
     */
    startJob(jobId: string): Promise<void>;
    /**
     * Update job progress
     */
    updateProgress(jobId: string, progress: number, message?: string): Promise<void>;
    /**
     * Complete a job successfully
     */
    completeJob(jobId: string, result?: any): Promise<void>;
    /**
     * Fail a job
     */
    failJob(jobId: string, error: Error, recoverable?: boolean): Promise<void>;
    /**
     * Cancel a job
     */
    cancelJob(jobId: string): Promise<void>;
    /**
     * Get job status
     */
    getJobStatus(jobId: string): Promise<QueueJob | null>;
    /**
     * Get job progress
     */
    getJobProgress(jobId: string): Promise<JobProgress | null>;
    /**
     * Get queue statistics
     */
    getQueueStats(): Promise<{
        queued: number;
        processing: number;
        completed: number;
        failed: number;
        byType: Record<JobType, number>;
    }>;
    /**
     * Clean up old completed jobs
     */
    cleanupOldJobs(olderThanDays?: number): Promise<number>;
    /**
     * Retry a failed job
     */
    retryJob(jobId: string): Promise<void>;
    /**
     * Log workflow event
     */
    private logEvent;
}
export declare const jobQueueService: JobQueueService;
//# sourceMappingURL=job-queue-service.d.ts.map