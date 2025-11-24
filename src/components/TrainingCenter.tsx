import React, { useState } from 'react';
import { Play, Book, FileText, CheckCircle, Award, Search, Zap, Video, ArrowRight, X } from 'lucide-react';
import clsx from 'clsx';
import { MOCK_MODULES, MOCK_DOCS } from '../lib/mock-data';

export const TrainingCenter: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<string>('all');

    const [activeVideo, setActiveVideo] = useState<{ title: string; url: string } | null>(null);

    const filteredModules = activeCategory === 'all'
        ? MOCK_MODULES
        : MOCK_MODULES.filter(m => m.category === activeCategory);

    const handleDocClick = (title: string) => {
        alert(`Opening documentation for: ${title}`);
    };

    const handleVideoClick = (title: string) => {
        // For demo purposes, we'll use a sample video
        setActiveVideo({
            title,
            url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        });
    };

    const [showTour, setShowTour] = useState(false);
    const [tourStep, setTourStep] = useState(0);

    const tourSteps = [
        {
            title: "Welcome to Training Center",
            description: "Your central hub for learning PreFlight Pro. Master workflows, fix issues, and become a pro.",
            target: "header"
        },
        {
            title: "Learning Paths",
            description: "Structured courses designed to take you from beginner to expert. Track your progress here.",
            target: "paths"
        },
        {
            title: "Video Library",
            description: "Quick video tutorials for common tasks and troubleshooting. Click to watch.",
            target: "videos"
        },
        {
            title: "Auto-Generated Docs",
            description: "Stay up to date with the latest features and fixes, automatically documented for you.",
            target: "docs"
        }
    ];

    const handleNextStep = () => {
        if (tourStep < tourSteps.length - 1) {
            setTourStep(prev => prev + 1);
        } else {
            setShowTour(false);
            setTourStep(0);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 relative">
            {/* Tour Overlay */}
            {showTour && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-surface border border-primary/50 rounded-xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-text flex items-center gap-2">
                                <Zap className="text-secondary" />
                                {tourSteps[tourStep].title}
                            </h3>
                            <span className="text-xs font-medium text-muted bg-surface-light px-2 py-1 rounded-full border border-border">
                                Step {tourStep + 1}/{tourSteps.length}
                            </span>
                        </div>
                        <p className="text-muted mb-6 leading-relaxed">
                            {tourSteps[tourStep].description}
                        </p>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => { setShowTour(false); setTourStep(0); }}
                                className="text-sm text-muted hover:text-text transition-colors"
                            >
                                Skip Tour
                            </button>
                            <button
                                onClick={handleNextStep}
                                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                {tourStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Player Modal */}
            {activeVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setActiveVideo(null)}>
                    <div
                        className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-bold text-text flex items-center gap-2">
                                <Video size={20} className="text-primary" />
                                {activeVideo.title}
                            </h3>
                            <button
                                onClick={() => setActiveVideo(null)}
                                className="text-muted hover:text-text transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="aspect-video bg-black relative">
                            <video
                                src={activeVideo.url}
                                controls
                                autoPlay
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-text">Training Center</h1>
                        <p className="text-muted mt-1">AI-powered learning paths and documentation</p>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search guides & videos..."
                            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Learning Paths */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text flex items-center gap-2">
                                <Award className="text-primary" />
                                Learning Paths
                            </h2>
                            <div className="flex gap-2">
                                {['all', 'onboarding', 'advanced', 'admin'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={clsx(
                                            "px-3 py-1 rounded-full text-sm font-medium capitalize transition-colors",
                                            activeCategory === cat
                                                ? "bg-primary text-white"
                                                : "bg-surface text-muted hover:text-text"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {filteredModules.map(module => (
                                <div key={module.id} className="bg-surface border border-border rounded-xl p-4 flex gap-4 hover:border-primary/30 transition-all group cursor-pointer">
                                    <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0">
                                        <img src={module.image} alt={module.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-text group-hover:text-primary transition-colors">{module.title}</h3>
                                                {module.progress === 100 && (
                                                    <CheckCircle size={16} className="text-green-500" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted line-clamp-2">{module.description}</p>
                                        </div>
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-xs text-muted mb-1">
                                                <span>{module.completedLessons}/{module.totalLessons} Lessons</span>
                                                <span>{module.progress}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{ width: `${module.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Video Library Section */}
                        <div className="pt-8">
                            <h2 className="text-xl font-bold text-text flex items-center gap-2 mb-4">
                                <Video className="text-secondary" />
                                Video Library
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: 'How to fix transparency issues', time: '3:45', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80' },
                                    { title: 'Understanding Bleed Zones', time: '5:12', img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&q=80' },
                                    { title: 'Font Embedding Guide', time: '4:20', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80' },
                                    { title: 'Exporting for Print', time: '6:15', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80' }
                                ].map((video, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleVideoClick(video.title)}
                                        className="bg-surface border border-border rounded-xl overflow-hidden group cursor-pointer hover:border-primary/50 transition-all"
                                    >
                                        <div className="aspect-video bg-black/20 relative overflow-hidden">
                                            <img src={video.img} alt={video.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                                    <Play size={20} className="ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                {video.time}
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-medium text-text text-sm mb-1 group-hover:text-primary transition-colors">{video.title}</h4>
                                            <p className="text-xs text-muted">Updated yesterday</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Auto-Docs Feed */}
                    <div className="space-y-6">
                        <div className="bg-surface border border-border rounded-xl p-6">
                            <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-4">
                                <Zap className="text-yellow-500" />
                                Auto-Generated Docs
                            </h2>
                            <div className="space-y-6">
                                {MOCK_DOCS.map((doc, i) => (
                                    <div
                                        key={doc.id}
                                        onClick={() => handleDocClick(doc.title)}
                                        className="relative pl-4 border-l-2 border-border hover:border-primary transition-colors cursor-pointer group"
                                    >
                                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform" />
                                        <div className="mb-1">
                                            <span className={clsx(
                                                "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                                                doc.type === 'feature' && "bg-blue-500/10 text-blue-500",
                                                doc.type === 'fix' && "bg-green-500/10 text-green-500",
                                                doc.type === 'workflow' && "bg-purple-500/10 text-purple-500"
                                            )}>
                                                {doc.type}
                                            </span>
                                            <span className="text-xs text-muted ml-2">{doc.timestamp}</span>
                                        </div>
                                        <h3 className="font-medium text-text text-sm mb-1 group-hover:text-primary transition-colors">
                                            {doc.title}
                                        </h3>
                                        <p className="text-xs text-muted leading-relaxed">
                                            {doc.summary}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-2 text-sm text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center gap-2">
                                View All Updates
                                <ArrowRight size={16} />
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 rounded-xl p-6">
                            <h3 className="font-bold text-text mb-2">Need personalized help?</h3>
                            <p className="text-sm text-muted mb-4">
                                Our AI support agent can guide you through any workflow or feature.
                            </p>
                            <button
                                onClick={() => setShowTour(true)}
                                className="w-full py-2 bg-background hover:bg-surface text-text border border-border rounded-lg text-sm font-medium transition-colors"
                            >
                                Start Interactive Tour
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
