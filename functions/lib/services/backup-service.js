"use strict";
/**
 * Backup Service
 * Manages database backups, data export/import, and disaster recovery
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
class BackupService {
    constructor(db, bucket) {
        this.db = db;
        this.bucket = bucket;
    }
    /**
     * Create full backup
     */
    async createBackup(collections, createdBy, type = 'manual') {
        const backupId = this.db.collection('backups').doc().id;
        const backup = {
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
            const backupData = {};
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
        }
        catch (error) {
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
    async restoreBackup(backupId, collections, startedBy) {
        const restoreId = this.db.collection('restore-operations').doc().id;
        const restore = {
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
            const backup = backupDoc.data();
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
        }
        catch (error) {
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
    async exportData(collections, format, createdBy, filters) {
        const exportId = this.db.collection('data-exports').doc().id;
        const dataExport = {
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
            let exportData;
            if (format === 'json') {
                exportData = await this.exportToJSON(collections, filters);
            }
            else if (format === 'csv') {
                exportData = await this.exportToCSV(collections, filters);
            }
            else {
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
        }
        catch (error) {
            await this.db.collection('data-exports').doc(exportId).update({
                status: 'failed',
            });
            throw error;
        }
    }
    /**
     * Export to JSON
     */
    async exportToJSON(collections, filters) {
        const data = {};
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
    async exportToCSV(collections, filters) {
        let csv = '';
        for (const collectionName of collections) {
            const snapshot = await this.db.collection(collectionName).get();
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (docs.length === 0)
                continue;
            // Add collection header
            csv += `\n# ${collectionName}\n`;
            // Add CSV headers
            const headers = Object.keys(docs[0]);
            csv += headers.join(',') + '\n';
            // Add rows
            for (const doc of docs) {
                const row = headers.map(header => {
                    const value = doc[header];
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
    async importData(collection, format, fileUrl, createdBy) {
        const importId = this.db.collection('data-imports').doc().id;
        const dataImport = {
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
    async getBackups() {
        const snapshot = await this.db
            .collection('backups')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        return snapshot.docs.map(doc => doc.data());
    }
    /**
     * Delete old backups
     */
    async cleanupOldBackups(olderThanDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
        const snapshot = await this.db
            .collection('backups')
            .where('createdAt', '<', cutoffDate)
            .get();
        let deletedCount = 0;
        for (const doc of snapshot.docs) {
            const backup = doc.data();
            // Delete from storage
            try {
                const fileName = `backups/${backup.id}.json`;
                await this.bucket.file(fileName).delete();
            }
            catch (error) {
                console.error('Error deleting backup file:', error);
            }
            // Delete from Firestore
            await doc.ref.delete();
            deletedCount++;
        }
        return deletedCount;
    }
}
exports.BackupService = BackupService;
//# sourceMappingURL=backup-service.js.map