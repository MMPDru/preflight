/**
 * Image Analysis Utilities
 * Extract and analyze images from PDFs using sharp
 */
import { PDFDocument } from 'pdf-lib';
export interface ImageMetadata {
    pageNumber: number;
    index: number;
    width: number;
    height: number;
    dpi: number;
    colorSpace: string;
    bitsPerComponent: number;
    compression: string;
    sizeBytes: number;
    meetsMinDPI: boolean;
}
export declare class ImageAnalyzer {
    private readonly MIN_DPI;
    /**
     * Analyze images in PDF document
     */
    analyzeImages(pdfDoc: PDFDocument): Promise<ImageMetadata[]>;
    /**
     * Extract images from a single page
     */
    private extractPageImages;
    /**
     * Analyze image compression
     */
    analyzeCompression(images: ImageMetadata[]): {
        compressionTypes: {
            [key: string]: number;
        };
        uncompressed: number;
        needsOptimization: number;
    };
}
export declare const imageAnalyzer: ImageAnalyzer;
//# sourceMappingURL=image-analyzer.d.ts.map