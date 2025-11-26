/**
 * Admin and Business Feature Type Definitions
 * Phase 3: Permissions, Workflows, Pricing, Audit
 */
export interface Permission {
    id: string;
    name: string;
    resource: string;
    actions: PermissionAction[];
    description: string;
    category: PermissionCategory;
}
export type PermissionAction = 'read' | 'write' | 'delete' | 'admin' | 'execute';
export type PermissionCategory = 'jobs' | 'users' | 'approvals' | 'settings' | 'reports' | 'billing' | 'system';
export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    isCustom: boolean;
    isSystem: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserPermissions {
    userId: string;
    roleId: string;
    customPermissions?: string[];
    deniedPermissions?: string[];
    expiresAt?: Date;
    assignedBy: string;
    assignedAt: Date;
}
export interface PermissionCheck {
    userId: string;
    resource: string;
    action: PermissionAction;
    resourceId?: string;
}
export interface PermissionCheckResult {
    allowed: boolean;
    reason?: string;
    matchedPermissions?: string[];
}
export interface Workflow {
    id: string;
    name: string;
    description?: string;
    trigger: WorkflowTrigger;
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
    variables: WorkflowVariable[];
    enabled: boolean;
    version: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    lastExecuted?: Date;
}
export interface WorkflowTrigger {
    type: TriggerType;
    config: Record<string, any>;
}
export type TriggerType = 'file-upload' | 'status-change' | 'time-based' | 'manual' | 'webhook' | 'approval-complete';
export interface WorkflowNode {
    id: string;
    type: NodeType;
    label: string;
    config: Record<string, any>;
    position: {
        x: number;
        y: number;
    };
}
export type NodeType = 'approval' | 'notification' | 'condition' | 'action' | 'delay' | 'transform' | 'split' | 'merge';
export interface WorkflowConnection {
    id: string;
    from: string;
    to: string;
    condition?: string;
}
export interface WorkflowVariable {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    defaultValue?: any;
    description?: string;
}
export interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    startedAt: Date;
    completedAt?: Date;
    currentNode?: string;
    variables: Record<string, any>;
    logs: WorkflowLog[];
    error?: string;
}
export interface WorkflowLog {
    timestamp: Date;
    nodeId: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    data?: any;
}
export interface PricingRule {
    id: string;
    name: string;
    description?: string;
    type: PricingRuleType;
    conditions: PricingCondition[];
    price: number;
    unit: PricingUnit;
    priority: number;
    enabled: boolean;
    validFrom?: Date;
    validUntil?: Date;
    createdBy: string;
    createdAt: Date;
}
export type PricingRuleType = 'base' | 'volume' | 'customer' | 'addon' | 'discount' | 'surcharge';
export type PricingUnit = 'page' | 'job' | 'hour' | 'item' | 'percentage';
export interface PricingCondition {
    field: string;
    operator: 'equals' | 'greater-than' | 'less-than' | 'in' | 'between';
    value: any;
}
export interface Quote {
    id: string;
    jobId: string;
    customerId: string;
    items: QuoteItem[];
    subtotal: number;
    discounts: QuoteDiscount[];
    tax: number;
    total: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
    validUntil: Date;
    createdAt: Date;
    acceptedAt?: Date;
}
export interface QuoteItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    appliedRules: string[];
}
export interface QuoteDiscount {
    id: string;
    description: string;
    amount: number;
    type: 'fixed' | 'percentage';
    ruleId?: string;
}
export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    action: AuditAction;
    resource: string;
    resourceId: string;
    changes?: AuditChange[];
    metadata?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'permission-change' | 'export' | 'import' | 'backup' | 'restore';
export interface AuditChange {
    field: string;
    oldValue: any;
    newValue: any;
}
export interface AuditQuery {
    userId?: string;
    action?: AuditAction;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    severity?: string;
    limit?: number;
    offset?: number;
}
export interface ComplianceReport {
    id: string;
    type: 'gdpr' | 'data-access' | 'retention' | 'deletion';
    startDate: Date;
    endDate: Date;
    data: Record<string, any>;
    generatedAt: Date;
    generatedBy: string;
}
export interface SystemConfig {
    id: string;
    category: ConfigCategory;
    settings: Record<string, any>;
    updatedBy: string;
    updatedAt: Date;
}
export type ConfigCategory = 'general' | 'email' | 'storage' | 'security' | 'features' | 'branding' | 'api';
export interface BrandingConfig {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
    companyName: string;
    emailSignature?: string;
    pdfWatermark?: string;
}
export interface EmailTemplateConfig {
    id: string;
    name: string;
    category: string;
    subject: string;
    htmlBody: string;
    textBody: string;
    variables: TemplateVariable[];
    version: number;
    updatedAt: Date;
}
export interface TemplateVariable {
    name: string;
    description: string;
    example: string;
    required: boolean;
}
export interface FeatureToggle {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    enabledFor?: string[];
    updatedAt: Date;
}
export interface APIConfig {
    apiKey: string;
    secretKey: string;
    rateLimit: number;
    webhookUrl?: string;
    webhookSecret?: string;
    allowedOrigins: string[];
    createdAt: Date;
    expiresAt?: Date;
}
export interface Backup {
    id: string;
    type: BackupType;
    status: 'in-progress' | 'completed' | 'failed';
    size: number;
    collections: string[];
    storageUrl: string;
    createdBy: string;
    createdAt: Date;
    completedAt?: Date;
    error?: string;
}
export type BackupType = 'full' | 'incremental' | 'manual';
export interface RestoreOperation {
    id: string;
    backupId: string;
    status: 'in-progress' | 'completed' | 'failed';
    collections: string[];
    startedBy: string;
    startedAt: Date;
    completedAt?: Date;
    error?: string;
}
export interface DataExport {
    id: string;
    format: 'json' | 'csv' | 'excel';
    collections: string[];
    filters?: Record<string, any>;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
    expiresAt?: Date;
    createdBy: string;
    createdAt: Date;
}
export interface DataImport {
    id: string;
    format: 'json' | 'csv' | 'excel';
    collection: string;
    fileUrl: string;
    status: 'pending' | 'validating' | 'importing' | 'completed' | 'failed';
    totalRecords: number;
    importedRecords: number;
    failedRecords: number;
    errors?: ImportError[];
    createdBy: string;
    createdAt: Date;
}
export interface ImportError {
    row: number;
    field?: string;
    message: string;
    data?: any;
}
export interface AdminAnalytics {
    totalUsers: number;
    activeUsers: number;
    totalJobs: number;
    completedJobs: number;
    revenue: number;
    topCustomers: CustomerMetric[];
    systemHealth: SystemHealth;
    period: 'day' | 'week' | 'month' | 'year';
}
export interface CustomerMetric {
    customerId: string;
    customerName: string;
    jobCount: number;
    revenue: number;
    avgJobValue: number;
}
export interface SystemHealth {
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    responseTime: number;
    errorRate: number;
    queueDepth: number;
    storageUsed: number;
    storageLimit: number;
}
//# sourceMappingURL=admin-types.d.ts.map