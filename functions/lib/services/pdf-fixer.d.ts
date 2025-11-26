import type { PreFlightReport, FixOptions } from '../types/preflight-types';
export declare class PdfFixerService {
    /**
     * Process PDF with fixes and return analysis report
     */
    processPdfWithAnalysis(fileBuffer: Buffer, operations: string[], options?: FixOptions): Promise<{
        buffer: Buffer;
        analysis: PreFlightReport;
    }>;
    processPdf(fileBuffer: Buffer, operations: string[], options?: FixOptions): Promise<Buffer>;
    private resetPageBoxes;
    private addTrimMarks;
    private splitSpreads;
    private convertToCMYK;
    private fixFonts;
    private resampleImages;
    private fixBleed;
    private scalePages;
    private cleanStrayObjects;
    private fixPageOrder;
    private normalizeMetadata;
    /**
     * Flatten transparency (enhanced with Ghostscript)
     */
    private flattenTransparency;
    /**
     * Fix Total Area Coverage (TAC)
     */
    private fixTAC;
    /**
     * Convert spot colors to process colors (CMYK)
     */
    private convertSpotColors;
    /**
     * Outline fonts (convert to paths)
     */
    private outlineFonts;
    /**
     * Make PDF/X compliant
     */
    private makePDFXCompliant;
}
export declare const pdfFixer: PdfFixerService;
//# sourceMappingURL=pdf-fixer.d.ts.map