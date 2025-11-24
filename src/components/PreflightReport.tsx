import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export interface PreflightCheck {
    id: string;
    label: string;
    status: 'pass' | 'warning' | 'error';
    message: string;
    category?: 'geometry' | 'fonts' | 'images' | 'colors' | 'metadata';
    imageData?: Array<{ name: string; dataUrl: string; dpi: number; page: number }>;
}

interface PreflightReportProps {
    checks: PreflightCheck[];
    onFix?: (checkId: string) => void;
}

const CategorySection = ({ title, checks, defaultOpen = true, onFix }: { title: string, checks: PreflightCheck[], defaultOpen?: boolean, onFix?: (id: string) => void }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    if (checks.length === 0) return null;

    const hasError = checks.some(c => c.status === 'error');
    const hasWarning = checks.some(c => c.status === 'warning');

    const isFixable = (id: string) => {
        return ['meta-title', 'meta-author', 'geo-bleed', 'img-color-rgb', 'font-embed'].includes(id);
    };

    return (
        <div className="border border-border rounded-lg overflow-hidden bg-background/50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 bg-surface hover:bg-surface/80 transition-colors text-left"
            >
                <div className="flex items-center gap-2">
                    {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="font-medium text-sm text-text">{title}</span>
                    <span className="text-xs text-muted">({checks.length})</span>
                </div>
                <div className="flex gap-1">
                    {hasError && <div className="w-2 h-2 rounded-full bg-red-500" />}
                    {hasWarning && <div className="w-2 h-2 rounded-full bg-yellow-500" />}
                </div>
            </button>

            {isOpen && (
                <div className="divide-y divide-border">
                    {checks.map(check => (
                        <div
                            key={check.id}
                            className={clsx(
                                "flex items-start gap-3 p-3",
                                check.status === 'error' && "bg-red-500/5",
                                check.status === 'warning' && "bg-yellow-500/5",
                                check.status === 'pass' && "bg-green-500/5",
                            )}
                        >
                            {check.status === 'error' && <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />}
                            {check.status === 'warning' && <AlertTriangle size={16} className="text-yellow-400 mt-0.5 shrink-0" />}
                            {check.status === 'pass' && <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />}

                            <div className="flex-1">
                                <p className={clsx(
                                    "text-sm font-medium",
                                    check.status === 'error' && "text-red-400",
                                    check.status === 'warning' && "text-yellow-400",
                                    check.status === 'pass' && "text-green-400",
                                )}>
                                    {check.label}
                                </p>
                                <p className="text-xs text-muted mt-1 whitespace-pre-line">{check.message}</p>

                                {/* Image Thumbnails */}
                                {check.imageData && check.imageData.length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        {check.imageData.map((img, idx) => (
                                            <div key={idx} className="border border-border rounded overflow-hidden bg-background">
                                                <img
                                                    src={img.dataUrl}
                                                    alt={img.name}
                                                    className="w-full h-20 object-contain bg-gray-900/20"
                                                />
                                                <div className="p-1.5 text-[10px] text-muted border-t border-border">
                                                    <div className="font-medium truncate">{img.name}</div>
                                                    <div className="flex justify-between mt-0.5">
                                                        <span>Page {img.page}</span>
                                                        <span className="text-red-400 font-medium">{img.dpi} DPI</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {onFix && isFixable(check.id) && check.status !== 'pass' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFix(check.id);
                                    }}
                                    className="px-2 py-1 text-xs font-medium bg-primary text-white rounded hover:bg-primary/90 transition-colors shrink-0"
                                >
                                    Fix
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const PreflightReport: React.FC<PreflightReportProps> = ({ checks, onFix }) => {
    const stats = {
        error: checks.filter(c => c.status === 'error').length,
        warning: checks.filter(c => c.status === 'warning').length,
        pass: checks.filter(c => c.status === 'pass').length,
    };

    const groupedChecks = useMemo(() => {
        const groups = {
            metadata: [] as PreflightCheck[],
            geometry: [] as PreflightCheck[],
            images: [] as PreflightCheck[],
            colors: [] as PreflightCheck[],
            fonts: [] as PreflightCheck[],
            other: [] as PreflightCheck[],
        };

        checks.forEach(check => {
            if (check.category && groups[check.category]) {
                groups[check.category].push(check);
            } else {
                groups.other.push(check);
            }
        });

        return groups;
    }, [checks]);

    return (
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col h-full">
            <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                <Info size={18} className="text-primary" />
                Preflight Summary
            </h3>

            <div className="flex gap-2 mb-4">
                <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-center">
                    <span className="block text-lg font-bold text-red-400">{stats.error}</span>
                    <span className="text-xs text-muted uppercase">Errors</span>
                </div>
                <div className="flex-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-center">
                    <span className="block text-lg font-bold text-yellow-400">{stats.warning}</span>
                    <span className="text-xs text-muted uppercase">Warnings</span>
                </div>
                <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
                    <span className="block text-lg font-bold text-green-400">{stats.pass}</span>
                    <span className="text-xs text-muted uppercase">Passed</span>
                </div>
            </div>

            <div className="space-y-3 overflow-auto flex-1 pr-2">
                <CategorySection title="Document Info" checks={groupedChecks.metadata} onFix={onFix} />
                <CategorySection title="Geometry & Bleed" checks={groupedChecks.geometry} onFix={onFix} />
                <CategorySection title="Images" checks={groupedChecks.images} onFix={onFix} />
                <CategorySection title="Colors" checks={groupedChecks.colors} onFix={onFix} />
                <CategorySection title="Fonts" checks={groupedChecks.fonts} onFix={onFix} />
                <CategorySection title="Other Checks" checks={groupedChecks.other} defaultOpen={true} onFix={onFix} />
            </div>
        </div >
    );
};
