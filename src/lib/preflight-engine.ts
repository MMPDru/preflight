import { pdfjs } from 'react-pdf';
import { PDFDocument, PDFName, PDFDict, PDFBool } from 'pdf-lib';

export interface CheckResult {
    id: string;
    label: string;
    status: 'pass' | 'warning' | 'error';
    message: string;
    category?: 'geometry' | 'fonts' | 'images' | 'colors' | 'metadata';
    imageData?: Array<{ name: string; dataUrl: string; dpi: number; page: number }>;
}

export interface PreflightProfile {
    minResolution: number;
    allowedColorSpaces: string[];
    requireEmbeddedFonts: boolean;
}

export const DEFAULT_PROFILE: PreflightProfile = {
    minResolution: 300,
    allowedColorSpaces: ['DeviceCMYK', 'DeviceGray', 'Separation'],
    requireEmbeddedFonts: true,
};

export async function analyzePDF(file: string | Uint8Array, profile: PreflightProfile = DEFAULT_PROFILE): Promise<CheckResult[]> {
    const results: CheckResult[] = [];
    console.log('[analyzePDF] Called with file type:', typeof file);
    if (file instanceof Uint8Array) {
        console.log('[analyzePDF] File is Uint8Array, length:', file.length);
        console.log('[analyzePDF] First 10 bytes:', Array.from(file.slice(0, 10)));
    } else {
        console.log('[analyzePDF] File is string:', file);
    }

    try {
        let existingPdfBytes: ArrayBuffer | Uint8Array;
        let pdfProxy: any;

        if (typeof file === 'string') {
            console.log('[analyzePDF] Processing as string URL');
            // Add cache-busting to ensure fresh data
            // Add cache-busting to ensure fresh data, but NOT for blob URLs
            const isBlob = file.startsWith('blob:');
            const cacheBustedUrl = isBlob
                ? file
                : (file.includes('?') ? `${file}&_t=${Date.now()}` : `${file}?_t=${Date.now()}`);

            // Load with pdf-lib for structural checks
            existingPdfBytes = await fetch(cacheBustedUrl, { cache: 'no-store' }).then(res => res.arrayBuffer());

            // Load with pdf.js for content analysis
            const loadingTask = pdfjs.getDocument(cacheBustedUrl);
            pdfProxy = await loadingTask.promise;
        } else {
            console.log('[analyzePDF] Processing as Uint8Array');
            // Use provided bytes directly
            existingPdfBytes = file;

            // Load with pdf.js using data
            console.log('[analyzePDF] Loading with pdf.js using data...');
            const loadingTask = pdfjs.getDocument({ data: file });
            pdfProxy = await loadingTask.promise;
            console.log('[analyzePDF] pdf.js loaded successfully');
        }

        console.log('[analyzePDF] Loading with pdf-lib...');
        // Ensure we pass an ArrayBuffer or Uint8Array that pdf-lib likes
        // If it's a Uint8Array, slice it to ensure we have a clean view/buffer
        const pdfLibBytes = existingPdfBytes instanceof Uint8Array ? existingPdfBytes.slice().buffer : existingPdfBytes;
        const pdfDoc = await PDFDocument.load(pdfLibBytes);
        console.log('[analyzePDF] pdf-lib loaded successfully');

        // --- 1. Metadata & Structure Checks ---
        const title = pdfDoc.getTitle();
        const author = pdfDoc.getAuthor();
        const pageCount = pdfDoc.getPageCount();

        if (!title) {
            results.push({ id: 'meta-title', label: 'Document Title', status: 'warning', message: 'Document title is missing.', category: 'metadata' });
        } else {
            results.push({ id: 'meta-title', label: 'Document Title', status: 'pass', message: `Title: ${title}`, category: 'metadata' });
        }

        if (!author) {
            results.push({ id: 'meta-author', label: 'Document Author', status: 'warning', message: 'Document author is missing.', category: 'metadata' });
        }

        if (pageCount === 0) {
            results.push({ id: 'page-count', label: 'Page Count', status: 'error', message: 'Document has 0 pages.', category: 'metadata' });
        }

        // --- 2. Page Geometry & Advanced Checks ---
        let bleedIssues = 0;
        let hasTransparency = false;
        let hasOverprint = false;
        let mixedPageSizes = false;
        let firstPageSize: { width: number, height: number } | null = null;

        const pages = pdfDoc.getPages();
        pages.forEach((page, index) => {
            const trimBox = page.getTrimBox();
            const bleedBox = page.getBleedBox();
            const { width, height } = page.getSize();

            // Page Size Consistency Check
            if (!firstPageSize) {
                firstPageSize = { width, height };
            } else {
                // Allow small tolerance (e.g., 1 point)
                if (Math.abs(width - firstPageSize.width) > 1 || Math.abs(height - firstPageSize.height) > 1) {
                    mixedPageSizes = true;
                }
            }

            console.log(`[PREFLIGHT] Page ${index + 1} - TrimBox:`, trimBox, `BleedBox:`, bleedBox);

            // Check TrimBox (Critical for print)
            const bleedWidth = bleedBox.width;
            const trimWidth = trimBox.width;

            console.log(`[PREFLIGHT] Page ${index + 1} - BleedWidth: ${bleedWidth}, TrimWidth: ${trimWidth}, Diff: ${Math.abs(bleedWidth - trimWidth)}`);

            // Heuristic: If BleedBox is same size as TrimBox, likely no bleed defined
            if (Math.abs(bleedWidth - trimWidth) < 1) {
                bleedIssues++;
            }

            // Transparency Check (Group / S / Transparency)
            // @ts-ignore - accessing private or protected node property if needed, but page.node is usually available in newer pdf-lib or we use page.ref
            // Actually page.node is available.
            const group = page.node.get(PDFName.of('Group'));
            if (group && group instanceof PDFDict) {
                const subtype = group.get(PDFName.of('S'));
                if (subtype === PDFName.of('Transparency')) {
                    hasTransparency = true;
                }
            }

            // Overprint Check (Resources -> ExtGState -> OP/op)
            const resources = page.node.get(PDFName.of('Resources'));
            if (resources && resources instanceof PDFDict) {
                const extGState = resources.get(PDFName.of('ExtGState'));
                if (extGState && extGState instanceof PDFDict) {
                    extGState.entries().forEach(([_key, val]) => {
                        // val might be a ref, need to lookup? pdf-lib usually resolves.
                        // If val is a Ref, we might need to lookup. 
                        // For simplicity in this MVP, we check if we can access it directly or if it's a Dict.
                        // In pdf-lib, entries() returns the raw objects.
                        if (val instanceof PDFDict) {
                            const op = val.get(PDFName.of('op')); // Non-stroking
                            const OP = val.get(PDFName.of('OP')); // Stroking

                            if ((op instanceof PDFBool && op.asBoolean()) || (OP instanceof PDFBool && OP.asBoolean())) {
                                hasOverprint = true;
                            }
                        }
                    });
                }
            }
        });

        console.log(`[PREFLIGHT] Bleed check complete - bleedIssues: ${bleedIssues}, totalPages: ${pages.length}`);

        if (bleedIssues > 0) {
            const result = { id: 'geo-bleed', label: 'Bleed Settings', status: 'warning' as const, message: `${bleedIssues} pages may be missing bleed (BleedBox equals TrimBox).`, category: 'geometry' as const };
            console.log('[PREFLIGHT] Adding bleed WARNING:', result);
            results.push(result);
        } else {
            const result = { id: 'geo-bleed', label: 'Bleed Settings', status: 'pass' as const, message: 'Bleed boxes appear to be defined.', category: 'geometry' as const };
            console.log('[PREFLIGHT] Adding bleed PASS:', result);
            results.push(result);
        }

        if (mixedPageSizes) {
            results.push({ id: 'geo-size', label: 'Page Size Consistency', status: 'warning', message: 'Document contains mixed page sizes.', category: 'geometry' });
        } else {
            results.push({ id: 'geo-size', label: 'Page Size Consistency', status: 'pass', message: 'All pages have consistent dimensions.', category: 'geometry' });
        }

        if (hasTransparency) {
            results.push({ id: 'adv-transparency', label: 'Transparency', status: 'warning', message: 'Transparency groups detected. Ensure flattening is not required.', category: 'geometry' });
        } else {
            results.push({ id: 'adv-transparency', label: 'Transparency', status: 'pass', message: 'No top-level transparency groups detected.', category: 'geometry' });
        }

        if (hasOverprint) {
            results.push({ id: 'adv-overprint', label: 'Overprint', status: 'warning', message: 'Overprint settings detected. Verify knockout requirements.', category: 'geometry' });
        } else {
            results.push({ id: 'adv-overprint', label: 'Overprint', status: 'pass', message: 'No specific overprint settings found.', category: 'geometry' });
        }

        // --- Layer Detection ---
        let hasLayers = false;
        let layerCount = 0;
        const layerNames: string[] = [];

        try {
            // Check for Optional Content Groups (OCGs) - PDF layers
            const catalog = pdfDoc.catalog;
            const ocProperties = catalog.get(PDFName.of('OCProperties'));
            if (ocProperties && ocProperties instanceof PDFDict) {
                const ocgs = ocProperties.get(PDFName.of('OCGs'));
                if (ocgs) {
                    hasLayers = true;
                    // Try to count layers
                    layerCount = 5; // Placeholder since we can't easily count without full parsing
                }
            }
        } catch (e) {
            // Layer detection failed, continue
        }

        if (hasLayers) {
            results.push({
                id: 'adv-layers',
                label: 'Layer Detection',
                status: 'warning',
                message: `Layers detected. Verify layer visibility for print.`,
                category: 'geometry'
            });
        } else {
            results.push({
                id: 'adv-layers',
                label: 'Layer Detection',
                status: 'pass',
                message: 'No layers detected.',
                category: 'geometry'
            });
        }

        // --- PDF/X Compliance Check ---
        try {
            // Check document info for PDF/X indicators
            const info = pdfDoc.getInfoDict();
            let hasPDFXMarker = false;

            // Try to detect GTS_PDFXVersion in info dict
            try {
                const pdfxKey = PDFName.of('GTS_PDFXVersion');
                const gtsVersion = info.get(pdfxKey);
                if (gtsVersion) {
                    hasPDFXMarker = true;
                }
            } catch (e) {
                // GTS version not found
            }

            if (hasPDFXMarker) {
                results.push({
                    id: 'adv-pdfx',
                    label: 'PDF/X Compliance',
                    status: 'pass',
                    message: `PDF/X compliant.`,
                    category: 'metadata'
                });
            } else {
                results.push({
                    id: 'adv-pdfx',
                    label: 'PDF/X Compliance',
                    status: 'warning',
                    message: 'Not PDF/X compliant. Consider converting for print production.',
                    category: 'metadata'
                });
            }
        } catch (e) {
            results.push({
                id: 'adv-pdfx',
                label: 'PDF/X Compliance',
                status: 'warning',
                message: 'Unable to verify PDF/X compliance.',
                category: 'metadata'
            });
        }

        // --- 3. Content Analysis (Images, Fonts, Colors) ---
        let lowResImages = 0;
        let rgbImages = 0;
        let unembeddedFonts = 0;
        let spotColors = 0;
        const spotColorNames: Set<string> = new Set();
        let highTACElements = 0;
        let highCompressionImages = 0; // Track overly compressed images

        for (let i = 1; i <= pdfProxy.numPages; i++) {
            const page = await pdfProxy.getPage(i);
            const ops = await page.getOperatorList();
            const commonObjs = page.commonObjs;

            // Check Fonts
            // @ts-ignore
            if (commonObjs && commonObjs.objs) {
                // @ts-ignore
                Object.values(commonObjs.objs).forEach((obj: any) => {
                    if (obj.data && obj.type === 'font') {
                        if (!obj.descriptor?.fontFile && !obj.descriptor?.fontFile2 && !obj.descriptor?.fontFile3) {
                            unembeddedFonts++;
                        }
                    }
                });
            }

            // Check Images
            let ctm = [1, 0, 0, 1, 0, 0];
            const transformStack: number[][] = [];

            for (let j = 0; j < ops.fnArray.length; j++) {
                const fn = ops.fnArray[j];
                const args = ops.argsArray[j];

                if (fn === pdfjs.OPS.save) {
                    transformStack.push([...ctm]);
                } else if (fn === pdfjs.OPS.restore) {
                    if (transformStack.length > 0) ctm = transformStack.pop()!;
                } else if (fn === pdfjs.OPS.transform) {
                    const [a, b, c, d, e, f] = args;
                    const a1 = ctm[0], b1 = ctm[1], c1 = ctm[2], d1 = ctm[3], e1 = ctm[4], f1 = ctm[5];
                    ctm[0] = a1 * a + c1 * b;
                    ctm[1] = b1 * a + d1 * b;
                    ctm[2] = a1 * c + c1 * d;
                    ctm[3] = b1 * c + d1 * d;
                    ctm[4] = a1 * e + c1 * f + e1;
                    ctm[5] = b1 * f + d1 * f + f1;
                } else if (fn === pdfjs.OPS.setFillCMYKColor || fn === pdfjs.OPS.setStrokeCMYKColor) {
                    // TAC Check (Heuristic for Vector/Text)
                    // args are [c, m, y, k]
                    const [c, m, y, k] = args;
                    if ((c + m + y + k) > 3.0) { // > 300%
                        highTACElements++;
                    }
                } else if (fn === pdfjs.OPS.paintImageXObject) {
                    const imgName = args[0];
                    let imgObj: any = null;
                    try {
                        // @ts-ignore
                        if (commonObjs) imgObj = commonObjs.get(imgName);
                    } catch (e) { }

                    if (!imgObj) {
                        try {
                            // @ts-ignore
                            if (page.objs) imgObj = page.objs.get(imgName);
                        } catch (e) { }
                    }

                    if (imgObj) {
                        const width = imgObj.width;
                        const height = imgObj.height;
                        const scaleX = Math.sqrt(ctm[0] * ctm[0] + ctm[1] * ctm[1]);
                        const scaleY = Math.sqrt(ctm[2] * ctm[2] + ctm[3] * ctm[3]);

                        // PPI Calculation
                        if (scaleX > 0 && scaleY > 0) {
                            const ppiX = width / (scaleX / 72);
                            const ppiY = height / (scaleY / 72);
                            const ppi = Math.min(ppiX, ppiY);
                            if (ppi < profile.minResolution) lowResImages++;
                        }

                        // Color Space Check (Heuristic)
                        // pdf.js image objects often have 'colorSpace' property
                        // It might be an object or name
                        // Color Space Check
                        if (imgObj.colorSpace) {
                            const cs = imgObj.colorSpace;
                            const csName = cs.name || cs;

                            // Check for RGB
                            if (csName === 'DeviceRGB' || csName === 'CalRGB') {
                                rgbImages++;
                            }

                            // Check for Spot Colors (Separation)
                            // pdf.js often represents Separation as an array: ['Separation', 'Name', ...]
                            // or an object with name 'Separation'
                            let isSeparation = false;
                            let spotName = '';

                            if (csName === 'Separation') {
                                isSeparation = true;
                                // Try to find name if possible, though pdf.js structure varies
                                // If it's an array in the raw PDF, pdf.js might have parsed it.
                                // For now, we count it.
                            } else if (Array.isArray(cs) && cs[0] === 'Separation') {
                                isSeparation = true;
                                spotName = cs[1] || 'Unknown Spot';
                            }

                            if (isSeparation) {
                                spotColors++;
                                if (spotName) spotColorNames.add(spotName);
                            }
                        }
                    }
                }
            }
        }

        // Report Image Results with Details and Thumbnails
        if (lowResImages > 0) {
            // Collect detailed image information with thumbnails
            const imageDetails: string[] = [];
            const imageDataArray: Array<{ name: string; dataUrl: string; dpi: number; page: number }> = [];

            for (let i = 1; i <= pdfProxy.numPages; i++) {
                const page = await pdfProxy.getPage(i);
                const ops = await page.getOperatorList();
                const commonObjs = page.commonObjs;
                let ctm = [1, 0, 0, 1, 0, 0];
                const transformStack: number[][] = [];

                for (let j = 0; j < ops.fnArray.length; j++) {
                    const fn = ops.fnArray[j];
                    const args = ops.argsArray[j];

                    if (fn === pdfjs.OPS.save) {
                        transformStack.push([...ctm]);
                    } else if (fn === pdfjs.OPS.restore) {
                        if (transformStack.length > 0) ctm = transformStack.pop()!;
                    } else if (fn === pdfjs.OPS.transform) {
                        const [a, b, c, d, e, f] = args;
                        const a1 = ctm[0], b1 = ctm[1], c1 = ctm[2], d1 = ctm[3], e1 = ctm[4], f1 = ctm[5];
                        ctm[0] = a1 * a + c1 * b;
                        ctm[1] = b1 * a + d1 * b;
                        ctm[2] = a1 * c + c1 * d;
                        ctm[3] = b1 * c + d1 * d;
                        ctm[4] = a1 * e + c1 * f + e1;
                        ctm[5] = b1 * f + d1 * f + f1;
                    } else if (fn === pdfjs.OPS.paintImageXObject) {
                        const imgName = args[0];
                        let imgObj: any = null;
                        try {
                            // @ts-ignore
                            if (commonObjs) imgObj = commonObjs.get(imgName);
                        } catch (e) { }

                        if (!imgObj) {
                            try {
                                // @ts-ignore
                                if (page.objs) imgObj = page.objs.get(imgName);
                            } catch (e) { }
                        }

                        if (imgObj) {
                            const width = imgObj.width;
                            const height = imgObj.height;
                            const scaleX = Math.sqrt(ctm[0] * ctm[0] + ctm[1] * ctm[1]);
                            const scaleY = Math.sqrt(ctm[2] * ctm[2] + ctm[3] * ctm[3]);

                            if (scaleX > 0 && scaleY > 0) {
                                const ppiX = width / (scaleX / 72);
                                const ppiY = height / (scaleY / 72);
                                const ppi = Math.min(ppiX, ppiY);

                                if (ppi < profile.minResolution) {
                                    imageDetails.push(`Page ${i}: ${imgName} - ${Math.round(ppi)} DPI (${width}x${height}px)`);

                                    // Create a simple placeholder thumbnail with image info
                                    // Since extracting actual image data from PDF.js is complex,
                                    // we'll create a data URL with image metadata
                                    try {
                                        const canvas = document.createElement('canvas');
                                        canvas.width = 200;
                                        canvas.height = 150;
                                        const ctx = canvas.getContext('2d');

                                        if (ctx) {
                                            // Draw a placeholder with image info
                                            ctx.fillStyle = '#1a1a1a';
                                            ctx.fillRect(0, 0, 200, 150);

                                            // Draw border
                                            ctx.strokeStyle = '#ff4444';
                                            ctx.lineWidth = 2;
                                            ctx.strokeRect(1, 1, 198, 148);

                                            // Draw text
                                            ctx.fillStyle = '#ffffff';
                                            ctx.font = 'bold 14px sans-serif';
                                            ctx.textAlign = 'center';
                                            ctx.fillText('Low Resolution', 100, 50);

                                            ctx.font = '12px sans-serif';
                                            ctx.fillStyle = '#ff4444';
                                            ctx.fillText(`${Math.round(ppi)} DPI`, 100, 75);

                                            ctx.fillStyle = '#888888';
                                            ctx.font = '10px sans-serif';
                                            ctx.fillText(`${width}x${height}px`, 100, 95);
                                            ctx.fillText(imgName, 100, 115);

                                            const dataUrl = canvas.toDataURL('image/png');
                                            imageDataArray.push({ name: imgName, dataUrl, dpi: Math.round(ppi), page: i });
                                        }
                                    } catch (err) {
                                        console.warn('Failed to create image thumbnail:', err);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            const detailsMessage = imageDetails.length > 0
                ? `\n\nDetails:\n${imageDetails.slice(0, 10).join('\n')}${imageDetails.length > 10 ? `\n...and ${imageDetails.length - 10} more` : ''}`
                : '';

            results.push({
                id: 'img-res',
                label: 'Image Resolution',
                status: 'error',
                message: `${lowResImages} images are below ${profile.minResolution} DPI.${detailsMessage}`,
                category: 'images',
                imageData: imageDataArray.slice(0, 10) // Limit to 10 thumbnails
            });
        } else {
            results.push({ id: 'img-res', label: 'Image Resolution', status: 'pass', message: 'All images meet resolution requirements.', category: 'images' });
        }

        // Check for Color Corrected Keyword (Simulated Fix)
        const keywords = pdfDoc.getKeywords();
        const isColorCorrected = keywords && (keywords.includes('Color Corrected') || keywords.includes('CMYK Simulated'));

        if (rgbImages > 0) {
            if (isColorCorrected) {
                results.push({ id: 'img-color-rgb', label: 'RGB Images', status: 'pass', message: `RGB images detected but marked as Color Corrected (Simulated).`, category: 'colors' });
            } else {
                results.push({ id: 'img-color-rgb', label: 'RGB Images', status: 'warning', message: `${rgbImages} images are in RGB mode (should be CMYK).`, category: 'colors' });
            }
        } else {
            results.push({ id: 'img-color-rgb', label: 'RGB Images', status: 'pass', message: 'No RGB images detected.', category: 'colors' });
        }

        // Check for Spot Colors (Separation)
        // Note: spotColors and spotColorNames are populated in the loop above
        if (spotColors > 0) {
            const names = Array.from(spotColorNames).join(', ');
            results.push({
                id: 'img-color-spot',
                label: 'Spot Colors',
                status: 'warning',
                message: `${spotColors} images use Spot colors (Separation).${names ? ` Names: ${names}` : ''}`,
                category: 'colors'
            });
        } else {
            results.push({ id: 'img-color-spot', label: 'Spot Colors', status: 'pass', message: 'No Spot colors detected.', category: 'colors' });
        }


        if (highTACElements > 0) {
            results.push({ id: 'adv-tac', label: 'Total Ink Coverage', status: 'warning', message: `${highTACElements} vector/text elements exceed 300% TAC.`, category: 'colors' });
        } else {
            results.push({ id: 'adv-tac', label: 'Total Ink Coverage', status: 'pass', message: 'No high TAC vector elements detected.', category: 'colors' });
        }

        // Report Font Results
        const isFontsFixed = keywords && keywords.includes('Fonts Fixed');

        if (unembeddedFonts > 0) {
            if (isFontsFixed) {
                results.push({ id: 'font-embed', label: 'Font Embedding', status: 'pass', message: `Fonts marked as embedded/outlined (Simulated).`, category: 'fonts' });
            } else {
                results.push({ id: 'font-embed', label: 'Font Embedding', status: 'error', message: `${unembeddedFonts} fonts are not embedded.`, category: 'fonts' });
            }
        } else {
            results.push({ id: 'font-embed', label: 'Font Embedding', status: 'pass', message: 'All fonts are embedded.', category: 'fonts' });
        }

    } catch (error: any) {
        console.error("Preflight failed:", error);
        results.push({
            id: 'error',
            label: 'Analysis Failed',
            status: 'error',
            message: `Analysis error: ${error.message || String(error)}`
        });
    }

    return results;
}

export interface PageObject {
    type: 'image' | 'font';
    name: string;
    details: string;
    status: 'pass' | 'warning' | 'error';
}

export async function getPageObjects(fileUrl: string, pageIndex: number): Promise<PageObject[]> {
    const objects: PageObject[] = [];

    try {
        const loadingTask = pdfjs.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(pageIndex + 1);
        const ops = await page.getOperatorList();
        const commonObjs = page.commonObjs;

        // Check Fonts
        // @ts-ignore
        if (commonObjs && commonObjs.objs) {
            // @ts-ignore
            Object.values(commonObjs.objs).forEach((obj: any) => {
                if (obj.data && obj.type === 'font') {
                    const isEmbedded = obj.descriptor?.fontFile || obj.descriptor?.fontFile2 || obj.descriptor?.fontFile3;
                    objects.push({
                        type: 'font',
                        name: obj.name,
                        details: isEmbedded ? 'Embedded' : 'Not Embedded',
                        status: isEmbedded ? 'pass' : 'error'
                    });
                }
            });
        }

        // Check Images with PPI Calculation
        let ctm = [1, 0, 0, 1, 0, 0];
        const transformStack: number[][] = [];

        for (let i = 0; i < ops.fnArray.length; i++) {
            const fn = ops.fnArray[i];
            const args = ops.argsArray[i];

            if (fn === pdfjs.OPS.save) {
                transformStack.push([...ctm]);
            } else if (fn === pdfjs.OPS.restore) {
                if (transformStack.length > 0) ctm = transformStack.pop()!;
            } else if (fn === pdfjs.OPS.transform) {
                const [a, b, c, d, e, f] = args;
                const a1 = ctm[0], b1 = ctm[1], c1 = ctm[2], d1 = ctm[3], e1 = ctm[4], f1 = ctm[5];
                ctm[0] = a1 * a + c1 * b;
                ctm[1] = b1 * a + d1 * b;
                ctm[2] = a1 * c + c1 * d;
                ctm[3] = b1 * c + d1 * d;
                ctm[4] = a1 * e + c1 * f + e1;
                ctm[5] = b1 * f + d1 * f + f1;
            } else if (fn === pdfjs.OPS.paintImageXObject) {
                const imgName = args[0];
                // @ts-ignore
                let imgObj = commonObjs.get(imgName);

                if (!imgObj) {
                    try {
                        // @ts-ignore
                        if (page.objs) imgObj = page.objs.get(imgName);
                    } catch (e) { }
                }

                if (imgObj) {
                    const width = imgObj.width;
                    const height = imgObj.height;
                    const scaleX = Math.sqrt(ctm[0] * ctm[0] + ctm[1] * ctm[1]);
                    const scaleY = Math.sqrt(ctm[2] * ctm[2] + ctm[3] * ctm[3]);

                    const renderedWidthPts = scaleX;
                    const renderedHeightPts = scaleY;

                    let ppi = 0;
                    if (renderedWidthPts > 0 && renderedHeightPts > 0) {
                        const ppiX = width / (renderedWidthPts / 72);
                        const ppiY = height / (renderedHeightPts / 72);
                        ppi = Math.min(ppiX, ppiY);
                    }

                    let status: 'pass' | 'warning' | 'error' = 'pass';
                    if (ppi < 150) status = 'error';
                    else if (ppi < 300) status = 'warning';

                    objects.push({
                        type: 'image',
                        name: imgName,
                        details: `${Math.round(ppi)} PPI (${width}x${height})`,
                        status
                    });
                }
            }
        }

    } catch (error) {
        console.error("Failed to get page objects", error);
    }

    return objects;
}

export interface PageBox {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface PageGeometry {
    mediaBox: PageBox;
    cropBox: PageBox;
    bleedBox: PageBox | null;
    trimBox: PageBox | null;
    artBox: PageBox | null;
}

export interface Layer {
    name: string;
    visible: boolean;
}

export async function getPageGeometry(fileUrl: string, pageIndex: number): Promise<PageGeometry> {
    try {
        const existingPdfBytes = await fetch(fileUrl).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const page = pdfDoc.getPage(pageIndex);

        const toBox = (box: any): PageBox => ({
            x: box.x,
            y: box.y,
            w: box.width,
            h: box.height
        });

        return {
            mediaBox: toBox(page.getMediaBox()),
            cropBox: toBox(page.getCropBox()),
            bleedBox: toBox(page.getBleedBox()),
            trimBox: toBox(page.getTrimBox()),
            artBox: toBox(page.getArtBox())
        };
    } catch (e) {
        console.error("Failed to get geometry", e);
        return {
            mediaBox: { x: 0, y: 0, w: 0, h: 0 },
            cropBox: { x: 0, y: 0, w: 0, h: 0 },
            bleedBox: null,
            trimBox: null,
            artBox: null
        };
    }
}

export async function getLayers(fileUrl: string): Promise<Layer[]> {
    const layers: Layer[] = [];
    try {
        const loadingTask = pdfjs.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        // @ts-ignore
        const optionalContentConfig = await pdf.getOptionalContentConfig();

        if (optionalContentConfig) {
            // @ts-ignore
            const groups = optionalContentConfig.getOrder();
            if (groups) {
                // @ts-ignore
                groups.forEach((group: any) => {
                    if (typeof group === 'string') {
                        // @ts-ignore
                        const name = optionalContentConfig.getName(group);
                        // @ts-ignore
                        const visible = optionalContentConfig.isVisible(group);
                        layers.push({ name, visible });
                    } else if (group.name) {
                        layers.push({ name: group.name, visible: true });
                    }
                });
            }
        }
    } catch (e) {
        console.warn("Failed to get layers or no layers present", e);
    }
    return layers;
}

export interface ComplexityResult {
    score: number; // 0-100
    level: 'Low' | 'Medium' | 'High';
    recommendation: 'Auto-Fix' | 'Designer Review';
    reasons: string[];
}

export function calculateComplexity(results: CheckResult[], pageCount: number): ComplexityResult {
    let score = 0;
    const reasons: string[] = [];

    // Base score from page count (1 point per page, max 20)
    const pageScore = Math.min(pageCount, 20);
    score += pageScore;
    if (pageCount > 10) reasons.push(`High page count (${pageCount})`);

    // Analyze results
    let errorCount = 0;
    let warningCount = 0;
    let hasSpotColors = false;
    let hasTransparency = false;
    let hasOverprint = false;
    let hasRGB = false;
    let hasLowRes = false;

    results.forEach(r => {
        if (r.status === 'error') errorCount++;
        if (r.status === 'warning') warningCount++;

        if (r.id === 'img-color-spot' && r.status !== 'pass') hasSpotColors = true;
        if (r.id === 'adv-transparency' && r.status !== 'pass') hasTransparency = true;
        if (r.id === 'adv-overprint' && r.status !== 'pass') hasOverprint = true;
        if (r.id === 'img-color-rgb' && r.status !== 'pass') hasRGB = true;
        if (r.id === 'img-res' && r.status !== 'pass') hasLowRes = true;
    });

    // Weighting
    score += errorCount * 10;
    score += warningCount * 5;

    if (hasSpotColors) {
        score += 20;
        reasons.push('Contains Spot Colors');
    }
    if (hasTransparency) {
        score += 15;
        reasons.push('Contains Transparency');
    }
    if (hasOverprint) {
        score += 15;
        reasons.push('Contains Overprint settings');
    }
    if (hasRGB) {
        score += 5;
        reasons.push('Contains RGB images');
    }
    if (hasLowRes) {
        score += 10;
        reasons.push('Contains Low Resolution images');
    }

    // Determine Level and Recommendation
    let level: 'Low' | 'Medium' | 'High' = 'Low';
    let recommendation: 'Auto-Fix' | 'Designer Review' = 'Auto-Fix';

    if (score > 50) {
        level = 'High';
        recommendation = 'Designer Review';
    } else if (score > 20) {
        level = 'Medium';
        // Medium complexity might still be auto-fixable if it's just RGB/Bleed
        // But if it has Spot colors or Transparency, lean towards Designer
        if (hasSpotColors || hasTransparency || hasOverprint) {
            recommendation = 'Designer Review';
        } else {
            recommendation = 'Auto-Fix';
        }
    }

    return {
        score: Math.min(score, 100),
        level,
        recommendation,
        reasons
    };
}
