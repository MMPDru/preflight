import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, Eye, Trash2, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export interface Job {
    id: string;
    fileName: string;
    status: 'pending' | 'processing' | 'ready' | 'approved' | 'error';
    uploadedAt: Date;
    fileSize: number;
    thumbnail?: string;
    errorCount?: number;
    warningCount?: number;
}

interface JobCardProps {
    job: Job;
    onDelete?: (id: string) => void;
    onDuplicate?: (id: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onDelete, onDuplicate }) => {
    const navigate = useNavigate();

    const statusConfig = {
        pending: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Pending', icon: Clock },
        processing: { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Processing', icon: Clock },
        ready: { color: 'text-green-400', bg: 'bg-green-400/10', label: 'Ready', icon: CheckCircle },
        approved: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Approved', icon: CheckCircle },
        error: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Error', icon: AlertCircle },
    };

    const config = statusConfig[job.status];
    const StatusIcon = config.icon;

    return (
        <div className="group bg-surface border border-border rounded-lg p-4 hover:border-primary/30 transition-all duration-200 hover:shadow-lg">
            <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-20 bg-background rounded-lg flex items-center justify-center shrink-0 border border-border">
                    {job.thumbnail ? (
                        <img src={job.thumbnail} alt={job.fileName} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <FileText size={32} className="text-muted" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-text truncate">{job.fileName}</h3>
                        <div className={clsx('flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium shrink-0', config.bg, config.color)}>
                            <StatusIcon size={12} />
                            {config.label}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted mb-3">
                        <span>{(job.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        <span>•</span>
                        <span>{new Date(job.uploadedAt).toLocaleDateString()}</span>
                        {(job.errorCount || job.warningCount) && (
                            <>
                                <span>•</span>
                                <div className="flex items-center gap-2">
                                    {job.errorCount && job.errorCount > 0 && (
                                        <span className="text-red-400">{job.errorCount} errors</span>
                                    )}
                                    {job.warningCount && job.warningCount > 0 && (
                                        <span className="text-yellow-400">{job.warningCount} warnings</span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => navigate(`/editor/${job.id}`, { state: { fileName: job.fileName } })}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
                        >
                            <Eye size={14} />
                            View
                        </button>
                        {onDuplicate && (
                            <button
                                onClick={() => onDuplicate(job.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-background text-text rounded-md text-xs font-medium hover:bg-surface transition-colors border border-border"
                            >
                                <Copy size={14} />
                                Duplicate
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(job.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-background text-red-400 rounded-md text-xs font-medium hover:bg-red-400/10 transition-colors border border-border"
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
