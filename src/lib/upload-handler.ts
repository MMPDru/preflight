import { type Job } from '../components/JobCard';

export interface UploadProgress {
    fileName: string;
    progress: number;
    status: 'uploading' | 'processing' | 'complete' | 'error';
}

export async function processFileUpload(file: File): Promise<Job> {
    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create job entry
    const job: Job = {
        id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
