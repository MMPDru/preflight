"use strict";
/**
 * Image Analysis Utilities
 * Extract and analyze images from PDFs using sharp
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageAnalyzer = exports.ImageAnalyzer = void 0;
const pdf_lib_1 = require("pdf-lib");
class ImageAnalyzer {
    constructor() {
        this.MIN_DPI = 300;
    }
    /**
     * Analyze images in PDF document
     */
    async analyzeImages(pdfDoc) {
        const images = [];
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
    async extractPageImages(page, pageNumber) {
        const images = [];
        try {
            const resources = page.node.Resources();
            if (!resources)
                return images;
            const xObjects = resources.lookup(pdf_lib_1.PDFName.of('XObject'));
            if (!xObjects || !(xObjects instanceof pdf_lib_1.PDFDict))
                return images;
            const xObjectNames = xObjects.keys();
            let imageIndex = 0;
            for (const name of xObjectNames) {
                const xObject = xObjects.lookup(name);
                if (!xObject || !(xObject instanceof pdf_lib_1.PDFDict))
                    continue;
                const subtype = xObject.lookup(pdf_lib_1.PDFName.of('Subtype'));
                if (subtype?.toString() !== '/Image')
                    continue;
                // Extract image metadata
                const width = xObject.lookup(pdf_lib_1.PDFName.of('Width'))?.toString() || '0';
                const height = xObject.lookup(pdf_lib_1.PDFName.of('Height'))?.toString() || '0';
                const bitsPerComponent = xObject.lookup(pdf_lib_1.PDFName.of('BitsPerComponent'))?.toString() || '8';
                const colorSpace = xObject.lookup(pdf_lib_1.PDFName.of('ColorSpace'))?.toString() || 'Unknown';
                const filter = xObject.lookup(pdf_lib_1.PDFName.of('Filter'))?.toString() || 'None';
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
        }
        catch (error) {
            console.error(`Error extracting images from page ${pageNumber}:`, error);
        }
        return images;
    }
    /**
     * Analyze image compression
     */
    analyzeCompression(images) {
        const compressionTypes = {};
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
exports.ImageAnalyzer = ImageAnalyzer;
exports.imageAnalyzer = new ImageAnalyzer();
//# sourceMappingURL=image-analyzer.js.map