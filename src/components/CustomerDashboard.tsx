import React, { useState, useEffect } from 'react';
import {
    Upload, Package, Clock, CheckCircle, AlertCircle, TrendingUp,
    FileText, ShoppingCart, Download, Eye, MessageSquare, Bell
} from 'lucide-react';
import clsx from 'clsx';
import { User, usePermissions } from '../lib/permissions';

export interface CustomerDashboardProps {
    user: User;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user }) => {
    const permissions = usePermissions(user);
    const [stats, setStats] = useState({
        activeJobs: 3,
        pendingApprovals: 2,
        completedOrders: 15,
        totalSpent: 4250.00
    });

    const [recentJobs, setRecentJobs] = useState([
        {
            id: '1',
            name: 'Business Cards',
            status: 'proofing',
            uploaded: new Date('2024-11-20'),
            dueDate: new Date('2024-11-25')
        },
        {
            id: '2',
            name: 'Marketing Flyers',
            status: 'in-production',
            uploaded: new Date('2024-11-18'),
            dueDate: new Date('2024-11-22')
        },
        {
            id: '3',
            name: 'Annual Report',
            status: 'pending-approval',
            uploaded: new Date('2024-11-19'),
            dueDate: new Date('2024-11-30')
        }
    ]);

    const [notifications, setNotifications] = useState([
        {
            id: '1',
            type: 'proof-ready',
            message: 'Your proof for "Business Cards" is ready for review',
            timestamp: new Date('2024-11-23T10:30:00'),
            read: false
        },
        {
            id: '2',
            type: 'approval-needed',
            message: 'Approval needed for "Marketing Flyers"',
            timestamp: new Date('2024-11-23T09:15:00'),
            read: false
        }
    ]);

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">
                    Welcome back, {user.displayName}!
                </h1>
                <p className="text-muted">Here's what's happening with your projects</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="p-6 bg-surface border border-border rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Package size={24} className="text-blue-500" />
                        </div>
                        <TrendingUp size={20} className="text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-text mb-1">{stats.activeJobs}</div>
                    <div className="text-sm text-muted">Active Jobs</div>
                </div>

                <div className="p-6 bg-surface border border-border rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-500/10 rounded-lg">
                            <Clock size={24} className="text-yellow-500" />
                        </div>
                        <AlertCircle size={20} className="text-yellow-500" />
                    </div>
                    <div className="text-3xl font-bold text-text mb-1">{stats.pendingApprovals}</div>
                    <div className="text-sm text-muted">Pending Approvals</div>
                </div>

                <div className="p-6 bg-surface border border-border rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500/10 rounded-lg">
                            <CheckCircle size={24} className="text-green-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-text mb-1">{stats.completedOrders}</div>
                    <div className="text-sm text-muted">Completed Orders</div>
                </div>

                <div className="p-6 bg-surface border border-border rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg">
                            <ShoppingCart size={24} className="text-purple-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-text mb-1">${stats.totalSpent.toLocaleString()}</div>
                    <div className="text-sm text-muted">Total Spent</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Jobs */}
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-text">Recent Jobs</h2>
                            {permissions.hasPermission('jobs:create') && (
                                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2">
                                    <Upload size={16} />
                                    Upload New
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {recentJobs.map(job => (
                                <div
                                    key={job.id}
                                    className="p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-all cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-text mb-1">{job.name}</h3>
                                            <p className="text-sm text-muted">
                                                Uploaded {job.uploaded.toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-xs font-medium",
                                            job.status === 'proofing' && "bg-yellow-500/20 text-yellow-500",
                                            job.status === 'in-production' && "bg-blue-500/20 text-blue-500",
                                            job.status === 'pending-approval' && "bg-orange-500/20 text-orange-500"
                                        )}>
                                            {job.status.replace('-', ' ').toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-muted">
                                            <Clock size={14} />
                                            <span>Due {job.dueDate.toLocaleDateString()}</span>
                                        </div>

                                        <div className="flex gap-2 ml-auto">
                                            {permissions.hasPermission('proofs:view-own') && (
                                                <button className="p-2 hover:bg-surface rounded-lg text-primary">
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                            {permissions.hasPermission('files:download') && (
                                                <button className="p-2 hover:bg-surface rounded-lg text-muted">
                                                    <Download size={16} />
                                                </button>
                                            )}
                                            <button className="p-2 hover:bg-surface rounded-lg text-muted">
                                                <MessageSquare size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {job.status === 'pending-approval' && permissions.hasPermission('proofs:approve') && (
                                        <div className="mt-4 pt-4 border-t border-border flex gap-2">
                                            <button className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium">
                                                Approve
                                            </button>
                                            <button className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">
                                                Request Changes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Notifications & Quick Actions */}
                <div className="space-y-6">
                    {/* Notifications */}
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Bell size={20} className="text-primary" />
                            <h3 className="font-bold text-text">Notifications</h3>
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span className="ml-auto px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            )}
                        </div>

                        <div className="space-y-3">
                            {notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={clsx(
                                        "p-3 rounded-lg",
                                        !notif.read ? "bg-primary/10 border border-primary/30" : "bg-background"
                                    )}
                                >
                                    <p className="text-sm text-text mb-1">{notif.message}</p>
                                    <p className="text-xs text-muted">
                                        {notif.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <h3 className="font-bold text-text mb-4">Quick Actions</h3>

                        <div className="space-y-2">
                            {permissions.hasPermission('files:upload') && (
                                <button className="w-full p-3 bg-background hover:bg-primary/10 border border-border hover:border-primary/30 rounded-lg text-left flex items-center gap-3">
                                    <Upload size={18} className="text-primary" />
                                    <span className="text-sm font-medium text-text">Upload New File</span>
                                </button>
                            )}

                            {permissions.hasPermission('orders:view-own') && (
                                <button className="w-full p-3 bg-background hover:bg-primary/10 border border-border hover:border-primary/30 rounded-lg text-left flex items-center gap-3">
                                    <ShoppingCart size={18} className="text-primary" />
                                    <span className="text-sm font-medium text-text">View Order History</span>
                                </button>
                            )}

                            {permissions.hasPermission('support:request') && (
                                <button className="w-full p-3 bg-background hover:bg-primary/10 border border-border hover:border-primary/30 rounded-lg text-left flex items-center gap-3">
                                    <MessageSquare size={18} className="text-primary" />
                                    <span className="text-sm font-medium text-text">Get Help</span>
                                </button>
                            )}

                            {permissions.hasPermission('analytics:view-own') && (
                                <button className="w-full p-3 bg-background hover:bg-primary/10 border border-border hover:border-primary/30 rounded-lg text-left flex items-center gap-3">
                                    <TrendingUp size={18} className="text-primary" />
                                    <span className="text-sm font-medium text-text">View Reports</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="mt-6 bg-surface border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-text mb-6">Recent Activity</h2>

                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                        <div className="flex-1">
                            <div className="font-medium text-text">Proof approved: Marketing Flyers</div>
                            <div className="text-sm text-muted">2 hours ago</div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div className="flex-1">
                            <div className="font-medium text-text">File uploaded: Business Cards</div>
                            <div className="text-sm text-muted">Yesterday at 3:45 PM</div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                        <div className="flex-1">
                            <div className="font-medium text-text">Revision requested: Annual Report</div>
                            <div className="text-sm text-muted">2 days ago</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
