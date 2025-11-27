/**
 * Service Instances
 * Lazy initialization to avoid Firebase initialization errors
 */

import { firestore, storage } from 'firebase-admin';
import { ApprovalService } from './approval-service';
import { JobQueueService } from './job-queue-service';
import { NotificationService } from './notification-service';
import { RoutingEngine } from './routing-engine';
import { PermissionService } from './permission-service';
import { AuditService } from './audit-service';
import { SystemConfigService } from './system-config-service';
import { PricingService } from './pricing-service';
import { BackupService } from './backup-service';
import { PdfAnalyzerService } from './pdf-analyzer';
import { PdfFixerService } from './pdf-fixer';
import { EmailNotificationService } from './email-notification-service';
import { GhostscriptService } from './ghostscript-service';

// Lazy-initialized service instances
let _approvalService: ApprovalService | null = null;
let _jobQueueService: JobQueueService | null = null;
let _notificationService: NotificationService | null = null;
let _routingEngine: RoutingEngine | null = null;
let _permissionService: PermissionService | null = null;
let _auditService: AuditService | null = null;
let _systemConfigService: SystemConfigService | null = null;
let _pricingService: PricingService | null = null;
let _backupService: BackupService | null = null;
let _pdfAnalyzerService: PdfAnalyzerService | null = null;
let _pdfFixerService: PdfFixerService | null = null;
let _emailNotificationService: EmailNotificationService | null = null;
let _ghostscriptService: GhostscriptService | null = null;

export function getApprovalService(): ApprovalService {
    if (!_approvalService) {
        _approvalService = new ApprovalService(firestore());
    }
    return _approvalService;
}

export function getJobQueueService(): JobQueueService {
    if (!_jobQueueService) {
        _jobQueueService = new JobQueueService(firestore());
    }
    return _jobQueueService;
}

export function getNotificationService(): NotificationService {
    if (!_notificationService) {
        _notificationService = new NotificationService(firestore());
    }
    return _notificationService;
}

export function getRoutingEngine(): RoutingEngine {
    if (!_routingEngine) {
        _routingEngine = new RoutingEngine(firestore());
    }
    return _routingEngine;
}

export function getPermissionService(): PermissionService {
    if (!_permissionService) {
        _permissionService = new PermissionService(firestore());
    }
    return _permissionService;
}

export function getAuditService(): AuditService {
    if (!_auditService) {
        _auditService = new AuditService(firestore());
    }
    return _auditService;
}

export function getSystemConfigService(): SystemConfigService {
    if (!_systemConfigService) {
        _systemConfigService = new SystemConfigService(firestore());
    }
    return _systemConfigService;
}

export function getPricingService(): PricingService {
    if (!_pricingService) {
        _pricingService = new PricingService(firestore());
    }
    return _pricingService;
}

export function getBackupService(): BackupService {
    if (!_backupService) {
        _backupService = new BackupService(firestore(), storage().bucket());
    }
    return _backupService;
}

export function getPdfAnalyzer(): PdfAnalyzerService {
    if (!_pdfAnalyzerService) {
        _pdfAnalyzerService = new PdfAnalyzerService();
    }
    return _pdfAnalyzerService;
}

export function getPdfFixer(): PdfFixerService {
    if (!_pdfFixerService) {
        _pdfFixerService = new PdfFixerService(getPdfAnalyzer(), getGhostscriptService());
    }
    return _pdfFixerService;
}

export function getEmailService(): EmailNotificationService {
    if (!_emailNotificationService) {
        _emailNotificationService = new EmailNotificationService();
    }
    return _emailNotificationService;
}

export function getGhostscriptService(): GhostscriptService {
    if (!_ghostscriptService) {
        _ghostscriptService = new GhostscriptService();
    }
    return _ghostscriptService;
}

// Legacy exports for backward compatibility
export const approvalService = { get: getApprovalService };
export const jobQueueService = { get: getJobQueueService };
export const notificationService = { get: getNotificationService };
export const routingEngine = { get: getRoutingEngine };
export const permissionService = { get: getPermissionService };
export const auditService = { get: getAuditService };
export const systemConfigService = { get: getSystemConfigService };
export const pricingService = { get: getPricingService };
export const backupService = { get: getBackupService };
export const pdfAnalyzer = { get: getPdfAnalyzer };
export const pdfFixer = { get: getPdfFixer };
export const emailService = { get: getEmailService };
export const ghostscript = { get: getGhostscriptService };
