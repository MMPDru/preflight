import React from 'react';
import { X, Bot, User, AlertTriangle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { type ComplexityResult } from '../lib/preflight-engine';

interface SmartRoutingPanelProps {
    complexity: ComplexityResult;
    onClose: () => void;
    onRoute: (route: 'auto' | 'designer') => void;
}

export const SmartRoutingPanel: React.FC<SmartRoutingPanelProps> = ({ complexity, onClose, onRoute }) => {
    const isAutoFix = complexity.recommendation === 'Auto-Fix';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-background/50 p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold text-text">Smart Routing Analysis</h2>
                    <button onClick={onClose} className="text-muted hover:text-text">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Score Display */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="60"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    className="text-border"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="60"
                                    fill="none"
                                    stroke={complexity.level === 'High' ? '#ef4444' : complexity.level === 'Medium' ? '#f59e0b' : '#22c55e'}
                                    strokeWidth="8"
                                    strokeDasharray={`${(complexity.score / 100) * 377} 377`}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="text-center">
                                <span className="text-3xl font-bold text-text">{complexity.score}</span>
                                <span className="block text-xs text-muted uppercase tracking-wider">Complexity</span>
                            </div>
                        </div>
                    </div>

                    {/* Recommendation */}
                    <div className={clsx(
                        "p-4 rounded-lg border mb-6 flex items-start gap-4",
                        isAutoFix ? "bg-green-500/10 border-green-500/20" : "bg-orange-500/10 border-orange-500/20"
                    )}>
                        <div className={clsx(
                            "p-2 rounded-full shrink-0",
                            isAutoFix ? "bg-green-500/20 text-green-500" : "bg-orange-500/20 text-orange-500"
                        )}>
                            {isAutoFix ? <Bot size={24} /> : <User size={24} />}
                        </div>
                        <div>
                            <h3 className={clsx(
                                "font-bold mb-1",
                                isAutoFix ? "text-green-500" : "text-orange-500"
                            )}>
                                Recommended: {complexity.recommendation}
                            </h3>
                            <p className="text-sm text-muted">
                                {isAutoFix
                                    ? "This file has low complexity and standard issues that can be automatically fixed."
                                    : "This file contains complex elements (Spot colors, Transparency) requiring human review."}
                            </p>
                        </div>
                    </div>

                    {/* Reasons */}
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-text mb-2">Analysis Factors</h4>
                        <ul className="space-y-2">
                            {complexity.reasons.length > 0 ? (
                                complexity.reasons.map((reason, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-muted">
                                        <AlertTriangle size={14} className="text-yellow-500" />
                                        {reason}
                                    </li>
                                ))
                            ) : (
                                <li className="flex items-center gap-2 text-sm text-muted">
                                    <CheckCircle size={14} className="text-green-500" />
                                    No complex factors detected
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => onRoute('auto')}
                            className={clsx(
                                "px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors border",
                                isAutoFix
                                    ? "bg-primary text-white border-primary hover:bg-primary/90"
                                    : "bg-surface text-muted border-border hover:border-primary hover:text-primary"
                            )}
                        >
                            <Bot size={18} />
                            Auto-Fix Queue
                        </button>
                        <button
                            onClick={() => onRoute('designer')}
                            className={clsx(
                                "px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors border",
                                !isAutoFix
                                    ? "bg-primary text-white border-primary hover:bg-primary/90"
                                    : "bg-surface text-muted border-border hover:border-primary hover:text-primary"
                            )}
                        >
                            <User size={18} />
                            Designer Queue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
