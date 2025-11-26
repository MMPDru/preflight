/**
 * Font Processing Utilities
 * Handles font analysis and embedding using pdf-lib and fontkit
 */

import { PDFDocument, PDFFont, PDFName } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { FontInfo } from '../types/preflight-types';

export class FontProcessor {
    /**
     * Register fontkit with PDFDocument to enable font embedding
     */
    registerFontkit(pdfDoc: PDFDocument): void {
        pdfDoc.registerFontkit(fontkit);
    }

    /**
     * Detect if a font is embedded in the PDF
     */
    async detectFontEmbedding(fontDict: any): Promise<boolean> {
        try {
            // Check if font has a FontFile, FontFile2, or FontFile3 entry
            const hasFile = fontDict.has(PDFName.of('FontFile'));
            const hasFile2 = fontDict.has(PDFName.of('FontFile2'));
            const hasFile3 = fontDict.has(PDFName.of('FontFile3'));

            return hasFile || hasFile2 || hasFile3;
        } catch (error) {
            console.error('Error detecting font embedding:', error);
            return false;
        }
    }

    /**
     * Check if a font is subset (partial embedding)
     */
    isFontSubset(fontName: string): boolean {
        // Subset fonts typically have a 6-character prefix followed by +
        // Example: ABCDEF+TimesNewRoman
        const subsetPattern = /^[A-Z]{6}\+/;
        return subsetPattern.test(fontName);
    }

    /**
     * Extract font information from PDF
     */
    async analyzeFonts(pdfDoc: PDFDocument): Promise<FontInfo[]> {
        const fonts: FontInfo[] = [];
        const pages = pdfDoc.getPages();

        for (const page of pages) {
            try {
                const pageDict = page.node;
                const resources = pageDict.get(PDFName.of('Resources')) as any;

                if (!resources) continue;

                const fontDict = resources.get(PDFName.of('Font')) as any;
                if (!fontDict) continue;

                // Iterate through fonts in the page
                const fontKeys = fontDict.keys();
                for (const key of fontKeys) {
                    const font = fontDict.get(key) as any;
                    if (!font) continue;

                    const baseFont = font.get(PDFName.of('BaseFont'));
                    const fontName = baseFont ? baseFont.toString().replace(/[/<>]/g, '') : 'Unknown';

                    const subtype = font.get(PDFName.of('Subtype'));
                    const fontType = subtype ? subtype.toString().replace(/[/<>]/g, '') : 'Unknown';

                    const isEmbedded = await this.detectFontEmbedding(font);
                    const isSubset = this.isFontSubset(fontName);

                    // Check if we already have this font
                    const existingFont = fonts.find(f => f.name === fontName);
                    if (existingFont && 'usageCount' in existingFont) {
                        (existingFont as any).usageCount++;
                    } else {
                        fonts.push({
                            name: fontName,
                            type: fontType,
                            isEmbedded,
                            isSubset,
                        });
                    }
                }
            } catch (error) {
                console.error('Error analyzing fonts on page:', error);
            }
        }

        return fonts;
    }

    /**
     * Embed a font from file path
     */
    async embedFont(pdfDoc: PDFDocument, fontPath: string): Promise<PDFFont> {
        this.registerFontkit(pdfDoc);

        const fontBytes = await import('fs').then(fs => fs.promises.readFile(fontPath));
        return pdfDoc.embedFont(fontBytes);
    }

    /**
     * Embed standard fonts (built into PDF spec)
     */
    async embedStandardFont(pdfDoc: PDFDocument, fontName: 'Helvetica' | 'Times-Roman' | 'Courier'): Promise<PDFFont> {
        const { StandardFonts } = await import('pdf-lib');

        switch (fontName) {
            case 'Helvetica':
                return pdfDoc.embedFont(StandardFonts.Helvetica);
            case 'Times-Roman':
                return pdfDoc.embedFont(StandardFonts.TimesRoman);
            case 'Courier':
                return pdfDoc.embedFont(StandardFonts.Courier);
            default:
                return pdfDoc.embedFont(StandardFonts.Helvetica);
        }
    }

    /**
     * Get font type from subtype
     */
    getFontType(subtype: string): 'TrueType' | 'Type1' | 'Type3' | 'CIDFont' | 'OpenType' | 'Unknown' {
        const subtypeLower = subtype.toLowerCase();

        if (subtypeLower.includes('truetype')) return 'TrueType';
        if (subtypeLower.includes('type1')) return 'Type1';
        if (subtypeLower.includes('type3')) return 'Type3';
        if (subtypeLower.includes('cidfont')) return 'CIDFont';
        if (subtypeLower.includes('opentype')) return 'OpenType';

        return 'Unknown';
    }

    /**
     * Check if all fonts in PDF are embedded
     */
    async areAllFontsEmbedded(pdfDoc: PDFDocument): Promise<boolean> {
        const fonts = await this.analyzeFonts(pdfDoc);
        return fonts.every(font => font.isEmbedded);
    }

    /**
     * Get list of non-embedded fonts
     */
    async getNonEmbeddedFonts(pdfDoc: PDFDocument): Promise<FontInfo[]> {
        const fonts = await this.analyzeFonts(pdfDoc);
        return fonts.filter(font => !font.isEmbedded);
    }

    /**
     * Subset a font (reduce to only used glyphs)
     * Note: This is a placeholder - actual subsetting requires fontkit manipulation
     */
    async subsetFont(fontData: Buffer, usedGlyphs: string[]): Promise<Buffer> {
        // Font subsetting is complex and typically requires specialized libraries
        // For now, return the original font data
        console.warn('Font subsetting not yet implemented');
        return fontData;
    }

    /**
     * Outline fonts (convert text to paths)
     * Note: This is a complex operation that requires rendering text and converting to vector paths
     */
    async outlineFonts(pdfDoc: PDFDocument): Promise<void> {
        console.warn('Font outlining not yet implemented - requires advanced PDF manipulation');
        // This would require:
        // 1. Extract all text objects
        // 2. Render each character as a path
        // 3. Replace text objects with path objects
        // 4. Remove font references
    }

    /**
     * Get common font substitutions for missing fonts
     */
    getFontSubstitution(fontName: string): string {
        const substitutions: { [key: string]: string } = {
            'Arial': 'Helvetica',
            'Times New Roman': 'Times-Roman',
            'Courier New': 'Courier',
            'Verdana': 'Helvetica',
            'Georgia': 'Times-Roman',
            'Comic Sans MS': 'Helvetica',
        };

        return substitutions[fontName] || 'Helvetica';
    }
}

export const fontProcessor = new FontProcessor();
