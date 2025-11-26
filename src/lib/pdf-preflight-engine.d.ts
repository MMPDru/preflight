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
        size: {
            width: number;
            height: number;
        };
    }>;
    meetsStandard: boolean;
}
export interface BleedAnalysis {
    hasBleed: boolean;
    bleedAmount: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    requiredBleed: number;
    meetsRequirement: boolean;
    pages: Array<{
        pageNumber: number;
        hasBleed: boolean;
        bleedAmount: {
            top: number;
            right: number;
            bottom: number;
            left: number;
        };
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
    maximumTAC: number;
    averageTAC: number;
    exceedsLimit: boolean;
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
        trimBox: {
            width: number;
            height: number;
        };
        mediaBox: {
            width: number;
            height: number;
        };
    }>;
    consistentSize: boolean;
    standardSize?: string;
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
    estimatedSavings: number;
}
export interface PDFXCompliance {
    isCompliant: boolean;
    standard: 'PDF/X-1a' | 'PDF/X-3' | 'PDF/X-4' | 'none';
    violations: string[];
}
export declare class PDFPreflightEngine {
    private pdfDoc;
    private pdfData;
    /**
     * Load PDF file for analysis
     */
    loadPDF(file: File | ArrayBuffer): Promise<void>;
    /**
     * Run comprehensive pre-flight analysis
     */
    analyze(fileName: string): Promise<PreflightReport>;
    /**
     * Analyze color spaces
     */
    private analyzeColorSpace;
    /**
     * Analyze image resolution
     */
    private analyzeResolution;
    /**
     * Analyze bleed settings
     */
    private analyzeBleed;
    /**
     * Analyze fonts
     */
    private analyzeFonts;
    /**
     * Analyze transparency
     */
    private analyzeTransparency;
    /**
     * Analyze overprint settings
     */
    private analyzeOverprint;
    /**
     * Analyze ink coverage
     */
    private analyzeInkCoverage;
    /**
     * Analyze page sizes
     */
    private analyzePageSize;
    /**
     * Detect standard page size
     */
    private detectStandardSize;
    /**
     * Analyze layers
     */
    private analyzeLayers;
    /**
     * Analyze compression
     */
    private analyzeCompression;
    /**
     * Analyze PDF/X compliance
     */
    private analyzePDFXCompliance;
    /**
     * Generate issues from analysis
     */
    private generateIssues;
    /**
     * Determine overall status
     */
    private determineOverallStatus;
}
export declare const preflightEngine: PDFPreflightEngine;
//# sourceMappingURL=pdf-preflight-engine.d.ts.map