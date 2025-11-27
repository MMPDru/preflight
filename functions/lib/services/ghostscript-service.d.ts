/**
 * Ghostscript Integration Service
 * Provides advanced PDF processing capabilities using Ghostscript
 *
 * REQUIREMENTS:
 * - Ghostscript must be installed on the system
 * - macOS: Install via Homebrew: `brew install ghostscript`
 * - Linux: `sudo apt-get install ghostscript` or `sudo yum install ghostscript`
 * - Verify installation: `gs --version`
 */
export declare class GhostscriptService {
    private gsCommand;
    /**
     * Check if Ghostscript is installed
     */
    isInstalled(): Promise<boolean>;
    /**
     * Convert RGB PDF to CMYK
     * This is the most important feature for print workflows
     */
    convertToCMYK(inputPath: string, outputPath: string): Promise<void>;
    /**
     * Flatten transparency in PDF
     */
    flattenTransparency(inputPath: string, outputPath: string): Promise<void>;
    /**
     * Resample images to target DPI
     */
    resampleImages(inputPath: string, outputPath: string, targetDPI?: number): Promise<void>;
    /**
     * Optimize PDF for print (combines multiple operations)
     */
    optimizeForPrint(inputPath: string, outputPath: string, options?: {
        targetDPI?: number;
        convertToCMYK?: boolean;
        flattenTransparency?: boolean;
    }): Promise<void>;
    /**
     * Make PDF/X-1a compliant
     */
    makePDFX1a(inputPath: string, outputPath: string): Promise<void>;
    /**
     * Get PDF info using Ghostscript
     */
    getPDFInfo(inputPath: string): Promise<any>;
    /**
     * Process PDF with buffer input/output
     */
    processBuffer(inputBuffer: Buffer, operation: 'cmyk' | 'flatten' | 'resample' | 'optimize' | 'pdfx', options?: any): Promise<Buffer>;
}
//# sourceMappingURL=ghostscript-service.d.ts.map