import React from 'react';

export const Settings = () => {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-text mb-6">Settings</h1>

            <div className="bg-surface border border-border rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-text mb-4">General Preferences</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-text">Dark Mode</span>
                        <div className="w-12 h-6 bg-primary/20 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-primary rounded-full"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-text">Auto-Save Workflows</span>
                        <div className="w-12 h-6 bg-primary/20 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-primary rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-text mb-4">Preflight Profiles</h2>
                <p className="text-muted mb-4">Configure default checks for new documents.</p>
                <button className="px-4 py-2 bg-surface border border-border rounded-lg text-text hover:bg-surface/80 transition-colors">
                    Manage Profiles
                </button>
            </div>
        </div>
    );
};
