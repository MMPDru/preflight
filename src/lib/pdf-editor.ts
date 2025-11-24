import { PDFDocument, degrees } from 'pdf-lib';

export async function rotatePage(pdfUrl: string, pageIndex: number, rotationAngle: number): Promise<string> {
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const page = pdfDoc.getPage(pageIndex);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + rotationAngle));

    const pdfBytes = await pdfDoc.save();
    return URL.createObjectURL(new Blob([pdfBytes as any], { type: 'application/pdf' }));
}

export async function deletePage(pdfUrl: string, pageIndex: number): Promise<string> {
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    pdfDoc.removePage(pageIndex);

    const pdfBytes = await pdfDoc.save();
    return URL.createObjectURL(new Blob([pdfBytes as any], { type: 'application/pdf' }));
}

export async function getPageInfo(pdfUrl: string, pageIndex: number) {
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPage(pageIndex);

    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle;

    return {
        width,
        height,
        rotation
    };
}

export async function movePage(pdfUrl: string, fromIndex: number, toIndex: number): Promise<string> {
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const [page] = await pdfDoc.copyPages(pdfDoc, [fromIndex]);

    // If moving forward, the original index is the same. If moving backward, it shifts by 1.
    // Actually, simpler logic: remove the original page.
    // If we insert at toIndex, indices shift.
    // Let's use a simpler approach: remove then insert? No, remove changes indices.
    // Correct logic:
    // 1. Copy page
    // 2. Remove original page
    // 3. Insert at new location (adjusting for removal if necessary)

    // Easier:
    // If toIndex > fromIndex: Insert at toIndex + 1, then remove fromIndex.
    // If toIndex < fromIndex: Insert at toIndex, then remove fromIndex + 1.

    if (fromIndex === toIndex) return pdfUrl;

    if (toIndex > fromIndex) {
        pdfDoc.insertPage(toIndex + 1, page);
        pdfDoc.removePage(fromIndex);
    } else {
        pdfDoc.insertPage(toIndex, page);
        pdfDoc.removePage(fromIndex + 1);
    }

    const pdfBytes = await pdfDoc.save();
    return URL.createObjectURL(new Blob([pdfBytes as any], { type: 'application/pdf' }));
}
