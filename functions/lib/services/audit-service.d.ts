/**
 * Audit Service
 * Manages audit logging and compliance reporting
 */
import { firestore } from 'firebase-admin';
import type { AuditLog, AuditAction, AuditQuery, ComplianceReport, AuditChange } from '../types/admin-types';
export declare class AuditService {
    private db;
    constructor(db: firestore.Firestore);
    /**
     * Create an audit log entry
     */
    log(userId: string, userName: string, action: AuditAction, resource: string, resourceId: string, options?: {
        changes?: AuditChange[];
        metadata?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
        severity?: 'low' | 'medium' | 'high' | 'critical';
    }): Promise<AuditLog>;
    /**
     * Query audit logs
     */
    query(query: AuditQuery): Promise<AuditLog[]>;
    /**
     * Get audit log by ID
     */
    getLog(logId: string): Promise<AuditLog | null>;
    /**
     * Generate compliance report
     */
    generateComplianceReport(type: 'gdpr' | 'data-access' | 'retention' | 'deletion', startDate: Date, endDate: Date, generatedBy: string): Promise<ComplianceReport>;
    /**
     * Generate GDPR compliance report
     */
    private generateGDPRReport;
    /**
     * Generate data access report
     */
    private generateDataAccessReport;
    /**
     * Generate retention report
     */
    private generateRetentionReport;
    /**
     * Generate deletion report
     */
    private generateDeletionReport;
    /**
     * Group logs by user
     */
    private groupByUser;
    /**
     * Group logs by resource
     */
    private groupByResource;
    /**
     * Group logs by action
     */
    private groupByAction;
    /**
     * Clean up old audit logs
     */
    cleanupOldLogs(olderThanDays: number): Promise<number>;
    /**
     * Export audit logs
     */
    exportLogs(query: AuditQuery, format: 'json' | 'csv'): Promise<string>;
}
export declare const auditService: AuditService;
//# sourceMappingURL=audit-service.d.ts.map