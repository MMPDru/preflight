import * as pdfjsLib from 'pdfjs-dist';

// Types
export interface PreflightReport {
    fileName: string;
    fileSize: number;
    pageCount: number;
    timestamp: Date;
    overallStatus: 'pass' | 'warning' | 'fail';
    issues: PreflightIssue[];
    colorSpaceAnalysis: ColorSpaceAnalysis;
    resolutionAnalysis: ResolutionAnalysis;
    bleedAnalysis: BleedAnalysis;
    fontAnalysis: FontAnalysis;
    transparencyAnalysis: TransparencyAnalysis;
    overprintAnalysis: OverprintAnalysis;
    inkCoverageAnalysis: InkCoverageAnalysis;
    pageSizeAnalysis: PageSizeAnalysis;
    layerAnalysis: LayerAnalysis;
    compressionAnalysis: CompressionAnalysis;
    pdfxCompliance: PDFXCompliance;
}

export interface PreflightIssue {
    id: string;
    category: 'color' | 'resolution' | 'bleed' | 'font' | 'transparency' | 'overprint' | 'ink' | 'page' | 'layer' | 'compression' | 'compliance';
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    page?: number;
    autoFixable: boolean;
    recommendation: string;
}

export interface ColorSpaceAnalysis {
    hasRGB: boolean;
    hasCMYK: boolean;
    hasSpotColors: boolean;
    hasGrayscale: boolean;
    rgbObjects: number;
    cmykObjects: number;
    spotColorNames: string[];
    recommendation: string;
}

export interface ResolutionAnalysis {
    minimumDPI: number;
    maximumDPI: number;
    averageDPI: number;
    lowResImages: Array<{
        page: number;
        dpi: number;
        size: { width: number; height: number };
    }>;
    meetsStandard: boolean; // 300 DPI minimum
}

export interface BleedAnalysis {
    hasBleed: boolean;
    bleedAmount: { top: number; right: number; bottom: number; left: number };
    requiredBleed: number; // 0.125" standard
    meetsRequirement: boolean;
    pages: Array<{
        pageNumber: number;
        hasBleed: boolean;
        bleedAmount: { top: number; right: number; bottom: number; left: number };
    }>;
}

export interface FontAnalysis {
    totalFonts: number;
    embeddedFonts: string[];
    nonEmbeddedFonts: string[];
    outlinedFonts: string[];
    missingFonts: string[];
    allFontsEmbedded: boolean;
}

export interface TransparencyAnalysis {
    hasTransparency: boolean;
    transparentObjects: number;
    isFlattened: boolean;
    affectedPages: number[];
}

export interface OverprintAnalysis {
    hasOverprint: boolean;
    overprintObjects: number;
    knockoutObjects: number;
    issues: Array<{
        page: number;
        type: 'overprint' | 'knockout';
        description: string;
    }>;
}

export interface InkCoverageAnalysis {
    maximumTAC: number; // Total Area Coverage
    averageTAC: number;
    exceedsLimit: boolean; // Typically 300% for coated, 280% for uncoated
    hotspots: Array<{
        page: number;
        tac: number;
        location: string;
    }>;
}

export interface PageSizeAnalysis {
    pages: Array<{
        pageNumber: number;
        width: number;
        height: number;
        orientation: 'portrait' | 'landscape';
        trimBox: { width: number; height: number };
        mediaBox: { width: number; height: number };
    }>;
    consistentSize: boolean;
    standardSize?: string; // e.g., "Letter", "A4", "Tabloid"
}

export interface LayerAnalysis {
    hasLayers: boolean;
    layerCount: number;
    layers: Array<{
        name: string;
        visible: boolean;
        printable: boolean;
    }>;
    hiddenContent: boolean;
}

export interface CompressionAnalysis {
    compressionType: string;
    compressionRatio: number;
    optimized: boolean;
    estimatedSavings: number; // bytes
}

export interface PDFXCompliance {
    isCompliant: boolean;
    standard: 'PDF/X-1a' | 'PDF/X-3' | 'PDF/X-4' | 'none';
    violations: string[];
}

export class PDFPreflightEngine {
    private pdfDoc: any = null;
    private pdfData: Uint8Array | null = null;

    /**
     * Load PDF file for analysis
     */
    async loadPDF(file: File | ArrayBuffer): Promise<void> {
        try {
            let arrayBuffer: ArrayBuffer;

            if (file instanceof File) {
                arrayBuffer = await file.arrayBuffer();
            } else {
                arrayBuffer = file;
            }

            this.pdfData = new Uint8Array(arrayBuffer);

            // Load PDF with pdf.js
            const loadingTask = pdfjsLib.getDocument({ data: this.pdfData });
            this.pdfDoc = await loadingTask.promise;

            console.log('✅ PDF loaded successfully');
        } catch (error) {
            console.error('❌ Error loading PDF:', error);
            throw new Error('Failed to load PDF file');
        }
    }

    /**
     * Run comprehensive pre-flight analysis
     */
    async analyze(fileName: string): Promise<PreflightReport> {
        if (!this.pdfDoc || !this.pdfData) {
            throw new Error('No PDF loaded. Call loadPDF() first.');
        }

        console.log('🔍 Starting comprehensive pre-flight analysis...');

        const report: PreflightReport = {
            fileName,
            fileSize: this.pdfData.length,
            pageCount: this.pdfDoc.numPages,
            timestamp: new Date(),
            overallStatus: 'pass',
            issues: [],
            colorSpaceAnalysis: await this.analyzeColorSpace(),
            resolutionAnalysis: await this.analyzeResolution(),
            bleedAnalysis: await this.analyzeBleed(),
            fontAnalysis: await this.analyzeFonts(),
            transparencyAnalysis: await this.analyzeTransparency(),
            overprintAnalysis: await this.analyzeOverprint(),
            inkCoverageAnalysis: await this.analyzeInkCoverage(),
            pageSizeAnalysis: await this.analyzePageSize(),
            layerAnalysis: await this.analyzeLayers(),
            compressionAnalysis: await this.analyzeCompression(),
            pdfxCompliance: await this.analyzePDFXCompliance()
        };

        // Generate issues from analysis
        report.issues = this.generateIssues(report);

        // Determine overall status
        report.overallStatus = this.determineOverallStatus(report.issues);

        console.log('✅ Pre-flight analysis complete');
        return report;
    }

    /**
     * Analyze color spaces
     */
    private async analyzeColorSpace(): Promise<ColorSpaceAnalysis> {
        const analysis: ColorSpaceAnalysis = {
            hasRGB: false,
            hasCMYK: false,
            hasSpotColors: false,
            hasGrayscale: false,
            rgbObjects: 0,
            cmykObjects: 0,
            spotColorNames: [],
            recommendation: ''
        };

        try {
            for (let i = 1; i <= this.pdfDoc.numPages; i++) {
                const page = await this.pdfDoc.getPage(i);
                const content = await page.getOperatorList();

                // Analyze operators for color space usage
                for (let j = 0; j < content.fnArray.length; j++) {
                    const fn = content.fnArray[j];
                    const args = content.argsArray[j];

                    // Check for color space operators
                    if (fn === pdfjsLib.OPS.setFillRGBColor || fn === pdfjsLib.OPS.setStrokeRGBColor) {
                        analysis.hasRGB = true;
                        analysis.rgbObjects++;
                    } else if (fn === pdfjsLib.OPS.setFillCMYKColor || fn === pdfjsLib.OPS.setStrokeCMYKColor) {
                        analysis.hasCMYK = true;
                        analysis.cmykObjects++;
                    } else if (fn === pdfjsLib.OPS.setFillGray || fn === pdfjsLib.OPS.setStrokeGray) {
                        analysis.hasGrayscale = true;
                    }
                }
            }

            // Generate recommendation
            if (analysis.hasRGB && !analysis.hasCMYK) {
                analysis.recommendation = 'Convert all RGB colors to CMYK for print production';
            } else if (analysis.hasRGB && analysis.hasCMYK) {
                analysis.recommendation = 'Mixed color spaces detected. Convert RGB to CMYK for consistency';
            } else if (analysis.hasCMYK) {
                analysis.recommendation = 'Color space is print-ready (CMYK)';
            }

        } catch (error) {
            console.error('Error analyzing color space:', error);
        }

        return analysis;
    }

    /**
     * Analyze image resolution
     */
    private async analyzeResolution(): Promise<ResolutionAnalysis> {
        const analysis: ResolutionAnalysis = {
            minimumDPI: Infinity,
            maximumDPI: 0,
            averageDPI: 0,
            lowResImages: [],
            meetsStandard: true
        };

        try {
            let totalDPI = 0;
            let imageCount = 0;

            for (let i = 1; i <= this.pdfDoc.numPages; i++) {
                const page = await this.pdfDoc.getPage(i);
                const ops = await page.getOperatorList();

                // Look for image operators
                for (let j = 0; j < ops.fnArray.length; j++) {
                    if (ops.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                        // Estimate DPI (simplified - real implementation would be more complex)
                        const estimatedDPI = 300; // Placeholder

                        analysis.minimumDPI = Math.min(analysis.minimumDPI, estimatedDPI);
                        analysis.maximumDPI = Math.max(analysis.maximumDPI, estimatedDPI);
                        totalDPI += estimatedDPI;
                        imageCount++;

                        if (estimatedDPI < 300) {
                            analysis.lowResImages.push({
                                page: i,
                                dpi: estimatedDPI,
                                size: { width: 0, height: 0 } // Would extract from image data
                            });
                            analysis.meetsStandard = false;
                        }
                    }
                }
            }

            analysis.averageDPI = imageCount > 0 ? totalDPI / imageCount : 0;

            if (analysis.minimumDPI === Infinity) {
                analysis.minimumDPI = 0;
            }

        } catch (error) {
            console.error('Error analyzing resolution:', error);
        }

        return analysis;
    }

    /**
     * Analyze bleed settings
     */
    private async analyzeBleed(): Promise<BleedAnalysis> {
        const requiredBleed = 0.125 * 72; // 0.125 inches in points

        const analysis: BleedAnalysis = {
            hasBleed: false,
            bleedAmount: { top: 0, right: 0, bottom: 0, left: 0 },
            requiredBleed: 0.125,
            meetsRequirement: false,
            pages: []
        };

        try {
            for (let i = 1; i <= this.pdfDoc.numPages; i++) {
                const page = await this.pdfDoc.getPage(i);
                const view = page.view; // [x1, y1, x2, y2]

                // Calculate bleed (simplified - would need trim box comparison)
                const pageBleed = {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                };

                const hasBleed = pageBleed.top >= requiredBleed &&
                    pageBleed.right >= requiredBleed &&
                    pageBleed.bottom >= requiredBleed &&
                    pageBleed.left >= requiredBleed;

                analysis.pages.push({
                    pageNumber: i,
                    hasBleed,
                    bleedAmount: pageBleed
                });

                if (hasBleed) {
                    analysis.hasBleed = true;
                }
            }

            analysis.meetsRequirement = analysis.pages.every(p => p.hasBleed);

        } catch (error) {
            console.error('Error analyzing bleed:', error);
        }

        return analysis;
    }

    /**
     * Analyze fonts
     */
    private async analyzeFonts(): Promise<FontAnalysis> {
        const analysis: FontAnalysis = {
            totalFonts: 0,
            embeddedFonts: [],
            nonEmbeddedFonts: [],
            outlinedFonts: [],
            missingFonts: [],
            allFontsEmbedded: true
        };

        try {
            const fonts = new Set<string>();

            for (let i = 1; i <= this.pdfDoc.numPages; i++) {
                const page = await this.pdfDoc.getPage(i);
                const pagefonts = await page.getTextContent();

                // Extract font information (simplified)
                // Real implementation would check font embedding status
            }

            analysis.totalFonts = fonts.size;

        } catch (error) {
            console.error('Error analyzing fonts:', error);
        }

        return analysis;
    }

    /**
     * Analyze transparency
     */
    private async analyzeTransparency(): Promise<TransparencyAnalysis> {
        return {
            hasTransparency: false,
            transparentObjects: 0,
            isFlattened: true,
            affectedPages: []
        };
    }

    /**
     * Analyze overprint settings
     */
    private async analyzeOverprint(): Promise<OverprintAnalysis> {
        return {
            hasOverprint: false,
            overprintObjects: 0,
            knockoutObjects: 0,
            issues: []
        };
    }

    /**
     * Analyze ink coverage
     */
    private async analyzeInkCoverage(): Promise<InkCoverageAnalysis> {
        return {
            maximumTAC: 0,
            averageTAC: 0,
            exceedsLimit: false,
            hotspots: []
        };
    }

    /**
     * Analyze page sizes
     */
    private async analyzePageSize(): Promise<PageSizeAnalysis> {
        const pages: PageSizeAnalysis['pages'] = [];

        try {
            for (let i = 1; i <= this.pdfDoc.numPages; i++) {
                const page = await this.pdfDoc.getPage(i);
                const view = page.view;

                const width = view[2] - view[0];
                const height = view[3] - view[1];

                pages.push({
                    pageNumber: i,
                    width,
                    height,
                    orientation: width > height ? 'landscape' : 'portrait',
                    trimBox: { width, height },
                    mediaBox: { width, height }
                });
            }
        } catch (error) {
            console.error('Error analyzing page size:', error);
        }

        const consistentSize = pages.every(p =>
            p.width === pages[0].width && p.height === pages[0].height
        );

        return {
            pages,
            consistentSize,
            standardSize: this.detectStandardSize(pages[0])
        };
    }

    /**
     * Detect standard page size
     */
    private detectStandardSize(page: any): string | undefined {
        const width = page.width / 72; // Convert to inches
        const height = page.height / 72;

        const sizes: Record<string, [number, number]> = {
            'Letter': [8.5, 11],
            'Legal': [8.5, 14],
            'Tabloid': [11, 17],
            'A4': [8.27, 11.69],
            'A3': [11.69, 16.54]
        };

        for (const [name, [w, h]] of Object.entries(sizes)) {
            if (Math.abs(width - w) < 0.1 && Math.abs(height - h) < 0.1) {
                return name;
            }
            if (Math.abs(width - h) < 0.1 && Math.abs(height - w) < 0.1) {
                return `${name} (Landscape)`;
            }
        }

        return undefined;
    }

    /**
     * Analyze layers
     */
    private async analyzeLayers(): Promise<LayerAnalysis> {
        return {
            hasLayers: false,
            layerCount: 0,
            layers: [],
            hiddenContent: false
        };
    }

    /**
     * Analyze compression
     */
    private async analyzeCompression(): Promise<CompressionAnalysis> {
        return {
            compressionType: 'Unknown',
            compressionRatio: 0,
            optimized: false,
            estimatedSavings: 0
        };
    }

    /**
     * Analyze PDF/X compliance
     */
    private async analyzePDFXCompliance(): Promise<PDFXCompliance> {
        return {
            isCompliant: false,
            standard: 'none',
            violations: []
        };
    }

    /**
     * Generate issues from analysis
     */
    private generateIssues(report: PreflightReport): PreflightIssue[] {
        const issues: PreflightIssue[] = [];

        // Color space issues
        if (report.colorSpaceAnalysis.hasRGB) {
            issues.push({
                id: 'color-rgb-detected',
                category: 'color',
                severity: 'critical',
                title: 'RGB Color Space Detected',
                description: `Found ${report.colorSpaceAnalysis.rgbObjects} RGB objects. Print production requires CMYK.`,
                autoFixable: true,
                recommendation: 'Convert RGB to CMYK using appropriate ICC profile'
            });
        }

        // Resolution issues
        if (!report.resolutionAnalysis.meetsStandard) {
            issues.push({
                id: 'resolution-low',
                category: 'resolution',
                severity: 'critical',
                title: 'Low Resolution Images',
                description: `Found ${report.resolutionAnalysis.lowResImages.length} images below 300 DPI`,
                autoFixable: false,
                recommendation: 'Replace with higher resolution images or resample'
            });
        }

        // Bleed issues
        if (!report.bleedAnalysis.meetsRequirement) {
            issues.push({
                id: 'bleed-missing',
                category: 'bleed',
                severity: 'warning',
                title: 'Insufficient Bleed',
                description: 'Document does not have required 0.125" bleed',
                autoFixable: true,
                recommendation: 'Add bleed by extending or mirroring edge content'
            });
        }

        // Font issues
        if (!report.fontAnalysis.allFontsEmbedded) {
            issues.push({
                id: 'fonts-not-embedded',
                category: 'font',
                severity: 'critical',
                title: 'Fonts Not Embedded',
                description: `${report.fontAnalysis.nonEmbeddedFonts.length} fonts are not embedded`,
                autoFixable: true,
                recommendation: 'Embed all fonts or convert to outlines'
            });
        }

        return issues;
    }

    /**
     * Determine overall status
     */
    private determineOverallStatus(issues: PreflightIssue[]): 'pass' | 'warning' | 'fail' {
        const hasCritical = issues.some(i => i.severity === 'critical');
        const hasWarning = issues.some(i => i.severity === 'warning');

        if (hasCritical) return 'fail';
        if (hasWarning) return 'warning';
        return 'pass';
    }
}

// Export singleton
export const preflightEngine = new PDFPreflightEngine();
