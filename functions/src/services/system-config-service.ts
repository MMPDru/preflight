/**
 * System Configuration Service
 * Manages system settings, branding, feature toggles, and API configuration
 */

import { firestore } from 'firebase-admin';
import type {
    SystemConfig,
    BrandingConfig,
    EmailTemplateConfig,
    FeatureToggle,
    APIConfig,
    ConfigCategory,
} from '../types/admin-types';

export class SystemConfigService {
    private db: firestore.Firestore;

    constructor(db: firestore.Firestore) {
        this.db = db;
    }

    /**
     * Get system configuration by category
     */
    async getConfig(category: ConfigCategory): Promise<SystemConfig | null> {
        const doc = await this.db.collection('system-config').doc(category).get();
        return doc.exists ? (doc.data() as SystemConfig) : null;
    }

    /**
     * Update system configuration
     */
    async updateConfig(
        category: ConfigCategory,
        settings: Record<string, any>,
        updatedBy: string
    ): Promise<void> {
        const config: SystemConfig = {
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
    async getBranding(): Promise<BrandingConfig> {
        const config = await this.getConfig('branding');

        if (!config) {
            // Return default branding
            return {
                primaryColor: '#6366f1',
                secondaryColor: '#8b5cf6',
                companyName: 'PreFlight Pro',
            };
        }

        return config.settings as BrandingConfig;
    }

    /**
     * Update branding configuration
     */
    async updateBranding(branding: BrandingConfig, updatedBy: string): Promise<void> {
        await this.updateConfig('branding', branding, updatedBy);
    }

    /**
     * Get email template
     */
    async getEmailTemplate(templateId: string): Promise<EmailTemplateConfig | null> {
        const doc = await this.db.collection('email-templates').doc(templateId).get();
        return doc.exists ? (doc.data() as EmailTemplateConfig) : null;
    }

    /**
     * Get all email templates
     */
    async getEmailTemplates(): Promise<EmailTemplateConfig[]> {
        const snapshot = await this.db.collection('email-templates').get();
        return snapshot.docs.map(doc => doc.data() as EmailTemplateConfig);
    }

    /**
     * Update email template
     */
    async updateEmailTemplate(template: EmailTemplateConfig): Promise<void> {
        await this.db.collection('email-templates').doc(template.id).set({
            ...template,
            updatedAt: new Date(),
        });
    }

    /**
     * Create default email templates
     */
    async initializeEmailTemplates(): Promise<void> {
        const templates: EmailTemplateConfig[] = [
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
    async getFeatureToggle(featureId: string): Promise<FeatureToggle | null> {
        const doc = await this.db.collection('feature-toggles').doc(featureId).get();
        return doc.exists ? (doc.data() as FeatureToggle) : null;
    }

    /**
     * Get all feature toggles
     */
    async getFeatureToggles(): Promise<FeatureToggle[]> {
        const snapshot = await this.db.collection('feature-toggles').get();
        return snapshot.docs.map(doc => doc.data() as FeatureToggle);
    }

    /**
     * Update feature toggle
     */
    async updateFeatureToggle(toggle: FeatureToggle): Promise<void> {
        await this.db.collection('feature-toggles').doc(toggle.id).set({
            ...toggle,
            updatedAt: new Date(),
        });
    }

    /**
     * Check if feature is enabled for user
     */
    async isFeatureEnabled(featureId: string, userId?: string): Promise<boolean> {
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
    async getAPIConfig(apiKeyId: string): Promise<APIConfig | null> {
        const doc = await this.db.collection('api-configs').doc(apiKeyId).get();
        return doc.exists ? (doc.data() as APIConfig) : null;
    }

    /**
     * Create API configuration
     */
    async createAPIConfig(config: Omit<APIConfig, 'createdAt'>): Promise<APIConfig> {
        const fullConfig: APIConfig = {
            ...config,
            createdAt: new Date(),
        };

        await this.db.collection('api-configs').doc(config.apiKey).set(fullConfig);
        return fullConfig;
    }

    /**
     * Update API configuration
     */
    async updateAPIConfig(apiKey: string, updates: Partial<APIConfig>): Promise<void> {
        await this.db.collection('api-configs').doc(apiKey).update(updates);
    }

    /**
     * Delete API configuration
     */
    async deleteAPIConfig(apiKey: string): Promise<void> {
        await this.db.collection('api-configs').doc(apiKey).delete();
    }

    /**
     * Get general system settings
     */
    async getGeneralSettings(): Promise<Record<string, any>> {
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
    async updateGeneralSettings(settings: Record<string, any>, updatedBy: string): Promise<void> {
        await this.updateConfig('general', settings, updatedBy);
    }
}

export const systemConfigService = new SystemConfigService(firestore());
