/**
 * Notification Service
 * Manages in-app and email notifications with preferences and templates
 */

import { firestore } from 'firebase-admin';
import type {
    Notification,
    NotificationType,
    NotificationPriority,
    NotificationChannel,
    NotificationPreferences,
    EmailTemplate,
} from '../types/workflow-types';
import { emailService } from './email-notification-service';

export class NotificationService {
    private db: firestore.Firestore;

    constructor(db: firestore.Firestore) {
        this.db = db;
    }

    /**
     * Send a notification to a user
     */
    async sendNotification(
        userId: string,
        type: NotificationType,
        title: string,
        message: string,
        options?: {
            data?: Record<string, any>;
            actionUrl?: string;
            actionLabel?: string;
            priority?: NotificationPriority;
            channels?: NotificationChannel[];
            expiresAt?: Date;
        }
    ): Promise<Notification> {
        const now = new Date();

        // Get user preferences
        const preferences = await this.getUserPreferences(userId);
        const channels = options?.channels || preferences?.channels?.[type] || ['in-app', 'email'];

        const notification: Notification = {
            id: this.db.collection('notifications').doc().id,
            userId,
            type,
            title,
            message,
            data: options?.data,
            read: false,
            actionUrl: options?.actionUrl,
            actionLabel: options?.actionLabel,
            priority: options?.priority || 'normal',
            channels,
            createdAt: now,
            expiresAt: options?.expiresAt,
        };

        // Save to database
        await this.db.collection('notifications').doc(notification.id).set(notification);

        // Send via requested channels
        await this.deliverNotification(notification, channels);

        return notification;
    }

    /**
     * Deliver notification via specified channels
     */
    private async deliverNotification(
        notification: Notification,
        channels: NotificationChannel[]
    ): Promise<void> {
        const promises: Promise<void>[] = [];

        if (channels.includes('email')) {
            promises.push(this.sendEmailNotification(notification));
        }

        // In-app notifications are stored in Firestore (already done)
        // Push notifications would go here
        // SMS would go here

        await Promise.all(promises);
    }

    /**
     * Send email notification
     */
    private async sendEmailNotification(notification: Notification): Promise<void> {
        // Get user email
        const userDoc = await this.db.collection('users').doc(notification.userId).get();
        if (!userDoc.exists) {
            console.error(`User ${notification.userId} not found`);
            return;
        }

        const user = userDoc.data();
        const email = user?.email;

        if (!email) {
            console.error(`No email for user ${notification.userId}`);
            return;
        }

        // Get email template
        const template = await this.getEmailTemplate(notification.type);

        if (!template) {
            console.error(`No email template for type ${notification.type}`);
            return;
        }

        // Render template
        const subject = this.renderTemplate(template.subject, {
            ...notification.data,
            title: notification.title,
            userName: user.displayName || 'User',
        });

        const htmlBody = this.renderTemplate(template.htmlBody, {
            ...notification.data,
            title: notification.title,
            message: notification.message,
            actionUrl: notification.actionUrl,
            actionLabel: notification.actionLabel,
            userName: user.displayName || 'User',
        });

        // Send email using existing email service
        await emailService.sendProofReadyNotification({
            customerName: user.displayName || 'User',
            customerEmail: email,
            jobName: notification.data?.jobName || notification.title,
            proofUrl: notification.actionUrl || '#',
            message: notification.message,
        });
    }

    /**
     * Simple template rendering
     */
    private renderTemplate(template: string, variables: Record<string, any>): string {
        let result = template;

        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{{${key}}}`;
            result = result.replace(new RegExp(placeholder, 'g'), String(value || ''));
        }

        return result;
    }

    /**
     * Get user notification preferences
     */
    async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
        const doc = await this.db.collection('notification-preferences').doc(userId).get();
        return doc.exists ? (doc.data() as NotificationPreferences) : null;
    }

    /**
     * Update user notification preferences
     */
    async updateUserPreferences(
        userId: string,
        preferences: Partial<NotificationPreferences>
    ): Promise<void> {
        await this.db.collection('notification-preferences').doc(userId).set(
            {
                ...preferences,
                userId,
                updatedAt: new Date(),
            },
            { merge: true }
        );
    }

    /**
     * Get email template
     */
    async getEmailTemplate(type: NotificationType): Promise<EmailTemplate | null> {
        const snapshot = await this.db
            .collection('email-templates')
            .where('category', '==', type)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        return snapshot.docs[0].data() as EmailTemplate;
    }

    /**
     * Create or update email template
     */
    async saveEmailTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
        const now = new Date();
        const id = this.db.collection('email-templates').doc().id;

        const fullTemplate: EmailTemplate = {
            ...template,
            id,
            createdAt: now,
            updatedAt: now,
        };

        await this.db.collection('email-templates').doc(id).set(fullTemplate);
        return fullTemplate;
    }

    /**
     * Get notifications for a user
     */
    async getUserNotifications(
        userId: string,
        options?: {
            unreadOnly?: boolean;
            limit?: number;
        }
    ): Promise<Notification[]> {
        let query = this.db
            .collection('notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc');

        if (options?.unreadOnly) {
            query = query.where('read', '==', false);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => doc.data() as Notification);
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        await this.db.collection('notifications').doc(notificationId).update({
            read: true,
            readAt: new Date(),
        });
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        const snapshot = await this.db
            .collection('notifications')
            .where('userId', '==', userId)
            .where('read', '==', false)
            .get();

        const batch = this.db.batch();
        const now = new Date();

        snapshot.forEach(doc => {
            batch.update(doc.ref, {
                read: true,
                readAt: now,
            });
        });

        await batch.commit();
    }

    /**
     * Delete old notifications
     */
    async cleanupOldNotifications(olderThanDays: number = 90): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const snapshot = await this.db
            .collection('notifications')
            .where('createdAt', '<', cutoffDate)
            .where('read', '==', true)
            .get();

        const batch = this.db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        return snapshot.size;
    }

    /**
     * Send proof ready notification
     */
    async sendProofReadyNotification(userId: string, jobId: string, jobName: string): Promise<void> {
        await this.sendNotification(
            userId,
            'proof-ready',
            'Proof Ready for Review',
            `Your proof "${jobName}" is ready for review.`,
            {
                data: { jobId, jobName },
                actionUrl: `/jobs/${jobId}`,
                actionLabel: 'View Proof',
                priority: 'high',
            }
        );
    }

    /**
     * Send approval request notification
     */
    async sendApprovalRequestNotification(
        userId: string,
        chainId: string,
        jobName: string,
        deadline?: Date
    ): Promise<void> {
        const message = deadline
            ? `Please review and approve "${jobName}" by ${deadline.toLocaleDateString()}.`
            : `Please review and approve "${jobName}".`;

        await this.sendNotification(
            userId,
            'approval-request',
            'Approval Required',
            message,
            {
                data: { chainId, jobName, deadline: deadline?.toISOString() },
                actionUrl: `/approvals/${chainId}`,
                actionLabel: 'Review Now',
                priority: 'high',
            }
        );
    }

    /**
     * Send deadline reminder
     */
    async sendDeadlineReminder(
        userId: string,
        chainId: string,
        jobName: string,
        hoursRemaining: number
    ): Promise<void> {
        await this.sendNotification(
            userId,
            'reminder',
            'Approval Deadline Approaching',
            `The approval deadline for "${jobName}" is in ${hoursRemaining} hours.`,
            {
                data: { chainId, jobName, hoursRemaining },
                actionUrl: `/approvals/${chainId}`,
                actionLabel: 'Review Now',
                priority: 'urgent',
            }
        );
    }

    /**
     * Send issue detected notification
     */
    async sendIssueDetectedNotification(
        userId: string,
        jobId: string,
        jobName: string,
        issueCount: number
    ): Promise<void> {
        await this.sendNotification(
            userId,
            'issue-detected',
            'Issues Detected in PDF',
            `${issueCount} issue(s) detected in "${jobName}". Please review.`,
            {
                data: { jobId, jobName, issueCount },
                actionUrl: `/jobs/${jobId}/issues`,
                actionLabel: 'View Issues',
                priority: 'high',
            }
        );
    }
}


