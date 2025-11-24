import React, { useState, useRef, useEffect } from 'react';
import {
    ZoomIn, ZoomOut, RotateCw, Maximize2, Grid, Eye, EyeOff,
    ArrowLeftRight, ChevronLeft, ChevronRight, Download, Layers
} from 'lucide-react';
import clsx from 'clsx';

// Types
export interface ComparisonVersion {
    id: string;
    name: string;
    url: string;
    uploadedAt: Date;
    uploadedBy: string;
    changes?: string[];
}

export interface SideBySideComparisonProps {
    versions: ComparisonVersion[];
    onVersionSelect?: (versionId: string) => void;
    onDownload?: (versionId: string) => void;
}

export const SideBySideComparison: React.FC<SideBySideComparisonProps> = ({
    versions,
    onVersionSelect,
    onDownload
}) => {
    const [leftVersion, setLeftVersion] = useState<ComparisonVersion | null>(
        versions.length > 1 ? versions[versions.length - 2] : null
    );
    const [rightVersion, setRightVersion] = useState<ComparisonVersion | null>(
        versions[versions.length - 1] || null
    );
    const [zoom, setZoom] = useState(100);
    const [viewMode, setViewMode] = useState<'split' | 'overlay' | 'slider'>('split');
    const [showDifferences, setShowDifferences] = useState(true);
    const [sliderPosition, setSliderPosition] = useState(50);
    const [overlayOpacity, setOverlayOpacity] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages] = useState(1); // Would be dynamic in real implementation

    const leftCanvasRef = useRef<HTMLCanvasElement>(null);
    const rightCanvasRef = useRef<HTMLCanvasElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 400));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
    const handleResetZoom = () => setZoom(100);

    const handleSliderDrag = (e: React.MouseEvent) => {
        if (!sliderRef.current) return;

        const rect = sliderRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setSliderPosition(Math.max(0, Math.min(100, percentage)));
    };

    const swapVersions = () => {
        const temp = leftVersion;
        setLeftVersion(rightVersion);
        setRightVersion(temp);
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Toolbar */}
            <div className="p-4 bg-surface border-b border-border">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Version Selectors */}
                    <div className="flex items-center gap-4">
                        <div>
                            <label className="text-xs text-muted mb-1 block">Before</label>
                            <select
                                value={leftVersion?.id || ''}
                                onChange={(e) => {
                                    const version = versions.find(v => v.id === e.target.value);
                                    if (version) setLeftVersion(version);
                                }}
                                className="px-3 py-2 border border-border rounded-lg bg-background text-text text-sm"
                            >
                                <option value="">Select version...</option>
                                {versions.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.name} - {new Date(v.uploadedAt).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={swapVersions}
                            className="mt-5 p-2 hover:bg-background rounded-lg text-muted hover:text-text"
                            title="Swap versions"
                        >
                            <ArrowLeftRight size={20} />
                        </button>

                        <div>
                            <label className="text-xs text-muted mb-1 block">After</label>
                            <select
                                value={rightVersion?.id || ''}
                                onChange={(e) => {
                                    const version = versions.find(v => v.id === e.target.value);
                                    if (version) setRightVersion(version);
                                }}
                                className="px-3 py-2 border border-border rounded-lg bg-background text-text text-sm"
                            >
                                <option value="">Select version...</option>
                                {versions.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.name} - {new Date(v.uploadedAt).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* View Mode */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('split')}
                            className={clsx(
                                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                viewMode === 'split'
                                    ? "bg-primary text-white"
                                    : "bg-surface text-muted hover:text-text"
                            )}
                        >
                            <Grid size={16} className="inline mr-2" />
                            Split
                        </button>
                        <button
                            onClick={() => setViewMode('overlay')}
                            className={clsx(
                                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                viewMode === 'overlay'
                                    ? "bg-primary text-white"
                                    : "bg-surface text-muted hover:text-text"
                            )}
                        >
                            <Layers size={16} className="inline mr-2" />
                            Overlay
                        </button>
                        <button
                            onClick={() => setViewMode('slider')}
                            className={clsx(
                                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                viewMode === 'slider'
                                    ? "bg-primary text-white"
                                    : "bg-surface text-muted hover:text-text"
                            )}
                        >
                            <ArrowLeftRight size={16} className="inline mr-2" />
                            Slider
                        </button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleZoomOut}
                            className="p-2 hover:bg-background rounded-lg text-muted hover:text-text"
                            title="Zoom out"
                        >
                            <ZoomOut size={20} />
                        </button>
                        <div className="px-3 py-2 bg-background rounded-lg text-text min-w-[70px] text-center">
                            {zoom}%
                        </div>
                        <button
                            onClick={handleZoomIn}
                            className="p-2 hover:bg-background rounded-lg text-muted hover:text-text"
                            title="Zoom in"
                        >
                            <ZoomIn size={20} />
                        </button>
                        <button
                            onClick={handleResetZoom}
                            className="p-2 hover:bg-background rounded-lg text-muted hover:text-text"
                            title="Reset zoom"
                        >
                            <Maximize2 size={20} />
                        </button>
                    </div>

                    {/* Difference Toggle */}
                    <button
                        onClick={() => setShowDifferences(!showDifferences)}
                        className={clsx(
                            "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2",
                            showDifferences
                                ? "bg-yellow-500/20 text-yellow-500"
                                : "bg-surface text-muted"
                        )}
                    >
                        {showDifferences ? <Eye size={16} /> : <EyeOff size={16} />}
                        {showDifferences ? 'Hide' : 'Show'} Differences
                    </button>
                </div>
            </div>

            {/* Comparison View */}
            <div className="flex-1 overflow-auto p-6">
                {viewMode === 'split' && (
                    <div className="grid grid-cols-2 gap-6 h-full">
                        {/* Left Version */}
                        <div className="border-2 border-border rounded-xl overflow-hidden bg-white">
                            <div className="p-3 bg-surface border-b border-border">
                                <h3 className="font-bold text-text">{leftVersion?.name || 'No version selected'}</h3>
                                {leftVersion && (
                                    <p className="text-xs text-muted">
                                        {new Date(leftVersion.uploadedAt).toLocaleString()} • {leftVersion.uploadedBy}
                                    </p>
                                )}
                            </div>
                            <div className="relative" style={{ height: 'calc(100% - 60px)' }}>
                                {leftVersion ? (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                                    >
                                        <canvas
                                            ref={leftCanvasRef}
                                            className="max-w-full max-h-full"
                                        />
                                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">📄</div>
                                                <div className="text-sm text-muted">PDF Preview</div>
                                                <div className="text-xs text-muted">{leftVersion.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted">
                                        Select a version to compare
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Version */}
                        <div className="border-2 border-border rounded-xl overflow-hidden bg-white">
                            <div className="p-3 bg-surface border-b border-border">
                                <h3 className="font-bold text-text">{rightVersion?.name || 'No version selected'}</h3>
                                {rightVersion && (
                                    <p className="text-xs text-muted">
                                        {new Date(rightVersion.uploadedAt).toLocaleString()} • {rightVersion.uploadedBy}
                                    </p>
                                )}
                            </div>
                            <div className="relative" style={{ height: 'calc(100% - 60px)' }}>
                                {rightVersion ? (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                                    >
                                        <canvas
                                            ref={rightCanvasRef}
                                            className="max-w-full max-h-full"
                                        />
                                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">📄</div>
                                                <div className="text-sm text-muted">PDF Preview</div>
                                                <div className="text-xs text-muted">{rightVersion.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted">
                                        Select a version to compare
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'overlay' && (
                    <div className="relative border-2 border-border rounded-xl overflow-hidden bg-white h-full">
                        <div className="p-3 bg-surface border-b border-border">
                            <h3 className="font-bold text-text">Overlay Comparison</h3>
                            <div className="mt-2">
                                <label className="text-xs text-muted block mb-1">Opacity: {overlayOpacity}%</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={overlayOpacity}
                                    onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="relative" style={{ height: 'calc(100% - 120px)' }}>
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🔍</div>
                                    <div className="text-sm text-muted">Overlay View</div>
                                    <div className="text-xs text-muted">
                                        {leftVersion?.name} + {rightVersion?.name}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {viewMode === 'slider' && (
                    <div className="relative border-2 border-border rounded-xl overflow-hidden bg-white h-full">
                        <div className="p-3 bg-surface border-b border-border">
                            <h3 className="font-bold text-text">Slider Comparison</h3>
                            <p className="text-xs text-muted">Drag the slider to compare versions</p>
                        </div>
                        <div
                            ref={sliderRef}
                            className="relative cursor-ew-resize"
                            style={{ height: 'calc(100% - 70px)' }}
                            onMouseMove={handleSliderDrag}
                        >
                            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">↔️</div>
                                    <div className="text-sm text-muted">Slider View</div>
                                    <div className="text-xs text-muted">
                                        Drag to compare {leftVersion?.name} and {rightVersion?.name}
                                    </div>
                                </div>
                            </div>
                            {/* Slider line */}
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize"
                                style={{ left: `${sliderPosition}%` }}
                            >
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-16 bg-primary rounded-full flex items-center justify-center">
                                    <ArrowLeftRight size={20} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Changes List */}
            {(leftVersion || rightVersion) && (
                <div className="p-4 bg-surface border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-text">Detected Changes</h3>
                        <div className="flex items-center gap-2">
                            {/* Page Navigation */}
                            <button className="p-2 hover:bg-background rounded-lg">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm text-muted px-3">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button className="p-2 hover:bg-background rounded-lg">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    {rightVersion?.changes && rightVersion.changes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {rightVersion.changes.map((change, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                                        <span className="text-sm text-text">{change}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-muted">
                            <Eye size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No changes detected</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
