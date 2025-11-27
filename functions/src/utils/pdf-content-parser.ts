/**
 * PDF Content Stream Parser
 * Parses PDF content streams to extract color, image, and transparency information
 */

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { PDFDocument } from 'pdf-lib';

// Disable worker for server-side usage
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

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

export class PdfContentParser {
    /**
     * Parse color operators from PDF content streams
     */
    async parseColorSpaces(pdfBuffer: Buffer): Promise<ColorUsage> {
        const colorUsage: ColorUsage = {
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
        } catch (error) {
            console.error('Error parsing color spaces:', error);
        }

        return colorUsage;
    }

    /**
     * Extract image information from PDF
     */
    async extractImages(pdfBuffer: Buffer): Promise<ImageInfo[]> {
        const images: ImageInfo[] = [];

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
        } catch (error) {
            console.error('Error extracting images:', error);
        }

        return images;
    }

    /**
     * Calculate Total Area Coverage (TAC) from CMYK values
     */
    calculateTAC(colorUsage: ColorUsage): { maxTAC: number; averageTAC: number; exceedsLimit: boolean } {
        const cmykValues = colorUsage.cmyk;
        const tacValues: number[] = [];

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

export const pdfContentParser = new PdfContentParser();
