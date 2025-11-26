/**
 * Backup Service
 * Manages database backups, data export/import, and disaster recovery
 */

import { firestore, storage } from 'firebase-admin';
import type {
    Backup,
    RestoreOperation,
    DataExport,
    DataImport,
    ImportError,
} from '../types/admin-types';

export class BackupService {
    private db: firestore.Firestore;
    private bucket: any;

    constructor(db: firestore.Firestore, bucket: any) {
        this.db = db;
        this.bucket = bucket;
    }

    /**
     * Create full backup
     */
    async createBackup(
        collections: string[],
        createdBy: string,
        type: 'full' | 'incremental' | 'manual' = 'manual'
    ): Promise<Backup> {
        const backupId = this.db.collection('backups').doc().id;

        const backup: Backup = {
            id: backupId,
            type,
            status: 'in-progress',
            size: 0,
            collections,
            storageUrl: '',
            createdBy,
            createdAt: new Date(),
        };

        await this.db.collection('backups').doc(backupId).set(backup);

        try {
            const backupData: Record<string, any[]> = {};
            let totalSize = 0;

            // Export each collection
            for (const collectionName of collections) {
                const snapshot = await this.db.collection(collectionName).get();
                const docs = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                backupData[collectionName] = docs;
                totalSize += JSON.stringify(docs).length;
            }

            // Upload to Cloud Storage
            const fileName = `backups/${backupId}.json`;
            const file = this.bucket.file(fileName);

            await file.save(JSON.stringify(backupData, null, 2), {
                contentType: 'application/json',
                metadata: {
                    backupId,
                    createdBy,
                    createdAt: new Date().toISOString(),
                },
            });

            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            // Update backup record
            await this.db.collection('backups').doc(backupId).update({
                status: 'completed',
                size: totalSize,
                storageUrl: url,
                completedAt: new Date(),
            });

            return {
                ...backup,
                status: 'completed',
                size: totalSize,
                storageUrl: url,
                completedAt: new Date(),
            };
        } catch (error: any) {
            await this.db.collection('backups').doc(backupId).update({
                status: 'failed',
                error: error.message,
                completedAt: new Date(),
            });

            throw error;
        }
    }

    /**
     * Restore from backup
     */
    async restoreBackup(
        backupId: string,
        collections: string[],
        startedBy: string
    ): Promise<RestoreOperation> {
        const restoreId = this.db.collection('restore-operations').doc().id;

        const restore: RestoreOperation = {
            id: restoreId,
            backupId,
            status: 'in-progress',
            collections,
            startedBy,
            startedAt: new Date(),
        };

        await this.db.collection('restore-operations').doc(restoreId).set(restore);

        try {
            // Get backup
            const backupDoc = await this.db.collection('backups').doc(backupId).get();
            if (!backupDoc.exists) {
                throw new Error('Backup not found');
            }

            const backup = backupDoc.data() as Backup;

            // Download backup file
            const fileName = `backups/${backupId}.json`;
            const file = this.bucket.file(fileName);
            const [contents] = await file.download();
            const backupData = JSON.parse(contents.toString());

            // Restore each collection
            for (const collectionName of collections) {
                if (!backupData[collectionName]) {
                    continue;
                }

                const batch = this.db.batch();
                const docs = backupData[collectionName];

                for (const doc of docs) {
                    const { id, ...data } = doc;
                    const ref = this.db.collection(collectionName).doc(id);
                    batch.set(ref, data);
                }

                await batch.commit();
            }

            // Update restore record
            await this.db.collection('restore-operations').doc(restoreId).update({
                status: 'completed',
                completedAt: new Date(),
            });

            return {
                ...restore,
                status: 'completed',
                completedAt: new Date(),
            };
        } catch (error: any) {
            await this.db.collection('restore-operations').doc(restoreId).update({
                status: 'failed',
                error: error.message,
                completedAt: new Date(),
            });

            throw error;
        }
    }

    /**
     * Export data
     */
    async exportData(
        collections: string[],
        format: 'json' | 'csv' | 'excel',
        createdBy: string,
        filters?: Record<string, any>
    ): Promise<DataExport> {
        const exportId = this.db.collection('data-exports').doc().id;

        const dataExport: DataExport = {
            id: exportId,
            format,
            collections,
            filters,
            status: 'processing',
            createdBy,
            createdAt: new Date(),
        };

        await this.db.collection('data-exports').doc(exportId).set(dataExport);

        try {
            let exportData: string;

            if (format === 'json') {
                exportData = await this.exportToJSON(collections, filters);
            } else if (format === 'csv') {
                exportData = await this.exportToCSV(collections, filters);
            } else {
                throw new Error('Excel export not yet implemented');
            }

            // Upload to Cloud Storage
            const fileName = `exports/${exportId}.${format}`;
            const file = this.bucket.file(fileName);

            await file.save(exportData, {
                contentType: format === 'json' ? 'application/json' : 'text/csv',
            });

            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            });

            // Update export record
            await this.db.collection('data-exports').doc(exportId).update({
                status: 'completed',
                downloadUrl: url,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });

            return {
                ...dataExport,
                status: 'completed',
                downloadUrl: url,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            };
        } catch (error: any) {
            await this.db.collection('data-exports').doc(exportId).update({
                status: 'failed',
            });

            throw error;
        }
    }

    /**
     * Export to JSON
     */
    private async exportToJSON(
        collections: string[],
        filters?: Record<string, any>
    ): Promise<string> {
        const data: Record<string, any[]> = {};

        for (const collectionName of collections) {
            const snapshot = await this.db.collection(collectionName).get();
            data[collectionName] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
        }

        return JSON.stringify(data, null, 2);
    }

    /**
     * Export to CSV
     */
    private async exportToCSV(
        collections: string[],
        filters?: Record<string, any>
    ): Promise<string> {
        let csv = '';

        for (const collectionName of collections) {
            const snapshot = await this.db.collection(collectionName).get();
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (docs.length === 0) continue;

            // Add collection header
            csv += `\n# ${collectionName}\n`;

            // Add CSV headers
            const headers = Object.keys(docs[0]);
            csv += headers.join(',') + '\n';

            // Add rows
            for (const doc of docs) {
                const row = headers.map(header => {
                    const value = (doc as any)[header];
                    if (typeof value === 'object') {
                        return JSON.stringify(value).replace(/"/g, '""');
                    }
                    return String(value).replace(/"/g, '""');
                });
                csv += row.join(',') + '\n';
            }
        }

        return csv;
    }

    /**
     * Import data
     */
    async importData(
        collection: string,
        format: 'json' | 'csv' | 'excel',
        fileUrl: string,
        createdBy: string
    ): Promise<DataImport> {
        const importId = this.db.collection('data-imports').doc().id;

        const dataImport: DataImport = {
            id: importId,
            format,
            collection,
            fileUrl,
            status: 'validating',
            totalRecords: 0,
            importedRecords: 0,
            failedRecords: 0,
            createdBy,
            createdAt: new Date(),
        };

        await this.db.collection('data-imports').doc(importId).set(dataImport);

        // Import would be processed asynchronously
        // This is a placeholder for the actual implementation

        return dataImport;
    }

    /**
     * Get all backups
     */
    async getBackups(): Promise<Backup[]> {
        const snapshot = await this.db
            .collection('backups')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        return snapshot.docs.map(doc => doc.data() as Backup);
    }

    /**
     * Delete old backups
     */
    async cleanupOldBackups(olderThanDays: number): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const snapshot = await this.db
            .collection('backups')
            .where('createdAt', '<', cutoffDate)
            .get();

        let deletedCount = 0;

        for (const doc of snapshot.docs) {
            const backup = doc.data() as Backup;

            // Delete from storage
            try {
                const fileName = `backups/${backup.id}.json`;
                await this.bucket.file(fileName).delete();
            } catch (error) {
                console.error('Error deleting backup file:', error);
            }

            // Delete from Firestore
            await doc.ref.delete();
            deletedCount++;
        }

        return deletedCount;
    }
}

export const backupService = new BackupService(
    firestore(),
    storage().bucket()
);
