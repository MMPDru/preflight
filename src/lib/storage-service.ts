import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
    listAll,
    type UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from './firebase-config';
import type { UploadProgress } from './types';

// Storage paths
export const STORAGE_PATHS = {
    PDFS: 'pdfs',
    PROOFS: 'proofs',
    ASSETS: 'assets',
    AVATARS: 'avatars',
} as const;

export class StorageService {
    /**
     * Upload a file to Firebase Storage with progress tracking
     */
    async uploadFile(
        file: File,
        path: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<string> {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot: UploadTaskSnapshot) => {
                    const progress: UploadProgress = {
                        bytesTransferred: snapshot.bytesTransferred,
                        totalBytes: snapshot.totalBytes,
                        percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                    };
                    onProgress?.(progress);
                },
                (error) => {
                    console.error('Upload error:', error);
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    }

    /**
     * Upload PDF file
     */
    async uploadPDF(
        file: File,
        userId: string,
        jobId: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<string> {
        const fileName = `${Date.now()}_${file.name}`;
        const path = `${STORAGE_PATHS.PDFS}/${userId}/${jobId}/${fileName}`;
        return this.uploadFile(file, path, onProgress);
    }

    /**
     * Upload user avatar
     */
    async uploadAvatar(
        file: File,
        userId: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<string> {
        const fileExtension = file.name.split('.').pop();
        const path = `${STORAGE_PATHS.AVATARS}/${userId}/avatar.${fileExtension}`;
        return this.uploadFile(file, path, onProgress);
    }

    /**
     * Upload asset to brand library
     */
    async uploadAsset(
        file: File,
        userId: string,
        assetId: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<string> {
        const fileName = `${Date.now()}_${file.name}`;
        const path = `${STORAGE_PATHS.ASSETS}/${userId}/${assetId}/${fileName}`;
        return this.uploadFile(file, path, onProgress);
    }

    /**
     * Delete a file from storage
     */
    async deleteFile(fileUrl: string): Promise<void> {
        try {
            const fileRef = ref(storage, fileUrl);
            await deleteObject(fileRef);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    /**
     * Delete all files in a folder
     */
    async deleteFolder(folderPath: string): Promise<void> {
        try {
            const folderRef = ref(storage, folderPath);
            const listResult = await listAll(folderRef);

            // Delete all files
            const deletePromises = listResult.items.map(item => deleteObject(item));
            await Promise.all(deletePromises);

            // Recursively delete subfolders
            const folderPromises = listResult.prefixes.map(folder =>
                this.deleteFolder(folder.fullPath)
            );
            await Promise.all(folderPromises);
        } catch (error) {
            console.error('Error deleting folder:', error);
            throw error;
        }
    }

    /**
     * Get download URL for a file
     */
    async getDownloadURL(path: string): Promise<string> {
        const fileRef = ref(storage, path);
        return getDownloadURL(fileRef);
    }

    /**
     * List all files in a folder
     */
    async listFiles(folderPath: string): Promise<string[]> {
        const folderRef = ref(storage, folderPath);
        const listResult = await listAll(folderRef);
        return listResult.items.map(item => item.fullPath);
    }
}

// Export singleton instance
export const storageService = new StorageService();

// Helper functions
export const storageHelpers = {
    /**
     * Format file size
     */
    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Get file extension
     */
    getFileExtension(filename: string): string {
        return filename.split('.').pop()?.toLowerCase() || '';
    },

    /**
     * Validate file type
     */
    isValidPDF(file: File): boolean {
        return file.type === 'application/pdf' || file.name.endsWith('.pdf');
    },

    /**
     * Validate file size (max 50MB)
     */
    isValidFileSize(file: File, maxSizeMB: number = 50): boolean {
        const maxBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxBytes;
    },

    /**
     * Generate unique file path
     */
    generateFilePath(basePath: string, filename: string): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        const ext = this.getFileExtension(filename);
        return `${basePath}/${timestamp}_${random}.${ext}`;
    },
};
