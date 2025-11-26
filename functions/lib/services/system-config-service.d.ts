/**
 * System Configuration Service
 * Manages system settings, branding, feature toggles, and API configuration
 */
import { firestore } from 'firebase-admin';
import type { SystemConfig, BrandingConfig, EmailTemplateConfig, FeatureToggle, APIConfig, ConfigCategory } from '../types/admin-types';
export declare class SystemConfigService {
    private db;
    constructor(db: firestore.Firestore);
    /**
     * Get system configuration by category
     */
    getConfig(category: ConfigCategory): Promise<SystemConfig | null>;
    /**
     * Update system configuration
     */
    updateConfig(category: ConfigCategory, settings: Record<string, any>, updatedBy: string): Promise<void>;
    /**
     * Get branding configuration
     */
    getBranding(): Promise<BrandingConfig>;
    /**
     * Update branding configuration
     */
    updateBranding(branding: BrandingConfig, updatedBy: string): Promise<void>;
    /**
     * Get email template
     */
    getEmailTemplate(templateId: string): Promise<EmailTemplateConfig | null>;
    /**
     * Get all email templates
     */
    getEmailTemplates(): Promise<EmailTemplateConfig[]>;
    /**
     * Update email template
     */
    updateEmailTemplate(template: EmailTemplateConfig): Promise<void>;
    /**
     * Create default email templates
     */
    initializeEmailTemplates(): Promise<void>;
    /**
     * Get feature toggle
     */
    getFeatureToggle(featureId: string): Promise<FeatureToggle | null>;
    /**
     * Get all feature toggles
     */
    getFeatureToggles(): Promise<FeatureToggle[]>;
    /**
     * Update feature toggle
     */
    updateFeatureToggle(toggle: FeatureToggle): Promise<void>;
    /**
     * Check if feature is enabled for user
     */
    isFeatureEnabled(featureId: string, userId?: string): Promise<boolean>;
    /**
     * Get API configuration
     */
    getAPIConfig(apiKeyId: string): Promise<APIConfig | null>;
    /**
     * Create API configuration
     */
    createAPIConfig(config: Omit<APIConfig, 'createdAt'>): Promise<APIConfig>;
    /**
     * Update API configuration
     */
    updateAPIConfig(apiKey: string, updates: Partial<APIConfig>): Promise<void>;
    /**
     * Delete API configuration
     */
    deleteAPIConfig(apiKey: string): Promise<void>;
    /**
     * Get general system settings
     */
    getGeneralSettings(): Promise<Record<string, any>>;
    /**
     * Update general settings
     */
    updateGeneralSettings(settings: Record<string, any>, updatedBy: string): Promise<void>;
}
export declare const systemConfigService: SystemConfigService;
//# sourceMappingURL=system-config-service.d.ts.map