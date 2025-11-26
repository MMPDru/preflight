/**
 * Color Space Conversion Utilities
 * Handles RGB to CMYK conversion, TAC calculation, and color space detection
 */

import type { CMYK, RGB, ColorSpace } from '../types/preflight-types';

export class ColorConverter {
    /**
     * Convert RGB to CMYK using standard formula
     * RGB values: 0-255
     * CMYK values: 0-1
     */
    rgbToCmyk(r: number, g: number, b: number): CMYK {
        // Normalize RGB to 0-1
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;

        // Calculate K (black)
        const k = 1 - Math.max(rNorm, gNorm, bNorm);

        // Handle pure black case
        if (k === 1) {
            return { c: 0, m: 0, y: 0, k: 1 };
        }

        // Calculate CMY
        const c = (1 - rNorm - k) / (1 - k);
        const m = (1 - gNorm - k) / (1 - k);
        const y = (1 - bNorm - k) / (1 - k);

        return { c, m, y, k };
    }

    /**
     * Convert CMYK to RGB
     * CMYK values: 0-1
     * RGB values: 0-255
     */
    cmykToRgb(c: number, m: number, y: number, k: number): RGB {
        const r = Math.round(255 * (1 - c) * (1 - k));
        const g = Math.round(255 * (1 - m) * (1 - k));
        const b = Math.round(255 * (1 - y) * (1 - k));

        return { r, g, b };
    }

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
    calculateTAC(c: number, m: number, y: number, k: number): number {
        return (c + m + y + k) * 100;
    }

    /**
     * Reduce TAC to meet maximum limit while preserving color balance
     * Uses GCR (Gray Component Replacement) technique
     */
    reduceTAC(c: number, m: number, y: number, k: number, maxTAC: number = 300): CMYK {
        const currentTAC = this.calculateTAC(c, m, y, k);

        if (currentTAC <= maxTAC) {
            return { c, m, y, k };
        }

        // Calculate reduction factor
        const reductionFactor = (maxTAC / 100) / (c + m + y + k);

        // Apply reduction
        return {
            c: c * reductionFactor,
            m: m * reductionFactor,
            y: y * reductionFactor,
            k: k * reductionFactor,
        };
    }

    /**
     * Detect color space from color array
     * PDF color arrays can be:
     * - [r, g, b] for RGB
     * - [c, m, y, k] for CMYK
     * - [gray] for Grayscale
     */
    detectColorSpace(colorArray: number[]): ColorSpace {
        if (!colorArray || colorArray.length === 0) {
            return 'Unknown';
        }

        switch (colorArray.length) {
            case 1:
                return 'Grayscale';
            case 3:
                return 'RGB';
            case 4:
                return 'CMYK';
            default:
                // DeviceN or Indexed color spaces
                return colorArray.length > 4 ? 'DeviceN' : 'Unknown';
        }
    }

    /**
     * Convert RGB hex string to CMYK
     * @param hex Hex color string (e.g., "#FF5733" or "FF5733")
     */
    hexToCmyk(hex: string): CMYK {
        // Remove # if present
        const cleanHex = hex.replace('#', '');

        // Parse RGB values
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);

        return this.rgbToCmyk(r, g, b);
    }

    /**
     * Convert CMYK to hex string
     */
    cmykToHex(c: number, m: number, y: number, k: number): string {
        const rgb = this.cmykToRgb(c, m, y, k);
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
    }

    /**
     * Check if a color is "rich black" (K > 0 with CMY components)
     */
    isRichBlack(c: number, m: number, y: number, k: number): boolean {
        return k > 0.5 && (c > 0 || m > 0 || y > 0);
    }

    /**
     * Check if a color is pure black (K only)
     */
    isPureBlack(c: number, m: number, y: number, k: number): boolean {
        return k > 0.9 && c < 0.1 && m < 0.1 && y < 0.1;
    }

    /**
     * Convert spot color name to approximate CMYK
     * This is a simplified conversion - real spot colors need ICC profiles
     */
    spotToCmyk(spotName: string): CMYK {
        // Common Pantone to CMYK approximations
        const pantoneMap: { [key: string]: CMYK } = {
            'PANTONE 185 C': { c: 0, m: 1, y: 0.79, k: 0.04 },
            'PANTONE 286 C': { c: 1, m: 0.75, y: 0, k: 0.04 },
            'PANTONE 348 C': { c: 1, m: 0, y: 0.91, k: 0 },
            'PANTONE Black C': { c: 0, m: 0, y: 0, k: 1 },
            'PANTONE Process Black C': { c: 0, m: 0, y: 0, k: 1 },
        };

        // Return mapped value or default to black
        return pantoneMap[spotName] || { c: 0, m: 0, y: 0, k: 1 };
    }

    /**
     * Validate CMYK values are within range
     */
    validateCMYK(c: number, m: number, y: number, k: number): boolean {
        return (
            c >= 0 && c <= 1 &&
            m >= 0 && m <= 1 &&
            y >= 0 && y <= 1 &&
            k >= 0 && k <= 1
        );
    }

    /**
     * Validate RGB values are within range
     */
    validateRGB(r: number, g: number, b: number): boolean {
        return (
            r >= 0 && r <= 255 &&
            g >= 0 && g <= 255 &&
            b >= 0 && b <= 255
        );
    }
}

export const colorConverter = new ColorConverter();
