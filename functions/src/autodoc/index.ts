import * as functions from 'firebase-functions';
import { changeDetector } from './changeDetector';
import { docGenerator } from './documentationGenerator';
import { trainingManager } from './trainingContentManager';
import * as admin from 'firebase-admin';
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

export class AutoDocumentationSystem {
    /**
     * Get Firestore instance lazily
     */
    private get db(): FirebaseFirestore.Firestore {
        return admin.firestore();
    }

    /**
     * Main handler triggered on deployment
     */
    async onDeployment(deployment: Deployment): Promise<void> {
        console.log(`Processing deployment: ${deployment.id}`);

        try {
            // Update deployment status
            await this.updateDeploymentStatus(deployment.id, 'processing');

            // Step 1: Detect Changes
            const changes = await changeDetector.analyzeCommit({
                sha: deployment.commitHash,
                message: deployment.changes.map((c: any) => c.message).join('\n'),
                author: { name: deployment.author },
                timestamp: deployment.timestamp.toDate(),
                files: deployment.changes,
            });

            console.log(`Detected ${changes.length} changes`);

            // Step 2: Generate Documentation
            const documentation = await docGenerator.generateDocumentation(changes);

            // Save documentation
            await this.saveDocumentation(deployment.id, documentation);

            // Step 3: Update Training Materials
            for (const change of changes) {
                await trainingManager.updateTrainingMaterials(documentation, change.component);
            }

            // Step 4: Notify Stakeholders
            await this.notifyStakeholders(deployment, changes, documentation);

            // Mark as complete
            await this.updateDeploymentStatus(deployment.id, 'complete');

            console.log(`Deployment ${deployment.id} processed successfully`);
        } catch (error) {
            console.error(`Error processing deployment ${deployment.id}:`, error);
            await this.updateDeploymentStatus(deployment.id, 'failed');
            throw error;
        }
    }

    /**
     * Update deployment status
     */
    private async updateDeploymentStatus(
        deploymentId: string,
        status: Deployment['status']
    ): Promise<void> {
        await this.db.collection('deployments').doc(deploymentId).update({
            status,
            updatedAt: Timestamp.now(),
        });
    }

    /**
     * Save generated documentation
     */
    private async saveDocumentation(deploymentId: string, doc: any): Promise<void> {
        await this.db.collection('documentation').doc(deploymentId).set({
            deploymentId,
            ...doc,
            createdAt: Timestamp.now(),
        });
    }

    /**
     * Notify stakeholders of changes
     */
    private async notifyStakeholders(
        deployment: Deployment,
        changes: any[],
        documentation: any
    ): Promise<void> {
        // Email summaries to users
        await this.sendEmailSummaries(deployment, changes);

        // In-app notification badges
        await this.createInAppNotifications(deployment, changes);

        // Training team alerts
        const pendingVideos = await trainingManager.getPendingUpdates();
        if (pendingVideos.length > 0) {
            await trainingManager.notifyTrainingTeam(pendingVideos);
        }

        // Support team briefings
        await this.notifySupportTeam(deployment, changes);

        // Customer success updates
        await this.notifyCustomerSuccess(deployment, changes);
    }

    /**
     * Send email summaries
     */
    private async sendEmailSummaries(deployment: Deployment, changes: any[]): Promise<void> {
        const summary = {
            subject: `New Features Deployed - ${new Date().toLocaleDateString()}`,
            body: this.generateEmailBody(changes),
            recipients: ['all-users'],
            createdAt: Timestamp.now(),
        };

        await this.db.collection('email-queue').add(summary);
    }

    /**
     * Create in-app notifications
     */
    private async createInAppNotifications(deployment: Deployment, changes: any[]): Promise<void> {
        const notification = {
            type: 'deployment',
            title: 'New Features Available',
            message: `${changes.length} new features and improvements have been deployed`,
            actionUrl: '/training',
            createdAt: Timestamp.now(),
            read: false,
        };

        await this.db.collection('notifications').add(notification);
    }

    /**
     * Notify support team
     */
    private async notifySupportTeam(deployment: Deployment, changes: any[]): Promise<void> {
        const briefing = {
            deploymentId: deployment.id,
            changes: changes.map(c => ({
                component: c.component,
                type: c.type,
                description: c.description,
                impactLevel: c.impactLevel,
            })),
            recommendedActions: this.generateSupportActions(changes),
            createdAt: Timestamp.now(),
        };

        await this.db.collection('support-briefings').add(briefing);
    }

    /**
     * Notify customer success team
     */
    private async notifyCustomerSuccess(deployment: Deployment, changes: any[]): Promise<void> {
        const highImpactChanges = changes.filter(c => c.impactLevel === 'high');

        if (highImpactChanges.length > 0) {
            await this.db.collection('customer-success-alerts').add({
                deploymentId: deployment.id,
                alertType: 'high-impact-changes',
                changes: highImpactChanges,
                suggestedOutreach: 'Proactive customer communication recommended',
                createdAt: Timestamp.now(),
            });
        }
    }

    /**
     * Generate email body
     */
    private generateEmailBody(changes: any[]): string {
        let body = 'Hello,\n\nWe\'ve just deployed some exciting updates:\n\n';

        changes.forEach(change => {
            body += `• ${change.component}: ${change.description}\n`;
        });

        body += '\nVisit the Training Center to learn how to use these new features.\n\n';
        body += 'Best regards,\nThe PreFlight Pro Team';

        return body;
    }

    /**
     * Generate support team actions
     */
    private generateSupportActions(changes: any[]): string[] {
        const actions: string[] = [];

        changes.forEach(change => {
            if (change.type === 'ui') {
                actions.push(`Review ${change.component} UI changes in demo environment`);
            }
            if (change.type === 'api') {
                actions.push(`Test ${change.component} API endpoints`);
            }
            if (change.impactLevel === 'high') {
                actions.push(`Prepare FAQ for ${change.component} changes`);
            }
        });

        return actions;
    }
}

// Lazy singleton
let _autoDocSystem: AutoDocumentationSystem | null = null;
export function getAutoDocSystem(): AutoDocumentationSystem {
    if (!_autoDocSystem) {
        _autoDocSystem = new AutoDocumentationSystem();
    }
    return _autoDocSystem;
}

/**
 * Firebase Cloud Function: Deployment Webhook
 * Triggered when a new deployment is detected
 */
export const onDeploymentWebhook = functions.https.onRequest(async (req, res) => {
    try {
        if (req.method !== 'POST') {
            res.status(405).send('Method not allowed');
            return;
        }

        const deployment: Deployment = {
            id: `deploy-${Date.now()}`,
            timestamp: Timestamp.now(),
            environment: req.body.environment || 'production',
            commitHash: req.body.commitHash,
            branch: req.body.branch,
            author: req.body.author,
            changes: req.body.changes || [],
            status: 'pending',
        };

        // Save deployment record
        await admin.firestore().collection('deployments').doc(deployment.id).set(deployment);

        // Process asynchronously
        getAutoDocSystem().onDeployment(deployment).catch(error => {
            console.error('Error in auto-documentation:', error);
        });

        res.status(200).json({
            success: true,
            deploymentId: deployment.id,
            message: 'Deployment processing started',
        });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Firebase Cloud Function: Scheduled Documentation Review
 * Runs daily to check for pending documentation updates
 */
export const scheduledDocReview = functions.pubsub
    .schedule('0 9 * * *') // Run at 9 AM daily
    .onRun(async (context) => {
        const pendingUpdates = await trainingManager.getPendingUpdates();

        if (pendingUpdates.length > 0) {
            await trainingManager.notifyTrainingTeam(pendingUpdates);
            console.log(`Notified training team of ${pendingUpdates.length} pending videos`);
        }

        return null;
    });
