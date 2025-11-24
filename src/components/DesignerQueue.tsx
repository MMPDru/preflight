import React, { useState } from 'react';
import { Clock, AlertCircle, CheckCircle, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import clsx from 'clsx';
import { TimeTracker } from './TimeTracker';

export interface QueueJob {
    id: string;
    fileName: string;
    customerName: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    status: 'queued' | 'in-progress' | 'review' | 'completed';
    complexity: 'low' | 'medium' | 'high';
    dueDate?: Date;
    assignedTo?: string;
    estimatedTime?: number; // in minutes
    actualTime?: number; // in minutes
}

const sampleJobs: QueueJob[] = [
    {
        id: 'job-001',
        fileName: 'business-cards.pdf',
        customerName: 'Acme Corporation',
        priority: 'urgent',
        status: 'queued',
        complexity: 'low',
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
        estimatedTime: 15
    },
    {
        id: 'job-002',
        fileName: 'brochure-tri-fold.pdf',
        customerName: 'Creative Studios',
        priority: 'high',
        status: 'in-progress',
        complexity: 'high',
        assignedTo: 'Current Designer',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        estimatedTime: 120,
        actualTime: 45
    },
    {
        id: 'job-003',
        fileName: 'flyer-event.pdf',
        customerName: 'Local Events Co',
        priority: 'normal',
        status: 'queued',
        complexity: 'medium',
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        estimatedTime: 30
    },
    {
        id: 'job-004',
        fileName: 'poster-large.pdf',
        customerName: 'Marketing Plus',
        priority: 'high',
        status: 'review',
        complexity: 'medium',
        assignedTo: 'Current Designer',
        dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
        estimatedTime: 60,
        actualTime: 55
    }
];

interface DesignerQueueProps {
    onClose: () => void;
}

export const DesignerQueue: React.FC<DesignerQueueProps> = ({ onClose }) => {
    const [jobs, setJobs] = useState<QueueJob[]>(sampleJobs);
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedJob, setSelectedJob] = useState<QueueJob | null>(null);
    const [showTimeTracker, setShowTimeTracker] = useState(false);

    const filteredJobs = jobs.filter(job => {
        const priorityMatch = filterPriority === 'all' || job.priority === filterPriority;
        const statusMatch = filterStatus === 'all' || job.status === filterStatus;
        return priorityMatch && statusMatch;
    });

    const getPriorityColor = (priority: QueueJob['priority']) => {
        switch (priority) {
            case 'urgent': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'normal': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'low': return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };

    const getStatusColor = (status: QueueJob['status']) => {
        switch (status) {
            case 'queued': return 'text-yellow-500 bg-yellow-500/10';
            case 'in-progress': return 'text-blue-500 bg-blue-500/10';
            case 'review': return 'text-purple-500 bg-purple-500/10';
            case 'completed': return 'text-green-500 bg-green-500/10';
        }
    };

    const handlePriorityChange = (jobId: string, direction: 'up' | 'down') => {
        setJobs(prev => prev.map(job => {
            if (job.id === jobId) {
                const priorities: QueueJob['priority'][] = ['low', 'normal', 'high', 'urgent'];
                const currentIndex = priorities.indexOf(job.priority);
                const newIndex = direction === 'up'
                    ? Math.min(currentIndex + 1, priorities.length - 1)
                    : Math.max(currentIndex - 1, 0);
                return { ...job, priority: priorities[newIndex] };
            }
            return job;
        }));
    };

    const handleStartJob = (job: QueueJob) => {
        setSelectedJob(job);
        setShowTimeTracker(true);
        setJobs(prev => prev.map(j =>
            j.id === job.id ? { ...j, status: 'in-progress', assignedTo: 'Current Designer' } : j
        ));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-bold text-text">Designer Queue</h2>
                        <p className="text-sm text-muted mt-1">
                            Manage and prioritize your workload
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-text transition-colors p-2 hover:bg-background rounded-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-border bg-background/50 flex gap-4">
                    <div>
                        <label className="text-xs font-bold text-muted uppercase mb-2 block">Priority</label>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm"
                        >
                            <option value="all">All</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="normal">Normal</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-muted uppercase mb-2 block">Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm"
                        >
                            <option value="all">All</option>
                            <option value="queued">Queued</option>
                            <option value="in-progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {/* Queue List */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="space-y-3">
                        {filteredJobs.map(job => (
                            <div
                                key={job.id}
                                className="bg-background border border-border rounded-lg p-4 hover:border-primary/50 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-text">{job.fileName}</h3>
                                            <span className={clsx("px-2 py-1 rounded text-xs font-medium border capitalize", getPriorityColor(job.priority))}>
                                                {job.priority}
                                            </span>
                                            <span className={clsx("px-2 py-1 rounded text-xs font-medium capitalize", getStatusColor(job.status))}>
                                                {job.status.replace('-', ' ')}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted space-y-1">
                                            <div>Customer: {job.customerName}</div>
                                            <div>Complexity: <span className="capitalize">{job.complexity}</span></div>
                                            {job.dueDate && (
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    Due: {job.dueDate.toLocaleString()}
                                                </div>
                                            )}
                                            {job.estimatedTime && (
                                                <div>Est. Time: {job.estimatedTime} min</div>
                                            )}
                                            {job.actualTime && (
                                                <div>Actual: {job.actualTime} min</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePriorityChange(job.id, 'up')}
                                            className="p-2 hover:bg-surface rounded-lg transition-colors"
                                            title="Increase Priority"
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => handlePriorityChange(job.id, 'down')}
                                            className="p-2 hover:bg-surface rounded-lg transition-colors"
                                            title="Decrease Priority"
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                        {job.status === 'queued' && (
                                            <button
                                                onClick={() => handleStartJob(job)}
                                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm font-medium"
                                            >
                                                Start Job
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Time Tracker Modal */}
                {showTimeTracker && selectedJob && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
                        <div className="bg-surface rounded-lg p-6 max-w-md w-full">
                            <TimeTracker
                                jobId={selectedJob.id}
                                jobName={selectedJob.fileName}
                            />
                            <button
                                onClick={() => setShowTimeTracker(false)}
                                className="mt-4 w-full px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors"
                            >
                                Close Tracker
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
