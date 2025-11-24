import React, { useState } from 'react';
import { X } from 'lucide-react';

interface MetadataFixDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (title: string, author: string) => void;
}

export const MetadataFixDialog: React.FC<MetadataFixDialogProps> = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(title, author);
        setTitle('');
        setAuthor('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={onClose}>
            <div
                className="bg-surface border border-border rounded-xl p-6 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-text">Fix Document Metadata</h3>
                    <button onClick={onClose} className="text-muted hover:text-text">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text mb-2">
                            Document Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter document title..."
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-2">
                            Document Author
                        </label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="Enter author name..."
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-background hover:bg-surface border border-border rounded-lg text-text transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
                        >
                            Apply Fix
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
