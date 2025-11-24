import { PDFDocument } from 'pdf-lib';

export async function fixBleed(fileUrl: string, bleedPoints: number = 9): Promise<{ url: string, bytes: Uint8Array }> {
    console.log('[fixBleed] Function called with URL:', fileUrl, 'bleedPoints:', bleedPoints);

    try {
        console.log('[fixBleed] Fetching PDF bytes...');
        const existingPdfBytes = await fetch(fileUrl).then(res => res.arrayBuffer());
        console.log('[fixBleed] PDF bytes fetched, size:', existingPdfBytes.byteLength);

        console.log('[fixBleed] Loading PDF document...');
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        console.log('[fixBleed] PDF loaded, page count:', pdfDoc.getPageCount());

        const pages = pdfDoc.getPages();

        console.log('[fixBleed] Creating new PDF document...');
        const newPdf = await PDFDocument.create();

        for (let i = 0; i < pages.length; i++) {
            console.log(`[fixBleed] Processing page ${i + 1}/${pages.length}...`);
            const originalPage = pages[i];
            const { width, height } = originalPage.getSize();
            console.log(`[fixBleed] Page ${i + 1} size: ${width}x${height}`);

            // Embed the original page
            const [embeddedPage] = await newPdf.embedPdf(pdfDoc, [i]);

            // Create new page with bleed
            const newWidth = width + (bleedPoints * 2);
            const newHeight = height + (bleedPoints * 2);
            console.log(`[fixBleed] New page size with bleed: ${newWidth}x${newHeight}`);
            const newPage = newPdf.addPage([newWidth, newHeight]);

            // Helper to draw the page
            const draw = (x: number, y: number, xScale: number = 1, yScale: number = 1) => {
                newPage.drawPage(embeddedPage, {
                    x,
                    y,
                    xScale,
                    yScale,
                });
            };

            // 1. Draw Center (Original)
            draw(bleedPoints, bleedPoints);

            // 2. Draw Top Mirror
            draw(bleedPoints, bleedPoints + 2 * height, 1, -1);

            // 3. Draw Bottom Mirror
            draw(bleedPoints, bleedPoints, 1, -1);

            // 4. Draw Left Mirror
            draw(bleedPoints, bleedPoints, -1, 1);

            // 5. Draw Right Mirror
            draw(bleedPoints + 2 * width, bleedPoints, -1, 1);

            // Corners
            draw(bleedPoints, bleedPoints + 2 * height, -1, -1); // Top-Left
            draw(bleedPoints + 2 * width, bleedPoints + 2 * height, -1, -1); // Top-Right
            draw(bleedPoints, bleedPoints, -1, -1); // Bottom-Left
            draw(bleedPoints + 2 * width, bleedPoints, -1, -1); // Bottom-Right

            // Draw Center again to cover seams
            draw(bleedPoints, bleedPoints);

            // Set Boxes
            console.log(`[fixBleed] Setting TrimBox: (${bleedPoints}, ${bleedPoints}, ${width}, ${height})`);
            newPage.setTrimBox(bleedPoints, bleedPoints, width, height);

            console.log(`[fixBleed] Setting MediaBox: (0, 0, ${newWidth}, ${newHeight})`);
            newPage.setMediaBox(0, 0, newWidth, newHeight);

            console.log(`[fixBleed] Setting BleedBox: (0, 0, ${newWidth}, ${newHeight})`);
            newPage.setBleedBox(0, 0, newWidth, newHeight);
        }

        console.log('[fixBleed] Saving new PDF...');
        const pdfBytes = await newPdf.save();
        console.log('[fixBleed] PDF saved, size:', pdfBytes.byteLength);

        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const objectUrl = URL.createObjectURL(blob);
        console.log('[fixBleed] Created object URL:', objectUrl);

        return { url: objectUrl, bytes: pdfBytes };

    } catch (e) {
        console.error("[fixBleed] ERROR - Failed to fix bleed:", e);
        console.error("[fixBleed] ERROR - Error stack:", e instanceof Error ? e.stack : 'No stack trace');
        throw e;
    }
}
