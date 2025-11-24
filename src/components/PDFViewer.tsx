import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { AnnotationToolbar, type AnnotationTool } from './AnnotationToolbar';
import { CanvasOverlay, type DrawingAnnotation } from './CanvasOverlay';
import { MeasurementOverlay } from './MeasurementOverlay';
import clsx from 'clsx';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    fileUrl: string;
    annotations?: { id: string; x: number; y: number; page: number; content: string }[];
    drawingAnnotations?: DrawingAnnotation[];
    onPageClick?: (page: number, x: number, y: number) => void;
    onPageChange?: (page: number) => void;
    onAddDrawingAnnotation?: (annotation: DrawingAnnotation) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
    fileUrl,
    annotations = [],
    drawingAnnotations = [],
    onPageClick,
    onPageChange,
    onAddDrawingAnnotation
}) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [rotation, setRotation] = useState<number>(0);
    const [selectedTool, setSelectedTool] = useState<AnnotationTool>('select');
    const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => {
            const newPage = Math.min(Math.max(prevPageNumber + offset, 1), numPages);
            onPageChange?.(newPage);
            return newPage;
        });
    };

    const handlePageLoadSuccess = (page: any) => {
        setPageDimensions({ width: page.originalWidth, height: page.originalHeight });
    };

    return (
        <div className="flex flex-col h-full bg-surface/30 rounded-xl overflow-hidden border border-border">
            {/* Toolbar */}
            <div className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 gap-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => changePage(-1)}
                        disabled={pageNumber <= 1}
                        className="p-2 hover:bg-background rounded-lg disabled:opacity-50 transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-medium w-24 text-center">
                        Page {pageNumber} of {numPages}
                    </span>
                    <button
                        onClick={() => changePage(1)}
                        disabled={pageNumber >= numPages}
                        className="p-2 hover:bg-background rounded-lg disabled:opacity-50 transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                <AnnotationToolbar selectedTool={selectedTool} onToolSelect={setSelectedTool} />

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                        title="Rotate"
                    >
                        <RotateCw size={20} />
                    </button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <button
                        onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                    >
                        <ZoomOut size={20} />
                    </button>
                    <span className="text-sm font-medium w-16 text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={() => setScale(prev => Math.min(prev + 0.1, 3.0))}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                    >
                        <ZoomIn size={20} />
                    </button>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 overflow-auto p-8 flex justify-center bg-background/50 relative">
                <div className="shadow-2xl relative">
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className="flex flex-col items-center"
                    >
                        <div className="relative">
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                rotate={rotation}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                onLoadSuccess={handlePageLoadSuccess}
                                onClick={(e) => {
                                    if (selectedTool !== 'select' || !onPageClick) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = (e.clientX - rect.left) / scale;
                                    const y = (e.clientY - rect.top) / scale;
                                    onPageClick(pageNumber, x, y);
                                }}
                                className={clsx(selectedTool === 'select' ? "cursor-crosshair" : "cursor-default")}
                            />

                            {/* Canvas Overlay for Drawing */}
                            {pageDimensions && (
                                <>
                                    <CanvasOverlay
                                        width={pageDimensions.width * scale}
                                        height={pageDimensions.height * scale}
                                        scale={scale}
                                        page={pageNumber}
                                        tool={selectedTool}
                                        annotations={drawingAnnotations}
                                        onAddAnnotation={(ann) => onAddDrawingAnnotation?.(ann)}
                                    />
                                    <MeasurementOverlay
                                        width={pageDimensions.width * scale}
                                        height={pageDimensions.height * scale}
                                        scale={scale}
                                        active={selectedTool === 'measure'}
                                    />
                                </>
                            )}

                            {/* Existing Pin Annotations */}
                            {annotations.filter(a => a.page === pageNumber).map((annotation) => (
                                <div
                                    key={annotation.id}
                                    className="absolute w-6 h-6 -ml-3 -mt-3 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold z-20 pointer-events-none"
                                    style={{
                                        left: annotation.x * scale,
                                        top: annotation.y * scale,
                                    }}
                                >
                                    {annotation.id}
                                </div>
                            ))}
                        </div>
                    </Document>
                </div>
            </div>
        </div>
    );
};

