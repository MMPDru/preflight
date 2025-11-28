import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobService, jobQueries } from '../lib/firestore-service';
import { useAuth } from '../contexts/AuthContext';
import type { Job } from './JobCard';

type JobStatus = 'queue' | 'pending' | 'completed';

interface JobListProps {
    filter: JobStatus;
    onClose: () => void;
}

export const JobList: React.FC<JobListProps> = ({ filter, onClose }) => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const unsubscribe = jobQueries.subscribeToUserJobs(currentUser.uid, (data) => {
            const filteredJobs = data.filter(job => job.status === filter);
            setJobs(filteredJobs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [filter, currentUser]);

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

    const handleJobClick = (jobId: string, fileName: string) => {
        navigate(`/editor/${jobId}`, { state: { fileName } });
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
                            {jobs.length}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-text transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-auto p-6">
                    {loading ? (
                        <div className="text-center py-12 text-muted">
                            <p>Loading jobs...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-12 text-muted">
                            <p>No jobs found in this category.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {jobs.map(job => (
                                <div
                                    key={job.id}
                                    onClick={() => handleJobClick(job.id, job.fileName)}
                                    className="flex items-center justify-between p-4 bg-background/50 border border-border rounded-lg hover:border-primary/50 transition-colors group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-surface rounded-md text-primary">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-text group-hover:text-primary transition-colors">{job.fileName}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-muted font-mono">{job.id}</span>
                                                <span className="text-xs text-muted">•</span>
                                                <span className="text-xs text-muted">
                                                    {job.uploadDate?.toDate ? job.uploadDate.toDate().toLocaleDateString() : 'Recent'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted">
                                            {(job.fileSize / 1024 / 1024).toFixed(2)} MB
                                        </span>
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
