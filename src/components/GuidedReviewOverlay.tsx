import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronRight, ChevronLeft, Flag, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

interface ReviewItem {
    id: string;
    title: string;
    description: string;
    page: number;
    status: 'pending' | 'approved' | 'flagged';
    coordinates?: { x: number; y: number };
}

interface GuidedReviewOverlayProps {
    items: ReviewItem[];
    onNavigate: (page: number, x?: number, y?: number) => void;
    onComplete: () => void;
}

export const GuidedReviewOverlay: React.FC<GuidedReviewOverlayProps> = ({
    items: initialItems,
    onNavigate,
    onComplete
}) => {
    const [items, setItems] = useState<ReviewItem[]>(initialItems);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentItem = items[currentIndex];
    const progress = Math.round((items.filter(i => i.status === 'approved').length / items.length) * 100);

    const handleNext = () => {
        if (currentIndex < items.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            const nextItem = items[nextIndex];
            onNavigate(nextItem.page, nextItem.coordinates?.x, nextItem.coordinates?.y);
        } else {
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            setCurrentIndex(prevIndex);
            const prevItem = items[prevIndex];
            onNavigate(prevItem.page, prevItem.coordinates?.x, prevItem.coordinates?.y);
        }
    };

    const handleStatusChange = (status: 'approved' | 'flagged') => {
        const newItems = [...items];
        newItems[currentIndex].status = status;
        setItems(newItems);

        if (status === 'approved') {
            handleNext();
        }
    };

    return (
        <div className="absolute top-4 right-4 w-80 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100%-2rem)] z-30">
            {/* Header */}
            <div className="p-4 border-b border-border bg-background">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-text">Guided Review</h3>
                    <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {currentIndex + 1} of {items.length}
                    </span>
                </div>
                <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Current Item */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-text mb-2">{currentItem.title}</h4>
                    <p className="text-muted text-sm leading-relaxed">{currentItem.description}</p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => handleStatusChange('approved')}
                        className={clsx(
                            "w-full py-3 px-4 rounded-lg border transition-all flex items-center justify-between group",
                            currentItem.status === 'approved'
                                ? "bg-green-500/10 border-green-500 text-green-500"
                                : "bg-background border-border hover:border-green-500 hover:text-green-500"
                        )}
                    >
                        <span className="font-medium">Approve Item</span>
                        <CheckCircle size={20} className={currentItem.status === 'approved' ? "fill-current" : ""} />
                    </button>

                    <button
                        onClick={() => handleStatusChange('flagged')}
                        className={clsx(
                            "w-full py-3 px-4 rounded-lg border transition-all flex items-center justify-between group",
                            currentItem.status === 'flagged'
                                ? "bg-red-500/10 border-red-500 text-red-500"
                                : "bg-background border-border hover:border-red-500 hover:text-red-500"
                        )}
                    >
                        <span className="font-medium">Flag Issue</span>
                        <Flag size={20} className={currentItem.status === 'flagged' ? "fill-current" : ""} />
                    </button>

                    <button className="w-full py-3 px-4 rounded-lg border border-border bg-background hover:bg-surface text-muted hover:text-text transition-colors flex items-center justify-between">
                        <span className="font-medium">Add Comment</span>
                        <MessageSquare size={20} />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className="p-4 border-t border-border bg-background flex justify-between items-center">
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-lg hover:bg-surface text-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="flex gap-1">
                    {items.map((item, idx) => (
                        <div
                            key={item.id}
                            className={clsx(
                                "w-2 h-2 rounded-full transition-colors",
                                idx === currentIndex ? "bg-primary" :
                                    item.status === 'approved' ? "bg-green-500" :
                                        item.status === 'flagged' ? "bg-red-500" :
                                            "bg-border"
                            )}
                        />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    className="p-2 rounded-lg hover:bg-surface text-muted hover:text-primary transition-colors"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};
