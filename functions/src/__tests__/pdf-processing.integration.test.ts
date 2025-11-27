/**
 * Integration Tests for PDF Processing Pipeline
 */

import { getPdfFixer, getPdfAnalyzer } from '../services/service-instances';
import { PDFDocument, rgb } from 'pdf-lib';

describe('PDF Processing Integration Tests', () => {
    let testPdfBuffer: Buffer;

    beforeAll(async () => {
        // Create a test PDF with various elements
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([612, 792]);

        // Add text
        page.drawText('Integration Test PDF', { x: 50, y: 700 });

        // Add colored rectangle (RGB)
        page.drawRectangle({
            x: 50,
            y: 500,
            width: 200,
            height: 100,
            color: rgb(1, 0, 0), // Red
        });

        const pdfBytes = await pdfDoc.save();
        testPdfBuffer = Buffer.from(pdfBytes);
    });

    describe('Complete Workflow', () => {
        it('should analyze, fix, and re-analyze PDF', async () => {
            // Step 1: Analyze original PDF
            const originalAnalysis = await getPdfAnalyzer().analyzeDocument(testPdfBuffer);
            expect(originalAnalysis).toBeDefined();

            // Step 2: Apply fixes
            const fixedBuffer = await getPdfFixer().processPdf(
                testPdfBuffer,
                ['normalize', 'boxes'],
                {}
            );
            expect(fixedBuffer).toBeDefined();
            expect(fixedBuffer.length).toBeGreaterThan(0);

            // Step 3: Re-analyze fixed PDF
            const fixedAnalysis = await getPdfAnalyzer().analyzeDocument(fixedBuffer);
            expect(fixedAnalysis).toBeDefined();
            expect(fixedAnalysis.documentInfo.pageCount).toBe(
                originalAnalysis.documentInfo.pageCount
            );
        });

        it('should process PDF with analysis in one call', async () => {
            const result = await getPdfFixer().processPdfWithAnalysis(
                testPdfBuffer,
                ['normalize'],
                {}
            );

            expect(result.buffer).toBeDefined();
            expect(result.analysis).toBeDefined();
            expect(result.analysis.documentInfo).toBeDefined();
        });
    });

    describe('Fix Operations', () => {
        it('should apply CMYK conversion', async () => {
            const fixedBuffer = await getPdfFixer().processPdf(
                testPdfBuffer,
                ['cmyk'],
                {}
            );

            expect(fixedBuffer).toBeDefined();

            // Verify CMYK metadata was added
            const pdfDoc = await PDFDocument.load(fixedBuffer);
            const producer = pdfDoc.getProducer();
            expect(producer).toContain('CMYK');
        });

        it('should normalize metadata', async () => {
            const fixedBuffer = await getPdfFixer().processPdf(
                testPdfBuffer,
                ['normalize'],
                {}
            );

            const pdfDoc = await PDFDocument.load(fixedBuffer);
            expect(pdfDoc.getProducer()).toBe('PreFlight Pro PDF Processor');
            expect(pdfDoc.getCreator()).toBe('PreFlight Pro');
        });

        it('should fix page boxes', async () => {
            const fixedBuffer = await getPdfFixer().processPdf(
                testPdfBuffer,
                ['boxes'],
                {}
            );

            const pdfDoc = await PDFDocument.load(fixedBuffer);
            const page = pdfDoc.getPage(0);

            // Should have all boxes set
            expect(page.getMediaBox()).toBeDefined();
            expect(page.getCropBox()).toBeDefined();
        });

        it('should handle multiple operations', async () => {
            const fixedBuffer = await getPdfFixer().processPdf(
                testPdfBuffer,
                ['cmyk', 'normalize', 'boxes'],
                {}
            );

            expect(fixedBuffer).toBeDefined();

            const pdfDoc = await PDFDocument.load(fixedBuffer);
            expect(pdfDoc.getProducer()).toContain('PreFlight Pro');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid PDF buffer', async () => {
            const invalidBuffer = Buffer.from('not a pdf');

            await expect(
                getPdfAnalyzer().analyzeDocument(invalidBuffer)
            ).rejects.toThrow();
        });

        it('should handle empty buffer', async () => {
            const emptyBuffer = Buffer.alloc(0);

            await expect(
                getPdfAnalyzer().analyzeDocument(emptyBuffer)
            ).rejects.toThrow();
        });

        it('should handle unknown fix operation gracefully', async () => {
            // Unknown operations should be ignored
            const fixedBuffer = await getPdfFixer().processPdf(
                testPdfBuffer,
                ['normalize', 'unknown-operation' as any],
                {}
            );

            expect(fixedBuffer).toBeDefined();
        });
    });

    describe('Performance', () => {
        it('should process small PDFs quickly', async () => {
            const startTime = Date.now();

            await getPdfFixer().processPdfWithAnalysis(
                testPdfBuffer,
                ['normalize'],
                {}
            );

            const endTime = Date.now();
            const processingTime = endTime - startTime;

            expect(processingTime).toBeLessThan(10000); // < 10 seconds
        });
    });

    describe('Data Integrity', () => {
        it('should preserve page count', async () => {
            const originalDoc = await PDFDocument.load(testPdfBuffer);
            const originalPageCount = originalDoc.getPageCount();

            const fixedBuffer = await getPdfFixer().processPdf(
                testPdfBuffer,
                ['normalize', 'boxes'],
                {}
            );

            const fixedDoc = await PDFDocument.load(fixedBuffer);
            expect(fixedDoc.getPageCount()).toBe(originalPageCount);
        });

        it('should preserve page dimensions', async () => {
            const originalDoc = await PDFDocument.load(testPdfBuffer);
            const originalPage = originalDoc.getPage(0);
            const originalSize = originalPage.getSize();

            const fixedBuffer = await getPdfFixer().processPdf(
                testPdfBuffer,
                ['normalize'],
                {}
            );

            const fixedDoc = await PDFDocument.load(fixedBuffer);
            const fixedPage = fixedDoc.getPage(0);
            const fixedSize = fixedPage.getSize();

            expect(fixedSize.width).toBeCloseTo(originalSize.width, 1);
            expect(fixedSize.height).toBeCloseTo(originalSize.height, 1);
        });
    });
});
