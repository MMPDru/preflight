import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface AddAnnotationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (content: string) => void;
    x: number;
    y: number;
}

export const AddAnnotationDialog: React.FC<AddAnnotationDialogProps> = ({ isOpen, onClose, onSubmit, x, y }) => {
    const [content, setContent] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen) {
            setContent('');
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content);
            onClose();
        }
    };

    // Calculate position to keep it on screen (simplified)
    const style = {
        left: Math.min(window.innerWidth - 320, Math.max(20, x)),
        top: Math.min(window.innerHeight - 200, Math.max(20, y)),
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-start" onClick={onClose}>
            {/* Backdrop is transparent but catches clicks */}
            <div
                className="absolute bg-surface border border-border rounded-lg shadow-xl p-4 w-80 animate-in fade-in zoom-in-95 duration-200"
                style={{ left: x, top: y }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-text">Add Comment</h3>
                    <button onClick={onClose} className="text-muted hover:text-text">
                        <X size={16} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <textarea
                        ref={inputRef}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full h-24 bg-background border border-border rounded-md p-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-primary resize-none mb-3"
                        placeholder="Type your comment here..."
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs font-medium text-muted hover:text-text transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!content.trim()}
                            className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            Add Note
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
