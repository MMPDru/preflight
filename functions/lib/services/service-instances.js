"use strict";
/**
 * Service Instances
 * Lazy initialization to avoid Firebase initialization errors
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ghostscript = exports.emailService = exports.pdfFixer = exports.pdfAnalyzer = exports.backupService = exports.pricingService = exports.systemConfigService = exports.auditService = exports.permissionService = exports.routingEngine = exports.notificationService = exports.jobQueueService = exports.approvalService = void 0;
exports.getApprovalService = getApprovalService;
exports.getJobQueueService = getJobQueueService;
exports.getNotificationService = getNotificationService;
exports.getRoutingEngine = getRoutingEngine;
exports.getPermissionService = getPermissionService;
exports.getAuditService = getAuditService;
exports.getSystemConfigService = getSystemConfigService;
exports.getPricingService = getPricingService;
exports.getBackupService = getBackupService;
exports.getPdfAnalyzer = getPdfAnalyzer;
exports.getPdfFixer = getPdfFixer;
exports.getEmailService = getEmailService;
exports.getGhostscriptService = getGhostscriptService;
const firebase_admin_1 = require("firebase-admin");
const approval_service_1 = require("./approval-service");
const job_queue_service_1 = require("./job-queue-service");
const notification_service_1 = require("./notification-service");
const routing_engine_1 = require("./routing-engine");
const permission_service_1 = require("./permission-service");
const audit_service_1 = require("./audit-service");
const system_config_service_1 = require("./system-config-service");
const pricing_service_1 = require("./pricing-service");
const backup_service_1 = require("./backup-service");
const pdf_analyzer_1 = require("./pdf-analyzer");
const pdf_fixer_1 = require("./pdf-fixer");
const email_notification_service_1 = require("./email-notification-service");
const ghostscript_service_1 = require("./ghostscript-service");
// Lazy-initialized service instances
let _approvalService = null;
let _jobQueueService = null;
let _notificationService = null;
let _routingEngine = null;
let _permissionService = null;
let _auditService = null;
let _systemConfigService = null;
let _pricingService = null;
let _backupService = null;
let _pdfAnalyzerService = null;
let _pdfFixerService = null;
let _emailNotificationService = null;
let _ghostscriptService = null;
function getApprovalService() {
    if (!_approvalService) {
        _approvalService = new approval_service_1.ApprovalService((0, firebase_admin_1.firestore)());
    }
    return _approvalService;
}
function getJobQueueService() {
    if (!_jobQueueService) {
        _jobQueueService = new job_queue_service_1.JobQueueService((0, firebase_admin_1.firestore)());
    }
    return _jobQueueService;
}
function getNotificationService() {
    if (!_notificationService) {
        _notificationService = new notification_service_1.NotificationService((0, firebase_admin_1.firestore)());
    }
    return _notificationService;
}
function getRoutingEngine() {
    if (!_routingEngine) {
        _routingEngine = new routing_engine_1.RoutingEngine((0, firebase_admin_1.firestore)());
    }
    return _routingEngine;
}
function getPermissionService() {
    if (!_permissionService) {
        _permissionService = new permission_service_1.PermissionService((0, firebase_admin_1.firestore)());
    }
    return _permissionService;
}
function getAuditService() {
    if (!_auditService) {
        _auditService = new audit_service_1.AuditService((0, firebase_admin_1.firestore)());
    }
    return _auditService;
}
function getSystemConfigService() {
    if (!_systemConfigService) {
        _systemConfigService = new system_config_service_1.SystemConfigService((0, firebase_admin_1.firestore)());
    }
    return _systemConfigService;
}
function getPricingService() {
    if (!_pricingService) {
        _pricingService = new pricing_service_1.PricingService((0, firebase_admin_1.firestore)());
    }
    return _pricingService;
}
function getBackupService() {
    if (!_backupService) {
        _backupService = new backup_service_1.BackupService((0, firebase_admin_1.firestore)(), (0, firebase_admin_1.storage)().bucket());
    }
    return _backupService;
}
function getPdfAnalyzer() {
    if (!_pdfAnalyzerService) {
        _pdfAnalyzerService = new pdf_analyzer_1.PdfAnalyzerService();
    }
    return _pdfAnalyzerService;
}
function getPdfFixer() {
    if (!_pdfFixerService) {
        _pdfFixerService = new pdf_fixer_1.PdfFixerService(getPdfAnalyzer(), getGhostscriptService());
    }
    return _pdfFixerService;
}
function getEmailService() {
    if (!_emailNotificationService) {
        _emailNotificationService = new email_notification_service_1.EmailNotificationService();
    }
    return _emailNotificationService;
}
function getGhostscriptService() {
    if (!_ghostscriptService) {
        _ghostscriptService = new ghostscript_service_1.GhostscriptService();
    }
    return _ghostscriptService;
}
// Legacy exports for backward compatibility
exports.approvalService = { get: getApprovalService };
exports.jobQueueService = { get: getJobQueueService };
exports.notificationService = { get: getNotificationService };
exports.routingEngine = { get: getRoutingEngine };
exports.permissionService = { get: getPermissionService };
exports.auditService = { get: getAuditService };
exports.systemConfigService = { get: getSystemConfigService };
exports.pricingService = { get: getPricingService };
exports.backupService = { get: getBackupService };
exports.pdfAnalyzer = { get: getPdfAnalyzer };
exports.pdfFixer = { get: getPdfFixer };
exports.emailService = { get: getEmailService };
exports.ghostscript = { get: getGhostscriptService };
//# sourceMappingURL=service-instances.js.map