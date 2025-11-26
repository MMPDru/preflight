/**
 * Service Instances
 * Lazy initialization to avoid Firebase initialization errors
 */
import { ApprovalService } from './approval-service';
import { JobQueueService } from './job-queue-service';
import { NotificationService } from './notification-service';
import { RoutingEngine } from './routing-engine';
import { PermissionService } from './permission-service';
import { AuditService } from './audit-service';
import { SystemConfigService } from './system-config-service';
import { PricingService } from './pricing-service';
import { BackupService } from './backup-service';
export declare function getApprovalService(): ApprovalService;
export declare function getJobQueueService(): JobQueueService;
export declare function getNotificationService(): NotificationService;
export declare function getRoutingEngine(): RoutingEngine;
export declare function getPermissionService(): PermissionService;
export declare function getAuditService(): AuditService;
export declare function getSystemConfigService(): SystemConfigService;
export declare function getPricingService(): PricingService;
export declare function getBackupService(): BackupService;
export declare const approvalService: {
    get: typeof getApprovalService;
};
export declare const jobQueueService: {
    get: typeof getJobQueueService;
};
export declare const notificationService: {
    get: typeof getNotificationService;
};
export declare const routingEngine: {
    get: typeof getRoutingEngine;
};
export declare const permissionService: {
    get: typeof getPermissionService;
};
export declare const auditService: {
    get: typeof getAuditService;
};
export declare const systemConfigService: {
    get: typeof getSystemConfigService;
};
export declare const pricingService: {
    get: typeof getPricingService;
};
export declare const backupService: {
    get: typeof getBackupService;
};
//# sourceMappingURL=service-instances.d.ts.map