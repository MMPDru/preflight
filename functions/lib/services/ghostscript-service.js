"use strict";
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
exports.ghostscript = exports.GhostscriptService = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class GhostscriptService {
    constructor() {
        this.gsCommand = 'gs'; // Ghostscript command
    }
    /**
     * Check if Ghostscript is installed
     */
    async isInstalled() {
        try {
            const { stdout } = await execAsync('gs --version');
            console.log(`Ghostscript version: ${stdout.trim()}`);
            return true;
        }
        catch (error) {
            console.warn('Ghostscript not installed');
            return false;
        }
    }
    /**
     * Convert RGB PDF to CMYK
     * This is the most important feature for print workflows
     */
    async convertToCMYK(inputPath, outputPath) {
        const command = [
            this.gsCommand,
            '-dSAFER',
            '-dBATCH',
            '-dNOPAUSE',
            '-dNOCACHE',
            '-sDEVICE=pdfwrite',
            '-sColorConversionStrategy=CMYK',
            '-dProcessColorModel=/DeviceCMYK',
            '-sOutputICCProfile=default_cmyk.icc', // Use default CMYK profile
            '-dOverrideICC=true',
            `-sOutputFile=${outputPath}`,
            inputPath
        ].join(' ');
        try {
            await execAsync(command);
            console.log(`Successfully converted to CMYK: ${outputPath}`);
        }
        catch (error) {
            throw new Error(`Ghostscript CMYK conversion failed: ${error.message}`);
        }
    }
    /**
     * Flatten transparency in PDF
     */
    async flattenTransparency(inputPath, outputPath) {
        const command = [
            this.gsCommand,
            '-dSAFER',
            '-dBATCH',
            '-dNOPAUSE',
            '-dNOCACHE',
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=1.4',
            '-dPDFSETTINGS=/prepress',
            `-sOutputFile=${outputPath}`,
            inputPath
        ].join(' ');
        try {
            await execAsync(command);
            console.log(`Successfully flattened transparency: ${outputPath}`);
        }
        catch (error) {
            throw new Error(`Ghostscript transparency flattening failed: ${error.message}`);
        }
    }
    /**
     * Resample images to target DPI
     */
    async resampleImages(inputPath, outputPath, targetDPI = 300) {
        const command = [
            this.gsCommand,
            '-dSAFER',
            '-dBATCH',
            '-dNOPAUSE',
            '-dNOCACHE',
            '-sDEVICE=pdfwrite',
            '-dPDFSETTINGS=/prepress',
            `-dColorImageResolution=${targetDPI}`,
            `-dGrayImageResolution=${targetDPI}`,
            `-dMonoImageResolution=${targetDPI}`,
            '-dColorImageDownsampleType=/Bicubic',
            '-dGrayImageDownsampleType=/Bicubic',
            '-dMonoImageDownsampleType=/Bicubic',
            `-sOutputFile=${outputPath}`,
            inputPath
        ].join(' ');
        try {
            await execAsync(command);
            console.log(`Successfully resampled images to ${targetDPI} DPI: ${outputPath}`);
        }
        catch (error) {
            throw new Error(`Ghostscript image resampling failed: ${error.message}`);
        }
    }
    /**
     * Optimize PDF for print (combines multiple operations)
     */
    async optimizeForPrint(inputPath, outputPath, options) {
        const tmpDir = os.tmpdir();
        let currentFile = inputPath;
        try {
            // Step 1: Convert to CMYK if requested
            if (options?.convertToCMYK) {
                const cmykFile = path.join(tmpDir, `cmyk_${Date.now()}.pdf`);
                await this.convertToCMYK(currentFile, cmykFile);
                currentFile = cmykFile;
            }
            // Step 2: Flatten transparency if requested
            if (options?.flattenTransparency) {
                const flatFile = path.join(tmpDir, `flat_${Date.now()}.pdf`);
                await this.flattenTransparency(currentFile, flatFile);
                if (currentFile !== inputPath)
                    fs.unlinkSync(currentFile);
                currentFile = flatFile;
            }
            // Step 3: Resample images if requested
            if (options?.targetDPI) {
                await this.resampleImages(currentFile, outputPath, options.targetDPI);
                if (currentFile !== inputPath)
                    fs.unlinkSync(currentFile);
            }
            else {
                // Just copy the file if no resampling
                fs.copyFileSync(currentFile, outputPath);
                if (currentFile !== inputPath)
                    fs.unlinkSync(currentFile);
            }
            console.log(`Successfully optimized PDF for print: ${outputPath}`);
        }
        catch (error) {
            // Cleanup temp files on error
            if (currentFile !== inputPath && fs.existsSync(currentFile)) {
                fs.unlinkSync(currentFile);
            }
            throw error;
        }
    }
    /**
     * Make PDF/X-1a compliant
     */
    async makePDFX1a(inputPath, outputPath) {
        const command = [
            this.gsCommand,
            '-dSAFER',
            '-dBATCH',
            '-dNOPAUSE',
            '-dNOCACHE',
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=1.3',
            '-dPDFX',
            '-sColorConversionStrategy=CMYK',
            '-dProcessColorModel=/DeviceCMYK',
            `-sOutputFile=${outputPath}`,
            inputPath
        ].join(' ');
        try {
            await execAsync(command);
            console.log(`Successfully created PDF/X-1a: ${outputPath}`);
        }
        catch (error) {
            throw new Error(`Ghostscript PDF/X-1a creation failed: ${error.message}`);
        }
    }
    /**
     * Get PDF info using Ghostscript
     */
    async getPDFInfo(inputPath) {
        const command = [
            this.gsCommand,
            '-dSAFER',
            '-dBATCH',
            '-dNOPAUSE',
            '-dNODISPLAY',
            '-q',
            '-c',
            `"(${inputPath}) (r) file runpdfbegin pdfpagecount = quit"`
        ].join(' ');
        try {
            const { stdout } = await execAsync(command);
            return { pageCount: parseInt(stdout.trim()) };
        }
        catch (error) {
            throw new Error(`Ghostscript PDF info extraction failed: ${error.message}`);
        }
    }
    /**
     * Process PDF with buffer input/output
     */
    async processBuffer(inputBuffer, operation, options) {
        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `input_${Date.now()}.pdf`);
        const outputPath = path.join(tmpDir, `output_${Date.now()}.pdf`);
        try {
            // Write buffer to temp file
            fs.writeFileSync(inputPath, inputBuffer);
            // Perform operation
            switch (operation) {
                case 'cmyk':
                    await this.convertToCMYK(inputPath, outputPath);
                    break;
                case 'flatten':
                    await this.flattenTransparency(inputPath, outputPath);
                    break;
                case 'resample':
                    await this.resampleImages(inputPath, outputPath, options?.targetDPI || 300);
                    break;
                case 'optimize':
                    await this.optimizeForPrint(inputPath, outputPath, options);
                    break;
                case 'pdfx':
                    await this.makePDFX1a(inputPath, outputPath);
                    break;
            }
            // Read result
            const outputBuffer = fs.readFileSync(outputPath);
            // Cleanup
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
            return outputBuffer;
        }
        catch (error) {
            // Cleanup on error
            if (fs.existsSync(inputPath))
                fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath))
                fs.unlinkSync(outputPath);
            throw error;
        }
    }
}
exports.GhostscriptService = GhostscriptService;
exports.ghostscript = new GhostscriptService();
//# sourceMappingURL=ghostscript-service.js.map