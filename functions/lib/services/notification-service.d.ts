/**
 * Notification Service
 * Manages in-app and email notifications with preferences and templates
 */
import { firestore } from 'firebase-admin';
import type { Notification, NotificationType, NotificationPriority, NotificationChannel, NotificationPreferences, EmailTemplate } from '../types/workflow-types';
export declare class NotificationService {
    private db;
    constructor(db: firestore.Firestore);
    /**
     * Send a notification to a user
     */
    sendNotification(userId: string, type: NotificationType, title: string, message: string, options?: {
        data?: Record<string, any>;
        actionUrl?: string;
        actionLabel?: string;
        priority?: NotificationPriority;
        channels?: NotificationChannel[];
        expiresAt?: Date;
    }): Promise<Notification>;
    /**
     * Deliver notification via specified channels
     */
    private deliverNotification;
    /**
     * Send email notification
     */
    private sendEmailNotification;
    /**
     * Simple template rendering
     */
    private renderTemplate;
    /**
     * Get user notification preferences
     */
    getUserPreferences(userId: string): Promise<NotificationPreferences | null>;
    /**
     * Update user notification preferences
     */
    updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void>;
    /**
     * Get email template
     */
    getEmailTemplate(type: NotificationType): Promise<EmailTemplate | null>;
    /**
     * Create or update email template
     */
    saveEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate>;
    /**
     * Get notifications for a user
     */
    getUserNotifications(userId: string, options?: {
        unreadOnly?: boolean;
        limit?: number;
    }): Promise<Notification[]>;
    /**
     * Mark notification as read
     */
    markAsRead(notificationId: string): Promise<void>;
    /**
     * Mark all notifications as read for a user
     */
    markAllAsRead(userId: string): Promise<void>;
    /**
     * Delete old notifications
     */
    cleanupOldNotifications(olderThanDays?: number): Promise<number>;
    /**
     * Send proof ready notification
     */
    sendProofReadyNotification(userId: string, jobId: string, jobName: string): Promise<void>;
    /**
     * Send approval request notification
     */
    sendApprovalRequestNotification(userId: string, chainId: string, jobName: string, deadline?: Date): Promise<void>;
    /**
     * Send deadline reminder
     */
    sendDeadlineReminder(userId: string, chainId: string, jobName: string, hoursRemaining: number): Promise<void>;
    /**
     * Send issue detected notification
     */
    sendIssueDetectedNotification(userId: string, jobId: string, jobName: string, issueCount: number): Promise<void>;
}
//# sourceMappingURL=notification-service.d.ts.map