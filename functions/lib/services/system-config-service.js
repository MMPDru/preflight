"use strict";
/**
 * System Configuration Service
 * Manages system settings, branding, feature toggles, and API configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemConfigService = exports.SystemConfigService = void 0;
const firebase_admin_1 = require("firebase-admin");
class SystemConfigService {
    constructor(db) {
        this.db = db;
    }
    /**
     * Get system configuration by category
     */
    async getConfig(category) {
        const doc = await this.db.collection('system-config').doc(category).get();
        return doc.exists ? doc.data() : null;
    }
    /**
     * Update system configuration
     */
    async updateConfig(category, settings, updatedBy) {
        const config = {
            id: category,
            category,
            settings,
            updatedBy,
            updatedAt: new Date(),
        };
        await this.db.collection('system-config').doc(category).set(config);
    }
    /**
     * Get branding configuration
     */
    async getBranding() {
        const config = await this.getConfig('branding');
        if (!config) {
            // Return default branding
            return {
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                companyName: 'PreFlight Pro',
            };
        }
        return config.settings;
    }
    /**
     * Update branding configuration
     */
    async updateBranding(branding, updatedBy) {
        await this.updateConfig('branding', branding, updatedBy);
    }
    /**
     * Get email template
     */
    async getEmailTemplate(templateId) {
        const doc = await this.db.collection('email-templates').doc(templateId).get();
        return doc.exists ? doc.data() : null;
    }
    /**
     * Get all email templates
     */
    async getEmailTemplates() {
        const snapshot = await this.db.collection('email-templates').get();
        return snapshot.docs.map(doc => doc.data());
    }
    /**
     * Update email template
     */
    async updateEmailTemplate(template) {
        await this.db.collection('email-templates').doc(template.id).set({
            ...template,
            updatedAt: new Date(),
        });
    }
    /**
     * Create default email templates
     */
    async initializeEmailTemplates() {
        const templates = [
            {
                id: 'proof-ready',
                name: 'Proof Ready',
                category: 'notifications',
                subject: 'Your proof is ready for review',
                htmlBody: '<p>Hi {{customerName}},</p><p>Your proof for job {{jobName}} is ready for review.</p><p><a href="{{proofUrl}}">View Proof</a></p>',
                textBody: 'Hi {{customerName}}, Your proof for job {{jobName}} is ready for review. View at: {{proofUrl}}',
                variables: [
                    { name: 'customerName', description: 'Customer name', example: 'John Doe', required: true },
                    { name: 'jobName', description: 'Job name', example: 'Business Cards', required: true },
                    { name: 'proofUrl', description: 'Proof URL', example: 'https://...', required: true },
                ],
                version: 1,
                updatedAt: new Date(),
            },
            {
                id: 'approval-request',
                name: 'Approval Request',
                category: 'approvals',
                subject: 'Approval required for {{jobName}}',
                htmlBody: '<p>Hi {{approverName}},</p><p>Your approval is required for {{jobName}}.</p><p><a href="{{approvalUrl}}">Review and Approve</a></p>',
                textBody: 'Hi {{approverName}}, Your approval is required for {{jobName}}. Review at: {{approvalUrl}}',
                variables: [
                    { name: 'approverName', description: 'Approver name', example: 'Jane Smith', required: true },
                    { name: 'jobName', description: 'Job name', example: 'Brochure', required: true },
                    { name: 'approvalUrl', description: 'Approval URL', example: 'https://...', required: true },
                ],
                version: 1,
                updatedAt: new Date(),
            },
            {
                id: 'issue-detected',
                name: 'Issue Detected',
                category: 'alerts',
                subject: 'Issues detected in {{jobName}}',
                htmlBody: '<p>Hi {{customerName}},</p><p>We detected {{issueCount}} issues in your file:</p><ul>{{issueList}}</ul><p><a href="{{jobUrl}}">View Details</a></p>',
                textBody: 'Hi {{customerName}}, We detected {{issueCount}} issues in your file. View details at: {{jobUrl}}',
                variables: [
                    { name: 'customerName', description: 'Customer name', example: 'John Doe', required: true },
                    { name: 'jobName', description: 'Job name', example: 'Flyer', required: true },
                    { name: 'issueCount', description: 'Number of issues', example: '3', required: true },
                    { name: 'issueList', description: 'List of issues', example: '<li>RGB colors</li>', required: false },
                    { name: 'jobUrl', description: 'Job URL', example: 'https://...', required: true },
                ],
                version: 1,
                updatedAt: new Date(),
            },
        ];
        for (const template of templates) {
            await this.db.collection('email-templates').doc(template.id).set(template);
        }
    }
    /**
     * Get feature toggle
     */
    async getFeatureToggle(featureId) {
        const doc = await this.db.collection('feature-toggles').doc(featureId).get();
        return doc.exists ? doc.data() : null;
    }
    /**
     * Get all feature toggles
     */
    async getFeatureToggles() {
        const snapshot = await this.db.collection('feature-toggles').get();
        return snapshot.docs.map(doc => doc.data());
    }
    /**
     * Update feature toggle
     */
    async updateFeatureToggle(toggle) {
        await this.db.collection('feature-toggles').doc(toggle.id).set({
            ...toggle,
            updatedAt: new Date(),
        });
    }
    /**
     * Check if feature is enabled for user
     */
    async isFeatureEnabled(featureId, userId) {
        const toggle = await this.getFeatureToggle(featureId);
        if (!toggle) {
            return false; // Feature doesn't exist
        }
        if (!toggle.enabled) {
            return false; // Feature globally disabled
        }
        if (!toggle.enabledFor || toggle.enabledFor.length === 0) {
            return true; // Feature enabled for everyone
        }
        if (userId && toggle.enabledFor.includes(userId)) {
            return true; // Feature enabled for this user
        }
        return false;
    }
    /**
     * Get API configuration
     */
    async getAPIConfig(apiKeyId) {
        const doc = await this.db.collection('api-configs').doc(apiKeyId).get();
        return doc.exists ? doc.data() : null;
    }
    /**
     * Create API configuration
     */
    async createAPIConfig(config) {
        const fullConfig = {
            ...config,
            createdAt: new Date(),
        };
        await this.db.collection('api-configs').doc(config.apiKey).set(fullConfig);
        return fullConfig;
    }
    /**
     * Update API configuration
     */
    async updateAPIConfig(apiKey, updates) {
        await this.db.collection('api-configs').doc(apiKey).update(updates);
    }
    /**
     * Delete API configuration
     */
    async deleteAPIConfig(apiKey) {
        await this.db.collection('api-configs').doc(apiKey).delete();
    }
    /**
     * Get general system settings
     */
    async getGeneralSettings() {
        const config = await this.getConfig('general');
        if (!config) {
            // Return default settings
            return {
                maxFileSize: 100 * 1024 * 1024, // 100MB
                allowedFileTypes: ['pdf'],
                sessionTimeout: 3600, // 1 hour
                maxUploadConcurrency: 5,
            };
        }
        return config.settings;
    }
    /**
     * Update general settings
     */
    async updateGeneralSettings(settings, updatedBy) {
        await this.updateConfig('general', settings, updatedBy);
    }
}
exports.SystemConfigService = SystemConfigService;
exports.systemConfigService = new SystemConfigService((0, firebase_admin_1.firestore)());
//# sourceMappingURL=system-config-service.js.map