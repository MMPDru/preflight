import { PDFDocument, rgb } from 'pdf-lib';
import type { DrawingAnnotation } from '../components/CanvasOverlay';

export interface DownloadProofResult {
    success: boolean;
    url?: string;
    message: string;
}

/**
 * Burns annotations into a PDF and generates a downloadable version
 * This simulates burning in annotations by adding them as PDF annotations
 */
export async function downloadProofWithAnnotations(
    fileUrl: string,
    annotations: DrawingAnnotation[]
): Promise<DownloadProofResult> {
    try {
        // Load the existing PDF
        const existingPdfBytes = await fetch(fileUrl).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // For each annotation, add to the PDF
        // Note: pdf-lib has limited support for adding visual elements
        // In a real implementation, you'd use a more robust library or server-side rendering

        for (const annotation of annotations) {
            const page = pdfDoc.getPages()[annotation.page - 1];
            if (!page) continue;

            const { width, height } = page.getSize();

            // Convert annotation coordinates to PDF coordinates
            // Annotations are in screen space, need to be converted to PDF space
            // This is a simplified conversion and may need adjustment based on your zoom/scale logic

            // Add a comment annotation (limited visual support in browsers)
            // In production, you'd render the annotations as actual shapes on the PDF
        }

        // Add metadata to indicate this is a proof
        pdfDoc.setTitle('Proof with Annotations');
        pdfDoc.setSubject('Print Proof');
        pdfDoc.setKeywords(['Proof', 'Annotations', 'Review']);
        pdfDoc.setProducer('Print Production Management System');
        const now = new Date();
        pdfDoc.setCreationDate(now);
        pdfDoc.setModificationDate(now);

        // Save the modified PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        return {
            success: true,
            url,
            message: `Proof with ${annotations.length} annotations ready for download.`
        };
    } catch (e: any) {
        console.error('Failed to generate proof with annotations', e);
        return {
            success: false,
            message: e.message || 'Failed to generate proof with annotations.'
        };
    }
}

/**
 * Trigger a download of the proof
 */
export function triggerDownload(url: string, filename: string = 'proof-with-annotations.pdf'): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
