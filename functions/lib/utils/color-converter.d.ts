/**
 * Color Space Conversion Utilities
 * Handles RGB to CMYK conversion, TAC calculation, and color space detection
 */
import type { CMYK, RGB, ColorSpace } from '../types/preflight-types';
export declare class ColorConverter {
    /**
     * Convert RGB to CMYK using standard formula
     * RGB values: 0-255
     * CMYK values: 0-1
     */
    rgbToCmyk(r: number, g: number, b: number): CMYK;
    /**
     * Convert CMYK to RGB
     * CMYK values: 0-1
     * RGB values: 0-255
     */
    cmykToRgb(c: number, m: number, y: number, k: number): RGB;
    /**
     * Calculate Total Area Coverage (TAC) for CMYK values
     * TAC is the sum of all CMYK percentages
     * Standard limit is 300% for most printing processes
     * @param c Cyan (0-1)
     * @param m Magenta (0-1)
     * @param y Yellow (0-1)
     * @param k Black (0-1)
     * @returns TAC as percentage (0-400)
     */
    calculateTAC(c: number, m: number, y: number, k: number): number;
    /**
     * Reduce TAC to meet maximum limit while preserving color balance
     * Uses GCR (Gray Component Replacement) technique
     */
    reduceTAC(c: number, m: number, y: number, k: number, maxTAC?: number): CMYK;
    /**
     * Detect color space from color array
     * PDF color arrays can be:
     * - [r, g, b] for RGB
     * - [c, m, y, k] for CMYK
     * - [gray] for Grayscale
     */
    detectColorSpace(colorArray: number[]): ColorSpace;
    /**
     * Convert RGB hex string to CMYK
     * @param hex Hex color string (e.g., "#FF5733" or "FF5733")
     */
    hexToCmyk(hex: string): CMYK;
    /**
     * Convert CMYK to hex string
     */
    cmykToHex(c: number, m: number, y: number, k: number): string;
    /**
     * Check if a color is "rich black" (K > 0 with CMY components)
     */
    isRichBlack(c: number, m: number, y: number, k: number): boolean;
    /**
     * Check if a color is pure black (K only)
     */
    isPureBlack(c: number, m: number, y: number, k: number): boolean;
    /**
     * Convert spot color name to approximate CMYK
     * This is a simplified conversion - real spot colors need ICC profiles
     */
    spotToCmyk(spotName: string): CMYK;
    /**
     * Validate CMYK values are within range
     */
    validateCMYK(c: number, m: number, y: number, k: number): boolean;
    /**
     * Validate RGB values are within range
     */
    validateRGB(r: number, g: number, b: number): boolean;
}
export declare const colorConverter: ColorConverter;
//# sourceMappingURL=color-converter.d.ts.map