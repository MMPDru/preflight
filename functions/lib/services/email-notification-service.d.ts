export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}
export interface EmailRecipient {
    email: string;
    name: string;
}
export interface ProofReadyNotification {
    customerName: string;
    customerEmail: string;
    jobName: string;
    proofUrl: string;
    deadline?: Date;
    message?: string;
}
export interface ReminderNotification {
    recipientName: string;
    recipientEmail: string;
    jobName: string;
    proofUrl: string;
    daysRemaining: number;
    deadline: Date;
}
export interface IssueAlertNotification {
    customerName: string;
    customerEmail: string;
    jobName: string;
    issues: Array<{
        title: string;
        severity: string;
        recommendation: string;
    }>;
    fixRecommendations: string[];
}
export interface RevisionNotification {
    designerName: string;
    designerEmail: string;
    jobName: string;
    customerName: string;
    revisionNotes: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
}
export interface ApprovalConfirmation {
    customerName: string;
    customerEmail: string;
    jobName: string;
    approvedBy: string;
    approvedAt: Date;
    nextSteps: string;
}
export declare class EmailNotificationService {
    private db;
    /**
     * Send proof ready notification
     */
    sendProofReadyNotification(data: ProofReadyNotification): Promise<void>;
    /**
     * Send reminder email
     */
    sendReminderNotification(data: ReminderNotification): Promise<void>;
    /**
     * Send issue alert
     */
    sendIssueAlert(data: IssueAlertNotification): Promise<void>;
    /**
     * Send revision notification to designer
     */
    sendRevisionNotification(data: RevisionNotification): Promise<void>;
    /**
     * Send approval confirmation
     */
    sendApprovalConfirmation(data: ApprovalConfirmation): Promise<void>;
    /**
     * Send email using Firebase or external service
     */
    private sendEmail;
    /**
     * Log notification for tracking
     */
    private logNotification;
    /**
     * Get proof ready email template
     */
    private getProofReadyTemplate;
    /**
     * Get reminder email template
     */
    private getReminderTemplate;
    /**
     * Get issue alert template
     */
    private getIssueAlertTemplate;
    /**
     * Get revision notification template
     */
    private getRevisionTemplate;
    /**
     * Get approval confirmation template
     */
    private getApprovalTemplate;
    /**
     * Schedule reminder emails
     */
    scheduleReminders(jobId: string, deadline: Date): Promise<void>;
}
//# sourceMappingURL=email-notification-service.d.ts.map