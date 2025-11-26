/**
 * Font Processing Utilities
 * Handles font analysis and embedding using pdf-lib and fontkit
 */
import { PDFDocument, PDFFont } from 'pdf-lib';
import type { FontInfo } from '../types/preflight-types';
export declare class FontProcessor {
    /**
     * Register fontkit with PDFDocument to enable font embedding
     */
    registerFontkit(pdfDoc: PDFDocument): void;
    /**
     * Detect if a font is embedded in the PDF
     */
    detectFontEmbedding(fontDict: any): Promise<boolean>;
    /**
     * Check if a font is subset (partial embedding)
     */
    isFontSubset(fontName: string): boolean;
    /**
     * Extract font information from PDF
     */
    analyzeFonts(pdfDoc: PDFDocument): Promise<FontInfo[]>;
    /**
     * Embed a font from file path
     */
    embedFont(pdfDoc: PDFDocument, fontPath: string): Promise<PDFFont>;
    /**
     * Embed standard fonts (built into PDF spec)
     */
    embedStandardFont(pdfDoc: PDFDocument, fontName: 'Helvetica' | 'Times-Roman' | 'Courier'): Promise<PDFFont>;
    /**
     * Get font type from subtype
     */
    getFontType(subtype: string): 'TrueType' | 'Type1' | 'Type3' | 'CIDFont' | 'OpenType' | 'Unknown';
    /**
     * Check if all fonts in PDF are embedded
     */
    areAllFontsEmbedded(pdfDoc: PDFDocument): Promise<boolean>;
    /**
     * Get list of non-embedded fonts
     */
    getNonEmbeddedFonts(pdfDoc: PDFDocument): Promise<FontInfo[]>;
    /**
     * Subset a font (reduce to only used glyphs)
     * Note: This is a placeholder - actual subsetting requires fontkit manipulation
     */
    subsetFont(fontData: Buffer, usedGlyphs: string[]): Promise<Buffer>;
    /**
     * Outline fonts (convert text to paths)
     * Note: This is a complex operation that requires rendering text and converting to vector paths
     */
    outlineFonts(pdfDoc: PDFDocument): Promise<void>;
    /**
     * Get common font substitutions for missing fonts
     */
    getFontSubstitution(fontName: string): string;
}
export declare const fontProcessor: FontProcessor;
//# sourceMappingURL=font-processor.d.ts.map