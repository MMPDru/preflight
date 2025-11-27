/**
 * PDF Analyzer Service
 * Comprehensive PDF analysis using pdfjs-dist for deep content inspection
 */
import type { PreFlightReport } from '../types/preflight-types';
export declare class PdfAnalyzerService {
    private readonly MIN_DPI;
    private readonly MAX_TAC;
    /**
     * Perform comprehensive PDF analysis
     */
    analyzeDocument(pdfBuffer: Buffer): Promise<PreFlightReport>;
    /**
     * Extract document information
     */
    private analyzeDocumentInfo;
    /**
     * Analyze color spaces used in the PDF
     */
    private analyzeColorSpaces;
    /**
     * Analyze all images in the PDF
     */
    private analyzeImages;
    /**
     * Analyze fonts in the PDF
     */
    private analyzeFonts;
    /**
     * Analyze transparency usage
     */
    private analyzeTransparency;
    /**
     * Analyze Total Area Coverage (TAC)
     */
    private analyzeTAC;
    /**
     * Check PDF/X compliance
     */
    private analyzePDFX;
    /**
     * Validate page boxes
     */
    private analyzePageBoxes;
    /**
     * Generate issues from analysis results
     */
    private generateIssues;
    /**
     * Generate warnings
     */
    private generateWarnings;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
}
//# sourceMappingURL=pdf-analyzer.d.ts.map