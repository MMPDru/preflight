"use strict";
/**
 * Font Processing Utilities
 * Handles font analysis and embedding using pdf-lib and fontkit
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fontProcessor = exports.FontProcessor = void 0;
const pdf_lib_1 = require("pdf-lib");
const fontkit_1 = __importDefault(require("@pdf-lib/fontkit"));
class FontProcessor {
    /**
     * Register fontkit with PDFDocument to enable font embedding
     */
    registerFontkit(pdfDoc) {
        pdfDoc.registerFontkit(fontkit_1.default);
    }
    /**
     * Detect if a font is embedded in the PDF
     */
    async detectFontEmbedding(fontDict) {
        try {
            // Check if font has a FontFile, FontFile2, or FontFile3 entry
            const hasFile = fontDict.has(pdf_lib_1.PDFName.of('FontFile'));
            const hasFile2 = fontDict.has(pdf_lib_1.PDFName.of('FontFile2'));
            const hasFile3 = fontDict.has(pdf_lib_1.PDFName.of('FontFile3'));
            return hasFile || hasFile2 || hasFile3;
        }
        catch (error) {
            console.error('Error detecting font embedding:', error);
            return false;
        }
    }
    /**
     * Check if a font is subset (partial embedding)
     */
    isFontSubset(fontName) {
        // Subset fonts typically have a 6-character prefix followed by +
        // Example: ABCDEF+TimesNewRoman
        const subsetPattern = /^[A-Z]{6}\+/;
        return subsetPattern.test(fontName);
    }
    /**
     * Extract font information from PDF
     */
    async analyzeFonts(pdfDoc) {
        const fonts = [];
        const pages = pdfDoc.getPages();
        for (const page of pages) {
            try {
                const pageDict = page.node;
                const resources = pageDict.get(pdf_lib_1.PDFName.of('Resources'));
                if (!resources)
                    continue;
                const fontDict = resources.get(pdf_lib_1.PDFName.of('Font'));
                if (!fontDict)
                    continue;
                // Iterate through fonts in the page
                const fontKeys = fontDict.keys();
                for (const key of fontKeys) {
                    const font = fontDict.get(key);
                    if (!font)
                        continue;
                    const baseFont = font.get(pdf_lib_1.PDFName.of('BaseFont'));
                    const fontName = baseFont ? baseFont.toString().replace(/[/<>]/g, '') : 'Unknown';
                    const subtype = font.get(pdf_lib_1.PDFName.of('Subtype'));
                    const fontType = subtype ? subtype.toString().replace(/[/<>]/g, '') : 'Unknown';
                    const isEmbedded = await this.detectFontEmbedding(font);
                    const isSubset = this.isFontSubset(fontName);
                    // Check if we already have this font
                    const existingFont = fonts.find(f => f.name === fontName);
                    if (existingFont && 'usageCount' in existingFont) {
                        existingFont.usageCount++;
                    }
                    else {
                        fonts.push({
                            name: fontName,
                            type: fontType,
                            isEmbedded,
                            isSubset,
                        });
                    }
                }
            }
            catch (error) {
                console.error('Error analyzing fonts on page:', error);
            }
        }
        return fonts;
    }
    /**
     * Embed a font from file path
     */
    async embedFont(pdfDoc, fontPath) {
        this.registerFontkit(pdfDoc);
        const fontBytes = await Promise.resolve().then(() => __importStar(require('fs'))).then(fs => fs.promises.readFile(fontPath));
        return pdfDoc.embedFont(fontBytes);
    }
    /**
     * Embed standard fonts (built into PDF spec)
     */
    async embedStandardFont(pdfDoc, fontName) {
        const { StandardFonts } = await Promise.resolve().then(() => __importStar(require('pdf-lib')));
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
    getFontType(subtype) {
        const subtypeLower = subtype.toLowerCase();
        if (subtypeLower.includes('truetype'))
            return 'TrueType';
        if (subtypeLower.includes('type1'))
            return 'Type1';
        if (subtypeLower.includes('type3'))
            return 'Type3';
        if (subtypeLower.includes('cidfont'))
            return 'CIDFont';
        if (subtypeLower.includes('opentype'))
            return 'OpenType';
        return 'Unknown';
    }
    /**
     * Check if all fonts in PDF are embedded
     */
    async areAllFontsEmbedded(pdfDoc) {
        const fonts = await this.analyzeFonts(pdfDoc);
        return fonts.every(font => font.isEmbedded);
    }
    /**
     * Get list of non-embedded fonts
     */
    async getNonEmbeddedFonts(pdfDoc) {
        const fonts = await this.analyzeFonts(pdfDoc);
        return fonts.filter(font => !font.isEmbedded);
    }
    /**
     * Subset a font (reduce to only used glyphs)
     * Note: This is a placeholder - actual subsetting requires fontkit manipulation
     */
    async subsetFont(fontData, usedGlyphs) {
        // Font subsetting is complex and typically requires specialized libraries
        // For now, return the original font data
        console.warn('Font subsetting not yet implemented');
        return fontData;
    }
    /**
     * Outline fonts (convert text to paths)
     * Note: This is a complex operation that requires rendering text and converting to vector paths
     */
    async outlineFonts(pdfDoc) {
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
    getFontSubstitution(fontName) {
        const substitutions = {
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
exports.FontProcessor = FontProcessor;
exports.fontProcessor = new FontProcessor();
//# sourceMappingURL=font-processor.js.map