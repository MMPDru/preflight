import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { JobCard, type Job } from '../components/JobCard';
import { JobList } from '../components/JobList';
import { Clock, FileText, CheckCircle, Settings as SettingsIcon, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobService } from '../lib/firestore-service';
import { validateFile, processFileUpload } from '../lib/upload-handler';

export const Dashboard = () => {
    const [showJobList, setShowJobList] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<'queue' | 'pending' | 'completed' | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]); // Consolidated job list
    const [loadingJobs, setLoadingJobs] = useState(true); // State for loading jobs
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    // Map Firestore Job to UI Job shape expected by JobCard
    const mapJob = (job: any): Job => ({
        id: job.id,
        fileName: job.fileName,
        status: job.status as any,
        uploadedAt: job.uploadDate.toDate(),
        fileSize: job.fileSize,
        thumbnail: undefined,
    });

    useEffect(() => {
        const unsubscribe = jobService.subscribe((data) => {
            const uiJobs = data.map(mapJob);
            setJobs(uiJobs);
            setLoadingJobs(false);
        }, {});
        return () => unsubscribe();
    }, []);

    const handleUpload = async (files: File[]) => {
        const newJobs: Job[] = [];

        for (const file of files) {
            const validation = validateFile(file);
            if (!validation.valid) {
                alert(`${file.name}: ${validation.error}`);
                continue;
            }

            try {
                const job = await processFileUpload(file);
                newJobs.push(job);
            } catch (e) {
                console.error('Failed to process file', e);
                alert(`Failed to process ${file.name}`);
            }
        }

        setJobs(prev => [...newJobs, ...prev]); // Add new jobs to the consolidated list
    };

    const handleStatClick = (status: 'queue' | 'pending' | 'completed') => {
        setSelectedStatus(status);
        setShowJobList(true);
    };

    const handleDeleteJob = (id: string) => {
        if (confirm('Are you sure you want to delete this job?')) {
            setJobs(prev => prev.filter(job => job.id !== id));
        }
    };

    const handleDuplicateJob = (id: string) => {
        const job = jobs.find(j => j.id === id);
        if (job) {
            const duplicate: Job = {
                ...job,
                id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                fileName: `${job.fileName} (Copy)`,
                uploadedAt: new Date(),
            };
            setJobs(prev => [duplicate, ...prev]);
        }
    };

    const getCount = (status: 'queue' | 'pending' | 'completed') => {
        return jobs.filter((job) => job.status === status).length;
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header with Branding */}
            <div className="bg-surface border-b border-border">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img
                                src="/minute-marketing-logo.jpg"
                                alt="Minute Marketing"
                                className="h-12 w-auto object-contain"
                            />
                            <div className="border-l border-border h-10" />
                            <div>
                                <h1 className="text-2xl font-bold text-primary">PreFlight Pro</h1>
                                <p className="text-xs text-muted">Print Production Management</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/training" className="px-3 py-1.5 text-muted hover:text-text hover:bg-background rounded-lg text-sm font-medium transition-colors">
                                Training Center
                            </Link>
                            <Link to="/analytics" className="px-3 py-1.5 text-muted hover:text-text hover:bg-background rounded-lg text-sm font-medium transition-colors">
                                Analytics
                            </Link>
                            <Link to="/agent" className="px-3 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-sm font-medium hover:bg-secondary/20 transition-colors">
                                Agent View
                            </Link>
                            <Link to="/settings" className="p-2 text-muted hover:text-text hover:bg-background rounded-lg transition-colors">
                                <SettingsIcon size={20} />
                            </Link>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-muted hover:text-text hover:bg-background rounded-lg transition-colors"
                                >
                                    <UserIcon size={18} />
                                    <span className="text-sm font-medium">{currentUser?.displayName || 'User'}</span>
                                    <ChevronDown size={16} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
                                        <div className="px-4 py-2 border-b border-border">
                                            <p className="text-sm font-medium text-text">{currentUser?.displayName}</p>
                                            <p className="text-xs text-muted truncate">{currentUser?.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-text hover:bg-background transition-colors"
                                        >
                                            <LogOut size={16} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        onClick={() => handleStatClick('queue')}
                        className="bg-surface border border-border rounded-xl p-6 hover:border-primary/30 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                <Clock className="text-primary" size={24} />
                            </div>
                            <span className="text-3xl font-bold text-text">{getCount('queue')}</span>
                        </div>
                        <h3 className="text-sm font-medium text-muted uppercase tracking-wider">In Queue</h3>
                    </div>

                    <div
                        onClick={() => handleStatClick('pending')}
                        className="bg-surface border border-border rounded-xl p-6 hover:border-primary/30 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                <FileText className="text-blue-400" size={24} />
                            </div>
                            <span className="text-3xl font-bold text-text">{getCount('pending')}</span>
                        </div>
                        <h3 className="text-sm font-medium text-muted uppercase tracking-wider">Pending Approval</h3>
                    </div>

                    <div
                        onClick={() => handleStatClick('completed')}
                        className="bg-surface border border-border rounded-xl p-6 hover:border-primary/30 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                                <CheckCircle className="text-green-500" size={24} />
                            </div>
                            <span className="text-3xl font-bold text-text">{getCount('completed')}</span>
                        </div>
                        <h3 className="text-sm font-medium text-muted uppercase tracking-wider">Completed Today</h3>
                    </div>
                </div>

                <FileUpload onUpload={handleUpload} />

                {jobs.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text">Recent Uploads</h2>
                            <span className="text-sm text-muted">{jobs.length} jobs</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {jobs.slice(0, 6).map(job => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    onDelete={handleDeleteJob}
                                    onDuplicate={handleDuplicateJob}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showJobList && selectedStatus && (
                <JobList
                    filter={selectedStatus}
                    onClose={() => setShowJobList(false)}
                />
            )}
        </div>
    );
};
