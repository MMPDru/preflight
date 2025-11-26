/**
 * Queue Worker
 * Background job processor for handling queued tasks
 */
export declare class QueueWorker {
    private isRunning;
    private pollInterval;
    private maxConcurrent;
    private currentJobs;
    /**
     * Start the worker
     */
    start(): Promise<void>;
    /**
     * Stop the worker
     */
    stop(): void;
    /**
     * Poll for jobs
     */
    private poll;
    /**
     * Process a single job
     */
    private processJob;
    /**
     * Handle PDF analysis job
     */
    private handlePdfAnalysis;
    /**
     * Handle PDF fix job
     */
    private handlePdfFix;
    /**
     * Handle email job
     */
    private handleEmail;
    /**
     * Handle notification job
     */
    private handleNotification;
    /**
     * Handle file processing job
     */
    private handleFileProcessing;
    /**
     * Handle report generation job
     */
    private handleReportGeneration;
    /**
     * Handle backup job
     */
    private handleBackup;
    /**
     * Handle cleanup job
     */
    private handleCleanup;
    /**
     * Sleep helper
     */
    private sleep;
}
export declare const queueWorker: QueueWorker;
//# sourceMappingURL=queue-worker.d.ts.map