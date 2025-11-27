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

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export class GhostscriptService {
    private gsCommand = 'gs'; // Ghostscript command

    /**
     * Check if Ghostscript is installed
     */
    async isInstalled(): Promise<boolean> {
        try {
            const { stdout } = await execAsync('gs --version');
            console.log(`Ghostscript version: ${stdout.trim()}`);
            return true;
        } catch (error) {
            console.warn('Ghostscript not installed');
            return false;
        }
    }

    /**
     * Convert RGB PDF to CMYK
     * This is the most important feature for print workflows
     */
    async convertToCMYK(inputPath: string, outputPath: string): Promise<void> {
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
        } catch (error: any) {
            throw new Error(`Ghostscript CMYK conversion failed: ${error.message}`);
        }
    }

    /**
     * Flatten transparency in PDF
     */
    async flattenTransparency(inputPath: string, outputPath: string): Promise<void> {
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
        } catch (error: any) {
            throw new Error(`Ghostscript transparency flattening failed: ${error.message}`);
        }
    }

    /**
     * Resample images to target DPI
     */
    async resampleImages(inputPath: string, outputPath: string, targetDPI: number = 300): Promise<void> {
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
        } catch (error: any) {
            throw new Error(`Ghostscript image resampling failed: ${error.message}`);
        }
    }

    /**
     * Optimize PDF for print (combines multiple operations)
     */
    async optimizeForPrint(inputPath: string, outputPath: string, options?: {
        targetDPI?: number;
        convertToCMYK?: boolean;
        flattenTransparency?: boolean;
    }): Promise<void> {
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
                if (currentFile !== inputPath) fs.unlinkSync(currentFile);
                currentFile = flatFile;
            }

            // Step 3: Resample images if requested
            if (options?.targetDPI) {
                await this.resampleImages(currentFile, outputPath, options.targetDPI);
                if (currentFile !== inputPath) fs.unlinkSync(currentFile);
            } else {
                // Just copy the file if no resampling
                fs.copyFileSync(currentFile, outputPath);
                if (currentFile !== inputPath) fs.unlinkSync(currentFile);
            }

            console.log(`Successfully optimized PDF for print: ${outputPath}`);
        } catch (error: any) {
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
    async makePDFX1a(inputPath: string, outputPath: string): Promise<void> {
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
        } catch (error: any) {
            throw new Error(`Ghostscript PDF/X-1a creation failed: ${error.message}`);
        }
    }

    /**
     * Get PDF info using Ghostscript
     */
    async getPDFInfo(inputPath: string): Promise<any> {
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
        } catch (error: any) {
            throw new Error(`Ghostscript PDF info extraction failed: ${error.message}`);
        }
    }

    /**
     * Process PDF with buffer input/output
     */
    async processBuffer(
        inputBuffer: Buffer,
        operation: 'cmyk' | 'flatten' | 'resample' | 'optimize' | 'pdfx',
        options?: any
    ): Promise<Buffer> {
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
        } catch (error: any) {
            // Cleanup on error
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            throw error;
        }
    }
}


