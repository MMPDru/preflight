import React, { useState } from 'react';
import { MessageSquare, Send, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export interface Comment {
    id: string;
    annotationId: string;
    author: string;
    content: string;
    timestamp: Date;
    mentions?: string[];
}

interface CommentThreadProps {
    annotationId: string;
    comments: Comment[];
    onAddComment: (content: string, mentions: string[]) => void;
    onClose: () => void;
    position?: { x: number; y: number };
}

export const CommentThread: React.FC<CommentThreadProps> = ({
    annotationId,
    comments,
    onAddComment,
    onClose,
    position
}) => {
    const [newComment, setNewComment] = useState('');
    const [mentions, setMentions] = useState<string[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(newComment, mentions);
            setNewComment('');
            setMentions([]);
        }
    };

    const extractMentions = (text: string): string[] => {
        const mentionRegex = /@(\w+)/g;
        const matches = text.match(mentionRegex);
        return matches ? matches.map(m => m.substring(1)) : [];
    };

    const handleTextChange = (text: string) => {
        setNewComment(text);
        setMentions(extractMentions(text));
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bg-surface border border-border rounded-lg shadow-2xl w-96 max-h-[500px] flex flex-col z-50"
            style={position ? { left: position.x, top: position.y } : { right: 20, bottom: 20 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-primary" />
                    <h3 className="font-semibold text-text">Comments</h3>
                    <span className="text-xs text-muted">({comments.length})</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-background rounded-md transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center text-muted text-sm py-8">
                        No comments yet. Start the conversation!
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="space-y-2">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <User size={16} className="text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-medium text-text text-sm">{comment.author}</span>
                                        <span className="text-xs text-muted">
                                            {new Date(comment.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text mt-1 whitespace-pre-wrap break-words">
                                        {comment.content}
                                    </p>
                                    {comment.mentions && comment.mentions.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {comment.mentions.map(mention => (
                                                <span
                                                    key={mention}
                                                    className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                                                >
                                                    @{mention}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border">
                <div className="flex gap-2">
                    <textarea
                        value={newComment}
                        onChange={(e) => handleTextChange(e.target.value)}
                        placeholder="Add a comment... (use @name to mention)"
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-text placeholder-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                        rows={2}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className={clsx(
                            "px-3 py-2 rounded-lg transition-colors shrink-0",
                            newComment.trim()
                                ? "bg-primary text-white hover:bg-primary/90"
                                : "bg-surface text-muted cursor-not-allowed"
                        )}
                    >
                        <Send size={18} />
                    </button>
                </div>
                {mentions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-xs text-muted">Mentioning:</span>
                        {mentions.map(mention => (
                            <span
                                key={mention}
                                className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                            >
                                @{mention}
                            </span>
                        ))}
                    </div>
                )}
            </form>
        </motion.div>
    );
};
