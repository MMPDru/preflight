import React, { useState } from 'react';
import {
    Briefcase, Clock, CheckCircle, AlertTriangle, Zap, TrendingUp,
    FileText, Package, Wrench, BarChart3, Users, Target
} from 'lucide-react';
import clsx from 'clsx';
import type { User } from '../lib/permissions';
import { usePermissions } from '../lib/permissions';

export interface DesignerDashboardProps {
    user: User;
}

export const DesignerDashboard: React.FC<DesignerDashboardProps> = ({ user }) => {
    const permissions = usePermissions(user);

    const [stats, setStats] = useState({
        assignedJobs: 8,
        inProgress: 3,
        completedToday: 5,
        avgFixTime: 45, // minutes
        queuePosition: 2,
        productivity: 92 // percentage
    });

    const [assignedJobs, setAssignedJobs] = useState([
        {
            id: '1',
            jobName: 'Business Cards - ABC Corp',
            customer: 'Alice Johnson',
            priority: 'high',
            status: 'fixing',
            assignedAt: new Date('2024-11-23T09:00:00'),
            dueDate: new Date('2024-11-23T17:00:00'),
            issues: ['RGB colors', 'Missing bleed'],
            Progress: 60
        },
        {
            id: '2',
            jobName: 'Marketing Flyers',
            customer: 'Bob Smith',
            priority: 'urgent',
            status: 'analyzing',
            assignedAt: new Date('2024-11-23T10:30:00'),
            dueDate: new Date('2024-11-23T14:00:00'),
            issues: ['Low resolution images'],
            progress: 20
        },
        {
            id: '3',
            jobName: 'Annual Report',
            customer: 'Carol White',
            priority: 'medium',
            status: 'queued',
            assignedAt: new Date('2024-11-23T11:00:00'),
            dueDate: new Date('2024-11-24T12:00:00'),
            issues: [],
            progress: 0
        }
    ]);

    const [recentlyCompleted, setRecentlyCompleted] = useState([
        {
            id: 'c1',
            jobName: 'Product Catalog',
            customer: 'David Brown',
            completedAt: new Date('2024-11-23T09:15:00'),
            fixTime: 35,
            issuesFixed: 4
        },
        {
            id: 'c2',
            jobName: 'Event Poster',
            customer: 'Emma Davis',
            completedAt: new Date('2024-11-23T08:30:00'),
            fixTime: 28,
            issuesFixed: 2
        }
    ]);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'queued': 'bg-gray-500',
            'analyzing': 'bg-blue-500',
            'fixing': 'bg-yellow-500',
            'reviewing': 'bg-orange-500',
            'completed': 'bg-green-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            'low': 'text-gray-500',
            'medium': 'text-blue-500',
            'high': 'text-orange-500',
            'urgent': 'text-red-500'
        };
        return colors[priority] || 'text-gray-500';
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">
                    Designer Dashboard
                </h1>
                <p className="text-muted">Welcome back, {user.displayName}! Here's your queue</p>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Briefcase size={18} className="text-blue-500" />
                        <div className="text-xs text-muted">Assigned</div>
                    </div>
                    <div className="text-2xl font-bold text-text">{stats.assignedJobs}</div>
                </div>

                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={18} className="text-yellow-500" />
                        <div className="text-xs text-muted">In Progress</div>
                    </div>
                    <div className="text-2xl font-bold text-text">{stats.inProgress}</div>
                </div>

                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={18} className="text-green-500" />
                        <div className="text-xs text-muted">Done Today</div>
                    </div>
                    <div className="text-2xl font-bold text-text">{stats.completedToday}</div>
                </div>

                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={18} className="text-purple-500" />
                        <div className="text-xs text-muted">Avg Fix Time</div>
                    </div>
                    <div className="text-2xl font-bold text-text">{stats.avgFixTime}m</div>
                </div>

                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={18} className="text-orange-500" />
                        <div className="text-xs text-muted">Queue Pos</div>
                    </div>
                    <div className="text-2xl font-bold text-text">#{stats.queuePosition}</div>
                </div>

                <div className="p-4 bg-surface border border-border rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={18} className="text-green-500" />
                        <div className="text-xs text-muted">Productivity</div>
                    </div>
                    <div className="text-2xl font-bold text-text">{stats.productivity}%</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assigned Jobs Queue */}
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-text">My Queue ({assignedJobs.length})</h2>
                            {permissions.hasPermission('processing:batch') && (
                                <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm flex items-center gap-2">
                                    <Package size={16} />
                                    Batch Process
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {assignedJobs.map(job => (
                                <div
                                    key={job.id}
                                    className="p-4 bg-background border-2 border-border rounded-lg hover:border-primary/50 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-text">{job.jobName}</h3>
                                                <span className={clsx(
                                                    "text-xs font-bold",
                                                    getPriorityColor(job.priority)
                                                )}>
                                                    {job.priority.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted">
                                                <Users size={14} />
                                                <span>{job.customer}</span>
                                            </div>
                                        </div>
                                        <span className={clsx(
                                            "px-3 py-1 rounded-full text-white text-xs font-medium",
                                            getStatusColor(job.status)
                                        )}>
                                            {job.status.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Issues */}
                                    {job.issues.length > 0 && (
                                        <div className="mb-3">
                                            <div className="flex items-center gap-1 text-xs text-muted mb-2">
                                                <AlertTriangle size={12} />
                                                <span>Issues Found:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {job.issues.map((issue, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded"
                                                    >
                                                        {issue}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Progress Bar */}
                                    {job.progress > 0 && (
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-muted">Progress</span>
                                                <span className="font-medium text-text">{job.progress}%</span>
                                            </div>
                                            <div className="h-2 bg-surface rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-300"
                                                    style={{ width: `${job.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Time Info */}
                                    <div className="flex items-center gap-4 text-xs text-muted mb-3">
                                        <div>Assigned: {job.assignedAt.toLocaleTimeString()}</div>
                                        <div>Due: {job.dueDate.toLocaleTimeString()}</div>
                                    </div>

                                    {/* Actions */}
                                    {permissions.hasPermission('jobs:edit-all') && (
                                        <div className="flex gap-2">
                                            {job.status === 'queued' && (
                                                <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">
                                                    Start Analysis
                                                </button>
                                            )}
                                            {job.status === 'analyzing' && (
                                                <button className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium">
                                                    View Report
                                                </button>
                                            )}
                                            {job.status === 'fixing' && (
                                                <>
                                                    <button className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                                                        <Wrench size={16} />
                                                        Continue Fixing
                                                    </button>
                                                    <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium">
                                                        Mark Complete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Tools */}
                    {permissions.hasPermission('processing:preflight') && (
                        <div className="bg-surface border border-border rounded-xl p-6">
                            <h3 className="font-bold text-text mb-4">Quick Tools</h3>

                            <div className="space-y-2">
                                <button className="w-full p-3 bg-background hover:bg-primary/10 border border-border hover:border-primary/30 rounded-lg text-left flex items-center gap-3">
                                    <FileText size={18} className="text-primary" />
                                    <span className="text-sm font-medium text-text">Run Pre-Flight</span>
                                </button>

                                <button className="w-full p-3 bg-background hover:bg-primary/10 border border-border hover:border-primary/30 rounded-lg text-left flex items-center gap-3">
                                    <Wrench size={18} className="text-primary" />
                                    <span className="text-sm font-medium text-text">Auto-Fix</span>
                                </button>

                                <button className="w-full p-3 bg-background hover:bg-primary/10 border border-border hover:border-primary/30 rounded-lg text-left flex items-center gap-3">
                                    <Package size={18} className="text-primary" />
                                    <span className="text-sm font-medium text-text">Batch Tools</span>
                                </button>

                                <button className="w-full p-3 bg-background hover:bg-primary/10 border border-border hover:border-primary/30 rounded-lg text-left flex items-center gap-3">
                                    <BarChart3 size={18} className="text-primary" />
                                    <span className="text-sm font-medium text-text">My Stats</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Recently Completed */}
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <h3 className="font-bold text-text mb-4">Recently Completed</h3>

                        <div className="space-y-3">
                            {recentlyCompleted.map(job => (
                                <div key={job.id} className="p-3 bg-background rounded-lg">
                                    <div className="font-medium text-text text-sm mb-1">{job.jobName}</div>
                                    <div className="text-xs text-muted mb-2">{job.customer}</div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <div className="flex items-center gap-1 text-green-500">
                                            <CheckCircle size={12} />
                                            <span>{job.fixTime}m</span>
                                        </div>
                                        <div className="text-muted">{job.issuesFixed} fixes</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Performance Target */}
                    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Target size={20} className="text-primary" />
                            <h3 className="font-bold text-text">Today's Goal</h3>
                        </div>

                        <div className="mb-4">
                            <div className="text-3xl font-bold text-text mb-1">
                                {stats.completedToday}/{stats.assignedJobs}
                            </div>
                            <div className="text-sm text-muted">Jobs Completed</div>
                        </div>

                        <div className="h-2 bg-background rounded-full overflow-hidden mb-2">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${(stats.completedToday / stats.assignedJobs) * 100}%` }}
                            />
                        </div>

                        <div className="text-xs text-muted">
                            {stats.assignedJobs - stats.completedToday} remaining
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
