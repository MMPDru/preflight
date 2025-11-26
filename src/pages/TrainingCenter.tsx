import React, { useState, useEffect } from 'react';

import { getTrainingVideos } from '../lib/firestore';
import type { TrainingVideo } from '../lib/training-videos';

import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { Play, Search, Filter, BookOpen, Video, Users, Settings, Zap } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

export const TrainingCenter: React.FC = () => {
    const { currentUser: user } = useAuth();
    const [selectedVideo, setSelectedVideo] = useState<TrainingVideo | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [videos, setVideos] = useState<TrainingVideo[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter videos
    let filteredVideos = videos;

    if (searchQuery) {
        filteredVideos = filteredVideos.filter(v =>
            v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }

    if (selectedCategory !== 'all') {
        filteredVideos = filteredVideos.filter(v => v.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
        filteredVideos = filteredVideos.filter(v => v.difficulty === selectedDifficulty);
    }

    // Filter by user role
    if (user?.role) {
        filteredVideos = filteredVideos.filter(v => v.roles.includes(user.role as any));
    }

    const categories = [
        { id: 'all', label: 'All Videos', icon: Video },
        { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
        { id: 'pdf-analysis', label: 'PDF Analysis', icon: Search },
        { id: 'templates', label: 'Templates', icon: Zap },
        { id: 'workflows', label: 'Workflows', icon: Settings },
        { id: 'user-management', label: 'User Management', icon: Users },
        { id: 'advanced', label: 'Advanced', icon: Filter }
    ];

    const difficulties = [
        { id: 'all', label: 'All Levels' },
        { id: 'beginner', label: 'Beginner' },
        { id: 'intermediate', label: 'Intermediate' },
        { id: 'advanced', label: 'Advanced' }
    ];

    if (loading) {
        return (
            <>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
            </>
        );
    }

    useEffect(() => {
        async function fetch() {
            try {
                const data = await getTrainingVideos();
                setVideos(data);
            } catch (e) {
                console.error('Failed to load training videos', e);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    return (
        <>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-text mb-2">Training Center</h1>
                    <p className="text-muted">
                        Learn how to use PreFlight Pro with our comprehensive video tutorials
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="bg-surface border border-border rounded-xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search videos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Difficulty Filter */}
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="px-4 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {difficulties.map(diff => (
                                <option key={diff.id} value={diff.id}>{diff.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {categories.map(category => {
                        const Icon = category.icon;
                        const isActive = selectedCategory === category.id;
                        return (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={clsx(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap",
                                    isActive
                                        ? "bg-primary text-white"
                                        : "bg-surface text-muted hover:bg-surface/80 border border-border"
                                )}
                            >
                                <Icon size={18} />
                                {category.label}
                            </button>
                        );
                    })}
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map(video => (
                        <div
                            key={video.id}
                            className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
                            onClick={() => setSelectedVideo(video)}
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-background">
                                <img
                                    src={video.thumbnailUrl}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback to gradient if image doesn't exist
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                                        <Play size={32} className="text-white ml-1" />
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                                    {video.duration}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-text mb-2 line-clamp-2">
                                    {video.title}
                                </h3>
                                <p className="text-sm text-muted mb-3 line-clamp-2">
                                    {video.description}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={clsx(
                                        "px-2 py-1 rounded text-xs font-medium",
                                        video.difficulty === 'beginner' && "bg-green-500/10 text-green-400 border border-green-500/20",
                                        video.difficulty === 'intermediate' && "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
                                        video.difficulty === 'advanced' && "bg-red-500/10 text-red-400 border border-red-500/20"
                                    )}>
                                        {video.difficulty.charAt(0).toUpperCase() + video.difficulty.slice(1)}
                                    </span>
                                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs border border-primary/20 capitalize">
                                        {video.category.replace('-', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results */}
                {filteredVideos.length === 0 && (
                    <div className="text-center py-16">
                        <Video size={64} className="text-muted mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-text mb-2">No videos found</h3>
                        <p className="text-muted mb-6">
                            {searchQuery || selectedCategory !== 'all'
                                ? "Try adjusting your search or filters"
                                : "The video library appears to be empty."}
                        </p>

                        {/* Admin Seed Button - Only show if no search/filters active and user is admin (or for now just show it if empty for debugging) */}
                        {!searchQuery && selectedCategory === 'all' && selectedDifficulty === 'all' && (
                            <button
                                onClick={async () => {
                                    if (confirm('This will populate the database with default videos. Continue?')) {
                                        setLoading(true);
                                        try {
                                            const { seedTrainingVideos } = await import('../lib/seeder');
                                            await seedTrainingVideos();
                                            // Refresh
                                            const data = await getTrainingVideos();
                                            setVideos(data);
                                        } catch (e) {
                                            alert('Failed to seed videos');
                                            console.error(e);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }
                                }}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Seed Default Videos
                            </button>
                        )}
                    </div>
                )}

                {/* Video Player Modal */}
                {selectedVideo && (
                    <VideoPlayerModal
                        video={selectedVideo}
                        onClose={() => setSelectedVideo(null)}
                    />
                )}
            </div>
        </>
    );
};

