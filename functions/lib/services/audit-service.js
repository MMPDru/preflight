"use strict";
/**
 * Audit Service
 * Manages audit logging and compliance reporting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
class AuditService {
    constructor(db) {
        this.db = db;
    }
    /**
     * Create an audit log entry
     */
    async log(userId, userName, action, resource, resourceId, options) {
        const now = new Date();
        const log = {
            id: this.db.collection('audit-logs').doc().id,
            userId,
            userName,
            action,
            resource,
            resourceId,
            changes: options?.changes,
            metadata: options?.metadata,
            ipAddress: options?.ipAddress || 'unknown',
            userAgent: options?.userAgent || 'unknown',
            timestamp: now,
            severity: options?.severity || 'low',
        };
        await this.db.collection('audit-logs').doc(log.id).set(log);
        return log;
    }
    /**
     * Query audit logs
     */
    async query(query) {
        let firestoreQuery = this.db.collection('audit-logs').orderBy('timestamp', 'desc');
        if (query.userId) {
            firestoreQuery = firestoreQuery.where('userId', '==', query.userId);
        }
        if (query.action) {
            firestoreQuery = firestoreQuery.where('action', '==', query.action);
        }
        if (query.resource) {
            firestoreQuery = firestoreQuery.where('resource', '==', query.resource);
        }
        if (query.severity) {
            firestoreQuery = firestoreQuery.where('severity', '==', query.severity);
        }
        if (query.startDate) {
            firestoreQuery = firestoreQuery.where('timestamp', '>=', query.startDate);
        }
        if (query.endDate) {
            firestoreQuery = firestoreQuery.where('timestamp', '<=', query.endDate);
        }
        if (query.limit) {
            firestoreQuery = firestoreQuery.limit(query.limit);
        }
        if (query.offset) {
            firestoreQuery = firestoreQuery.offset(query.offset);
        }
        const snapshot = await firestoreQuery.get();
        return snapshot.docs.map(doc => doc.data());
    }
    /**
     * Get audit log by ID
     */
    async getLog(logId) {
        const doc = await this.db.collection('audit-logs').doc(logId).get();
        return doc.exists ? doc.data() : null;
    }
    /**
     * Generate compliance report
     */
    async generateComplianceReport(type, startDate, endDate, generatedBy) {
        const logs = await this.query({ startDate, endDate });
        let reportData = {};
        switch (type) {
            case 'gdpr':
                reportData = this.generateGDPRReport(logs);
                break;
            case 'data-access':
                reportData = this.generateDataAccessReport(logs);
                break;
            case 'retention':
                reportData = this.generateRetentionReport(logs);
                break;
            case 'deletion':
                reportData = this.generateDeletionReport(logs);
                break;
        }
        const report = {
            id: this.db.collection('compliance-reports').doc().id,
            type,
            startDate,
            endDate,
            data: reportData,
            generatedAt: new Date(),
            generatedBy,
        };
        await this.db.collection('compliance-reports').doc(report.id).set(report);
        return report;
    }
    /**
     * Generate GDPR compliance report
     */
    generateGDPRReport(logs) {
        const dataAccess = logs.filter(l => l.action === 'read');
        const dataModification = logs.filter(l => l.action === 'update');
        const dataDeletion = logs.filter(l => l.action === 'delete');
        const dataExport = logs.filter(l => l.action === 'export');
        return {
            totalDataAccess: dataAccess.length,
            totalDataModification: dataModification.length,
            totalDataDeletion: dataDeletion.length,
            totalDataExport: dataExport.length,
            userDataAccess: this.groupByUser(dataAccess),
            criticalActions: logs.filter(l => l.severity === 'critical').length,
        };
    }
    /**
     * Generate data access report
     */
    generateDataAccessReport(logs) {
        const accessLogs = logs.filter(l => l.action === 'read');
        return {
            totalAccess: accessLogs.length,
            byUser: this.groupByUser(accessLogs),
            byResource: this.groupByResource(accessLogs),
            unauthorizedAttempts: logs.filter(l => l.metadata?.unauthorized).length,
        };
    }
    /**
     * Generate retention report
     */
    generateRetentionReport(logs) {
        return {
            totalLogs: logs.length,
            oldestLog: logs[logs.length - 1]?.timestamp,
            newestLog: logs[0]?.timestamp,
            byAction: this.groupByAction(logs),
            storageSizeEstimate: logs.length * 1024, // Rough estimate
        };
    }
    /**
     * Generate deletion report
     */
    generateDeletionReport(logs) {
        const deletionLogs = logs.filter(l => l.action === 'delete');
        return {
            totalDeletions: deletionLogs.length,
            byUser: this.groupByUser(deletionLogs),
            byResource: this.groupByResource(deletionLogs),
            permanentDeletions: deletionLogs.filter(l => l.metadata?.permanent).length,
        };
    }
    /**
     * Group logs by user
     */
    groupByUser(logs) {
        return logs.reduce((acc, log) => {
            acc[log.userId] = (acc[log.userId] || 0) + 1;
            return acc;
        }, {});
    }
    /**
     * Group logs by resource
     */
    groupByResource(logs) {
        return logs.reduce((acc, log) => {
            acc[log.resource] = (acc[log.resource] || 0) + 1;
            return acc;
        }, {});
    }
    /**
     * Group logs by action
     */
    groupByAction(logs) {
        return logs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {});
    }
    /**
     * Clean up old audit logs
     */
    async cleanupOldLogs(olderThanDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        const snapshot = await this.db
            .collection('audit-logs')
            .where('timestamp', '<', cutoffDate)
            .where('severity', 'in', ['low', 'medium'])
            .get();
        const batch = this.db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        return snapshot.size;
    }
    /**
     * Export audit logs
     */
    async exportLogs(query, format) {
        const logs = await this.query(query);
        if (format === 'json') {
            return JSON.stringify(logs, null, 2);
        }
        else {
            // CSV format
            const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'Severity'];
            const rows = logs.map(log => [
                log.timestamp.toISOString(),
                log.userName,
                log.action,
                log.resource,
                log.resourceId,
                log.severity,
            ]);
            return [headers, ...rows].map(row => row.join(',')).join('\n');
        }
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit-service.js.map