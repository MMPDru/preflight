/**
 * Type definitions for PDF Pre-Flight Analysis and Auto-Fix System
 */

export interface PreFlightReport {
  documentInfo: DocumentInfo;
  colorSpaceAnalysis: ColorSpaceAnalysis;
  imageAnalysis: ImageAnalysis[];
  fontAnalysis: FontAnalysis[];
  transparencyAnalysis: TransparencyAnalysis;
  tacAnalysis: TACAnalysis;
  pdfxCompliance: PDFXCompliance;
  pageBoxValidation: BoxValidation[];
  issues: Issue[];
  warnings: Warning[];
  recommendations: Recommendation[];
  timestamp: Date;
  processingTime: number; // milliseconds
}

export interface DocumentInfo {
  fileName: string;
  fileSize: number;
  pageCount: number;
  pdfVersion: string;
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export interface ColorSpaceAnalysis {
  hasRGB: boolean;
  hasCMYK: boolean;
  hasSpotColors: boolean;
  hasGrayscale: boolean;
  spotColorNames: string[];
  colorSpaceBreakdown: {
    rgb: number;
    cmyk: number;
    spot: number;
    grayscale: number;
  };
  dominantColorSpace: 'RGB' | 'CMYK' | 'Spot' | 'Grayscale' | 'Mixed';
}

export interface ImageAnalysis {
  index: number;
  pageNumber: number;
  width: number;
  height: number;
  dpi: number;
  colorSpace: 'RGB' | 'CMYK' | 'Grayscale' | 'Indexed' | 'DeviceN';
  compression: string;
  sizeBytes: number;
  meetsMinDPI: boolean;
  minDPIRequired: number;
  needsOptimization: boolean;
}

export interface FontAnalysis {
  name: string;
  isEmbedded: boolean;
  isSubset: boolean;
  type: 'TrueType' | 'Type1' | 'Type3' | 'CIDFont' | 'OpenType' | 'Unknown';
  encoding?: string;
  usageCount: number;
  pageNumbers: number[];
}

export interface TransparencyAnalysis {
  hasTransparency: boolean;
  transparentObjects: number;
  blendModes: string[];
  affectedPages: number[];
  needsFlattening: boolean;
}

export interface TACAnalysis {
  maxTAC: number;
  exceedsLimit: boolean;
  limit: number;
  affectedAreas: number;
  affectedPages: number[];
  averageTAC: number;
}

export interface PDFXCompliance {
  isCompliant: boolean;
  standard: 'PDF/X-1a' | 'PDF/X-3' | 'PDF/X-4' | 'None';
  violations: string[];
  hasOutputIntent: boolean;
  hasBleedBox: boolean;
  hasTrimBox: boolean;
  fontsEmbedded: boolean;
}

export interface BoxValidation {
  pageIndex: number;
  hasMediaBox: boolean;
  hasCropBox: boolean;
  hasTrimBox: boolean;
  hasBleedBox: boolean;
  bleedSize: number;
  isValid: boolean;
  issues: string[];
  mediaBox?: Box;
  cropBox?: Box;
  trimBox?: Box;
  bleedBox?: Box;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Issue {
  id: string;
  severity: 'critical' | 'error' | 'warning';
  category: 'color' | 'image' | 'font' | 'transparency' | 'tac' | 'boxes' | 'compliance' | 'general';
  message: string;
  pageNumber?: number;
  autoFixAvailable: boolean;
  fixType?: string;
  details?: any;
}

export interface Warning {
  id: string;
  category: string;
  message: string;
  pageNumber?: number;
}

export interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  reason: string;
  fixType?: string;
}

// Color Types
export interface CMYK {
  c: number; // 0-1
  m: number; // 0-1
  y: number; // 0-1
  k: number; // 0-1
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export type ColorSpace = 'RGB' | 'CMYK' | 'Grayscale' | 'Indexed' | 'DeviceN' | 'Spot' | 'Unknown';

// Image Processing Types
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  colorSpace: string;
  channels: number;
  depth: string; // Changed from number to match Sharp's metadata type
  density?: number;
  hasAlpha: boolean;
  isProgressive?: boolean;
}

export interface ImageInfo {
  buffer: Buffer;
  metadata: ImageMetadata;
  pageNumber: number;
  index: number;
}

// Font Processing Types
export interface FontInfo {
  name: string;
  type: string;
  isEmbedded: boolean;
  isSubset: boolean;
  encoding?: string;
  descriptor?: any;
}

// Fix Operation Types
export type FixOperation =
  | 'cmyk'           // Convert RGB to CMYK
  | 'fonts'          // Embed fonts
  | 'resample'       // Optimize image DPI
  | 'bleed'          // Add bleed
  | 'boxes'          // Fix page boxes
  | 'marks'          // Add trim marks
  | 'split'          // Split spreads
  | 'scale'          // Scale pages
  | 'clean'          // Remove stray objects
  | 'reorder'        // Fix page order
  | 'normalize'      // Normalize metadata
  | 'flatten'        // Flatten transparency
  | 'tac'            // Fix TAC
  | 'spot-to-cmyk'   // Convert spot colors
  | 'outline-fonts'  // Outline fonts
  | 'optimize'       // General optimization
  | 'pdfx';          // Make PDF/X compliant

export interface FixOptions {
  targetDPI?: number;
  maxTAC?: number;
  bleedSize?: number;
  scaleFactor?: number;
  preserveTransparency?: boolean;
  embedFonts?: boolean;
  outlineFonts?: boolean;
  pdfxStandard?: 'PDF/X-1a' | 'PDF/X-3' | 'PDF/X-4';
}

export interface FixResult {
  success: boolean;
  url?: string;
  analysis: PreFlightReport;
  fixesApplied: FixOperation[];
  errors?: string[];
  processingTime: number;
}

// Analysis-only result
export interface AnalysisResult {
  success: boolean;
  analysis: PreFlightReport;
  errors?: string[];
}
