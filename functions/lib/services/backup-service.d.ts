/**
 * Backup Service
 * Manages database backups, data export/import, and disaster recovery
 */
import { firestore } from 'firebase-admin';
import type { Backup, RestoreOperation, DataExport, DataImport } from '../types/admin-types';
export declare class BackupService {
    private db;
    private bucket;
    constructor(db: firestore.Firestore, bucket: any);
    /**
     * Create full backup
     */
    createBackup(collections: string[], createdBy: string, type?: 'full' | 'incremental' | 'manual'): Promise<Backup>;
    /**
     * Restore from backup
     */
    restoreBackup(backupId: string, collections: string[], startedBy: string): Promise<RestoreOperation>;
    /**
     * Export data
     */
    exportData(collections: string[], format: 'json' | 'csv' | 'excel', createdBy: string, filters?: Record<string, any>): Promise<DataExport>;
    /**
     * Export to JSON
     */
    private exportToJSON;
    /**
     * Export to CSV
     */
    private exportToCSV;
    /**
     * Import data
     */
    importData(collection: string, format: 'json' | 'csv' | 'excel', fileUrl: string, createdBy: string): Promise<DataImport>;
    /**
     * Get all backups
     */
    getBackups(): Promise<Backup[]>;
    /**
     * Delete old backups
     */
    cleanupOldBackups(olderThanDays: number): Promise<number>;
}
export declare const backupService: BackupService;
//# sourceMappingURL=backup-service.d.ts.map