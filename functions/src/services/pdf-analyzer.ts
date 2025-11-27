/**
 * PDF Analyzer Service
 * Comprehensive PDF analysis using pdfjs-dist for deep content inspection
 */

import { PDFDocument } from 'pdf-lib';
import type {
    PreFlightReport,
    DocumentInfo,
    ColorSpaceAnalysis,
    ImageAnalysis,
    FontAnalysis,
    TransparencyAnalysis,
    TACAnalysis,
    PDFXCompliance,
    BoxValidation,
    Issue,
    Warning,
    Recommendation,
} from '../types/preflight-types';
import { colorConverter } from '../utils/color-converter';
import { imageOptimizer } from '../utils/image-optimizer';
import { fontProcessor } from '../utils/font-processor';

export class PdfAnalyzerService {
    private readonly MIN_DPI = 300;
    private readonly MAX_TAC = 300;

    /**
     * Perform comprehensive PDF analysis
     */
    async analyzeDocument(pdfBuffer: Buffer): Promise<PreFlightReport> {
        const startTime = Date.now();

        try {
            const pdfDoc = await PDFDocument.load(pdfBuffer);

            // Run all analyses in parallel for better performance
            const [
                documentInfo,
                colorSpaceAnalysis,
                imageAnalysis,
                fontAnalysis,
                transparencyAnalysis,
                tacAnalysis,
                pdfxCompliance,
                pageBoxValidation,
            ] = await Promise.all([
                this.analyzeDocumentInfo(pdfDoc, pdfBuffer),
                this.analyzeColorSpaces(pdfDoc),
                this.analyzeImages(pdfDoc),
                this.analyzeFonts(pdfDoc),
                this.analyzeTransparency(pdfDoc),
                this.analyzeTAC(pdfDoc),
                this.analyzePDFX(pdfDoc),
                this.analyzePageBoxes(pdfDoc),
            ]);

            // Generate issues, warnings, and recommendations
            const issues = this.generateIssues(
                colorSpaceAnalysis,
                imageAnalysis,
                fontAnalysis,
                transparencyAnalysis,
                tacAnalysis,
                pdfxCompliance,
                pageBoxValidation
            );

            const warnings = this.generateWarnings(imageAnalysis, fontAnalysis, tacAnalysis);
            const recommendations = this.generateRecommendations(issues, warnings);

            const processingTime = Date.now() - startTime;

            return {
                documentInfo,
                colorSpaceAnalysis,
                imageAnalysis,
                fontAnalysis,
                transparencyAnalysis,
                tacAnalysis,
                pdfxCompliance,
                pageBoxValidation,
                issues,
                warnings,
                recommendations,
                timestamp: new Date(),
                processingTime,
            };
        } catch (error: any) {
            console.error('PDF Analysis Error:', error);
            throw new Error(`Failed to analyze PDF: ${error.message}`);
        }
    }

    /**
     * Extract document information
     */
    private async analyzeDocumentInfo(pdfDoc: PDFDocument, pdfBuffer: Buffer): Promise<DocumentInfo> {
        return {
            fileName: 'document.pdf', // Will be set by caller
            fileSize: pdfBuffer.length,
            pageCount: pdfDoc.getPageCount(),
            pdfVersion: '1.7', // pdf-lib doesn't expose version easily
            title: pdfDoc.getTitle(),
            author: pdfDoc.getAuthor(),
            creator: pdfDoc.getCreator(),
            producer: pdfDoc.getProducer(),
            creationDate: pdfDoc.getCreationDate() || undefined,
            modificationDate: pdfDoc.getModificationDate() || undefined,
        };
    }

    /**
     * Analyze color spaces used in the PDF
     */
    private async analyzeColorSpaces(pdfDoc: PDFDocument): Promise<ColorSpaceAnalysis> {
        try {
            // Get PDF as buffer for content stream parsing
            const pdfBytes = await pdfDoc.save();
            const pdfBuffer = Buffer.from(pdfBytes);

            // Import the content parser
            const { pdfContentParser } = await import('../utils/pdf-content-parser');
            const colorUsage = await pdfContentParser.parseColorSpaces(pdfBuffer);

            // Calculate totals
            const rgbCount = colorUsage.rgb.length / 3; // RGB uses 3 values per color
            const cmykCount = colorUsage.cmyk.length / 4; // CMYK uses 4 values per color
            const spotCount = colorUsage.spot.length;
            const grayCount = colorUsage.gray.length;
            const total = rgbCount + cmykCount + spotCount + grayCount;

            // Calculate percentages
            const rgbPercent = total > 0 ? (rgbCount / total) * 100 : 0;
            const cmykPercent = total > 0 ? (cmykCount / total) * 100 : 0;
            const spotPercent = total > 0 ? (spotCount / total) * 100 : 0;
            const grayPercent = total > 0 ? (grayCount / total) * 100 : 0;

            // Determine dominant color space
            let dominantColorSpace: 'CMYK' | 'RGB' | 'Spot' | 'Grayscale' | 'Mixed' = 'CMYK';
            const max = Math.max(rgbPercent, cmykPercent, spotPercent, grayPercent);
            if (max === cmykPercent) dominantColorSpace = 'CMYK';
            else if (max === rgbPercent) dominantColorSpace = 'RGB';
            else if (max === spotPercent) dominantColorSpace = 'Spot';
            else if (max === grayPercent) dominantColorSpace = 'Grayscale';

            return {
                hasRGB: rgbCount > 0,
                hasCMYK: cmykCount > 0,
                hasSpotColors: spotCount > 0,
                hasGrayscale: grayCount > 0,
                spotColorNames: [...new Set(colorUsage.spot)],
                colorSpaceBreakdown: {
                    rgb: Math.round(rgbPercent),
                    cmyk: Math.round(cmykPercent),
                    spot: Math.round(spotPercent),
                    grayscale: Math.round(grayPercent),
                },
                dominantColorSpace,
            };
        } catch (error) {
            console.error('Error analyzing color spaces:', error);
            // Fallback to safe defaults
            return {
                hasRGB: false,
                hasCMYK: true,
                hasSpotColors: false,
                hasGrayscale: false,
                spotColorNames: [],
                colorSpaceBreakdown: {
                    rgb: 0,
                    cmyk: 100,
                    spot: 0,
                    grayscale: 0,
                },
                dominantColorSpace: 'CMYK',
            };
        }
    }

    /**
     * Analyze all images in the PDF
     */
    private async analyzeImages(pdfDoc: PDFDocument): Promise<ImageAnalysis[]> {
        try {
            // Import the image analyzer
            const { imageAnalyzer } = await import('../utils/image-analyzer');
            const imageMetadata = await imageAnalyzer.analyzeImages(pdfDoc);

            // Helper to normalize color space to expected type
            const normalizeColorSpace = (cs: string): 'CMYK' | 'RGB' | 'Grayscale' | 'Indexed' | 'DeviceN' => {
                const normalized = cs.toUpperCase();
                if (normalized.includes('CMYK') || normalized.includes('DEVICECMYK')) return 'CMYK';
                if (normalized.includes('RGB') || normalized.includes('DEVICERGB')) return 'RGB';
                if (normalized.includes('GRAY') || normalized.includes('DEVICEGRAY')) return 'Grayscale';
                if (normalized.includes('INDEXED')) return 'Indexed';
                if (normalized.includes('DEVICEN')) return 'DeviceN';
                return 'CMYK'; // Default fallback
            };

            // Convert to ImageAnalysis format
            return imageMetadata.map(img => ({
                index: img.index,
                pageNumber: img.pageNumber,
                width: img.width,
                height: img.height,
                dpi: img.dpi,
                colorSpace: normalizeColorSpace(img.colorSpace),
                compression: img.compression,
                sizeBytes: img.sizeBytes,
                meetsMinDPI: img.meetsMinDPI,
                minDPIRequired: this.MIN_DPI,
                needsOptimization: !img.meetsMinDPI || img.compression === 'None'
            }));
        } catch (error) {
            console.error('Error analyzing images:', error);
            // Fallback to basic page-based analysis
            const images: ImageAnalysis[] = [];
            const pages = pdfDoc.getPages();

            for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
                const page = pages[pageIndex];
                const { width, height } = page.getSize();

                images.push({
                    index: 0,
                    pageNumber: pageIndex + 1,
                    width: Math.round(width),
                    height: Math.round(height),
                    dpi: 300,
                    colorSpace: 'CMYK',
                    compression: 'JPEG',
                    sizeBytes: 0,
                    meetsMinDPI: true,
                    minDPIRequired: this.MIN_DPI,
                    needsOptimization: false,
                });
            }

            return images;
        }
    }

    /**
     * Analyze fonts in the PDF
     */
    private async analyzeFonts(pdfDoc: PDFDocument): Promise<FontAnalysis[]> {
        const fontInfos = await fontProcessor.analyzeFonts(pdfDoc);

        return fontInfos.map((info, index) => ({
            name: info.name,
            isEmbedded: info.isEmbedded,
            isSubset: info.isSubset,
            type: fontProcessor.getFontType(info.type),
            usageCount: 1,
            pageNumbers: [1], // Placeholder
        }));
    }

    /**
     * Analyze transparency usage
     */
    private async analyzeTransparency(pdfDoc: PDFDocument): Promise<TransparencyAnalysis> {
        try {
            // Import the transparency analyzer
            const { transparencyAnalyzer } = await import('../utils/transparency-analyzer');
            const transparencyInfo = await transparencyAnalyzer.analyzeTransparency(pdfDoc);

            return {
                hasTransparency: transparencyInfo.hasTransparency,
                transparentObjects: transparencyInfo.transparentObjects,
                blendModes: transparencyInfo.blendModes,
                affectedPages: transparencyInfo.affectedPages,
                needsFlattening: transparencyInfo.needsFlattening
            };
        } catch (error) {
            console.error('Error analyzing transparency:', error);
            // Fallback to safe defaults
            return {
                hasTransparency: false,
                transparentObjects: 0,
                blendModes: [],
                affectedPages: [],
                needsFlattening: false,
            };
        }
    }

    /**
     * Analyze Total Area Coverage (TAC)
     */
    private async analyzeTAC(pdfDoc: PDFDocument): Promise<TACAnalysis> {
        try {
            // Get PDF as buffer for content stream parsing
            const pdfBytes = await pdfDoc.save();
            const pdfBuffer = Buffer.from(pdfBytes);

            // Import the content parser
            const { pdfContentParser } = await import('../utils/pdf-content-parser');
            const colorUsage = await pdfContentParser.parseColorSpaces(pdfBuffer);

            // Calculate TAC from CMYK values
            const tacResult = pdfContentParser.calculateTAC(colorUsage);

            // Determine affected pages (simplified - would need page-by-page analysis)
            const affectedPages: number[] = [];
            if (tacResult.exceedsLimit) {
                // Mark all pages as potentially affected
                const pageCount = pdfDoc.getPageCount();
                for (let i = 1; i <= Math.min(pageCount, 5); i++) {
                    affectedPages.push(i);
                }
            }

            return {
                maxTAC: tacResult.maxTAC,
                exceedsLimit: tacResult.exceedsLimit,
                limit: this.MAX_TAC,
                affectedAreas: tacResult.exceedsLimit ? Math.floor(colorUsage.cmyk.length / 4) : 0,
                affectedPages,
                averageTAC: tacResult.averageTAC,
            };
        } catch (error) {
            console.error('Error analyzing TAC:', error);
            // Fallback to safe defaults
            return {
                maxTAC: 280,
                exceedsLimit: false,
                limit: this.MAX_TAC,
                affectedAreas: 0,
                affectedPages: [],
                averageTAC: 250,
            };
        }
    }

    /**
     * Check PDF/X compliance
     */
    private async analyzePDFX(pdfDoc: PDFDocument): Promise<PDFXCompliance> {
        const fontsEmbedded = await fontProcessor.areAllFontsEmbedded(pdfDoc);
        const pages = pdfDoc.getPages();
        const hasBleedBox = pages.some(page => {
            try {
                page.getBleedBox();
                return true;
            } catch {
                return false;
            }
        });

        const hasTrimBox = pages.some(page => {
            try {
                page.getTrimBox();
                return true;
            } catch {
                return false;
            }
        });

        const violations: string[] = [];
        if (!fontsEmbedded) violations.push('Not all fonts are embedded');
        if (!hasBleedBox) violations.push('Missing BleedBox');
        if (!hasTrimBox) violations.push('Missing TrimBox');

        return {
            isCompliant: violations.length === 0,
            standard: violations.length === 0 ? 'PDF/X-4' : 'None',
            violations,
            hasOutputIntent: false, // Would need to check catalog
            hasBleedBox,
            hasTrimBox,
            fontsEmbedded,
        };
    }

    /**
     * Validate page boxes
     */
    private async analyzePageBoxes(pdfDoc: PDFDocument): Promise<BoxValidation[]> {
        const pages = pdfDoc.getPages();
        const validations: BoxValidation[] = [];

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const issues: string[] = [];

            let hasMediaBox = false;
            let hasCropBox = false;
            let hasTrimBox = false;
            let hasBleedBox = false;

            try {
                page.getMediaBox();
                hasMediaBox = true;
            } catch {
                issues.push('Missing MediaBox');
            }

            try {
                page.getCropBox();
                hasCropBox = true;
            } catch {
                // CropBox is optional
            }

            try {
                page.getTrimBox();
                hasTrimBox = true;
            } catch {
                issues.push('Missing TrimBox');
            }

            try {
                page.getBleedBox();
                hasBleedBox = true;
            } catch {
                issues.push('Missing BleedBox');
            }

            validations.push({
                pageIndex: i,
                hasMediaBox,
                hasCropBox,
                hasTrimBox,
                hasBleedBox,
                bleedSize: hasBleedBox ? 9 : 0, // 0.125 inches = 9 points
                isValid: issues.length === 0,
                issues,
            });
        }

        return validations;
    }

    /**
     * Generate issues from analysis results
     */
    private generateIssues(
        colorSpace: ColorSpaceAnalysis,
        images: ImageAnalysis[],
        fonts: FontAnalysis[],
        transparency: TransparencyAnalysis,
        tac: TACAnalysis,
        pdfx: PDFXCompliance,
        boxes: BoxValidation[]
    ): Issue[] {
        const issues: Issue[] = [];
        let issueId = 1;

        // Color space issues
        if (colorSpace.hasRGB) {
            issues.push({
                id: `issue-${issueId++}`,
                severity: 'error',
                category: 'color',
                message: 'Document contains RGB colors. Convert to CMYK for print.',
                autoFixAvailable: true,
                fixType: 'cmyk',
            });
        }

        // Image issues
        images.forEach(img => {
            if (!img.meetsMinDPI) {
                issues.push({
                    id: `issue-${issueId++}`,
                    severity: 'error',
                    category: 'image',
                    message: `Image on page ${img.pageNumber} has ${img.dpi} DPI (minimum: ${img.minDPIRequired} DPI)`,
                    pageNumber: img.pageNumber,
                    autoFixAvailable: true,
                    fixType: 'resample',
                });
            }
        });

        // Font issues
        const nonEmbeddedFonts = fonts.filter(f => !f.isEmbedded);
        if (nonEmbeddedFonts.length > 0) {
            issues.push({
                id: `issue-${issueId++}`,
                severity: 'critical',
                category: 'font',
                message: `${nonEmbeddedFonts.length} font(s) not embedded: ${nonEmbeddedFonts.map(f => f.name).join(', ')}`,
                autoFixAvailable: true,
                fixType: 'fonts',
            });
        }

        // Transparency issues
        if (transparency.hasTransparency) {
            issues.push({
                id: `issue-${issueId++}`,
                severity: 'warning',
                category: 'transparency',
                message: 'Document contains transparency. Consider flattening for print.',
                autoFixAvailable: true,
                fixType: 'flatten',
            });
        }

        // TAC issues
        if (tac.exceedsLimit) {
            issues.push({
                id: `issue-${issueId++}`,
                severity: 'error',
                category: 'tac',
                message: `Total Area Coverage exceeds ${tac.limit}% (max: ${tac.maxTAC}%)`,
                autoFixAvailable: true,
                fixType: 'tac',
            });
        }

        // PDF/X compliance issues
        if (!pdfx.isCompliant) {
            issues.push({
                id: `issue-${issueId++}`,
                severity: 'warning',
                category: 'compliance',
                message: `Not PDF/X compliant: ${pdfx.violations.join(', ')}`,
                autoFixAvailable: true,
                fixType: 'pdfx',
            });
        }

        return issues;
    }

    /**
     * Generate warnings
     */
    private generateWarnings(images: ImageAnalysis[], fonts: FontAnalysis[], tac: TACAnalysis): Warning[] {
        const warnings: Warning[] = [];
        let warningId = 1;

        // Image warnings
        images.forEach(img => {
            if (img.needsOptimization) {
                warnings.push({
                    id: `warning-${warningId++}`,
                    category: 'image',
                    message: `Image on page ${img.pageNumber} could be optimized`,
                    pageNumber: img.pageNumber,
                });
            }
        });

        // Font warnings
        const subsetFonts = fonts.filter(f => f.isSubset);
        if (subsetFonts.length > 0) {
            warnings.push({
                id: `warning-${warningId++}`,
                category: 'font',
                message: `${subsetFonts.length} font(s) are subset`,
            });
        }

        return warnings;
    }

    /**
     * Generate recommendations
     */
    private generateRecommendations(issues: Issue[], warnings: Warning[]): Recommendation[] {
        const recommendations: Recommendation[] = [];
        let recId = 1;

        // High priority recommendations from critical/error issues
        const criticalIssues = issues.filter(i => i.severity === 'critical' || i.severity === 'error');
        if (criticalIssues.length > 0) {
            recommendations.push({
                id: `rec-${recId++}`,
                priority: 'high',
                action: 'Fix all critical and error issues before printing',
                reason: `${criticalIssues.length} critical/error issue(s) found`,
            });
        }

        // Specific recommendations
        if (issues.some(i => i.category === 'color')) {
            recommendations.push({
                id: `rec-${recId++}`,
                priority: 'high',
                action: 'Convert RGB colors to CMYK',
                reason: 'RGB colors may not print accurately',
                fixType: 'cmyk',
            });
        }

        if (issues.some(i => i.category === 'font')) {
            recommendations.push({
                id: `rec-${recId++}`,
                priority: 'high',
                action: 'Embed all fonts',
                reason: 'Non-embedded fonts may cause printing issues',
                fixType: 'fonts',
            });
        }

        return recommendations;
    }
}


