"use strict";
/**
 * Integration Tests for PDF Processing Pipeline
 */
Object.defineProperty(exports, "__esModule", { value: true });
const service_instances_1 = require("../services/service-instances");
const pdf_lib_1 = require("pdf-lib");
describe('PDF Processing Integration Tests', () => {
    let testPdfBuffer;
    beforeAll(async () => {
        // Create a test PDF with various elements
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
        const page = pdfDoc.addPage([612, 792]);
        // Add text
        page.drawText('Integration Test PDF', { x: 50, y: 700 });
        // Add colored rectangle (RGB)
        page.drawRectangle({
            x: 50,
            y: 500,
            width: 200,
            height: 100,
            color: (0, pdf_lib_1.rgb)(1, 0, 0), // Red
        });
        const pdfBytes = await pdfDoc.save();
        testPdfBuffer = Buffer.from(pdfBytes);
    });
    describe('Complete Workflow', () => {
        it('should analyze, fix, and re-analyze PDF', async () => {
            // Step 1: Analyze original PDF
            const originalAnalysis = await (0, service_instances_1.getPdfAnalyzer)().analyzeDocument(testPdfBuffer);
            expect(originalAnalysis).toBeDefined();
            // Step 2: Apply fixes
            const fixedBuffer = await (0, service_instances_1.getPdfFixer)().processPdf(testPdfBuffer, ['normalize', 'boxes'], {});
            expect(fixedBuffer).toBeDefined();
            expect(fixedBuffer.length).toBeGreaterThan(0);
            // Step 3: Re-analyze fixed PDF
            const fixedAnalysis = await (0, service_instances_1.getPdfAnalyzer)().analyzeDocument(fixedBuffer);
            expect(fixedAnalysis).toBeDefined();
            expect(fixedAnalysis.documentInfo.pageCount).toBe(originalAnalysis.documentInfo.pageCount);
        });
        it('should process PDF with analysis in one call', async () => {
            const result = await (0, service_instances_1.getPdfFixer)().processPdfWithAnalysis(testPdfBuffer, ['normalize'], {});
            expect(result.buffer).toBeDefined();
            expect(result.analysis).toBeDefined();
            expect(result.analysis.documentInfo).toBeDefined();
        });
    });
    describe('Fix Operations', () => {
        it('should apply CMYK conversion', async () => {
            const fixedBuffer = await (0, service_instances_1.getPdfFixer)().processPdf(testPdfBuffer, ['cmyk'], {});
            expect(fixedBuffer).toBeDefined();
            // Verify CMYK metadata was added
            const pdfDoc = await pdf_lib_1.PDFDocument.load(fixedBuffer);
            const producer = pdfDoc.getProducer();
            expect(producer).toContain('CMYK');
        });
        it('should normalize metadata', async () => {
            const fixedBuffer = await (0, service_instances_1.getPdfFixer)().processPdf(testPdfBuffer, ['normalize'], {});
            const pdfDoc = await pdf_lib_1.PDFDocument.load(fixedBuffer);
            expect(pdfDoc.getProducer()).toBe('PreFlight Pro PDF Processor');
            expect(pdfDoc.getCreator()).toBe('PreFlight Pro');
        });
        it('should fix page boxes', async () => {
            const fixedBuffer = await (0, service_instances_1.getPdfFixer)().processPdf(testPdfBuffer, ['boxes'], {});
            const pdfDoc = await pdf_lib_1.PDFDocument.load(fixedBuffer);
            const page = pdfDoc.getPage(0);
            // Should have all boxes set
            expect(page.getMediaBox()).toBeDefined();
            expect(page.getCropBox()).toBeDefined();
        });
        it('should handle multiple operations', async () => {
            const fixedBuffer = await (0, service_instances_1.getPdfFixer)().processPdf(testPdfBuffer, ['cmyk', 'normalize', 'boxes'], {});
            expect(fixedBuffer).toBeDefined();
            const pdfDoc = await pdf_lib_1.PDFDocument.load(fixedBuffer);
            expect(pdfDoc.getProducer()).toContain('PreFlight Pro');
        });
    });
    describe('Error Handling', () => {
        it('should handle invalid PDF buffer', async () => {
            const invalidBuffer = Buffer.from('not a pdf');
            await expect((0, service_instances_1.getPdfAnalyzer)().analyzeDocument(invalidBuffer)).rejects.toThrow();
        });
        it('should handle empty buffer', async () => {
            const emptyBuffer = Buffer.alloc(0);
            await expect((0, service_instances_1.getPdfAnalyzer)().analyzeDocument(emptyBuffer)).rejects.toThrow();
        });
        it('should handle unknown fix operation gracefully', async () => {
            // Unknown operations should be ignored
            const fixedBuffer = await (0, service_instances_1.getPdfFixer)().processPdf(testPdfBuffer, ['normalize', 'unknown-operation'], {});
            expect(fixedBuffer).toBeDefined();
        });
    });
    describe('Performance', () => {
        it('should process small PDFs quickly', async () => {
            const startTime = Date.now();
            await (0, service_instances_1.getPdfFixer)().processPdfWithAnalysis(testPdfBuffer, ['normalize'], {});
            const endTime = Date.now();
            const processingTime = endTime - startTime;
            expect(processingTime).toBeLessThan(10000); // < 10 seconds
        });
    });
    describe('Data Integrity', () => {
        it('should preserve page count', async () => {
            const originalDoc = await pdf_lib_1.PDFDocument.load(testPdfBuffer);
            const originalPageCount = originalDoc.getPageCount();
            const fixedBuffer = await (0, service_instances_1.getPdfFixer)().processPdf(testPdfBuffer, ['normalize', 'boxes'], {});
            const fixedDoc = await pdf_lib_1.PDFDocument.load(fixedBuffer);
            expect(fixedDoc.getPageCount()).toBe(originalPageCount);
        });
        it('should preserve page dimensions', async () => {
            const originalDoc = await pdf_lib_1.PDFDocument.load(testPdfBuffer);
            const originalPage = originalDoc.getPage(0);
            const originalSize = originalPage.getSize();
            const fixedBuffer = await (0, service_instances_1.getPdfFixer)().processPdf(testPdfBuffer, ['normalize'], {});
            const fixedDoc = await pdf_lib_1.PDFDocument.load(fixedBuffer);
            const fixedPage = fixedDoc.getPage(0);
            const fixedSize = fixedPage.getSize();
            expect(fixedSize.width).toBeCloseTo(originalSize.width, 1);
            expect(fixedSize.height).toBeCloseTo(originalSize.height, 1);
        });
    });
});
//# sourceMappingURL=pdf-processing.integration.test.js.map