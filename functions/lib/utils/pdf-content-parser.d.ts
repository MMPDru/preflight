/**
 * PDF Content Stream Parser
 * Parses PDF content streams to extract color, image, and transparency information
 */
export interface ColorUsage {
    rgb: number[];
    cmyk: number[];
    spot: string[];
    gray: number[];
}
export interface ImageInfo {
    pageNumber: number;
    width: number;
    height: number;
    bitsPerComponent: number;
    colorSpace: string;
    filter: string;
}
export declare class PdfContentParser {
    /**
     * Parse color operators from PDF content streams
     */
    parseColorSpaces(pdfBuffer: Buffer): Promise<ColorUsage>;
    /**
     * Extract image information from PDF
     */
    extractImages(pdfBuffer: Buffer): Promise<ImageInfo[]>;
    /**
     * Calculate Total Area Coverage (TAC) from CMYK values
     */
    calculateTAC(colorUsage: ColorUsage): {
        maxTAC: number;
        averageTAC: number;
        exceedsLimit: boolean;
    };
}
export declare const pdfContentParser: PdfContentParser;
//# sourceMappingURL=pdf-content-parser.d.ts.map