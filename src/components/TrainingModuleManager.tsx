import React, { useState } from 'react';
import {
    BookOpen, Play, CheckCircle, Lock, Star, Trophy, Target,
    Clock, Award, TrendingUp, Users, Video, FileText, Zap,
    Globe, MessageSquare, Settings as SettingsIcon
} from 'lucide-react';
import clsx from 'clsx';

interface TrainingModule {
    id: string;
    title: string;
    description: string;
    duration: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: 'customer' | 'staff';
    type: 'video' | 'interactive' | 'quiz' | 'practice';
    completed: boolean;
    locked: boolean;
    progress: number;
    rating: number;
    enrollments: number;
}

interface LearningPath {
    id: string;
    name: string;
    role: string;
    modules: string[];
    progress: number;
    estimatedTime: string;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: Date;
}

const CUSTOMER_MODULES: TrainingModule[] = [
    {
        id: 'onboarding',
        title: '3-Minute Quick Start',
        description: 'Interactive onboarding tour of essential features',
        duration: '3 min',
        difficulty: 'beginner',
        category: 'customer',
        type: 'interactive',
        completed: true,
        locked: false,
        progress: 100,
        rating: 4.8,
        enrollments: 1247
    },
    {
        id: 'setup-wizard',
        title: 'Personalized Setup',
        description: 'Configure your workspace based on your business type',
        duration: '5 min',
        difficulty: 'beginner',
        category: 'customer',
        type: 'interactive',
        completed: true,
        locked: false,
        progress: 100,
        rating: 4.9,
        enrollments: 1156
    },
    {
        id: 'proof-approval',
        title: 'Proof Review & Approval',
        description: 'Learn to review and approve proofs with confidence',
        duration: '8 min',
        difficulty: 'beginner',
        category: 'customer',
        type: 'video',
        completed: false,
        locked: false,
        progress: 45,
        rating: 4.7,
        enrollments: 892
    },
    {
        id: 'collaboration',
        title: 'Live Collaboration Tools',
        description: 'Master screen sharing, annotations, and video calls',
        duration: '12 min',
        difficulty: 'intermediate',
        category: 'customer',
        type: 'interactive',
        completed: false,
        locked: false,
        progress: 0,
        rating: 4.9,
        enrollments: 645
    },
    {
        id: 'advanced-features',
        title: 'Advanced Features',
        description: 'Automation, workflows, and power user tips',
        duration: '15 min',
        difficulty: 'advanced',
        category: 'customer',
        type: 'video',
        completed: false,
        locked: true,
        progress: 0,
        rating: 4.6,
        enrollments: 234
    }
];

const STAFF_MODULES: TrainingModule[] = [
    {
        id: 'preflight-basics',
        title: 'Preflight Fundamentals',
        description: 'Master all 25+ preflight parameters',
        duration: '20 min',
        difficulty: 'beginner',
        category: 'staff',
        type: 'interactive',
        completed: true,
        locked: false,
        progress: 100,
        rating: 4.9,
        enrollments: 156
    },
    {
        id: 'pdf-correction',
        title: 'Advanced PDF Correction',
        description: 'Techniques for fixing complex PDF issues',
        duration: '25 min',
        difficulty: 'advanced',
        category: 'staff',
        type: 'video',
        completed: false,
        locked: false,
        progress: 60,
        rating: 4.8,
        enrollments: 142
    },
    {
        id: 'customer-communication',
        title: 'Customer Communication Excellence',
        description: 'Best practices for client interactions',
        duration: '15 min',
        difficulty: 'intermediate',
        category: 'staff',
        type: 'interactive',
        completed: false,
        locked: false,
        progress: 0,
        rating: 4.7,
        enrollments: 138
    },
    {
        id: 'efficiency',
        title: 'Efficiency & Shortcuts',
        description: 'Optimize your workflow with keyboard shortcuts',
        duration: '10 min',
        difficulty: 'intermediate',
        category: 'staff',
        type: 'practice',
        completed: false,
        locked: false,
        progress: 0,
        rating: 4.6,
        enrollments: 124
    }
];

const LEARNING_PATHS: LearningPath[] = [
    {
        id: 'customer-basic',
        name: 'Customer Essentials',
        role: 'Customer',
        modules: ['onboarding', 'setup-wizard', 'proof-approval'],
        progress: 82,
        estimatedTime: '16 min'
    },
    {
        id: 'customer-advanced',
        name: 'Power User',
        role: 'Customer',
        modules: ['collaboration', 'advanced-features'],
        progress: 0,
        estimatedTime: '27 min'
    },
    {
        id: 'staff-complete',
        name: 'Complete Staff Training',
        role: 'Staff',
        modules: ['preflight-basics', 'pdf-correction', 'customer-communication', 'efficiency'],
        progress: 40,
        estimatedTime: '70 min'
    }
];

const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-module',
        title: 'Getting Started',
        description: 'Complete your first training module',
        icon: '🎯',
        unlocked: true,
        unlockedAt: new Date('2024-11-20')
    },
    {
        id: 'speed-learner',
        title: 'Speed Learner',
        description: 'Complete 3 modules in one day',
        icon: '⚡',
        unlocked: true,
        unlockedAt: new Date('2024-11-21')
    },
    {
        id: 'perfect-score',
        title: 'Perfect Score',
        description: 'Get 100% on a quiz',
        icon: '💯',
        unlocked: false
    },
    {
        id: 'master',
        title: 'Master',
        description: 'Complete all modules in a learning path',
        icon: '🏆',
        unlocked: false
    }
];

export const TrainingModuleManager: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<'customer' | 'staff'>('customer');
    const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
    const [showAchievements, setShowAchievements] = useState(false);

    const modules = selectedCategory === 'customer' ? CUSTOMER_MODULES : STAFF_MODULES;
    const completedCount = modules.filter(m => m.completed).length;
    const totalProgress = Math.round(modules.reduce((sum, m) => sum + m.progress, 0) / modules.length);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'text-green-500 bg-green-500/10';
            case 'intermediate': return 'text-yellow-500 bg-yellow-500/10';
            case 'advanced': return 'text-red-500 bg-red-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return Video;
            case 'interactive': return Play;
            case 'quiz': return Target;
            case 'practice': return Zap;
            default: return FileText;
        }
    };

    return (
        <div className="h-full bg-background overflow-auto">
            {/* Header */}
            <div className="p-6 border-b border-border bg-surface">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text">Training Center</h1>
                        <p className="text-sm text-muted">Interactive learning & skill development</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAchievements(!showAchievements)}
                            className="px-4 py-2 bg-background border border-border rounded-lg text-text hover:bg-surface transition-colors flex items-center gap-2"
                        >
                            <Trophy size={16} />
                            Achievements
                        </button>
                        <div className="flex gap-1 bg-background border border-border rounded-lg p-1">
                            <button
                                onClick={() => setSelectedCategory('customer')}
                                className={clsx(
                                    "px-4 py-2 rounded text-sm font-medium transition-colors",
                                    selectedCategory === 'customer'
                                        ? "bg-primary text-white"
                                        : "text-muted hover:text-text"
                                )}
                            >
                                Customer Training
                            </button>
                            <button
                                onClick={() => setSelectedCategory('staff')}
                                className={clsx(
                                    "px-4 py-2 rounded text-sm font-medium transition-colors",
                                    selectedCategory === 'staff'
                                        ? "bg-primary text-white"
                                        : "text-muted hover:text-text"
                                )}
                            >
                                Staff Training
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-background rounded-lg">
                        <div className="text-2xl font-bold text-text">{completedCount}/{modules.length}</div>
                        <div className="text-xs text-muted">Modules Completed</div>
                    </div>
                    <div className="p-4 bg-background rounded-lg">
                        <div className="text-2xl font-bold text-text">{totalProgress}%</div>
                        <div className="text-xs text-muted">Overall Progress</div>
                    </div>
                    <div className="p-4 bg-background rounded-lg">
                        <div className="text-2xl font-bold text-text">4.8★</div>
                        <div className="text-xs text-muted">Avg Rating</div>
                    </div>
                    <div className="p-4 bg-background rounded-lg">
                        <div className="text-2xl font-bold text-text">{ACHIEVEMENTS.filter(a => a.unlocked).length}/{ACHIEVEMENTS.length}</div>
                        <div className="text-xs text-muted">Achievements</div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Achievements Panel */}
                {showAchievements && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl">
                        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                            <Trophy size={20} className="text-yellow-500" />
                            Your Achievements
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {ACHIEVEMENTS.map(achievement => (
                                <div
                                    key={achievement.id}
                                    className={clsx(
                                        "p-4 rounded-lg text-center transition-all",
                                        achievement.unlocked
                                            ? "bg-yellow-500/20 border-2 border-yellow-500/50"
                                            : "bg-background border border-border opacity-50"
                                    )}
                                >
                                    <div className="text-4xl mb-2">{achievement.icon}</div>
                                    <h3 className="font-bold text-text text-sm mb-1">{achievement.title}</h3>
                                    <p className="text-xs text-muted mb-2">{achievement.description}</p>
                                    {achievement.unlocked && achievement.unlockedAt && (
                                        <p className="text-xs text-yellow-500">
                                            Unlocked {achievement.unlockedAt.toLocaleDateString()}
                                        </p>
                                    )}
                                    {!achievement.unlocked && (
                                        <div className="flex items-center justify-center gap-1 text-xs text-muted">
                                            <Lock size={12} />
                                            Locked
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Learning Paths */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                        <Target size={20} />
                        Learning Paths
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {LEARNING_PATHS.filter(path =>
                            (selectedCategory === 'customer' && path.role === 'Customer') ||
                            (selectedCategory === 'staff' && path.role === 'Staff')
                        ).map(path => (
                            <div
                                key={path.id}
                                className="p-6 bg-surface border border-border rounded-xl hover:border-primary/50 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-text mb-1">{path.name}</h3>
                                        <p className="text-xs text-muted">{path.modules.length} modules • {path.estimatedTime}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-primary">{path.progress}%</div>
                                    </div>
                                </div>
                                <div className="w-full bg-background h-2 rounded-full overflow-hidden mb-4">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${path.progress}%` }}
                                    />
                                </div>
                                <button className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
                                    {path.progress > 0 ? 'Continue' : 'Start'} Path
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Training Modules */}
                <div>
                    <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                        <BookOpen size={20} />
                        All Modules
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modules.map(module => {
                            const TypeIcon = getTypeIcon(module.type);
                            return (
                                <div
                                    key={module.id}
                                    onClick={() => !module.locked && setSelectedModule(module)}
                                    className={clsx(
                                        "p-6 bg-surface border rounded-xl transition-all",
                                        module.locked
                                            ? "opacity-50 cursor-not-allowed border-border"
                                            : "cursor-pointer hover:border-primary/50 border-border"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <TypeIcon size={20} />
                                            </div>
                                            {module.completed && (
                                                <div className="p-1 bg-green-500 rounded-full">
                                                    <CheckCircle size={16} className="text-white" />
                                                </div>
                                            )}
                                            {module.locked && (
                                                <div className="p-1 bg-gray-500 rounded-full">
                                                    <Lock size={16} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <span className={clsx(
                                            "px-2 py-1 rounded-full text-xs font-medium capitalize",
                                            getDifficultyColor(module.difficulty)
                                        )}>
                                            {module.difficulty}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-text mb-2">{module.title}</h3>
                                    <p className="text-sm text-muted mb-4">{module.description}</p>

                                    <div className="flex items-center gap-3 text-xs text-muted mb-4">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {module.duration}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star size={12} fill="currentColor" className="text-yellow-500" />
                                            {module.rating}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users size={12} />
                                            {module.enrollments}
                                        </span>
                                    </div>

                                    {module.progress > 0 && !module.completed && (
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-xs text-muted mb-1">
                                                <span>Progress</span>
                                                <span>{module.progress}%</span>
                                            </div>
                                            <div className="w-full bg-background h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all"
                                                    style={{ width: `${module.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        disabled={module.locked}
                                        className={clsx(
                                            "w-full px-4 py-2 rounded-lg font-medium transition-colors",
                                            module.locked
                                                ? "bg-surface text-muted cursor-not-allowed"
                                                : module.completed
                                                    ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                                    : module.progress > 0
                                                        ? "bg-primary text-white hover:bg-primary/90"
                                                        : "bg-surface border border-border text-text hover:bg-background"
                                        )}
                                    >
                                        {module.locked ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Lock size={16} />
                                                Locked
                                            </span>
                                        ) : module.completed ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <CheckCircle size={16} />
                                                Review
                                            </span>
                                        ) : module.progress > 0 ? (
                                            'Continue'
                                        ) : (
                                            'Start Module'
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Language Support */}
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Globe size={24} className="text-blue-500" />
                            <div>
                                <h3 className="font-bold text-text">Multi-Language Support</h3>
                                <p className="text-sm text-muted">Training available in 12 languages with regional printing standards</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
                            Change Language
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
