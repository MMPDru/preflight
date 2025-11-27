import * as functions from 'firebase-functions';
import { Timestamp } from 'firebase-admin/firestore';
export interface Deployment {
    id: string;
    timestamp: Timestamp;
    environment: 'production' | 'staging' | 'development';
    commitHash: string;
    branch: string;
    author: string;
    changes: any[];
    status: 'pending' | 'processing' | 'complete' | 'failed';
}
export declare class AutoDocumentationSystem {
    /**
     * Get Firestore instance lazily
     */
    private get db();
    /**
     * Main handler triggered on deployment
     */
    onDeployment(deployment: Deployment): Promise<void>;
    /**
     * Update deployment status
     */
    private updateDeploymentStatus;
    /**
     * Save generated documentation
     */
    private saveDocumentation;
    /**
     * Notify stakeholders of changes
     */
    private notifyStakeholders;
    /**
     * Send email summaries
     */
    private sendEmailSummaries;
    /**
     * Create in-app notifications
     */
    private createInAppNotifications;
    /**
     * Notify support team
     */
    private notifySupportTeam;
    /**
     * Notify customer success team
     */
    private notifyCustomerSuccess;
    /**
     * Generate email body
     */
    private generateEmailBody;
    /**
     * Generate support team actions
     */
    private generateSupportActions;
}
export declare function getAutoDocSystem(): AutoDocumentationSystem;
/**
 * Firebase Cloud Function: Deployment Webhook
 * Triggered when a new deployment is detected
 */
export declare const onDeploymentWebhook: functions.HttpsFunction;
/**
 * Firebase Cloud Function: Scheduled Documentation Review
 * Runs daily to check for pending documentation updates
 */
export declare const scheduledDocReview: functions.CloudFunction<unknown>;
//# sourceMappingURL=index.d.ts.map