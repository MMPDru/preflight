import { PDFDocument, PDFName } from 'pdf-lib';

export interface FixResult {
    success: boolean;
    newUrl?: string;
    message: string;
}

export async function fixMetadata(fileUrl: string, metadata: { title?: string; author?: string }): Promise<FixResult> {
    try {
        const existingPdfBytes = await fetch(fileUrl).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        if (metadata.title) pdfDoc.setTitle(metadata.title);
        if (metadata.author) pdfDoc.setAuthor(metadata.author);

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        return {
            success: true,
            newUrl: URL.createObjectURL(blob),
            message: 'Metadata updated successfully.'
        };
    } catch (e: any) {
        console.error("Failed to fix metadata", e);
        return { success: false, message: e.message || 'Failed to update metadata.' };
    }
}

export async function fixBleed(fileUrl: string, bleedPoints: number = 9): Promise<FixResult> {
    try {
        const existingPdfBytes = await fetch(fileUrl).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const newPdf = await PDFDocument.create();

        for (let i = 0; i < pages.length; i++) {
            const originalPage = pages[i];
            const { width, height } = originalPage.getSize();

            // Embed the original page
            const [embeddedPage] = await newPdf.embedPdf(pdfDoc, [i]);

            // Create new page with bleed
            const newWidth = width + (bleedPoints * 2);
            const newHeight = height + (bleedPoints * 2);
            const newPage = newPdf.addPage([newWidth, newHeight]);

            // Helper to draw the page
            const draw = (x: number, y: number, xScale: number = 1, yScale: number = 1) => {
                newPage.drawPage(embeddedPage, { x, y, xScale, yScale });
            };

            // 1. Draw Center (Original)
            draw(bleedPoints, bleedPoints);

            // 2. Draw Top Mirror (Reflect across y=h)
            // Translate (bleedPoints, bleedPoints + 2*height), Scale (1, -1)
            draw(bleedPoints, bleedPoints + 2 * height, 1, -1);

            // 3. Draw Bottom Mirror (Reflect across y=0)
            // Translate (bleedPoints, bleedPoints), Scale (1, -1)
            draw(bleedPoints, bleedPoints, 1, -1);

            // 4. Draw Left Mirror (Reflect across x=0)
            // Translate (bleedPoints, bleedPoints), Scale (-1, 1)
            draw(bleedPoints, bleedPoints, -1, 1);

            // 5. Draw Right Mirror (Reflect across x=width)
            // Translate (bleedPoints + 2*width, bleedPoints), Scale (-1, 1)
            draw(bleedPoints + 2 * width, bleedPoints, -1, 1);

            // Corners
            draw(bleedPoints, bleedPoints + 2 * height, -1, -1); // Top-Left
            draw(bleedPoints + 2 * width, bleedPoints + 2 * height, -1, -1); // Top-Right
            draw(bleedPoints, bleedPoints, -1, -1); // Bottom-Left
            draw(bleedPoints + 2 * width, bleedPoints, -1, -1); // Bottom-Right

            // Redraw Center to cover seams
            draw(bleedPoints, bleedPoints);

            // Set TrimBox to original size (centered)
            newPage.setTrimBox(bleedPoints, bleedPoints, bleedPoints + width, bleedPoints + height);

            // Set BleedBox to full size
            newPage.setBleedBox(0, 0, newWidth, newHeight);
        }

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        return {
            success: true,
            newUrl: URL.createObjectURL(blob),
            message: 'Bleed fixed (mirrored edges).'
        };

    } catch (e: any) {
        console.error("Failed to fix bleed", e);
        return { success: false, message: e.message || 'Failed to fix bleed.' };
    }
}

export async function fixColors(fileUrl: string): Promise<FixResult> {
    try {
        const existingPdfBytes = await fetch(fileUrl).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // In a real server-side environment, we would use Ghostscript or similar to convert colors.
        // For this client-side demo, we will mark the document as "Color Corrected" in metadata
        // and potentially add a visual indicator or just return success to simulate the workflow.

        pdfDoc.setKeywords(['Color Corrected', 'CMYK Simulated']);
        const now = new Date();
        pdfDoc.setModificationDate(now);

        // We could also iterate pages and add a hidden annotation or similar if needed.

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

        return {
            success: true,
            newUrl: URL.createObjectURL(blob),
            message: 'Colors converted to CMYK (Simulated for Browser Demo).'
        };
    } catch (e: any) {
        console.error("Failed to fix colors", e);
        return { success: false, message: e.message || 'Failed to fix colors.' };
    }
}

export async function fixFonts(fileUrl: string): Promise<FixResult> {
    try {
        const existingPdfBytes = await fetch(fileUrl).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // Simulated Font Fix
        // In reality, we would need the font files to embed them, or use a library to outline text (complex).

        // pdf-lib getKeywords returns a string, but setKeywords expects string[]
        const currentKeywordsStr = pdfDoc.getKeywords() || '';
        const currentKeywords = currentKeywordsStr ? currentKeywordsStr.split(/[;,]\s*/) : [];

        if (!currentKeywords.includes('Fonts Fixed')) {
            pdfDoc.setKeywords([...currentKeywords, 'Fonts Fixed']);
        }

        const now = new Date();
        pdfDoc.setModificationDate(now);

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });

        return {
            success: true,
            newUrl: URL.createObjectURL(blob),
            message: 'Fonts embedded/outlined (Simulated for Browser Demo).'
        };
    } catch (e: any) {
        console.error("Failed to fix fonts", e);
        return { success: false, message: e.message || 'Failed to fix fonts.' };
    }
}

export async function fixPDFX(fileUrl: string): Promise<FixResult> {
    try {
        const existingPdfBytes = await fetch(fileUrl).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        // 1. Set PDF/X Version in Metadata
        pdfDoc.setTitle(pdfDoc.getTitle() || 'Untitled');
        pdfDoc.setAuthor(pdfDoc.getAuthor() || 'Unknown');
        pdfDoc.setProducer('PreFlight Pro PDF/X Converter');

        // 2. Add Output Intent (Simulated for browser)
        // In a real backend, we would embed an ICC profile here.
        // For now, we register the intent in the catalog.
        const outputIntent = pdfDoc.context.obj({
            Type: 'OutputIntent',
            S: 'GTS_PDFX',
            OutputConditionIdentifier: 'CGATS TR 001', // SWOP
            RegistryName: 'http://www.color.org',
            Info: 'U.S. Web Coated (SWOP) v2',
        });

        // pdf-lib requires constructing the array properly
        const outputIntents = pdfDoc.context.obj([outputIntent]);
        pdfDoc.catalog.set(PDFName.of('OutputIntents'), outputIntents);

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
        const newUrl = URL.createObjectURL(blob);

        return {
            success: true,
            message: 'Converted to PDF/X-1a (Simulated)',
            newUrl
        };
    } catch (error) {
        console.error('Failed to convert to PDF/X:', error);
        return {
            success: false,
            message: 'Failed to convert to PDF/X: ' + (error instanceof Error ? error.message : String(error))
        };
    }
}
