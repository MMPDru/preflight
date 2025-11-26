import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RefreshCw, Loader, TrendingUp } from 'lucide-react';

interface QueueJob {
    id: string;
    type: string;
    priority: number;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'retrying';
    attempts: number;
    maxAttempts: number;
    error?: { message: string };
    progress?: number;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}

interface QueueStats {
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    byType: Record<string, number>;
}

export const JobQueueMonitor: React.FC = () => {
    const [jobs, setJobs] = useState<QueueJob[]>([]);
    const [stats, setStats] = useState<QueueStats | null>(null);
    const [filter, setFilter] = useState<'all' | 'queued' | 'processing' | 'failed'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
        fetchStats();

        // Poll every 5 seconds
        const interval = setInterval(() => {
            fetchJobs();
            fetchStats();
        }, 5000);

        return () => clearInterval(interval);
    }, [filter]);

    const fetchJobs = async () => {
        try {
            // In a real implementation, we'd have an endpoint to list jobs
            // For now, we'll just show stats
            setLoading(false);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/v1/queue/stats');
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const retryJob = async (jobId: string) => {
        try {
            const response = await fetch(`/api/v1/queue/retry/${jobId}`, {
                method: 'POST',
            });

            if (response.ok) {
                fetchJobs();
                fetchStats();
            }
        } catch (error) {
            console.error('Error retrying job:', error);
        }
    };

    const cancelJob = async (jobId: string) => {
        try {
            const response = await fetch(`/api/v1/queue/cancel/${jobId}`, {
                method: 'POST',
            });

            if (response.ok) {
                fetchJobs();
                fetchStats();
            }
        } catch (error) {
            console.error('Error cancelling job:', error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'processing':
                return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
            case 'queued':
                return <Clock className="w-5 h-5 text-gray-500" />;
            case 'retrying':
                return <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'queued':
                return 'bg-gray-100 text-gray-800';
            case 'retrying':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: number) => {
        if (priority >= 8) return 'text-red-600 font-bold';
        if (priority >= 6) return 'text-orange-600 font-semibold';
        if (priority >= 4) return 'text-yellow-600';
        return 'text-gray-600';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Job Queue Monitor</h2>
                <button
                    onClick={() => {
                        fetchJobs();
                        fetchStats();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Queued</span>
                            <Clock className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900">{stats.queued}</div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Processing</span>
                            <Loader className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="text-3xl font-bold text-blue-600">{stats.processing}</div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Completed</span>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Failed</span>
                            <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
                    </div>
                </div>
            )}

            {/* Job Type Distribution */}
            {stats && Object.keys(stats.byType).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Job Distribution by Type
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(stats.byType).map(([type, count]) => (
                            <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">{count}</div>
                                <div className="text-sm text-gray-600 capitalize">{type.replace('-', ' ')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {['all', 'queued', 'processing', 'failed'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 font-medium capitalize transition-colors ${filter === f
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Jobs List */}
            <div className="space-y-3">
                {jobs.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Queue is empty</h3>
                        <p className="text-gray-600">No jobs matching the current filter.</p>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div
                            key={job.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                    {getStatusIcon(job.status)}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-gray-900 capitalize">
                                                {job.type.replace('-', ' ')}
                                            </h4>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                                {job.status}
                                            </span>
                                            <span className={`text-sm ${getPriorityColor(job.priority)}`}>
                                                P{job.priority}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            ID: {job.id.substring(0, 8)}...
                                        </div>
                                        {job.error && (
                                            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                                {job.error.message}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {job.status === 'failed' && (
                                    <button
                                        onClick={() => retryJob(job.id)}
                                        className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Retry
                                    </button>
                                )}
                            </div>

                            {job.progress !== undefined && job.status === 'processing' && (
                                <div className="mb-2">
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span>{job.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${job.progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Created: {new Date(job.createdAt).toLocaleString()}</span>
                                {job.attempts > 0 && (
                                    <span>Attempts: {job.attempts}/{job.maxAttempts}</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
