import React, { useState } from 'react';
import { X, Play, AlertCircle, CheckCircle, Clock, Zap, Filter } from 'lucide-react';
import { automationTemplates, type AutomationTemplate, executeTemplate } from '../lib/automation-templates';
import { savedWorkflows, executeWorkflow, type SavedWorkflow } from '../lib/saved-workflows';
import { WorkflowBuilder } from './WorkflowBuilder';
import { BulkOperations } from './BulkOperations';
import clsx from 'clsx';

interface AutomationPanelProps {
    onClose: () => void;
    fileUrl?: string;
}

export const AutomationPanel: React.FC<AutomationPanelProps> = ({ onClose, fileUrl = '/sample.pdf' }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
    const [executingTemplates, setExecutingTemplates] = useState<Set<string>>(new Set());
    const [results, setResults] = useState<Map<string, { success: boolean; message: string; details?: any }>>(new Map());
    const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
    const [showBulkOps, setShowBulkOps] = useState(false);
    const [activeTab, setActiveTab] = useState<'templates' | 'workflows'>('templates');

    const categories = ['all', 'fonts', 'colors', 'images', 'geometry', 'transparency', 'layers', 'overprint', 'ink'];
    const severities = ['all', 'critical', 'high', 'medium', 'low'];

    const filteredTemplates = automationTemplates.filter(template => {
        const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
        const severityMatch = selectedSeverity === 'all' || template.severity === selectedSeverity;
        return categoryMatch && severityMatch;
    });

    const handleExecuteTemplate = async (template: AutomationTemplate) => {
        setExecutingTemplates(prev => new Set(prev).add(template.id));

        try {
            const result = await executeTemplate(template.id, fileUrl);
            setResults(prev => new Map(prev).set(template.id, result));
        } catch (error) {
            setResults(prev => new Map(prev).set(template.id, {
                success: false,
                message: `Error: ${error}`,
            }));
        } finally {
            setExecutingTemplates(prev => {
                const newSet = new Set(prev);
                newSet.delete(template.id);
                return newSet;
            });
        }
    };

    const getSeverityColor = (severity: AutomationTemplate['severity']) => {
        switch (severity) {
            case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    const getCategoryIcon = (category: AutomationTemplate['category']) => {
        // Return appropriate icon based on category
        return <Zap size={16} />;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-bold text-text flex items-center gap-3">
                            <Zap size={28} className="text-primary" />
                            PDF Correction Templates
                        </h2>
                        <p className="text-sm text-muted mt-1">
                            Automated fixes for web-to-print workflow
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-text transition-colors p-2 hover:bg-background rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border bg-background/50">
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={clsx(
                            "px-6 py-3 font-medium transition-colors border-b-2",
                            activeTab === 'templates'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted hover:text-text"
                        )}
                    >
                        Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('workflows')}
                        className={clsx(
                            "px-6 py-3 font-medium transition-colors border-b-2",
                            activeTab === 'workflows'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted hover:text-text"
                        )}
                    >
                        Saved Workflows ({savedWorkflows.length})
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2 px-4">
                        <button
                            onClick={() => setShowWorkflowBuilder(true)}
                            className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium"
                        >
                            + Create Workflow
                        </button>
                        <button
                            onClick={() => setShowBulkOps(true)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                        >
                            Bulk Operations
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-6 border-b border-border bg-background/50">
                    <div className="flex gap-6">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                                Category
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                                            selectedCategory === cat
                                                ? "bg-primary text-white border-primary"
                                                : "bg-surface text-muted border-border hover:border-primary/50 hover:text-text"
                                        )}
                                    >
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                                Severity
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {severities.map(sev => (
                                    <button
                                        key={sev}
                                        onClick={() => setSelectedSeverity(sev)}
                                        className={clsx(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                                            selectedSeverity === sev
                                                ? "bg-primary text-white border-primary"
                                                : "bg-surface text-muted border-border hover:border-primary/50 hover:text-text"
                                        )}
                                    >
                                        {sev.charAt(0).toUpperCase() + sev.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Templates Grid */}
                <div className="flex-1 overflow-auto p-6">
                    {activeTab === 'templates' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredTemplates.map(template => {
                                const isExecuting = executingTemplates.has(template.id);
                                const result = results.get(template.id);

                                return (
                                    <div
                                        key={template.id}
                                        className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getCategoryIcon(template.category)}
                                                    <h3 className="font-semibold text-text">{template.name}</h3>
                                                </div>
                                                <p className="text-sm text-muted leading-relaxed">
                                                    {template.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={clsx(
                                                "px-2 py-1 rounded text-xs font-medium border",
                                                getSeverityColor(template.severity)
                                            )}>
                                                {template.severity.toUpperCase()}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-muted">
                                                <Clock size={12} />
                                                {template.estimatedTime}
                                            </span>
                                            {template.requiresBackend && (
                                                <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                    Backend Required
                                                </span>
                                            )}
                                        </div>

                                        {result && (
                                            <div className={clsx(
                                                "mb-3 p-3 rounded-lg border text-sm",
                                                result.success
                                                    ? "bg-green-500/5 border-green-500/20 text-green-400"
                                                    : "bg-red-500/5 border-red-500/20 text-red-400"
                                            )}>
                                                <div className="flex items-start gap-2">
                                                    {result.success ? (
                                                        <CheckCircle size={16} className="mt-0.5 shrink-0" />
                                                    ) : (
                                                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium mb-1">{result.message}</p>
                                                        {result.details && (
                                                            <div className="text-xs opacity-80 mt-2 space-y-1">
                                                                {Object.entries(result.details).map(([key, value]) => (
                                                                    <div key={key} className="flex justify-between">
                                                                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                                        <span className="font-mono">
                                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleExecuteTemplate(template)}
                                            disabled={isExecuting}
                                            className={clsx(
                                                "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                                                isExecuting
                                                    ? "bg-muted/20 text-muted cursor-not-allowed"
                                                    : "bg-primary hover:bg-primary/90 text-white"
                                            )}
                                        >
                                            {isExecuting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Executing...
                                                </>
                                            ) : (
                                                <>
                                                    <Play size={16} />
                                                    Execute Template
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'workflows' && (
                        <div className="space-y-4">
                            {savedWorkflows.map(workflow => (
                                <div
                                    key={workflow.id}
                                    className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Zap size={18} className="text-primary" />
                                                <h3 className="font-semibold text-text">{workflow.name}</h3>
                                                <span className={clsx(
                                                    "px-2 py-1 rounded text-xs font-medium border capitalize",
                                                    workflow.category === 'custom'
                                                        ? "bg-secondary/10 text-secondary border-secondary/20"
                                                        : "bg-primary/10 text-primary border-primary/20"
                                                )}>
                                                    {workflow.category === 'custom' ? '⭐ Custom' : workflow.category}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted mb-2">{workflow.description}</p>
                                            <div className="text-xs text-muted">
                                                {workflow.steps.length} steps • Used {workflow.usageCount} times
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                executeWorkflow(workflow, fileUrl);
                                            }}
                                            className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                        >
                                            <Play size={16} />
                                            Execute Workflow
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {savedWorkflows.length === 0 && (
                                <div className="text-center py-12">
                                    <Zap size={48} className="mx-auto text-muted mb-4" />
                                    <p className="text-muted">No saved workflows yet.</p>
                                    <button
                                        onClick={() => setShowWorkflowBuilder(true)}
                                        className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
                                    >
                                        Create Your First Workflow
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'templates' && filteredTemplates.length === 0 && (
                        <div className="text-center py-12">
                            <Filter size={48} className="mx-auto text-muted mb-4" />
                            <p className="text-muted">No templates match the selected filters.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-background/50">
                    <div className="flex items-center justify-between text-sm">
                        <p className="text-muted">
                            {activeTab === 'templates'
                                ? `Showing ${filteredTemplates.length} of ${automationTemplates.length} templates`
                                : `${savedWorkflows.length} saved workflows`
                            }
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showWorkflowBuilder && (
                <WorkflowBuilder
                    onClose={() => setShowWorkflowBuilder(false)}
                    onSave={() => {
                        setShowWorkflowBuilder(false);
                        setActiveTab('workflows');
                    }}
                />
            )}
            {showBulkOps && (
                <BulkOperations onClose={() => setShowBulkOps(false)} />
            )}
        </div>
    );
};
