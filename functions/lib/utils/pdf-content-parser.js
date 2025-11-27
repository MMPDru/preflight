"use strict";
/**
 * PDF Content Stream Parser
 * Parses PDF content streams to extract color, image, and transparency information
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfContentParser = exports.PdfContentParser = void 0;
const pdfjsLib = __importStar(require("pdfjs-dist/legacy/build/pdf.js"));
// Disable worker for server-side usage
pdfjsLib.GlobalWorkerOptions.workerSrc = '';
class PdfContentParser {
    /**
     * Parse color operators from PDF content streams
     */
    async parseColorSpaces(pdfBuffer) {
        const colorUsage = {
            rgb: [],
            cmyk: [],
            spot: [],
            gray: []
        };
        try {
            const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
            const pdfDoc = await loadingTask.promise;
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const ops = await page.getOperatorList();
                for (let j = 0; j < ops.fnArray.length; j++) {
                    const fn = ops.fnArray[j];
                    const args = ops.argsArray[j];
                    // RGB color operators
                    if (fn === pdfjsLib.OPS.setFillRGBColor || fn === pdfjsLib.OPS.setStrokeRGBColor) {
                        colorUsage.rgb.push(...args);
                    }
                    // CMYK color operators
                    else if (fn === pdfjsLib.OPS.setFillCMYKColor || fn === pdfjsLib.OPS.setStrokeCMYKColor) {
                        colorUsage.cmyk.push(...args);
                    }
                    // Gray color operators
                    else if (fn === pdfjsLib.OPS.setFillGray || fn === pdfjsLib.OPS.setStrokeGray) {
                        colorUsage.gray.push(...args);
                    }
                    // Spot color operators (simplified)
                    else if (fn === pdfjsLib.OPS.setFillColorSpace || fn === pdfjsLib.OPS.setStrokeColorSpace) {
                        if (args[0] && typeof args[0] === 'string' && args[0].includes('Separation')) {
                            colorUsage.spot.push(args[0]);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Error parsing color spaces:', error);
        }
        return colorUsage;
    }
    /**
     * Extract image information from PDF
     */
    async extractImages(pdfBuffer) {
        const images = [];
        try {
            const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
            const pdfDoc = await loadingTask.promise;
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const ops = await page.getOperatorList();
                for (let j = 0; j < ops.fnArray.length; j++) {
                    const fn = ops.fnArray[j];
                    const args = ops.argsArray[j];
                    if (fn === pdfjsLib.OPS.paintImageXObject || fn === pdfjsLib.OPS.paintInlineImageXObject) {
                        // Extract image metadata
                        // Note: Full image extraction requires more complex parsing
                        images.push({
                            pageNumber: i,
                            width: 0, // Would need to parse from image dictionary
                            height: 0,
                            bitsPerComponent: 8,
                            colorSpace: 'Unknown',
                            filter: 'Unknown'
                        });
                    }
                }
            }
        }
        catch (error) {
            console.error('Error extracting images:', error);
        }
        return images;
    }
    /**
     * Calculate Total Area Coverage (TAC) from CMYK values
     */
    calculateTAC(colorUsage) {
        const cmykValues = colorUsage.cmyk;
        const tacValues = [];
        // Process CMYK values in groups of 4 (C, M, Y, K)
        for (let i = 0; i < cmykValues.length; i += 4) {
            if (i + 3 < cmykValues.length) {
                const c = cmykValues[i];
                const m = cmykValues[i + 1];
                const y = cmykValues[i + 2];
                const k = cmykValues[i + 3];
                // TAC = C% + M% + Y% + K% (values are 0-1, multiply by 100)
                const tac = (c + m + y + k) * 100;
                tacValues.push(tac);
            }
        }
        const maxTAC = tacValues.length > 0 ? Math.max(...tacValues) : 0;
        const averageTAC = tacValues.length > 0
            ? tacValues.reduce((a, b) => a + b, 0) / tacValues.length
            : 0;
        return {
            maxTAC: Math.round(maxTAC),
            averageTAC: Math.round(averageTAC),
            exceedsLimit: maxTAC > 300
        };
    }
}
exports.PdfContentParser = PdfContentParser;
exports.pdfContentParser = new PdfContentParser();
//# sourceMappingURL=pdf-content-parser.js.map