import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFViewer } from '../components/PDFViewer';
import { GuidedReviewOverlay } from '../components/GuidedReviewOverlay';
import { ArrowLeft } from 'lucide-react';

const MOCK_REVIEW_ITEMS = [
    {
        id: '1',
        title: 'Check Bleed Area',
        description: 'Ensure the background image extends 3mm beyond the trim line on all sides.',
        page: 1,
        status: 'pending' as const,
        coordinates: { x: 100, y: 100 }
    },
    {
        id: '2',
        title: 'Verify Logo Placement',
        description: 'The logo should be at least 10mm from the edge and centered horizontally.',
        page: 1,
        status: 'pending' as const,
        coordinates: { x: 300, y: 50 }
    },
    {
        id: '3',
        title: 'Color Profile Check',
        description: 'Confirm that all images are converted to CMYK for print.',
        page: 2,
        status: 'pending' as const
    }
];

export const ReviewSession = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);

    // In a real app, we'd fetch session details here. 
    // For now, we assume it's a guided session if the ID starts with 'guided'.
    const isGuided = sessionId?.startsWith('guided');

    const handleNavigate = (page: number, x?: number, y?: number) => {
        setCurrentPage(page);
        // In a real implementation, we would also scroll/zoom to x,y
        console.log(`Navigating to page ${page}, coordinates: ${x}, ${y}`);
    };

    const handleComplete = () => {
        alert('Review Session Completed!');
        navigate('/reviews');
    };

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/reviews')}
                        className="p-2 hover:bg-background rounded-lg text-muted hover:text-text transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-text">Review Session</h1>
                        <p className="text-xs text-muted">ID: {sessionId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {isGuided ? 'Guided Mode' : 'Standard Review'}
                    </span>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 relative overflow-hidden">
                <PDFViewer
                    fileUrl="https://pdfobject.com/pdf/sample.pdf" // Using sample PDF for demo
                    onPageChange={setCurrentPage}
                />

                {isGuided && (
                    <GuidedReviewOverlay
                        items={MOCK_REVIEW_ITEMS}
                        onNavigate={handleNavigate}
                        onComplete={handleComplete}
                    />
                )}
            </div>
        </div>
    );
};
