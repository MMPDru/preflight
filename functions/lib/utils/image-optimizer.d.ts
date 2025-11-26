/**
 * Image Optimization Utilities
 * Handles image processing using Sharp library
 */
import type { ImageMetadata } from '../types/preflight-types';
export declare class ImageOptimizer {
    /**
     * Get detailed metadata from an image buffer
     */
    getImageMetadata(buffer: Buffer): Promise<ImageMetadata>;
    /**
     * Calculate DPI from image dimensions and physical size
     * @param widthPixels Image width in pixels
     * @param heightPixels Image height in pixels
     * @param widthInches Physical width in inches
     * @param heightInches Physical height in inches
     */
    calculateDPI(widthPixels: number, heightPixels: number, widthInches: number, heightInches: number): number;
    /**
     * Downsample image to target DPI
     * @param buffer Image buffer
     * @param currentDPI Current DPI of the image
     * @param targetDPI Target DPI (default: 300)
     */
    downsampleImage(buffer: Buffer, currentDPI: number, targetDPI?: number): Promise<Buffer>;
    /**
     * Convert image color space
     * Note: Sharp has limited CMYK support, primarily for reading
     */
    convertColorSpace(buffer: Buffer, targetSpace: 'srgb' | 'cmyk'): Promise<Buffer>;
    /**
     * Optimize image compression
     * @param buffer Image buffer
     * @param quality Quality level (1-100)
     */
    optimizeCompression(buffer: Buffer, quality?: number): Promise<Buffer>;
    /**
     * Resize image to specific dimensions
     */
    resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer>;
    /**
     * Convert image to grayscale
     */
    convertToGrayscale(buffer: Buffer): Promise<Buffer>;
    /**
     * Check if image meets minimum DPI requirement
     */
    meetsMinimumDPI(dpi: number, minDPI?: number): boolean;
    /**
     * Estimate DPI from image metadata and PDF page size
     * @param imageWidth Image width in pixels
     * @param imageHeight Image height in pixels
     * @param pdfWidth PDF width in points (1 point = 1/72 inch)
     * @param pdfHeight PDF height in points
     */
    estimateDPIFromPDF(imageWidth: number, imageHeight: number, pdfWidth: number, pdfHeight: number): number;
    /**
     * Get file size of image buffer
     */
    getFileSize(buffer: Buffer): number;
    /**
     * Check if image needs optimization
     */
    needsOptimization(metadata: ImageMetadata, minDPI?: number, maxFileSize?: number): boolean;
}
export declare const imageOptimizer: ImageOptimizer;
//# sourceMappingURL=image-optimizer.d.ts.map