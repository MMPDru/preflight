import React, { useState } from 'react';
import { History, Eye, Download, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export interface Revision {
    id: string;
    version: number;
    timestamp: Date;
    author: string;
    changes: string;
    fileUrl: string;
}

interface RevisionHistoryProps {
    revisions: Revision[];
    currentRevision: string;
    onSelectRevision: (revisionId: string) => void;
    onCompareRevisions: (rev1: string, rev2: string) => void;
    onDeleteRevision?: (revisionId: string) => void;
}

export const RevisionHistory: React.FC<RevisionHistoryProps> = ({
    revisions,
    currentRevision,
    onSelectRevision,
    onCompareRevisions,
    onDeleteRevision
}) => {
    const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

    const toggleComparisonSelection = (revisionId: string) => {
        setSelectedForComparison(prev => {
            if (prev.includes(revisionId)) {
                return prev.filter(id => id !== revisionId);
            }
            if (prev.length >= 2) {
                return [prev[1], revisionId];
            }
            return [...prev, revisionId];
        });
    };

    const handleCompare = () => {
        if (selectedForComparison.length === 2) {
            onCompareRevisions(selectedForComparison[0], selectedForComparison[1]);
        }
    };

    return (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History size={20} className="text-primary" />
                    <h3 className="font-semibold text-text">Revision History</h3>
                </div>
                {selectedForComparison.length === 2 && (
                    <button
                        onClick={handleCompare}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        Compare Selected
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {revisions.map((revision, index) => {
                    const isCurrent = revision.id === currentRevision;
                    const isSelected = selectedForComparison.includes(revision.id);

                    return (
                        <div
                            key={revision.id}
                            className={clsx(
                                "border rounded-lg p-4 transition-all",
                                isCurrent ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30",
                                isSelected && "ring-2 ring-primary/50"
                            )}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-semibold text-text">
                                            Version {revision.version}
                                        </span>
                                        {isCurrent && (
                                            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full">
                                                Current
                                            </span>
                                        )}
                                        {index === 0 && (
                                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                                                Latest
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-muted mb-1">
                                        By {revision.author} • {new Date(revision.timestamp).toLocaleString()}
                                    </p>

                                    <p className="text-sm text-text">{revision.changes}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleComparisonSelection(revision.id)}
                                        className={clsx(
                                            "p-2 rounded-md text-sm font-medium transition-colors",
                                            isSelected
                                                ? "bg-primary text-white"
                                                : "bg-background text-text hover:bg-surface border border-border"
                                        )}
                                        title="Select for comparison"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => { }}
                                            className="pointer-events-none"
                                        />
                                    </button>
                                    <button
                                        onClick={() => onSelectRevision(revision.id)}
                                        className="p-2 bg-background text-text rounded-md hover:bg-surface transition-colors border border-border"
                                        title="View this version"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <a
                                        href={revision.fileUrl}
                                        download
                                        className="p-2 bg-background text-text rounded-md hover:bg-surface transition-colors border border-border"
                                        title="Download"
                                    >
                                        <Download size={16} />
                                    </a>
                                    {onDeleteRevision && !isCurrent && (
                                        <button
                                            onClick={() => onDeleteRevision(revision.id)}
                                            className="p-2 bg-background text-red-400 rounded-md hover:bg-red-400/10 transition-colors border border-border"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
