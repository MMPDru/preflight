/**
 * Transparency Analysis Utilities
 * Detect and analyze transparency in PDFs
 */
import { PDFDocument } from 'pdf-lib';
export interface TransparencyInfo {
    hasTransparency: boolean;
    transparentObjects: number;
    blendModes: string[];
    affectedPages: number[];
    needsFlattening: boolean;
    softMasks: number;
    transparencyGroups: number;
}
export declare class TransparencyAnalyzer {
    /**
     * Analyze transparency in PDF document
     */
    analyzeTransparency(pdfDoc: PDFDocument): Promise<TransparencyInfo>;
    /**
     * Analyze transparency on a single page
     */
    private analyzePageTransparency;
}
export declare const transparencyAnalyzer: TransparencyAnalyzer;
//# sourceMappingURL=transparency-analyzer.d.ts.map