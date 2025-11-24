import React, { useState } from 'react';
import { X, User, Settings, CheckCircle } from 'lucide-react';
import { defaultCustomerPresets, type CustomerPreset } from '../lib/customer-presets';
import clsx from 'clsx';

interface CustomerPresetPanelProps {
    onClose: () => void;
    onSelectPreset: (preset: CustomerPreset) => void;
}

export const CustomerPresetPanel: React.FC<CustomerPresetPanelProps> = ({ onClose, onSelectPreset }) => {
    const [selectedPreset, setSelectedPreset] = useState<CustomerPreset | null>(null);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-bold text-text flex items-center gap-3">
                            <User size={28} className="text-primary" />
                            Customer Presets
                        </h2>
                        <p className="text-sm text-muted mt-1">
                            Select customer-specific preferences for preflight checks
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-text transition-colors p-2 hover:bg-background rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Preset List */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {defaultCustomerPresets.map(preset => (
                            <div
                                key={preset.id}
                                className={clsx(
                                    "bg-background border rounded-lg p-5 cursor-pointer transition-all hover:border-primary/50",
                                    selectedPreset?.id === preset.id ? "border-primary ring-2 ring-primary/20" : "border-border"
                                )}
                                onClick={() => setSelectedPreset(preset)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-text text-lg">{preset.customerName}</h3>
                                        <p className="text-xs text-muted">ID: {preset.id}</p>
                                    </div>
                                    {selectedPreset?.id === preset.id && (
                                        <CheckCircle size={20} className="text-primary" />
                                    )}
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted">Color Space:</span>
                                        <span className="font-medium text-text">{preset.preferences.colorSpace}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Resolution:</span>
                                        <span className="font-medium text-text">{preset.preferences.resolution} DPI</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Bleed Required:</span>
                                        <span className={clsx(
                                            "font-medium",
                                            preset.preferences.bleedRequired ? "text-green-500" : "text-yellow-500"
                                        )}>
                                            {preset.preferences.bleedRequired ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Spot Colors:</span>
                                        <span className={clsx(
                                            "font-medium",
                                            preset.preferences.spotColorsAllowed ? "text-green-500" : "text-red-500"
                                        )}>
                                            {preset.preferences.spotColorsAllowed ? 'Allowed' : 'Not Allowed'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Auto Route:</span>
                                        <span className="font-medium text-text capitalize">{preset.preferences.autoRoute}</span>
                                    </div>
                                </div>

                                {preset.lastUsed && (
                                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted">
                                        Last used: {preset.lastUsed.toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border flex items-center justify-between">
                    <button
                        className="px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <Settings size={16} />
                        Create New Preset
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (selectedPreset) {
                                    onSelectPreset(selectedPreset);
                                    onClose();
                                }
                            }}
                            disabled={!selectedPreset}
                            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Apply Preset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
