import { type Job } from '../components/JobCard';

export interface UploadProgress {
    fileName: string;
    progress: number;
    status: 'uploading' | 'processing' | 'complete' | 'error';
}

export async function processFileUpload(file: File, userId: string): Promise<Job> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Upload file to Firebase Storage
    let fileUrl = '';
    try {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { storage } = await import('./firebase-config');

        const storageRef = ref(storage, `uploads/${jobId}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        fileUrl = await getDownloadURL(snapshot.ref);

        console.log('File uploaded to Storage:', fileUrl);
    } catch (error) {
        console.error('Failed to upload to Storage:', error);
        // Continue anyway with empty URL for now
    }

    // Create job entry for Firestore
    const firestoreJob = {
        fileName: file.name,
        status: 'pending',
        uploadDate: new Date(),
        fileSize: file.size,
        userId: userId,
        fileUrl: fileUrl,
        analysisResults: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    // Save to Firestore
    try {
        const { jobService } = await import('./firestore-service');
        await jobService.create(jobId, firestoreJob as any);
        console.log('Job saved to Firestore:', jobId);
    } catch (error) {
        console.error('Failed to save job to Firestore:', error);
    }

    // Create job entry for UI
    const job: Job = {
        id: jobId,
        fileName: file.name,
        status: 'pending',
        uploadedAt: new Date(),
        fileSize: file.size,
    };

    // Generate thumbnail for PDFs (simplified - in production use pdf.js)
    if (file.type === 'application/pdf') {
        try {
            const url = URL.createObjectURL(file);
            job.thumbnail = url; // In production, generate actual thumbnail
        } catch (e) {
            console.error('Failed to generate thumbnail', e);
        }
    }

    return job;
}

export async function generatePDFThumbnail(file: File): Promise<string | null> {
    // In production, use pdf.js to render first page as thumbnail
    // For now, return null
    return null;
}

export function validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];

    if (file.size > maxSize) {
        return { valid: false, error: 'File size exceeds 100MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'File type not supported. Please upload PDF, JPEG, PNG, or TIFF files.' };
    }

    return { valid: true };
}
