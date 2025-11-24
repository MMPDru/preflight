import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = util.promisify(exec);

/**
 * Execute a Ghostscript command
 */
const runGhostscript = async (args) => {
    const command = `gs ${args.join(' ')}`;
    console.log(`Executing: ${command}`);
    try {
        const { stdout, stderr } = await execPromise(command);
        if (stderr) console.error('GS Stderr:', stderr);
        return stdout;
    } catch (error) {
        console.error('GS Error:', error);
        throw error;
    }
};

/**
 * Embed all fonts
 * Note: This uses the PDFWRITE device which generally embeds fonts if available.
 * For strict embedding, we might need specific PDFSettings.
 */
export const embedFonts = async (inputPath, outputPath) => {
    const args = [
        '-q',
        '-dNOPAUSE',
        '-dBATCH',
        '-dSAFER',
        '-sDEVICE=pdfwrite',
        '-dEmbedAllFonts=true',
        '-dSubsetFonts=true',
        '-dPDFSETTINGS=/prepress',
        `-sOutputFile=${outputPath}`,
        inputPath
    ];
    await runGhostscript(args);
};

/**
 * Convert to CMYK
 */
export const convertToCMYK = async (inputPath, outputPath, iccProfile = 'USWebCoatedSWOP.icc') => {
    // Note: In a real environment, we'd need to point to the actual ICC profile file.
    // For this implementation, we'll use a standard color conversion strategy.
    const args = [
        '-q',
        '-dNOPAUSE',
        '-dBATCH',
        '-dSAFER',
        '-sDEVICE=pdfwrite',
        '-sProcessColorModel=DeviceCMYK',
        '-sColorConversionStrategy=CMYK',
        '-dOverrideICC=true',
        `-sOutputFile=${outputPath}`,
        inputPath
    ];
    await runGhostscript(args);
};

/**
 * Resample Images
 */
export const resampleImages = async (inputPath, outputPath, targetDPI = 300) => {
    const args = [
        '-q',
        '-dNOPAUSE',
        '-dBATCH',
        '-dSAFER',
        '-sDEVICE=pdfwrite',
        '-dDownsampleColorImages=true',
        `-dColorImageResolution=${targetDPI}`,
        '-dDownsampleGrayImages=true',
        `-dGrayImageResolution=${targetDPI}`,
        '-dDownsampleMonoImages=true',
        `-dMonoImageResolution=${targetDPI}`,
        `-sOutputFile=${outputPath}`,
        inputPath
    ];
    await runGhostscript(args);
};

/**
 * Flatten Transparencies
 * Note: Ghostscript 9.50+ handles this well with pdfwrite.
 * For older versions or strict flattening, we might render to raster and back, 
 * but that loses vector data. We'll use the high-quality transparency flattening settings.
 */
export const flattenTransparency = async (inputPath, outputPath) => {
    const args = [
        '-q',
        '-dNOPAUSE',
        '-dBATCH',
        '-dSAFER',
        '-sDEVICE=pdfwrite',
        '-dHaveTransparency=false', // Forces flattening
        `-sOutputFile=${outputPath}`,
        inputPath
    ];
    await runGhostscript(args);
};
