/**
 * Image Optimization Utilities
 * Handles image processing using Sharp library
 */

import sharp from 'sharp';
import type { ImageMetadata } from '../types/preflight-types';

export class ImageOptimizer {
    /**
     * Get detailed metadata from an image buffer
     */
    async getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
        const metadata = await sharp(buffer).metadata();

        return {
            width: metadata.width || 0,
            height: metadata.height || 0,
            format: metadata.format || 'unknown',
            colorSpace: metadata.space || 'unknown',
            channels: metadata.channels || 0,
            depth: metadata.depth || 'uint8',
            density: metadata.density,
            hasAlpha: metadata.hasAlpha || false,
            isProgressive: metadata.isProgressive,
        };
    }

    /**
     * Calculate DPI from image dimensions and physical size
     * @param widthPixels Image width in pixels
     * @param heightPixels Image height in pixels
     * @param widthInches Physical width in inches
     * @param heightInches Physical height in inches
     */
    calculateDPI(widthPixels: number, heightPixels: number, widthInches: number, heightInches: number): number {
        const dpiX = widthPixels / widthInches;
        const dpiY = heightPixels / heightInches;
        return Math.min(dpiX, dpiY); // Return the lower DPI
    }

    /**
     * Downsample image to target DPI
     * @param buffer Image buffer
     * @param currentDPI Current DPI of the image
     * @param targetDPI Target DPI (default: 300)
     */
    async downsampleImage(buffer: Buffer, currentDPI: number, targetDPI: number = 300): Promise<Buffer> {
        if (currentDPI <= targetDPI) {
            // Image already meets or is below target DPI
            return buffer;
        }

        const metadata = await this.getImageMetadata(buffer);
        const scaleFactor = targetDPI / currentDPI;
        const newWidth = Math.round(metadata.width * scaleFactor);
        const newHeight = Math.round(metadata.height * scaleFactor);

        return sharp(buffer)
            .resize(newWidth, newHeight, {
                fit: 'fill',
                kernel: sharp.kernel.lanczos3, // High-quality resampling
            })
            .toBuffer();
    }

    /**
     * Convert image color space
     * Note: Sharp has limited CMYK support, primarily for reading
     */
    async convertColorSpace(buffer: Buffer, targetSpace: 'srgb' | 'cmyk'): Promise<Buffer> {
        const image = sharp(buffer);

        if (targetSpace === 'srgb') {
            return image.toColorspace('srgb').toBuffer();
        } else if (targetSpace === 'cmyk') {
            // Sharp can read CMYK but converting TO CMYK requires external tools
            // For now, we'll mark this as a limitation
            console.warn('CMYK conversion requires external tools like ImageMagick or Ghostscript');
            return buffer;
        }

        return buffer;
    }

    /**
     * Optimize image compression
     * @param buffer Image buffer
     * @param quality Quality level (1-100)
     */
    async optimizeCompression(buffer: Buffer, quality: number = 85): Promise<Buffer> {
        const metadata = await this.getImageMetadata(buffer);

        switch (metadata.format) {
            case 'jpeg':
            case 'jpg':
                return sharp(buffer)
                    .jpeg({ quality, mozjpeg: true })
                    .toBuffer();

            case 'png':
                return sharp(buffer)
                    .png({ quality, compressionLevel: 9 })
                    .toBuffer();

            case 'webp':
                return sharp(buffer)
                    .webp({ quality })
                    .toBuffer();

            default:
                // For other formats, convert to JPEG
                return sharp(buffer)
                    .jpeg({ quality, mozjpeg: true })
                    .toBuffer();
        }
    }

    /**
     * Resize image to specific dimensions
     */
    async resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer> {
        return sharp(buffer)
            .resize(width, height, {
                fit: 'fill',
                kernel: sharp.kernel.lanczos3,
            })
            .toBuffer();
    }

    /**
     * Convert image to grayscale
     */
    async convertToGrayscale(buffer: Buffer): Promise<Buffer> {
        return sharp(buffer)
            .grayscale()
            .toBuffer();
    }

    /**
     * Check if image meets minimum DPI requirement
     */
    meetsMinimumDPI(dpi: number, minDPI: number = 300): boolean {
        return dpi >= minDPI;
    }

    /**
     * Estimate DPI from image metadata and PDF page size
     * @param imageWidth Image width in pixels
     * @param imageHeight Image height in pixels
     * @param pdfWidth PDF width in points (1 point = 1/72 inch)
     * @param pdfHeight PDF height in points
     */
    estimateDPIFromPDF(imageWidth: number, imageHeight: number, pdfWidth: number, pdfHeight: number): number {
        // Convert PDF points to inches
        const widthInches = pdfWidth / 72;
        const heightInches = pdfHeight / 72;

        return this.calculateDPI(imageWidth, imageHeight, widthInches, heightInches);
    }

    /**
     * Get file size of image buffer
     */
    getFileSize(buffer: Buffer): number {
        return buffer.length;
    }

    /**
     * Check if image needs optimization
     */
    needsOptimization(metadata: ImageMetadata, minDPI: number = 300, maxFileSize: number = 10 * 1024 * 1024): boolean {
        // Check if DPI is too low (if density is available)
        if (metadata.density && metadata.density < minDPI) {
            return true;
        }

        // Check if file is too large (would need buffer for this)
        // This is a placeholder - actual check would need buffer size

        return false;
    }
}

export const imageOptimizer = new ImageOptimizer();
