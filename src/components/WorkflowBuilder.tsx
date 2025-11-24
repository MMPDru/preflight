import React, { useState } from 'react';
import { X, Plus, Trash2, GripVertical, Save, Play } from 'lucide-react';
import { automationTemplates, type AutomationTemplate } from '../lib/automation-templates';
import { saveWorkflow, type SavedWorkflow, type WorkflowStep } from '../lib/saved-workflows';
import clsx from 'clsx';

interface WorkflowBuilderProps {
    onClose: () => void;
    onSave?: (workflow: SavedWorkflow) => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ onClose, onSave }) => {
    const [workflowName, setWorkflowName] = useState('');
    const [workflowDescription, setWorkflowDescription] = useState('');
    const [selectedSteps, setSelectedSteps] = useState<WorkflowStep[]>([]);
    const [availableTemplates, setAvailableTemplates] = useState(automationTemplates);

    const handleAddStep = (template: AutomationTemplate) => {
        const newStep: WorkflowStep = {
            templateId: template.id,
            order: selectedSteps.length + 1,
            enabled: true
        };
        setSelectedSteps([...selectedSteps, newStep]);
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = selectedSteps.filter((_, i) => i !== index);
        // Reorder
        newSteps.forEach((step, i) => {
            step.order = i + 1;
        });
        setSelectedSteps(newSteps);
    };

    const handleMoveStep = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === selectedSteps.length - 1) return;

        const newSteps = [...selectedSteps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];

        // Reorder
        newSteps.forEach((step, i) => {
            step.order = i + 1;
        });
        setSelectedSteps(newSteps);
    };

    const handleSave = () => {
        if (!workflowName.trim()) {
            alert('Please enter a workflow name');
            return;
        }

        if (selectedSteps.length === 0) {
            alert('Please add at least one step');
            return;
        }

        const workflow = saveWorkflow({
            name: workflowName,
            description: workflowDescription,
            steps: selectedSteps,
            category: 'custom'
        });

        // Show success message
        alert(`✓ Workflow "${workflow.name}" saved successfully!\n\nYou can now find it in the "Saved Workflows" tab.`);

        onSave?.(workflow);
        onClose();
    };

    const getTemplateName = (templateId: string): string => {
        return automationTemplates.find(t => t.id === templateId)?.name || templateId;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-bold text-text">Create Custom Workflow</h2>
                        <p className="text-sm text-muted mt-1">
                            Combine multiple automation steps into a reusable workflow
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-text transition-colors p-2 hover:bg-background rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Left: Workflow Details */}
                    <div className="w-1/3 border-r border-border p-6 overflow-auto">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">
                                    Workflow Name *
                                </label>
                                <input
                                    type="text"
                                    value={workflowName}
                                    onChange={(e) => setWorkflowName(e.target.value)}
                                    placeholder="e.g., Standard Print Prep"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={workflowDescription}
                                    onChange={(e) => setWorkflowDescription(e.target.value)}
                                    placeholder="Describe what this workflow does..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:border-primary resize-none"
                                />
                            </div>

                            <div className="pt-4 border-t border-border">
                                <h3 className="font-medium text-text mb-2">Selected Steps ({selectedSteps.length})</h3>
                                {selectedSteps.length === 0 ? (
                                    <p className="text-sm text-muted">No steps selected yet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedSteps.map((step, index) => (
                                            <div
                                                key={index}
                                                className="bg-background border border-border rounded-lg p-3 flex items-center gap-2"
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        onClick={() => handleMoveStep(index, 'up')}
                                                        disabled={index === 0}
                                                        className="text-muted hover:text-text disabled:opacity-30"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoveStep(index, 'down')}
                                                        disabled={index === selectedSteps.length - 1}
                                                        className="text-muted hover:text-text disabled:opacity-30"
                                                    >
                                                        ▼
                                                    </button>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-muted">Step {step.order}</div>
                                                    <div className="text-sm text-text truncate">{getTemplateName(step.templateId)}</div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveStep(index)}
                                                    className="text-red-500 hover:text-red-400"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Available Templates */}
                    <div className="flex-1 p-6 overflow-auto">
                        <h3 className="font-medium text-text mb-4">Available Automation Templates</h3>
                        <div className="space-y-2">
                            {availableTemplates.map(template => {
                                const isSelected = selectedSteps.some(s => s.templateId === template.id);
                                return (
                                    <div
                                        key={template.id}
                                        className={clsx(
                                            "bg-background border rounded-lg p-4 transition-all",
                                            isSelected ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-text mb-1">{template.name}</h4>
                                                <p className="text-sm text-muted">{template.description}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-xs px-2 py-1 bg-surface rounded border border-border text-muted capitalize">
                                                        {template.category}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 bg-surface rounded border border-border text-muted capitalize">
                                                        {template.severity}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAddStep(template)}
                                                disabled={isSelected}
                                                className={clsx(
                                                    "px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2",
                                                    isSelected
                                                        ? "bg-muted/20 text-muted cursor-not-allowed"
                                                        : "bg-primary hover:bg-primary/90 text-white"
                                                )}
                                            >
                                                <Plus size={16} />
                                                {isSelected ? 'Added' : 'Add'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border flex items-center justify-between">
                    <div className="text-sm text-muted">
                        {selectedSteps.length} step{selectedSteps.length !== 1 ? 's' : ''} configured
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                        >
                            <Save size={16} />
                            Save Workflow
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
