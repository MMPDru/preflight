import React, { useState } from 'react';
import { Settings, Users, Workflow, X } from 'lucide-react';
import clsx from 'clsx';

interface AdminControlPanelProps {
    onClose: () => void;
}

type AdminTab = 'workflow' | 'users';

export const AdminControlPanel: React.FC<AdminControlPanelProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('workflow');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-bold text-text flex items-center gap-3">
                            <Settings size={28} className="text-primary" />
                            Admin Control Panel
                        </h2>
                        <p className="text-sm text-muted mt-1">
                            Manage workflows, users, and system settings
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
                        onClick={() => setActiveTab('workflow')}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2",
                            activeTab === 'workflow'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted hover:text-text"
                        )}
                    >
                        <Workflow size={18} />
                        Workflow Builder
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2",
                            activeTab === 'users'
                                ? "border-primary text-primary"
                                : "border-transparent text-muted hover:text-text"
                        )}
                    >
                        <Users size={18} />
                        User Management
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {activeTab === 'workflow' && <WorkflowBuilder />}
                    {activeTab === 'users' && <UserManagement />}
                </div>
            </div>
        </div>
    );
};

const WorkflowBuilder: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-text mb-2">Workflow Rules</h3>
                <p className="text-sm text-muted">Define automatic routing rules based on file characteristics</p>
            </div>

            <div className="space-y-4">
                {/* Sample workflow rules */}
                <div className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h4 className="font-medium text-text">High Complexity Files</h4>
                            <p className="text-sm text-muted">Complexity score &gt; 50</p>
                        </div>
                        <div className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded text-sm font-medium">
                            Active
                        </div>
                    </div>
                    <div className="text-sm text-muted">
                        <div>Route to: <span className="font-medium text-text">Designer Review Queue</span></div>
                        <div>Notify: <span className="font-medium text-text">Senior Designer</span></div>
                        <div>Priority: <span className="font-medium text-text">High</span></div>
                    </div>
                </div>

                <div className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-center justify between mb-3">
                        <div>
                            <h4 className="font-medium text-text">RGB Color Detected</h4>
                            <p className="text-sm text-muted">PDF contains RGB images</p>
                        </div>
                        <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded text-sm font-medium">
                            Active
                        </div>
                    </div>
                    <div className="text-sm text-muted">
                        <div>Route to: <span className="font-medium text-text">Auto-Fix Queue</span></div>
                        <div>Apply: <span className="font-medium text-text">RGB to CMYK Conversion</span></div>
                        <div>Notify: <span className="font-medium text-text">Customer</span></div>
                    </div>
                </div>

                <div className="bg-background border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h4 className="font-medium text-text">VIP Customer Upload</h4>
                            <p className="text-sm text-muted">Customer tier = VIP</p>
                        </div>
                        <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded text-sm font-medium">
                            Active
                        </div>
                    </div>
                    <div className="text-sm text-muted">
                        <div>Route to: <span className="font-medium text-text">Priority Queue</span></div>
                        <div>SLA: <span className="font-medium text-text">2 hours</span></div>
                        <div>Notify: <span className="font-medium text-text">Customer Success Manager</span></div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-border">
                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium">
                    + Add New Rule
                </button>
            </div>
        </div>
    );
};

const UserManagement: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-text mb-2">Users & Permissions</h3>
                    <p className="text-sm text-muted">Manage user accounts and access levels</p>
                </div>
                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium">
                    + Add User
                </button>
            </div>

            <div className="space-y-3">
                {/* Sample users */}
                <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                            JD
                        </div>
                        <div>
                            <h4 className="font-medium text-text">John Doe</h4>
                            <p className="text-sm text-muted">john.doe@example.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-purple-500/10 text-purple-500 rounded text-sm font-medium">
                            Admin
                        </span>
                        <button className="px-3 py-1 bg-surface hover:bg-surface/80 text-text rounded border border-border text-sm">
                            Edit
                        </button>
                    </div>
                </div>

                <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 font-bold">
                            SM
                        </div>
                        <div>
                            <h4 className="font-medium text-text">Sarah Miller</h4>
                            <p className="text-sm text-muted">sarah.m@example.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded text-sm font-medium">
                            Designer
                        </span>
                        <button className="px-3 py-1 bg-surface hover:bg-surface/80 text-text rounded border border-border text-sm">
                            Edit
                        </button>
                    </div>
                </div>

                <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 font-bold">
                            AC
                        </div>
                        <div>
                            <h4 className="font-medium text-text">Alice Cooper</h4>
                            <p className="text-sm text-muted">alice.c@customer.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded text-sm font-medium">
                            Customer
                        </span>
                        <button className="px-3 py-1 bg-surface hover:bg-surface/80 text-text rounded border border-border text-sm">
                            Edit
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-border">
                <h4 className="font-medium text-text mb-3">Role Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-background border border-border rounded-lg p-4">
                        <h5 className="font-medium text-purple-500 mb-2">Admin</h5>
                        <ul className="text-sm text-muted space-y-1">
                            <li>• Full system access</li>
                            <li>• Manage workflows</li>
                            <li>• Manage users</li>
                            <li>• View analytics</li>
                        </ul>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-4">
                        <h5 className="font-medium text-blue-500 mb-2">Designer</h5>
                        <ul className="text-sm text-muted space-y-1">
                            <li>• View queue</li>
                            <li>• Edit files</li>
                            <li>• Approve proofs</li>
                            <li>• Time tracking</li>
                        </ul>
                    </div>
                    <div className="bg-background border border-border rounded-lg p-4">
                        <h5 className="font-medium text-green-500 mb-2">Customer</h5>
                        <ul className="text-sm text-muted space-y-1">
                            <li>• Upload files</li>
                            <li>• View proofs</li>
                            <li>• Add comments</li>
                            <li>• Approve/reject</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
