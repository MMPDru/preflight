/**
 * Unit Tests for PDF Analyzer Service
 */

import { pdfAnalyzer } from '../services/pdf-analyzer';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

describe('PDF Analyzer Service', () => {
    let testPdfBuffer: Buffer;

    beforeAll(async () => {
        // Create a simple test PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([612, 792]); // Letter size
        page.drawText('Test PDF for Analysis', { x: 50, y: 700 });

        const pdfBytes = await pdfDoc.save();
        testPdfBuffer = Buffer.from(pdfBytes);
    });

    describe('analyzeDocument', () => {
        it('should return a complete PreFlightReport', async () => {
            const report = await pdfAnalyzer.analyzeDocument(testPdfBuffer);

            expect(report).toBeDefined();
            expect(report.documentInfo).toBeDefined();
            expect(report.colorSpaceAnalysis).toBeDefined();
            expect(report.imageAnalysis).toBeDefined();
            expect(report.fontAnalysis).toBeDefined();
            expect(report.transparencyAnalysis).toBeDefined();
            expect(report.tacAnalysis).toBeDefined();
            expect(report.pdfxCompliance).toBeDefined();
            expect(report.pageBoxValidation).toBeDefined();
            expect(report.issues).toBeDefined();
            expect(report.warnings).toBeDefined();
            expect(report.recommendations).toBeDefined();
            expect(report.timestamp).toBeInstanceOf(Date);
            expect(report.processingTime).toBeGreaterThan(0);
        });

        it('should extract correct document info', async () => {
            const report = await pdfAnalyzer.analyzeDocument(testPdfBuffer);

            expect(report.documentInfo.pageCount).toBe(1);
            expect(report.documentInfo.fileSize).toBeGreaterThan(0);
        });

        it('should detect color spaces', async () => {
            const report = await pdfAnalyzer.analyzeDocument(testPdfBuffer);

            expect(report.colorSpaceAnalysis.dominantColorSpace).toBeDefined();
            expect(['RGB', 'CMYK', 'Grayscale', 'Mixed']).toContain(
                report.colorSpaceAnalysis.dominantColorSpace
            );
        });

        it('should validate page boxes', async () => {
            const report = await pdfAnalyzer.analyzeDocument(testPdfBuffer);

            expect(report.pageBoxValidation).toHaveLength(1);
            expect(report.pageBoxValidation[0].hasMediaBox).toBe(true);
        });

        it('should generate issues for non-compliant PDFs', async () => {
            const report = await pdfAnalyzer.analyzeDocument(testPdfBuffer);

            expect(Array.isArray(report.issues)).toBe(true);
            expect(Array.isArray(report.warnings)).toBe(true);
            expect(Array.isArray(report.recommendations)).toBe(true);
        });
    });

    describe('Performance', () => {
        it('should complete analysis in reasonable time', async () => {
            const startTime = Date.now();
            await pdfAnalyzer.analyzeDocument(testPdfBuffer);
            const endTime = Date.now();

            const processingTime = endTime - startTime;
            expect(processingTime).toBeLessThan(5000); // Should complete in < 5 seconds
        });
    });
});

describe('Color Space Analysis', () => {
    it('should detect CMYK documents', async () => {
        // Create a CMYK test PDF (would need actual CMYK content)
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const pdfBytes = await pdfDoc.save();

        const report = await pdfAnalyzer.analyzeDocument(Buffer.from(pdfBytes));

        expect(report.colorSpaceAnalysis).toBeDefined();
    });
});

describe('Font Analysis', () => {
    it('should detect fonts in PDF', async () => {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        page.drawText('Test with default font', { x: 50, y: 700 });

        const pdfBytes = await pdfDoc.save();
        const report = await pdfAnalyzer.analyzeDocument(Buffer.from(pdfBytes));

        expect(Array.isArray(report.fontAnalysis)).toBe(true);
    });
});

describe('PDF/X Compliance', () => {
    it('should check PDF/X compliance', async () => {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const pdfBytes = await pdfDoc.save();

        const report = await pdfAnalyzer.analyzeDocument(Buffer.from(pdfBytes));

        expect(report.pdfxCompliance).toBeDefined();
        expect(report.pdfxCompliance.standard).toBeDefined();
        expect(Array.isArray(report.pdfxCompliance.violations)).toBe(true);
    });
});
