import React from 'react';
import { X, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_JOBS, type JobStatus } from '../lib/mock-data';

interface JobListProps {
    filter: JobStatus;
    onClose: () => void;
}

export const JobList: React.FC<JobListProps> = ({ filter, onClose }) => {
    const navigate = useNavigate();
    const filteredJobs = MOCK_JOBS.filter(job => job.status === filter);

    const getTitle = () => {
        switch (filter) {
            case 'queue': return 'Jobs in Queue';
            case 'pending': return 'Pending Approval';
            case 'completed': return 'Completed Today';
        }
    };

    const getIcon = () => {
        switch (filter) {
            case 'queue': return <Clock className="text-primary" size={24} />;
            case 'pending': return <AlertCircle className="text-accent" size={24} />;
            case 'completed': return <CheckCircle className="text-green-500" size={24} />;
        }
    };

    const handleJobClick = (jobId: string) => {
        // Navigate to the editor with the job ID
        // In a real app, this would load the specific job data
        navigate(`/editor/${jobId}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        {getIcon()}
                        <h2 className="text-xl font-bold text-text">{getTitle()}</h2>
                        <span className="px-2 py-0.5 rounded-full bg-background border border-border text-xs font-medium text-muted">
                            {filteredJobs.length}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-text transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-auto p-6">
                    {filteredJobs.length === 0 ? (
                        <div className="text-center py-12 text-muted">
                            <p>No jobs found in this category.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredJobs.map(job => (
                                <div
                                    key={job.id}
                                    onClick={() => handleJobClick(job.id)}
                                    className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-lg hover:border-primary/50 transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-surface rounded-md text-primary">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-text group-hover:text-primary transition-colors">{job.name}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-muted font-mono">{job.id}</span>
                                                <span className="text-xs text-muted">•</span>
                                                <span className="text-xs text-muted">{job.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {job.priority && (
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${job.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                                                job.priority === 'normal' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-gray-500/10 text-gray-500'
                                                }`}>
                                                {job.priority}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-surface/50 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-muted hover:text-text transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
