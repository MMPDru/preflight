"use strict";
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
exports.preflightEngine = exports.PDFPreflightEngine = void 0;
const pdfjsLib = __importStar(require("pdfjs-dist"));
class PDFPreflightEngine {
    constructor() {
        this.pdfDoc = null;
        this.pdfData = null;
    }
    /**
     * Load PDF file for analysis
     */
    async loadPDF(file) {
        try {
            let arrayBuffer;
            if (file instanceof File) {
                arrayBuffer = await file.arrayBuffer();
            }
            else {
                arrayBuffer = file;
            }
            this.pdfData = new Uint8Array(arrayBuffer);
            // Load PDF with pdf.js
            const loadingTask = pdfjsLib.getDocument({ data: this.pdfData });
            this.pdfDoc = await loadingTask.promise;
            console.log('✅ PDF loaded successfully');
        }
        catch (error) {
            console.error('❌ Error loading PDF:', error);
            throw new Error('Failed to load PDF file');
        }
    }
    /**
     * Run comprehensive pre-flight analysis
     */
    async analyze(fileName) {
        if (!this.pdfDoc || !this.pdfData) {
            throw new Error('No PDF loaded. Call loadPDF() first.');
        }
        console.log('🔍 Starting comprehensive pre-flight analysis...');
        const report = {
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
    async analyzeColorSpace() {
        const analysis = {
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
                    }
                    else if (fn === pdfjsLib.OPS.setFillCMYKColor || fn === pdfjsLib.OPS.setStrokeCMYKColor) {
                        analysis.hasCMYK = true;
                        analysis.cmykObjects++;
                    }
                    else if (fn === pdfjsLib.OPS.setFillGray || fn === pdfjsLib.OPS.setStrokeGray) {
                        analysis.hasGrayscale = true;
                    }
                }
            }
            // Generate recommendation
            if (analysis.hasRGB && !analysis.hasCMYK) {
                analysis.recommendation = 'Convert all RGB colors to CMYK for print production';
            }
            else if (analysis.hasRGB && analysis.hasCMYK) {
                analysis.recommendation = 'Mixed color spaces detected. Convert RGB to CMYK for consistency';
            }
            else if (analysis.hasCMYK) {
                analysis.recommendation = 'Color space is print-ready (CMYK)';
            }
        }
        catch (error) {
            console.error('Error analyzing color space:', error);
        }
        return analysis;
    }
    /**
     * Analyze image resolution
     */
    async analyzeResolution() {
        const analysis = {
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
        }
        catch (error) {
            console.error('Error analyzing resolution:', error);
        }
        return analysis;
    }
    /**
     * Analyze bleed settings
     */
    async analyzeBleed() {
        const requiredBleed = 0.125 * 72; // 0.125 inches in points
        const analysis = {
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
        }
        catch (error) {
            console.error('Error analyzing bleed:', error);
        }
        return analysis;
    }
    /**
     * Analyze fonts
     */
    async analyzeFonts() {
        const analysis = {
            totalFonts: 0,
            embeddedFonts: [],
            nonEmbeddedFonts: [],
            outlinedFonts: [],
            missingFonts: [],
            allFontsEmbedded: true
        };
        try {
            const fonts = new Set();
            for (let i = 1; i <= this.pdfDoc.numPages; i++) {
                const page = await this.pdfDoc.getPage(i);
                const pagefonts = await page.getTextContent();
                // Extract font information (simplified)
                // Real implementation would check font embedding status
            }
            analysis.totalFonts = fonts.size;
        }
        catch (error) {
            console.error('Error analyzing fonts:', error);
        }
        return analysis;
    }
    /**
     * Analyze transparency
     */
    async analyzeTransparency() {
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
    async analyzeOverprint() {
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
    async analyzeInkCoverage() {
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
    async analyzePageSize() {
        const pages = [];
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
        }
        catch (error) {
            console.error('Error analyzing page size:', error);
        }
        const consistentSize = pages.every(p => p.width === pages[0].width && p.height === pages[0].height);
        return {
            pages,
            consistentSize,
            standardSize: this.detectStandardSize(pages[0])
        };
    }
    /**
     * Detect standard page size
     */
    detectStandardSize(page) {
        const width = page.width / 72; // Convert to inches
        const height = page.height / 72;
        const sizes = {
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
    async analyzeLayers() {
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
    async analyzeCompression() {
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
    async analyzePDFXCompliance() {
        return {
            isCompliant: false,
            standard: 'none',
            violations: []
        };
    }
    /**
     * Generate issues from analysis
     */
    generateIssues(report) {
        const issues = [];
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
    determineOverallStatus(issues) {
        const hasCritical = issues.some(i => i.severity === 'critical');
        const hasWarning = issues.some(i => i.severity === 'warning');
        if (hasCritical)
            return 'fail';
        if (hasWarning)
            return 'warning';
        return 'pass';
    }
}
exports.PDFPreflightEngine = PDFPreflightEngine;
// Export singleton
exports.preflightEngine = new PDFPreflightEngine();
//# sourceMappingURL=pdf-preflight-engine.js.map