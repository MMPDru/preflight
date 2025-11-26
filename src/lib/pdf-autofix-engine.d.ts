import { PreflightReport } from './pdf-preflight-engine';
export interface AutoFixResult {
    success: boolean;
    fixedIssues: string[];
    remainingIssues: string[];
    pdfBytes: Uint8Array;
    report: string;
}
export interface FixOptions {
    convertRGBtoCMYK: boolean;
    addBleed: boolean;
    embedFonts: boolean;
    flattenTransparency: boolean;
    optimizeImages: boolean;
    fixOverprint: boolean;
    adjustInkCoverage: boolean;
    fixTrimBox: boolean;
    removeHiddenLayers: boolean;
    convertSpotColors: boolean;
}
export declare class PDFAutoFixEngine {
    private pdfDoc;
    private originalBytes;
    /**
     * Load PDF for auto-fixing
     */
    loadPDF(pdfBytes: Uint8Array): Promise<void>;
    /**
     * Apply all auto-fixes based on preflight report
     */
    autoFix(preflightReport: PreflightReport, options?: Partial<FixOptions>): Promise<AutoFixResult>;
    /**
     * Convert RGB colors to CMYK
     */
    private convertRGBtoCMYK;
    /**
     * Add bleed to all pages
     */
    private addBleed;
    /**
     * Embed all fonts
     */
    private embedFonts;
    /**
     * Flatten transparency
     */
    private flattenTransparency;
    /**
     * Fix trim box and media box
     */
    private fixTrimBox;
    /**
     * Optimize image compression
     */
    private optimizeImages;
    /**
     * Remove hidden layers
     */
    private removeHiddenLayers;
    /**
     * Convert spot colors to process (CMYK)
     */
    private convertSpotColors;
    /**
     * Fix overprint settings
     */
    private fixOverprint;
    /**
     * Adjust ink coverage
     */
    private adjustInkCoverage;
    /**
     * Generate fix report
     */
    private generateFixReport;
    /**
     * Quick fix for common issues
     */
    quickFix(issueType: 'bleed' | 'rgb' | 'fonts' | 'transparency'): Promise<Uint8Array>;
    /**
     * Get comparison data for before/after
     */
    getComparisonData(): Promise<{
        original: Uint8Array;
        fixed: Uint8Array;
        changes: string[];
    }>;
}
export declare const autoFixEngine: PDFAutoFixEngine;
//# sourceMappingURL=pdf-autofix-engine.d.ts.map