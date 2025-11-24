import React, { useState } from 'react';
import {
    Package, Play, Pause, CheckCircle, XCircle, Clock, Zap,
    FileText, Download, Trash2, Plus, Settings, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';

// Types
export interface BatchJob {
    id: string;
    name: string;
    files: BatchFile[];
    operations: BatchOperation[];
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
    progress: number;
    startedAt?: Date;
    completedAt?: Date;
    estimatedTimeRemaining?: number;
    errors: BatchError[];
}

export interface BatchFile {
    id: string;
    name: string;
    url: string;
    size: number;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    result?: any;
    error?: string;
}

export interface BatchOperation {
    type: 'preflight' | 'autofix' | 'convert-cmyk' | 'add-bleed' | 'embed-fonts' | 'optimize' | 'proof-generation';
    label: string;
    enabled: boolean;
    options?: any;
}

export interface BatchError {
    fileId: string;
    fileName: string;
    error: string;
    timestamp: Date;
}

export interface BatchProcessingProps {
    onStartBatch: (job: BatchJob) => void;
    onPauseBatch: (jobId: string) => void;
    onResumeBatch: (jobId: string) => void;
    onCancelBatch: (jobId: string) => void;
    onDownloadResults: (jobId: string) => void;
}

export const BatchProcessing: React.FC<BatchProcessingProps> = ({
    onStartBatch,
    onPauseBatch,
    onResumeBatch,
    onCancelBatch,
    onDownloadResults
}) => {
    const [activeJobs, setActiveJobs] = useState<BatchJob[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [jobName, setJobName] = useState('');
    const [operations, setOperations] = useState<BatchOperation[]>(DEFAULT_OPERATIONS);
    const [showSettings, setShowSettings] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const toggleOperation = (type: string) => {
        setOperations(ops =>
            ops.map(op =>
                op.type === type ? { ...op, enabled: !op.enabled } : op
            )
        );
    };

    const createBatchJob = () => {
        if (selectedFiles.length === 0) {
            alert('Please select files to process');
            return;
        }

        if (!jobName.trim()) {
            alert('Please enter a job name');
            return;
        }

        const job: BatchJob = {
            id: `batch-${Date.now()}`,
            name: jobName,
            files: selectedFiles.map((file, index) => ({
                id: `file-${index}`,
                name: file.name,
                url: URL.createObjectURL(file),
                size: file.size,
                status: 'queued',
                progress: 0
            })),
            operations: operations.filter(op => op.enabled),
            status: 'pending',
            progress: 0,
            errors: []
        };

        setActiveJobs([...activeJobs, job]);
        onStartBatch(job);

        // Reset form
        setSelectedFiles([]);
        setJobName('');
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-gray-500',
            processing: 'bg-blue-500',
            completed: 'bg-green-500',
            failed: 'bg-red-500',
            paused: 'bg-yellow-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle size={18} />;
            case 'failed':
                return <XCircle size={18} />;
            case 'processing':
                return <Zap size={18} className="animate-pulse" />;
            case 'paused':
                return <Pause size={18} />;
            default:
                return <Clock size={18} />;
        }
    };

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-text mb-2">Batch Processing</h1>
                <p className="text-muted">Process multiple files with automated workflows</p>
            </div>

            {/* Create New Batch Job */}
            <div className="p-6 bg-surface border border-border rounded-xl mb-6">
                <h2 className="text-xl font-bold text-text mb-4">Create Batch Job</h2>

                <div className="space-y-4">
                    {/* Job Name */}
                    <div>
                        <label className="block text-sm font-medium text-text mb-2">
                            Job Name
                        </label>
                        <input
                            type="text"
                            value={jobName}
                            onChange={(e) => setJobName(e.target.value)}
                            placeholder="e.g., Business Cards Batch"
                            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text"
                        />
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-text mb-2">
                            Select Files
                        </label>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                            <input
                                type="file"
                                multiple
                                accept=".pdf"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="batch-file-upload"
                            />
                            <label
                                htmlFor="batch-file-upload"
                                className="cursor-pointer inline-flex flex-col items-center"
                            >
                                <Package size={48} className="text-muted mb-3" />
                                <span className="text-text font-medium mb-1">
                                    Drop PDF files here or click to browse
                                </span>
                                <span className="text-sm text-muted">
                                    Select multiple files for batch processing
                                </span>
                            </label>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm font-medium text-text">
                                    {selectedFiles.length} file(s) selected
                                </p>
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-background rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText size={20} className="text-muted" />
                                            <div>
                                                <div className="text-sm font-medium text-text">{file.name}</div>
                                                <div className="text-xs text-muted">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                                            className="p-2 hover:bg-surface rounded-lg text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Operations */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-text">
                                Processing Operations
                            </label>
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="text-sm text-primary hover:text-primary/90 flex items-center gap-1"
                            >
                                <Settings size={16} />
                                Configure
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {operations.map(op => (
                                <button
                                    key={op.type}
                                    onClick={() => toggleOperation(op.type)}
                                    className={clsx(
                                        "p-4 border-2 rounded-lg text-left transition-all",
                                        op.enabled
                                            ? "border-primary bg-primary/10"
                                            : "border-border bg-background hover:border-primary/50"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-text">{op.label}</span>
                                        <div className={clsx(
                                            "w-5 h-5 rounded border-2 flex items-center justify-center",
                                            op.enabled ? "border-primary bg-primary" : "border-border"
                                        )}>
                                            {op.enabled && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted">
                                        {op.type === 'preflight' && 'Analyze PDF for issues'}
                                        {op.type === 'autofix' && 'Automatically fix common issues'}
                                        {op.type === 'convert-cmyk' && 'Convert RGB to CMYK'}
                                        {op.type === 'add-bleed' && 'Add 0.125" bleed'}
                                        {op.type === 'embed-fonts' && 'Embed all fonts'}
                                        {op.type === 'optimize' && 'Optimize file size'}
                                        {op.type === 'proof-generation' && 'Generate proof images'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={createBatchJob}
                            disabled={selectedFiles.length === 0 || !jobName.trim()}
                            className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Play size={20} />
                            Start Batch Processing
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Batch Jobs */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-text">Active Batch Jobs</h2>

                {activeJobs.length === 0 ? (
                    <div className="p-12 bg-surface border border-border rounded-xl text-center">
                        <Package size={48} className="mx-auto text-muted mb-3" />
                        <h3 className="text-lg font-bold text-text mb-2">No active batch jobs</h3>
                        <p className="text-muted">Create a new batch job to get started</p>
                    </div>
                ) : (
                    activeJobs.map(job => (
                        <div
                            key={job.id}
                            className="p-6 bg-surface border border-border rounded-xl"
                        >
                            {/* Job Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-text">{job.name}</h3>
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-white text-sm font-medium flex items-center gap-2",
                                            getStatusColor(job.status)
                                        )}>
                                            {getStatusIcon(job.status)}
                                            {job.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted">
                                        {job.files.length} files • {job.operations.length} operations
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {job.status === 'processing' && (
                                        <button
                                            onClick={() => onPauseBatch(job.id)}
                                            className="p-2 hover:bg-background rounded-lg text-muted hover:text-text"
                                            title="Pause"
                                        >
                                            <Pause size={20} />
                                        </button>
                                    )}
                                    {job.status === 'paused' && (
                                        <button
                                            onClick={() => onResumeBatch(job.id)}
                                            className="p-2 hover:bg-background rounded-lg text-muted hover:text-text"
                                            title="Resume"
                                        >
                                            <Play size={20} />
                                        </button>
                                    )}
                                    {job.status === 'completed' && (
                                        <button
                                            onClick={() => onDownloadResults(job.id)}
                                            className="p-2 hover:bg-background rounded-lg text-green-500"
                                            title="Download results"
                                        >
                                            <Download size={20} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onCancelBatch(job.id)}
                                        className="p-2 hover:bg-background rounded-lg text-red-500"
                                        title="Cancel"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-text">
                                        Overall Progress: {job.progress}%
                                    </span>
                                    {job.estimatedTimeRemaining && (
                                        <span className="text-sm text-muted">
                                            Est. {formatTime(job.estimatedTimeRemaining)} remaining
                                        </span>
                                    )}
                                </div>
                                <div className="h-2 bg-background rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${job.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* File List */}
                            <div className="space-y-2">
                                {job.files.map(file => (
                                    <div
                                        key={file.id}
                                        className="p-3 bg-background rounded-lg flex items-center justify-between"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-text">{file.name}</span>
                                                <span className={clsx(
                                                    "px-2 py-0.5 rounded text-xs font-medium",
                                                    file.status === 'completed' && "bg-green-500/20 text-green-500",
                                                    file.status === 'processing' && "bg-blue-500/20 text-blue-500",
                                                    file.status === 'failed' && "bg-red-500/20 text-red-500",
                                                    file.status === 'queued' && "bg-gray-500/20 text-gray-500"
                                                )}>
                                                    {file.status}
                                                </span>
                                            </div>
                                            {file.status === 'processing' && (
                                                <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all duration-300"
                                                        style={{ width: `${file.progress}%` }}
                                                    />
                                                </div>
                                            )}
                                            {file.error && (
                                                <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                                                    <AlertCircle size={12} />
                                                    {file.error}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Errors */}
                            {job.errors.length > 0 && (
                                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <h4 className="font-medium text-red-500 mb-2">
                                        {job.errors.length} Error(s)
                                    </h4>
                                    <div className="space-y-1">
                                        {job.errors.map((error, index) => (
                                            <div key={index} className="text-sm text-red-500">
                                                <strong>{error.fileName}:</strong> {error.error}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Default operations
const DEFAULT_OPERATIONS: BatchOperation[] = [
    { type: 'preflight', label: 'Pre-flight Analysis', enabled: true },
    { type: 'autofix', label: 'Auto-fix Issues', enabled: true },
    { type: 'convert-cmyk', label: 'Convert to CMYK', enabled: false },
    { type: 'add-bleed', label: 'Add Bleed', enabled: false },
    { type: 'embed-fonts', label: 'Embed Fonts', enabled: false },
    { type: 'optimize', label: 'Optimize File Size', enabled: false },
    { type: 'proof-generation', label: 'Generate Proofs', enabled: false }
];
