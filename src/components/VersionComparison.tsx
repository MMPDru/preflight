import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import clsx from 'clsx';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface VersionComparisonProps {
    originalUrl: string;
    revisedUrl: string;
    onClose: () => void;
}

export const VersionComparison: React.FC<VersionComparisonProps> = ({
    originalUrl,
    revisedUrl,
    onClose
}) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(0.8);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const changePage = (offset: number) => {
        setPageNumber(prev => Math.min(Math.max(prev + offset, 1), numPages));
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
            {/* Header */}
            <div className="bg-surface border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-text">Version Comparison</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => changePage(-1)}
                            disabled={pageNumber <= 1}
                            className="p-2 hover:bg-background rounded-lg disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-sm font-medium w-32 text-center">
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
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
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
                            onClick={() => setScale(prev => Math.min(prev + 0.1, 2.0))}
                            className="p-2 hover:bg-background rounded-lg transition-colors"
                        >
                            <ZoomIn size={20} />
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Comparison View */}
            <div className="flex-1 overflow-hidden flex">
                {/* Original */}
                <div className="flex-1 flex flex-col border-r border-border">
                    <div className="bg-surface/50 p-2 text-center border-b border-border">
                        <span className="text-sm font-medium text-muted">Original</span>
                    </div>
                    <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-background/50">
                        <Document
                            file={originalUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="shadow-2xl"
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </Document>
                    </div>
                </div>

                {/* Revised */}
                <div className="flex-1 flex flex-col">
                    <div className="bg-surface/50 p-2 text-center border-b border-border">
                        <span className="text-sm font-medium text-muted">Revised</span>
                    </div>
                    <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-background/50">
                        <Document
                            file={revisedUrl}
                            className="shadow-2xl"
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </Document>
                    </div>
                </div>
            </div>
        </div>
    );
};
