/**
 * Image Analysis Utilities
 * Extract and analyze images from PDFs using sharp
 */

import sharp from 'sharp';
import { PDFDocument, PDFName, PDFDict, PDFArray } from 'pdf-lib';

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

export class ImageAnalyzer {
    private readonly MIN_DPI = 300;

    /**
     * Analyze images in PDF document
     */
    async analyzeImages(pdfDoc: PDFDocument): Promise<ImageMetadata[]> {
        const images: ImageMetadata[] = [];
        const pages = pdfDoc.getPages();

        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
            const page = pages[pageIndex];
            const pageImages = await this.extractPageImages(page, pageIndex + 1);
            images.push(...pageImages);
        }

        return images;
    }

    /**
     * Extract images from a single page
     */
    private async extractPageImages(page: any, pageNumber: number): Promise<ImageMetadata[]> {
        const images: ImageMetadata[] = [];

        try {
            const resources = page.node.Resources();
            if (!resources) return images;

            const xObjects = resources.lookup(PDFName.of('XObject'));
            if (!xObjects || !(xObjects instanceof PDFDict)) return images;

            const xObjectNames = xObjects.keys();
            let imageIndex = 0;

            for (const name of xObjectNames) {
                const xObject = xObjects.lookup(name);
                if (!xObject || !(xObject instanceof PDFDict)) continue;

                const subtype = xObject.lookup(PDFName.of('Subtype'));
                if (subtype?.toString() !== '/Image') continue;

                // Extract image metadata
                const width = xObject.lookup(PDFName.of('Width'))?.toString() || '0';
                const height = xObject.lookup(PDFName.of('Height'))?.toString() || '0';
                const bitsPerComponent = xObject.lookup(PDFName.of('BitsPerComponent'))?.toString() || '8';
                const colorSpace = xObject.lookup(PDFName.of('ColorSpace'))?.toString() || 'Unknown';
                const filter = xObject.lookup(PDFName.of('Filter'))?.toString() || 'None';

                const imageWidth = parseInt(width);
                const imageHeight = parseInt(height);

                // Calculate DPI based on page size
                const { width: pageWidth, height: pageHeight } = page.getSize();
                const pageWidthInches = pageWidth / 72; // Convert points to inches
                const pageHeightInches = pageHeight / 72;

                // Estimate DPI (this is simplified - real calculation would need image placement)
                const dpiX = imageWidth / pageWidthInches;
                const dpiY = imageHeight / pageHeightInches;
                const effectiveDPI = Math.min(dpiX, dpiY);

                images.push({
                    pageNumber,
                    index: imageIndex++,
                    width: imageWidth,
                    height: imageHeight,
                    dpi: Math.round(effectiveDPI),
                    colorSpace: colorSpace.replace('/', ''),
                    bitsPerComponent: parseInt(bitsPerComponent),
                    compression: filter.replace('/', ''),
                    sizeBytes: 0, // Would need to extract actual image data
                    meetsMinDPI: effectiveDPI >= this.MIN_DPI
                });
            }
        } catch (error) {
            console.error(`Error extracting images from page ${pageNumber}:`, error);
        }

        return images;
    }

    /**
     * Analyze image compression
     */
    analyzeCompression(images: ImageMetadata[]): {
        compressionTypes: { [key: string]: number };
        uncompressed: number;
        needsOptimization: number;
    } {
        const compressionTypes: { [key: string]: number } = {};
        let uncompressed = 0;
        let needsOptimization = 0;

        images.forEach(img => {
            compressionTypes[img.compression] = (compressionTypes[img.compression] || 0) + 1;

            if (img.compression === 'None' || img.compression === 'Unknown') {
                uncompressed++;
            }

            if (!img.meetsMinDPI || img.compression === 'None') {
                needsOptimization++;
            }
        });

        return {
            compressionTypes,
            uncompressed,
            needsOptimization
        };
    }
}

export const imageAnalyzer = new ImageAnalyzer();
