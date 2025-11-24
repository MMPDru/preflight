import React, { useState } from 'react';
import { PreflightReport, type PreflightCheck } from './PreflightReport';
import { FileText, Layers, Box, AlertCircle, Settings, Edit, Eye, RotateCw, Trash2, MessageSquare, ArrowUp, ArrowDown, Image as ImageIcon, Type } from 'lucide-react';
import { type PageObject, type PageGeometry, type Layer } from '../lib/preflight-engine';

interface Annotation {
    id: string;
    x: number;
    y: number;
    page: number;
    content: string;
}

interface InspectorPanelProps {
    checks: PreflightCheck[];
    pageInfo: { width: number; height: number; rotation: number } | null;
    onRotatePage: () => void;
    onDeletePage: () => void;
    onMovePageUp: () => void;
    onMovePageDown: () => void;
    onFixBleed: () => void;
    annotations: any[];
    currentPage: number;
    pageObjects: any[];
    pageGeometry: any;
    layers: any[];
    onFix?: (checkId: string) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
    checks,
    pageInfo,
    onRotatePage,
    onDeletePage,
    onMovePageUp,
    onMovePageDown,
    onFixBleed,
    annotations,
    currentPage,
    pageObjects,
    pageGeometry,
    layers,
    onFix
}) => {
    const [activeTab, setActiveTab] = useState<'preflight' | 'inspect' | 'edit' | 'comments' | 'layers'>('preflight');

    return (
        <div className="w-80 flex flex-col bg-surface border-l border-border h-full">
            {/* Tabs */}
            <div className="flex border-b border-border overflow-x-auto">
                <button
                    onClick={() => setActiveTab('preflight')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 min-w-[60px] ${activeTab === 'preflight' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-text'}`}
                    title="Preflight"
                >
                    <Settings size={16} />
                </button>
                <button
                    onClick={() => setActiveTab('inspect')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 min-w-[60px] ${activeTab === 'inspect' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-text'}`}
                    title="Inspect"
                >
                    <Eye size={16} />
                </button>
                <button
                    onClick={() => setActiveTab('layers')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 min-w-[60px] ${activeTab === 'layers' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-text'}`}
                    title="Layers"
                >
                    <Layers size={16} />
                </button>
                <button
                    onClick={() => setActiveTab('edit')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 min-w-[60px] ${activeTab === 'edit' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-text'}`}
                    title="Edit"
                >
                    <Edit size={16} />
                </button>
                <button
                    onClick={() => setActiveTab('comments')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 min-w-[60px] ${activeTab === 'comments' ? 'text-primary border-b-2 border-primary' : 'text-muted hover:text-text'}`}
                    title="Comments"
                >
                    <MessageSquare size={16} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {activeTab === 'preflight' && (
                    <PreflightReport checks={checks} onFix={onFix} />
                )}

                {activeTab === 'inspect' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-3">Page {currentPage} Geometry</h3>
                            {pageInfo ? (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted">Width</span>
                                        <div className="text-right">
                                            <span className="text-text font-mono block">{pageInfo.width.toFixed(2)} pt</span>
                                            <span className="text-xs text-muted block">{(pageInfo.width / 72).toFixed(2)} in</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Height</span>
                                        <div className="text-right">
                                            <span className="text-text font-mono block">{pageInfo.height.toFixed(2)} pt</span>
                                            <span className="text-xs text-muted block">{(pageInfo.height / 72).toFixed(2)} in</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Rotation</span>
                                        <span className="text-text font-mono">{pageInfo.rotation}°</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted italic">Select a page to view details.</p>
                            )}
                        </div>

                        {pageGeometry && (
                            <div>
                                <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-3">Page Boxes</h3>
                                <div className="space-y-3 text-xs">
                                    <div className="p-2 bg-background border border-border rounded">
                                        <div className="flex items-center gap-2 mb-1 text-blue-500 font-medium">
                                            <Box size={12} /> Media Box
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted font-mono">
                                            <span>W: {pageGeometry.mediaBox.w.toFixed(2)}</span>
                                            <span>H: {pageGeometry.mediaBox.h.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-background border border-border rounded">
                                        <div className="flex items-center gap-2 mb-1 text-green-500 font-medium">
                                            <Box size={12} /> Crop Box
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted font-mono">
                                            <span>W: {pageGeometry.cropBox.w.toFixed(2)}</span>
                                            <span>H: {pageGeometry.cropBox.h.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-3">Page Objects</h3>
                            {pageObjects.length === 0 ? (
                                <p className="text-sm text-muted italic">No objects detected.</p>
                            ) : (
                                <div className="space-y-2">
                                    {pageObjects.map((obj, i) => (
                                        <div key={i} className="flex items-start gap-3 p-2 bg-background rounded border border-border">
                                            <div className="mt-0.5 text-muted">
                                                {obj.type === 'image' ? <ImageIcon size={14} /> : <Type size={14} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-text truncate">{obj.name}</p>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${obj.status === 'pass' ? 'bg-green-500/10 text-green-500' :
                                                        obj.status === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                                                            'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {obj.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted mt-0.5">{obj.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'layers' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-3">Optional Content Groups</h3>
                            {layers.length === 0 ? (
                                <p className="text-sm text-muted italic">No layers found.</p>
                            ) : (
                                <div className="space-y-2">
                                    {layers.map((layer, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-background rounded border border-border">
                                            <div className="flex items-center gap-3">
                                                <Layers size={16} className="text-muted" />
                                                <span className="text-sm font-medium text-text">{layer.name}</span>
                                            </div>
                                            <div className={`w-2 h-2 rounded-full ${layer.visible ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'edit' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-3">Page Operations</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={onRotatePage}
                                    className="flex flex-col items-center justify-center p-4 bg-background border border-border rounded-lg hover:border-primary hover:text-primary transition-colors"
                                >
                                    <RotateCw size={24} className="mb-2" />
                                    <span className="text-xs font-medium">Rotate 90°</span>
                                </button>
                                <button
                                    onClick={onDeletePage}
                                    className="flex flex-col items-center justify-center p-4 bg-background border border-border rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={24} className="mb-2" />
                                    <span className="text-xs font-medium">Delete Page</span>
                                </button>
                                <button
                                    onClick={onMovePageUp}
                                    className="flex flex-col items-center justify-center p-4 bg-background border border-border rounded-lg hover:border-primary hover:text-primary transition-colors"
                                >
                                    <ArrowUp size={24} className="mb-2" />
                                    <span className="text-xs font-medium">Move Up</span>
                                </button>
                                <button
                                    onClick={onMovePageDown}
                                    className="flex flex-col items-center justify-center p-4 bg-background border border-border rounded-lg hover:border-primary hover:text-primary transition-colors"
                                >
                                    <ArrowDown size={24} className="mb-2" />
                                    <span className="text-xs font-medium">Move Down</span>
                                </button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Automated Fixes</h4>
                                <button
                                    onClick={onFixBleed}
                                    className="w-full flex items-center justify-center gap-2 p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors border border-primary/20"
                                >
                                    <Box size={16} />
                                    <span className="text-sm font-medium">Fix Bleed (Mirror)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-3">Comments</h3>
                        {annotations.length === 0 ? (
                            <div className="text-center py-8 text-muted">
                                <p className="text-sm">No comments yet.</p>
                                <p className="text-xs mt-1">Click on the document to add a note.</p>
                            </div>
                        ) : (
                            annotations.map(a => (
                                <div key={a.id} className="p-3 bg-background rounded-lg border border-border text-sm">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-accent">#{a.id}</span>
                                        <span className="text-xs text-muted">Page {a.page}</span>
                                    </div>
                                    <p className="text-text">{a.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
