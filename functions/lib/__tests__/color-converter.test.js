"use strict";
/**
 * Unit Tests for Color Converter Utility
 */
Object.defineProperty(exports, "__esModule", { value: true });
const color_converter_1 = require("../utils/color-converter");
describe('Color Converter', () => {
    describe('rgbToCmyk', () => {
        it('should convert pure red to CMYK', () => {
            const result = color_converter_1.colorConverter.rgbToCmyk(255, 0, 0);
            expect(result.c).toBeCloseTo(0, 2);
            expect(result.m).toBeCloseTo(1, 2);
            expect(result.y).toBeCloseTo(1, 2);
            expect(result.k).toBeCloseTo(0, 2);
        });
        it('should convert pure black to CMYK', () => {
            const result = color_converter_1.colorConverter.rgbToCmyk(0, 0, 0);
            expect(result.c).toBe(0);
            expect(result.m).toBe(0);
            expect(result.y).toBe(0);
            expect(result.k).toBe(1);
        });
        it('should convert white to CMYK', () => {
            const result = color_converter_1.colorConverter.rgbToCmyk(255, 255, 255);
            expect(result.c).toBe(0);
            expect(result.m).toBe(0);
            expect(result.y).toBe(0);
            expect(result.k).toBeCloseTo(0, 2);
        });
        it('should convert gray to CMYK', () => {
            const result = color_converter_1.colorConverter.rgbToCmyk(128, 128, 128);
            expect(result.c).toBeCloseTo(0, 2);
            expect(result.m).toBeCloseTo(0, 2);
            expect(result.y).toBeCloseTo(0, 2);
            expect(result.k).toBeCloseTo(0.5, 1);
        });
    });
    describe('cmykToRgb', () => {
        it('should convert CMYK to RGB', () => {
            const result = color_converter_1.colorConverter.cmykToRgb(0, 1, 1, 0);
            expect(result.r).toBeCloseTo(255, 0);
            expect(result.g).toBeCloseTo(0, 0);
            expect(result.b).toBeCloseTo(0, 0);
        });
        it('should convert black CMYK to RGB', () => {
            const result = color_converter_1.colorConverter.cmykToRgb(0, 0, 0, 1);
            expect(result.r).toBe(0);
            expect(result.g).toBe(0);
            expect(result.b).toBe(0);
        });
    });
    describe('calculateTAC', () => {
        it('should calculate TAC correctly', () => {
            const tac = color_converter_1.colorConverter.calculateTAC(0.5, 0.5, 0.5, 0.5);
            expect(tac).toBe(200);
        });
        it('should return 0 for white', () => {
            const tac = color_converter_1.colorConverter.calculateTAC(0, 0, 0, 0);
            expect(tac).toBe(0);
        });
        it('should return 400 for maximum ink', () => {
            const tac = color_converter_1.colorConverter.calculateTAC(1, 1, 1, 1);
            expect(tac).toBe(400);
        });
    });
    describe('reduceTAC', () => {
        it('should reduce TAC when exceeding limit', () => {
            const result = color_converter_1.colorConverter.reduceTAC(1, 1, 1, 1, 300);
            const tac = color_converter_1.colorConverter.calculateTAC(result.c, result.m, result.y, result.k);
            expect(tac).toBeCloseTo(300, 1);
        });
        it('should not change TAC when within limit', () => {
            const result = color_converter_1.colorConverter.reduceTAC(0.5, 0.5, 0.5, 0.5, 300);
            expect(result.c).toBeCloseTo(0.5, 2);
            expect(result.m).toBeCloseTo(0.5, 2);
            expect(result.y).toBeCloseTo(0.5, 2);
            expect(result.k).toBeCloseTo(0.5, 2);
        });
    });
    describe('detectColorSpace', () => {
        it('should detect RGB', () => {
            const result = color_converter_1.colorConverter.detectColorSpace([255, 128, 64]);
            expect(result).toBe('RGB');
        });
        it('should detect CMYK', () => {
            const result = color_converter_1.colorConverter.detectColorSpace([0.5, 0.5, 0.5, 0.5]);
            expect(result).toBe('CMYK');
        });
        it('should detect Grayscale', () => {
            const result = color_converter_1.colorConverter.detectColorSpace([128]);
            expect(result).toBe('Grayscale');
        });
        it('should detect DeviceN', () => {
            const result = color_converter_1.colorConverter.detectColorSpace([1, 2, 3, 4, 5]);
            expect(result).toBe('DeviceN');
        });
    });
    describe('hexToCmyk', () => {
        it('should convert hex to CMYK', () => {
            const result = color_converter_1.colorConverter.hexToCmyk('#FF0000');
            expect(result.c).toBeCloseTo(0, 2);
            expect(result.m).toBeCloseTo(1, 2);
            expect(result.y).toBeCloseTo(1, 2);
            expect(result.k).toBeCloseTo(0, 2);
        });
        it('should handle hex without #', () => {
            const result = color_converter_1.colorConverter.hexToCmyk('FF0000');
            expect(result.c).toBeCloseTo(0, 2);
            expect(result.m).toBeCloseTo(1, 2);
        });
    });
    describe('isRichBlack', () => {
        it('should detect rich black', () => {
            const result = color_converter_1.colorConverter.isRichBlack(0.2, 0.2, 0.2, 0.8);
            expect(result).toBe(true);
        });
        it('should not detect pure black as rich black', () => {
            const result = color_converter_1.colorConverter.isRichBlack(0, 0, 0, 1);
            expect(result).toBe(false);
        });
    });
    describe('isPureBlack', () => {
        it('should detect pure black', () => {
            const result = color_converter_1.colorConverter.isPureBlack(0, 0, 0, 1);
            expect(result).toBe(true);
        });
        it('should not detect rich black as pure black', () => {
            const result = color_converter_1.colorConverter.isPureBlack(0.2, 0.2, 0.2, 0.8);
            expect(result).toBe(false);
        });
    });
    describe('validateCMYK', () => {
        it('should validate correct CMYK values', () => {
            expect(color_converter_1.colorConverter.validateCMYK(0.5, 0.5, 0.5, 0.5)).toBe(true);
        });
        it('should reject negative values', () => {
            expect(color_converter_1.colorConverter.validateCMYK(-0.1, 0.5, 0.5, 0.5)).toBe(false);
        });
        it('should reject values > 1', () => {
            expect(color_converter_1.colorConverter.validateCMYK(1.1, 0.5, 0.5, 0.5)).toBe(false);
        });
    });
    describe('validateRGB', () => {
        it('should validate correct RGB values', () => {
            expect(color_converter_1.colorConverter.validateRGB(128, 128, 128)).toBe(true);
        });
        it('should reject negative values', () => {
            expect(color_converter_1.colorConverter.validateRGB(-1, 128, 128)).toBe(false);
        });
        it('should reject values > 255', () => {
            expect(color_converter_1.colorConverter.validateRGB(256, 128, 128)).toBe(false);
        });
    });
});
//# sourceMappingURL=color-converter.test.js.map