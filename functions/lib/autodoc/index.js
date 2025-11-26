"use strict";
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
exports.scheduledDocReview = exports.onDeploymentWebhook = exports.autoDocSystem = exports.AutoDocumentationSystem = void 0;
const functions = __importStar(require("firebase-functions"));
const changeDetector_1 = require("./changeDetector");
const documentationGenerator_1 = require("./documentationGenerator");
const trainingContentManager_1 = require("./trainingContentManager");
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const db = admin.firestore();
class AutoDocumentationSystem {
    /**
     * Main handler triggered on deployment
     */
    async onDeployment(deployment) {
        console.log(`Processing deployment: ${deployment.id}`);
        try {
            // Update deployment status
            await this.updateDeploymentStatus(deployment.id, 'processing');
            // Step 1: Detect Changes
            const changes = await changeDetector_1.changeDetector.analyzeCommit({
                sha: deployment.commitHash,
                message: deployment.changes.map((c) => c.message).join('\n'),
                author: { name: deployment.author },
                timestamp: deployment.timestamp.toDate(),
                files: deployment.changes,
            });
            console.log(`Detected ${changes.length} changes`);
            // Step 2: Generate Documentation
            const documentation = await documentationGenerator_1.docGenerator.generateDocumentation(changes);
            // Save documentation
            await this.saveDocumentation(deployment.id, documentation);
            // Step 3: Update Training Materials
            for (const change of changes) {
                await trainingContentManager_1.trainingManager.updateTrainingMaterials(documentation, change.component);
            }
            // Step 4: Notify Stakeholders
            await this.notifyStakeholders(deployment, changes, documentation);
            // Mark as complete
            await this.updateDeploymentStatus(deployment.id, 'complete');
            console.log(`Deployment ${deployment.id} processed successfully`);
        }
        catch (error) {
            console.error(`Error processing deployment ${deployment.id}:`, error);
            await this.updateDeploymentStatus(deployment.id, 'failed');
            throw error;
        }
    }
    /**
     * Update deployment status
     */
    async updateDeploymentStatus(deploymentId, status) {
        await db.collection('deployments').doc(deploymentId).update({
            status,
            updatedAt: firestore_1.Timestamp.now(),
        });
    }
    /**
     * Save generated documentation
     */
    async saveDocumentation(deploymentId, doc) {
        await db.collection('documentation').doc(deploymentId).set({
            deploymentId,
            ...doc,
            createdAt: firestore_1.Timestamp.now(),
        });
    }
    /**
     * Notify stakeholders of changes
     */
    async notifyStakeholders(deployment, changes, documentation) {
        // Email summaries to users
        await this.sendEmailSummaries(deployment, changes);
        // In-app notification badges
        await this.createInAppNotifications(deployment, changes);
        // Training team alerts
        const pendingVideos = await trainingContentManager_1.trainingManager.getPendingUpdates();
        if (pendingVideos.length > 0) {
            await trainingContentManager_1.trainingManager.notifyTrainingTeam(pendingVideos);
        }
        // Support team briefings
        await this.notifySupportTeam(deployment, changes);
        // Customer success updates
        await this.notifyCustomerSuccess(deployment, changes);
    }
    /**
     * Send email summaries
     */
    async sendEmailSummaries(deployment, changes) {
        const summary = {
            subject: `New Features Deployed - ${new Date().toLocaleDateString()}`,
            body: this.generateEmailBody(changes),
            recipients: ['all-users'],
            createdAt: firestore_1.Timestamp.now(),
        };
        await db.collection('email-queue').add(summary);
    }
    /**
     * Create in-app notifications
     */
    async createInAppNotifications(deployment, changes) {
        const notification = {
            type: 'deployment',
            title: 'New Features Available',
            message: `${changes.length} new features and improvements have been deployed`,
            actionUrl: '/training',
            createdAt: firestore_1.Timestamp.now(),
            read: false,
        };
        await db.collection('notifications').add(notification);
    }
    /**
     * Notify support team
     */
    async notifySupportTeam(deployment, changes) {
        const briefing = {
            deploymentId: deployment.id,
            changes: changes.map(c => ({
                component: c.component,
                type: c.type,
                description: c.description,
                impactLevel: c.impactLevel,
            })),
            recommendedActions: this.generateSupportActions(changes),
            createdAt: firestore_1.Timestamp.now(),
        };
        await db.collection('support-briefings').add(briefing);
    }
    /**
     * Notify customer success team
     */
    async notifyCustomerSuccess(deployment, changes) {
        const highImpactChanges = changes.filter(c => c.impactLevel === 'high');
        if (highImpactChanges.length > 0) {
            await db.collection('customer-success-alerts').add({
                deploymentId: deployment.id,
                alertType: 'high-impact-changes',
                changes: highImpactChanges,
                suggestedOutreach: 'Proactive customer communication recommended',
                createdAt: firestore_1.Timestamp.now(),
            });
        }
    }
    /**
     * Generate email body
     */
    generateEmailBody(changes) {
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
    generateSupportActions(changes) {
        const actions = [];
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
exports.AutoDocumentationSystem = AutoDocumentationSystem;
exports.autoDocSystem = new AutoDocumentationSystem();
/**
 * Firebase Cloud Function: Deployment Webhook
 * Triggered when a new deployment is detected
 */
exports.onDeploymentWebhook = functions.https.onRequest(async (req, res) => {
    try {
        if (req.method !== 'POST') {
            res.status(405).send('Method not allowed');
            return;
        }
        const deployment = {
            id: `deploy-${Date.now()}`,
            timestamp: firestore_1.Timestamp.now(),
            environment: req.body.environment || 'production',
            commitHash: req.body.commitHash,
            branch: req.body.branch,
            author: req.body.author,
            changes: req.body.changes || [],
            status: 'pending',
        };
        // Save deployment record
        await db.collection('deployments').doc(deployment.id).set(deployment);
        // Process asynchronously
        exports.autoDocSystem.onDeployment(deployment).catch(error => {
            console.error('Error in auto-documentation:', error);
        });
        res.status(200).json({
            success: true,
            deploymentId: deployment.id,
            message: 'Deployment processing started',
        });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * Firebase Cloud Function: Scheduled Documentation Review
 * Runs daily to check for pending documentation updates
 */
exports.scheduledDocReview = functions.pubsub
    .schedule('0 9 * * *') // Run at 9 AM daily
    .onRun(async (context) => {
    const pendingUpdates = await trainingContentManager_1.trainingManager.getPendingUpdates();
    if (pendingUpdates.length > 0) {
        await trainingContentManager_1.trainingManager.notifyTrainingTeam(pendingUpdates);
        console.log(`Notified training team of ${pendingUpdates.length} pending videos`);
    }
    return null;
});
//# sourceMappingURL=index.js.map