/**
 * Transparency Analysis Utilities
 * Detect and analyze transparency in PDFs
 */

import { PDFDocument, PDFName, PDFDict } from 'pdf-lib';

export interface TransparencyInfo {
    hasTransparency: boolean;
    transparentObjects: number;
    blendModes: string[];
    affectedPages: number[];
    needsFlattening: boolean;
    softMasks: number;
    transparencyGroups: number;
}

export class TransparencyAnalyzer {
    /**
     * Analyze transparency in PDF document
     */
    async analyzeTransparency(pdfDoc: PDFDocument): Promise<TransparencyInfo> {
        let hasTransparency = false;
        let transparentObjects = 0;
        const blendModes: string[] = [];
        const affectedPages: number[] = [];
        let softMasks = 0;
        let transparencyGroups = 0;

        const pages = pdfDoc.getPages();

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const pageHasTransparency = await this.analyzePageTransparency(page);

            if (pageHasTransparency.hasTransparency) {
                hasTransparency = true;
                affectedPages.push(i + 1);
                transparentObjects += pageHasTransparency.transparentObjects;
                blendModes.push(...pageHasTransparency.blendModes);
                softMasks += pageHasTransparency.softMasks;
                transparencyGroups += pageHasTransparency.transparencyGroups;
            }
        }

        return {
            hasTransparency,
            transparentObjects,
            blendModes: [...new Set(blendModes)],
            affectedPages,
            needsFlattening: hasTransparency,
            softMasks,
            transparencyGroups
        };
    }

    /**
     * Analyze transparency on a single page
     */
    private async analyzePageTransparency(page: any): Promise<{
        hasTransparency: boolean;
        transparentObjects: number;
        blendModes: string[];
        softMasks: number;
        transparencyGroups: number;
    }> {
        let hasTransparency = false;
        let transparentObjects = 0;
        const blendModes: string[] = [];
        let softMasks = 0;
        let transparencyGroups = 0;

        try {
            const resources = page.node.Resources();
            if (!resources) {
                return { hasTransparency, transparentObjects, blendModes, softMasks, transparencyGroups };
            }

            // Check ExtGState for blend modes and soft masks
            const extGState = resources.lookup(PDFName.of('ExtGState'));
            if (extGState && extGState instanceof PDFDict) {
                const stateNames = extGState.keys();

                for (const stateName of stateNames) {
                    const state = extGState.lookup(stateName);
                    if (!state || !(state instanceof PDFDict)) continue;

                    // Check for blend mode
                    const bm = state.lookup(PDFName.of('BM'));
                    if (bm && bm.toString() !== '/Normal') {
                        hasTransparency = true;
                        blendModes.push(bm.toString().replace('/', ''));
                        transparentObjects++;
                    }

                    // Check for soft mask
                    const smask = state.lookup(PDFName.of('SMask'));
                    if (smask && smask.toString() !== '/None') {
                        hasTransparency = true;
                        softMasks++;
                        transparentObjects++;
                    }

                    // Check for opacity
                    const ca = state.lookup(PDFName.of('ca')); // Fill opacity
                    const CA = state.lookup(PDFName.of('CA')); // Stroke opacity
                    if ((ca && parseFloat(ca.toString()) < 1) || (CA && parseFloat(CA.toString()) < 1)) {
                        hasTransparency = true;
                        transparentObjects++;
                    }
                }
            }

            // Check for transparency groups
            const group = page.node.lookup(PDFName.of('Group'));
            if (group && group instanceof PDFDict) {
                const s = group.lookup(PDFName.of('S'));
                if (s && s.toString() === '/Transparency') {
                    hasTransparency = true;
                    transparencyGroups++;
                }
            }
        } catch (error) {
            console.error('Error analyzing page transparency:', error);
        }

        return {
            hasTransparency,
            transparentObjects,
            blendModes,
            softMasks,
            transparencyGroups
        };
    }
}

export const transparencyAnalyzer = new TransparencyAnalyzer();
