import React from 'react';
import { MousePointer2, Square, Circle, Highlighter, PenTool, Ruler } from 'lucide-react';
import clsx from 'clsx';

export type AnnotationTool = 'select' | 'rect' | 'circle' | 'highlight' | 'pen' | 'measure';

interface AnnotationToolbarProps {
    selectedTool: AnnotationTool;
    onToolSelect: (tool: AnnotationTool) => void;
}

export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({ selectedTool, onToolSelect }) => {
    const tools: { id: AnnotationTool; icon: React.ElementType; label: string }[] = [
        { id: 'select', icon: MousePointer2, label: 'Select' },
        { id: 'measure', icon: Ruler, label: 'Measure' },
        { id: 'rect', icon: Square, label: 'Rectangle' },
        { id: 'circle', icon: Circle, label: 'Circle' },
        { id: 'highlight', icon: Highlighter, label: 'Highlight' },
        { id: 'pen', icon: PenTool, label: 'Pen' },
    ];

    return (
        <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1 shadow-sm">
            {tools.map(tool => (
                <button
                    key={tool.id}
                    onClick={() => onToolSelect(tool.id)}
                    className={clsx(
                        "p-2 rounded-md transition-colors flex items-center justify-center",
                        selectedTool === tool.id
                            ? "bg-primary text-white shadow-sm"
                            : "text-muted hover:text-text hover:bg-background"
                    )}
                    title={tool.label}
                >
                    <tool.icon size={18} />
                </button>
            ))}
        </div>
    );
};
