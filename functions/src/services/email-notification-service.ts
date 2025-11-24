import * as admin from 'firebase-admin';

// Types
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

export class EmailNotificationService {
    private db = admin.firestore();

    /**
     * Send proof ready notification
     */
    async sendProofReadyNotification(data: ProofReadyNotification): Promise<void> {
        const template = this.getProofReadyTemplate(data);

        await this.sendEmail({
            to: { email: data.customerEmail, name: data.customerName },
            subject: template.subject,
            html: template.html,
            text: template.text
        });

        // Log notification
        await this.logNotification({
            type: 'proof-ready',
            recipient: data.customerEmail,
            jobName: data.jobName,
            sentAt: new Date()
        });

        console.log(`✅ Proof ready notification sent to ${data.customerEmail}`);
    }

    /**
     * Send reminder email
     */
    async sendReminderNotification(data: ReminderNotification): Promise<void> {
        const template = this.getReminderTemplate(data);

        await this.sendEmail({
            to: { email: data.recipientEmail, name: data.recipientName },
            subject: template.subject,
            html: template.html,
            text: template.text
        });

        await this.logNotification({
            type: 'reminder',
            recipient: data.recipientEmail,
            jobName: data.jobName,
            sentAt: new Date()
        });

        console.log(`✅ Reminder sent to ${data.recipientEmail}`);
    }

    /**
     * Send issue alert
     */
    async sendIssueAlert(data: IssueAlertNotification): Promise<void> {
        const template = this.getIssueAlertTemplate(data);

        await this.sendEmail({
            to: { email: data.customerEmail, name: data.customerName },
            subject: template.subject,
            html: template.html,
            text: template.text
        });

        await this.logNotification({
            type: 'issue-alert',
            recipient: data.customerEmail,
            jobName: data.jobName,
            sentAt: new Date()
        });

        console.log(`✅ Issue alert sent to ${data.customerEmail}`);
    }

    /**
     * Send revision notification to designer
     */
    async sendRevisionNotification(data: RevisionNotification): Promise<void> {
        const template = this.getRevisionTemplate(data);

        await this.sendEmail({
            to: { email: data.designerEmail, name: data.designerName },
            subject: template.subject,
            html: template.html,
            text: template.text
        });

        await this.logNotification({
            type: 'revision-request',
            recipient: data.designerEmail,
            jobName: data.jobName,
            sentAt: new Date()
        });

        console.log(`✅ Revision notification sent to ${data.designerEmail}`);
    }

    /**
     * Send approval confirmation
     */
    async sendApprovalConfirmation(data: ApprovalConfirmation): Promise<void> {
        const template = this.getApprovalTemplate(data);

        await this.sendEmail({
            to: { email: data.customerEmail, name: data.customerName },
            subject: template.subject,
            html: template.html,
            text: template.text
        });

        await this.logNotification({
            type: 'approval-confirmation',
            recipient: data.customerEmail,
            jobName: data.jobName,
            sentAt: new Date()
        });

        console.log(`✅ Approval confirmation sent to ${data.customerEmail}`);
    }

    /**
     * Send email using Firebase or external service
     */
    private async sendEmail(params: {
        to: EmailRecipient;
        subject: string;
        html: string;
        text: string;
    }): Promise<void> {
        // In production, integrate with SendGrid, AWS SES, or similar
        // For now, we'll queue it in Firestore for processing

        await this.db.collection('emailQueue').add({
            to: params.to.email,
            toName: params.to.name,
            subject: params.subject,
            html: params.html,
            text: params.text,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            attempts: 0
        });
    }

    /**
     * Log notification for tracking
     */
    private async logNotification(data: any): Promise<void> {
        await this.db.collection('notificationLogs').add({
            ...data,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    /**
     * Get proof ready email template
     */
    private getProofReadyTemplate(data: ProofReadyNotification): EmailTemplate {
        const deadlineText = data.deadline
            ? `<p><strong>Deadline:</strong> ${data.deadline.toLocaleDateString()}</p>`
            : '';

        const messageText = data.message
            ? `<p>${data.message}</p>`
            : '';

        return {
            subject: `Your Proof is Ready: ${data.jobName}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Your Proof is Ready!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.customerName},</p>
              
              <p>Great news! Your proof for <strong>${data.jobName}</strong> is ready for review.</p>
              
              ${messageText}
              ${deadlineText}
              
              <p>Please review the proof and provide your approval or feedback.</p>
              
              <div style="text-align: center;">
                <a href="${data.proofUrl}" class="button">Review Proof Now</a>
              </div>
              
              <p><strong>What to look for:</strong></p>
              <ul>
                <li>Colors and images appear correct</li>
                <li>Text is accurate and properly formatted</li>
                <li>Layout matches your expectations</li>
                <li>All elements are positioned correctly</li>
              </ul>
              
              <p>If you have any questions or need changes, simply add comments directly on the proof or reply to this email.</p>
              
              <p>Best regards,<br>PreFlight Pro Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} PreFlight Pro. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
Hi ${data.customerName},

Your proof for ${data.jobName} is ready for review.

${data.message || ''}
${data.deadline ? `Deadline: ${data.deadline.toLocaleDateString()}` : ''}

Review your proof: ${data.proofUrl}

Please review and provide your approval or feedback.

Best regards,
PreFlight Pro Team
      `
        };
    }

    /**
     * Get reminder email template
     */
    private getReminderTemplate(data: ReminderNotification): EmailTemplate {
        const urgency = data.daysRemaining <= 1 ? 'URGENT' : 'Reminder';

        return {
            subject: `${urgency}: Proof Approval Needed - ${data.jobName}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${data.daysRemaining <= 1 ? '#ef4444' : '#f59e0b'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .urgent { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ ${urgency}: Approval Needed</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName},</p>
              
              ${data.daysRemaining <= 1 ? `
                <div class="urgent">
                  <strong>⚠️ URGENT:</strong> Your proof approval is due ${data.daysRemaining === 0 ? 'TODAY' : 'TOMORROW'}!
                </div>
              ` : `
                <p>This is a friendly reminder that your proof for <strong>${data.jobName}</strong> is awaiting your approval.</p>
              `}
              
              <p><strong>Deadline:</strong> ${data.deadline.toLocaleDateString()}</p>
              <p><strong>Days Remaining:</strong> ${data.daysRemaining} day${data.daysRemaining !== 1 ? 's' : ''}</p>
              
              <div style="text-align: center;">
                <a href="${data.proofUrl}" class="button">Review Proof Now</a>
              </div>
              
              <p>To avoid delays in production, please review and approve (or request changes) as soon as possible.</p>
              
              <p>Need help? Reply to this email or contact our support team.</p>
              
              <p>Best regards,<br>PreFlight Pro Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
Hi ${data.recipientName},

${urgency}: Your proof for ${data.jobName} needs approval.

Deadline: ${data.deadline.toLocaleDateString()}
Days Remaining: ${data.daysRemaining}

Review proof: ${data.proofUrl}

Please review and approve as soon as possible to avoid production delays.

Best regards,
PreFlight Pro Team
      `
        };
    }

    /**
     * Get issue alert template
     */
    private getIssueAlertTemplate(data: IssueAlertNotification): EmailTemplate {
        const issuesList = data.issues.map(issue => `
      <li>
        <strong>${issue.title}</strong> (${issue.severity})<br>
        <em>${issue.recommendation}</em>
      </li>
    `).join('');

        const fixesList = data.fixRecommendations.map(fix => `<li>${fix}</li>`).join('');

        return {
            subject: `Issues Detected: ${data.jobName}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .issue { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 10px 0; }
            .fix { background: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Issues Detected</h1>
            </div>
            <div class="content">
              <p>Hi ${data.customerName},</p>
              
              <p>We've analyzed your file <strong>${data.jobName}</strong> and detected some issues that need attention:</p>
              
              <div class="issue">
                <h3>Issues Found:</h3>
                <ul>${issuesList}</ul>
              </div>
              
              <div class="fix">
                <h3>✅ Good News - We Can Auto-Fix:</h3>
                <ul>${fixesList}</ul>
              </div>
              
              <p>Our team is working on these fixes now. You'll receive an updated proof shortly.</p>
              
              <p>If you have any questions about these issues, please don't hesitate to reach out.</p>
              
              <p>Best regards,<br>PreFlight Pro Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
Hi ${data.customerName},

Issues detected in ${data.jobName}:

${data.issues.map(i => `- ${i.title} (${i.severity}): ${i.recommendation}`).join('\n')}

Auto-fixes available:
${data.fixRecommendations.map(f => `- ${f}`).join('\n')}

Our team is working on these fixes. You'll receive an updated proof shortly.

Best regards,
PreFlight Pro Team
      `
        };
    }

    /**
     * Get revision notification template
     */
    private getRevisionTemplate(data: RevisionNotification): EmailTemplate {
        const priorityColor = {
            low: '#22c55e',
            medium: '#f59e0b',
            high: '#ef4444',
            urgent: '#dc2626'
        }[data.priority];

        const revisionsList = data.revisionNotes.map((note, i) => `<li>${i + 1}. ${note}</li>`).join('');

        return {
            subject: `[${data.priority.toUpperCase()}] Revision Request: ${data.jobName}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${priorityColor}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .revisions { background: white; border: 2px solid ${priorityColor}; padding: 20px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔄 Revision Request</h1>
              <p style="margin: 0; font-size: 18px;">${data.priority.toUpperCase()} Priority</p>
            </div>
            <div class="content">
              <p>Hi ${data.designerName},</p>
              
              <p><strong>${data.customerName}</strong> has requested revisions for <strong>${data.jobName}</strong>.</p>
              
              <div class="revisions">
                <h3>Requested Changes:</h3>
                <ol>${revisionsList}</ol>
              </div>
              
              <p>Please implement these changes and upload a new proof for review.</p>
              
              <p><strong>Priority Level:</strong> ${data.priority.toUpperCase()}</p>
              
              <p>Best regards,<br>PreFlight Pro Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
Hi ${data.designerName},

Revision request for ${data.jobName} from ${data.customerName}.

Priority: ${data.priority.toUpperCase()}

Requested changes:
${data.revisionNotes.map((note, i) => `${i + 1}. ${note}`).join('\n')}

Please implement these changes and upload a new proof.

Best regards,
PreFlight Pro Team
      `
        };
    }

    /**
     * Get approval confirmation template
     */
    private getApprovalTemplate(data: ApprovalConfirmation): EmailTemplate {
        return {
            subject: `✅ Proof Approved: ${data.jobName}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #22c55e; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Proof Approved!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.customerName},</p>
              
              <div class="success">
                <p><strong>Great news!</strong> Your proof for <strong>${data.jobName}</strong> has been approved and is now locked for production.</p>
              </div>
              
              <p><strong>Approved by:</strong> ${data.approvedBy}</p>
              <p><strong>Approved on:</strong> ${data.approvedAt.toLocaleString()}</p>
              
              <p><strong>Next Steps:</strong></p>
              <p>${data.nextSteps}</p>
              
              <p>Your job is now in our production queue. We'll keep you updated on the progress.</p>
              
              <p>Thank you for your business!</p>
              
              <p>Best regards,<br>PreFlight Pro Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
Hi ${data.customerName},

✅ Your proof for ${data.jobName} has been approved!

Approved by: ${data.approvedBy}
Approved on: ${data.approvedAt.toLocaleString()}

Next Steps:
${data.nextSteps}

Your job is now in production. We'll keep you updated.

Best regards,
PreFlight Pro Team
      `
        };
    }

    /**
     * Schedule reminder emails
     */
    async scheduleReminders(jobId: string, deadline: Date): Promise<void> {
        const now = new Date();
        const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Schedule reminders at 3 days, 1 day, and on deadline
        const reminderDays = [3, 1, 0];

        for (const days of reminderDays) {
            if (daysUntilDeadline >= days) {
                const reminderDate = new Date(deadline);
                reminderDate.setDate(reminderDate.getDate() - days);

                await this.db.collection('scheduledReminders').add({
                    jobId,
                    scheduledFor: reminderDate,
                    daysBeforeDeadline: days,
                    sent: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }

        console.log(`✅ Scheduled ${reminderDays.length} reminders for job ${jobId}`);
    }
}

// Export singleton
export const emailService = new EmailNotificationService();
