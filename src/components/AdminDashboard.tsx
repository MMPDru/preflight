import React, { useState } from 'react';
import {
    Users, Briefcase, TrendingUp, DollarSign, Settings, AlertCircle,
    CheckCircle, Clock, Package, Activity, BarChart3, PieChart
} from 'lucide-react';
import clsx from 'clsx';
import type { User } from '../lib/permissions';
import { usePermissions } from '../lib/permissions';

export interface AdminDashboardProps {
    user: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
    const permissions = usePermissions(user);

    const [systemStats, setSystemStats] = useState({
        totalUsers: 156,
        activeJobs: 47,
        totalRevenue: 125430.50,
        avgProcessingTime: 38, // minutes
        systemHealth: 98, // percentage
        queueDepth: 12
    });

    const [recentActivity, setRecentActivity] = useState([
        {
            id: '1',
            type: 'job_completed',
            message: 'Job completed: Business Cards for Alice Johnson',
            timestamp: new Date('2024-11-23T11:30:00'),
            user: 'Designer Mike'
        },
        {
            id: '2',
            type: 'user_registered',
            message: 'New customer registered: John Doe',
            timestamp: new Date('2024-11-23T11:15:00'),
            user: 'System'
        },
        {
            id: '3',
            type: 'order_placed',
            message: 'New order placed: Marketing Materials ($450)',
            timestamp: new Date('2024-11-23T10:45:00'),
            user: 'Carol White'
        },
        {
            id: '4',
            type: 'issue_detected',
            message: 'Critical issue detected in Annual Report',
            timestamp: new Date('2024-11-23T10:30:00'),
            user: 'PreFlight Engine'
        }
    ]);

    const [usersByRole, setUsersByRole] = useState({
        customers: 120,
        designers: 30,
        admins: 6
    });

    const [jobsByStatus, setJobsByStatus] = useState({
        queued: 8,
        analyzing: 5,
        fixing: 12,
        proofing: 15,
        approved: 7
    });

    const [topDesigners, setTopDesigners] = useState([
        { name: 'Mike Chen', completed: 45, avgTime: 32, rating: 4.9 },
        { name: 'Sarah Williams', completed: 38, avgTime: 35, rating: 4.8 },
        { name: 'Tom Rodriguez', completed: 35, avgTime: 40, rating: 4.7 }
    ]);

    const [systemAlerts, setSystemAlerts] = useState([
        {
            id: '1',
            severity: 'warning',
            message: 'Job queue depth above normal (12 jobs)',
            timestamp: new Date('2024-11-23T11:00:00')
        },
        {
            id: '2',
            severity: 'info',
            message: 'Scheduled maintenance tonight at 2 AM',
            timestamp: new Date('2024-11-23T09:00:00')
        }
    ]);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'job_completed':
                return <CheckCircle size={16} className="text-green-500" />;
            case 'user_registered':
                return <Users size={16} className="text-blue-500" />;
            case 'order_placed':
                return <Package size={16} className="text-purple-500" />;
            case 'issue_detected':
                return <AlertCircle size={16} className="text-red-500" />;
            default:
                return <Activity size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="max-w-full mx-auto p-6">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-muted">Complete system overview and management</p>
            </div>

            {/* System Health & Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Users size={18} className="text-blue-500" />
                        <div className="text-xs text-muted">Total Users</div>
                    </div>
                    <div className="text-2xl font-bold text-text">{systemStats.totalUsers}</div>
                    <div className="text-xs text-green-500 mt-1">+12 this week</div>
                </div>

                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Briefcase size={18} className="text-yellow-500" />
                        <div className="text-xs text-muted">Active Jobs</div>
                    </div>
                    <div className="text-2xl font-bold text-text">{systemStats.activeJobs}</div>
                    <div className="text-xs text-blue-500 mt-1">{systemStats.queueDepth} queued</div>
                </div>

                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={18} className="text-green-500" />
                        <div className="text-xs text-muted">Revenue</div>
                    </div>
                    <div className="text-2xl font-bold text-text">${(systemStats.totalRevenue / 1000).toFixed(0)}k</div>
                    <div className="text-xs text-green-500 mt-1">+8% this month</div>
                </div>

                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={18} className="text-purple-500" />
                        <div className="text-xs text-muted">Avg Time</div>
                    </div>
                    <div className="text-2xl font-bold text-text">{systemStats.avgProcessingTime}m</div>
                    <div className="text-xs text-green-500 mt-1">-5m improved</div>
                </div>

                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity size={18} className="text-orange-500" />
                        <div className="text-xs text-muted">System Health</div>
                    </div>
                    <div className="text-2xl font-bold text-text">{systemStats.systemHealth}%</div>
                    <div className="text-xs text-green-500 mt-1">Excellent</div>
                </div>

                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={18} className="text-cyan-500" />
                        <div className="text-xs text-muted">Performance</div>
                    </div>
                    <div className="text-2xl font-bold text-text">94%</div>
                    <div className="text-xs text-green-500 mt-1">Above target</div>
                </div>
            </div>

            {/* System Alerts */}
            {systemAlerts.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                    <h3 className="font-bold text-text mb-3 flex items-center gap-2">
                        <AlertCircle size={20} className="text-yellow-500" />
                        System Alerts
                    </h3>
                    <div className="space-y-2">
                        {systemAlerts.map(alert => (
                            <div key={alert.id} className="flex items-center justify-between text-sm">
                                <span className="text-text">{alert.message}</span>
                                <span className="text-xs text-muted">{alert.timestamp.toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Users by Role */}
                {permissions.hasPermission('users:view') && (
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-text">Users by Role</h3>
                            <PieChart size={20} className="text-muted" />
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-muted">Customers</span>
                                    <span className="text-sm font-bold text-text">{usersByRole.customers}</span>
                                </div>
                                <div className="h-2 bg-background rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500"
                                        style={{ width: `${(usersByRole.customers / systemStats.totalUsers) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-muted">Designers</span>
                                    <span className="text-sm font-bold text-text">{usersByRole.designers}</span>
                                </div>
                                <div className="h-2 bg-background rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500"
                                        style={{ width: `${(usersByRole.designers / systemStats.totalUsers) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-muted">Admins</span>
                                    <span className="text-sm font-bold text-text">{usersByRole.admins}</span>
                                </div>
                                <div className="h-2 bg-background rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500"
                                        style={{ width: `${(usersByRole.admins / systemStats.totalUsers) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {permissions.hasPermission('users:create') && (
                            <button className="w-full mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium">
                                Manage Users
                            </button>
                        )}
                    </div>
                )}

                {/* Jobs by Status */}
                <div className="bg-surface border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-text">Jobs by Status</h3>
                        <BarChart3 size={20} className="text-muted" />
                    </div>

                    <div className="space-y-3">
                        {Object.entries(jobsByStatus).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className="text-sm text-muted capitalize">{status}</span>
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 px-4 py-2 bg-surface border border-border hover:bg-background text-text rounded-lg text-sm font-medium">
                        View All Jobs
                    </button>
                </div>

                {/* Top Designers */}
                <div className="bg-surface border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-text">Top Designers</h3>
                        <TrendingUp size={20} className="text-green-500" />
                    </div>

                    <div className="space-y-3">
                        {topDesigners.map((designer, index) => (
                            <div key={designer.name} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-text text-sm">{designer.name}</div>
                                    <div className="text-xs text-muted">
                                        {designer.completed} jobs • {designer.avgTime}m avg
                                    </div>
                                </div>
                                <div className="text-yellow-500 text-sm">★ {designer.rating}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface border border-border rounded-xl p-6 mb-6">
                <h3 className="font-bold text-text mb-4">Recent Activity</h3>

                <div className="space-y-3">
                    {recentActivity.map(activity => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 bg-background rounded-lg"
                        >
                            <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                            <div className="flex-1">
                                <div className="text-sm text-text">{activity.message}</div>
                                <div className="text-xs text-muted mt-1">
                                    {activity.user} • {activity.timestamp.toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            {permissions.hasPermission('settings:edit') && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 bg-surface border border-border hover:border-primary/50 rounded-xl text-center">
                        <Users size={24} className="mx-auto text-primary mb-2" />
                        <div className="text-sm font-medium text-text">User Management</div>
                    </button>

                    <button className="p-4 bg-surface border border-border hover:border-primary/50 rounded-xl text-center">
                        <Settings size={24} className="mx-auto text-primary mb-2" />
                        <div className="text-sm font-medium text-text">System Settings</div>
                    </button>

                    <button className="p-4 bg-surface border border-border hover:border-primary/50 rounded-xl text-center">
                        <BarChart3 size={24} className="mx-auto text-primary mb-2" />
                        <div className="text-sm font-medium text-text">Analytics</div>
                    </button>

                    <button className="p-4 bg-surface border border-border hover:border-primary/50 rounded-xl text-center">
                        <DollarSign size={24} className="mx-auto text-primary mb-2" />
                        <div className="text-sm font-medium text-text">Billing</div>
                    </button>
                </div>
            )}
        </div>
    );
};
