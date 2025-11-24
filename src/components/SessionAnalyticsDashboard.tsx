import React, { useState } from 'react';
import {
    TrendingUp, Clock, Users, CheckCircle, Star, MessageSquare,
    Video, Monitor, Bot, ArrowUp, ArrowDown, Activity, Target,
    BarChart3, PieChart, Calendar, Download, Filter
} from 'lucide-react';
import clsx from 'clsx';

interface SessionAnalyticsProps {
    dateRange?: { start: Date; end: Date };
}

interface Metric {
    label: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
    icon: any;
    color: string;
}

interface ChannelStats {
    channel: string;
    sessions: number;
    avgDuration: string;
    resolution: number;
    satisfaction: number;
}

const METRICS: Metric[] = [
    {
        label: 'Total Sessions',
        value: '1,247',
        change: 12.5,
        trend: 'up',
        icon: Users,
        color: 'from-blue-500 to-cyan-500'
    },
    {
        label: 'Avg Session Duration',
        value: '8m 32s',
        change: -5.2,
        trend: 'down',
        icon: Clock,
        color: 'from-purple-500 to-pink-500'
    },
    {
        label: 'First Contact Resolution',
        value: '94.2%',
        change: 3.1,
        trend: 'up',
        icon: CheckCircle,
        color: 'from-green-500 to-emerald-500'
    },
    {
        label: 'Customer Satisfaction',
        value: '4.8',
        change: 0.2,
        trend: 'up',
        icon: Star,
        color: 'from-yellow-500 to-orange-500'
    },
    {
        label: 'Avg Connection Time',
        value: '28s',
        change: -12.3,
        trend: 'down',
        icon: Activity,
        color: 'from-red-500 to-pink-500'
    },
    {
        label: 'Escalation Rate',
        value: '15.3%',
        change: -2.1,
        trend: 'down',
        icon: TrendingUp,
        color: 'from-orange-500 to-red-500'
    }
];

const CHANNEL_STATS: ChannelStats[] = [
    {
        channel: 'AI Chatbot',
        sessions: 523,
        avgDuration: '2m 15s',
        resolution: 85,
        satisfaction: 4.6
    },
    {
        channel: 'Live Chat',
        sessions: 412,
        avgDuration: '6m 45s',
        resolution: 92,
        satisfaction: 4.7
    },
    {
        channel: 'Screen Share',
        sessions: 218,
        avgDuration: '12m 30s',
        resolution: 95,
        satisfaction: 4.9
    },
    {
        channel: 'Video Call',
        sessions: 94,
        avgDuration: '18m 20s',
        resolution: 98,
        satisfaction: 5.0
    }
];

const ESCALATION_FLOW = [
    { from: 'AI Chatbot', to: 'Live Chat', count: 78, percentage: 14.9 },
    { from: 'Live Chat', to: 'Screen Share', count: 62, percentage: 15.0 },
    { from: 'Screen Share', to: 'Video Call', count: 33, percentage: 15.1 }
];

const PEAK_HOURS = [
    { hour: '9 AM', sessions: 45 },
    { hour: '10 AM', sessions: 78 },
    { hour: '11 AM', sessions: 92 },
    { hour: '12 PM', sessions: 65 },
    { hour: '1 PM', sessions: 58 },
    { hour: '2 PM', sessions: 88 },
    { hour: '3 PM', sessions: 95 },
    { hour: '4 PM', sessions: 72 },
    { hour: '5 PM', sessions: 54 }
];

const COMMON_TOPICS = [
    { topic: 'Bleed Settings', count: 234, trend: 'up' },
    { topic: 'Color Profile', count: 189, trend: 'down' },
    { topic: 'PDF Export', count: 156, trend: 'up' },
    { topic: 'File Upload', count: 142, trend: 'neutral' },
    { topic: 'Approval Workflow', count: 128, trend: 'up' }
];

export const SessionAnalyticsDashboard: React.FC<SessionAnalyticsProps> = ({ dateRange }) => {
    const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
    const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

    const getChannelIcon = (channel: string) => {
        switch (channel) {
            case 'AI Chatbot': return Bot;
            case 'Live Chat': return MessageSquare;
            case 'Screen Share': return Monitor;
            case 'Video Call': return Video;
            default: return Users;
        }
    };

    return (
        <div className="h-full bg-background overflow-auto">
            {/* Header */}
            <div className="p-6 border-b border-border bg-surface">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text">Session Analytics</h1>
                        <p className="text-sm text-muted">Collaboration & support metrics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Period Selector */}
                        <div className="flex gap-1 bg-background border border-border rounded-lg p-1">
                            {(['day', 'week', 'month', 'year'] as const).map(period => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={clsx(
                                        "px-3 py-1 rounded text-sm font-medium capitalize transition-colors",
                                        selectedPeriod === period
                                            ? "bg-primary text-white"
                                            : "text-muted hover:text-text"
                                    )}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>

                        {/* Actions */}
                        <button className="px-4 py-2 bg-background border border-border rounded-lg text-text hover:bg-surface transition-colors flex items-center gap-2">
                            <Filter size={16} />
                            Filter
                        </button>
                        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {METRICS.map(metric => {
                        const Icon = metric.icon;
                        return (
                            <div
                                key={metric.label}
                                className="p-6 bg-surface border border-border rounded-xl hover:border-primary/50 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={clsx(
                                        "w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br",
                                        metric.color
                                    )}>
                                        <Icon size={24} className="text-white" />
                                    </div>
                                    <div className={clsx(
                                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                        metric.trend === 'up' && "bg-green-500/10 text-green-500",
                                        metric.trend === 'down' && "bg-red-500/10 text-red-500",
                                        metric.trend === 'neutral' && "bg-gray-500/10 text-gray-500"
                                    )}>
                                        {metric.trend === 'up' && <ArrowUp size={12} />}
                                        {metric.trend === 'down' && <ArrowDown size={12} />}
                                        {Math.abs(metric.change)}%
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-text mb-1">{metric.value}</div>
                                <div className="text-sm text-muted">{metric.label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Channel Performance */}
                <div className="bg-surface border border-border rounded-xl p-6">
                    <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                        <BarChart3 size={20} />
                        Channel Performance
                    </h2>
                    <div className="space-y-3">
                        {CHANNEL_STATS.map(channel => {
                            const Icon = getChannelIcon(channel.channel);
                            const maxSessions = Math.max(...CHANNEL_STATS.map(c => c.sessions));
                            const percentage = (channel.sessions / maxSessions) * 100;

                            return (
                                <div
                                    key={channel.channel}
                                    onClick={() => setSelectedChannel(channel.channel)}
                                    className={clsx(
                                        "p-4 bg-background rounded-lg cursor-pointer transition-all",
                                        selectedChannel === channel.channel
                                            ? "border-2 border-primary"
                                            : "border border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-text">{channel.channel}</h3>
                                                <p className="text-xs text-muted">{channel.sessions} sessions</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-text">{channel.avgDuration}</div>
                                            <div className="text-xs text-muted">Avg Duration</div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden mb-3">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-2 bg-surface rounded">
                                            <div className="text-lg font-bold text-green-500">{channel.resolution}%</div>
                                            <div className="text-xs text-muted">Resolution</div>
                                        </div>
                                        <div className="text-center p-2 bg-surface rounded">
                                            <div className="text-lg font-bold text-yellow-500">{channel.satisfaction}★</div>
                                            <div className="text-xs text-muted">Satisfaction</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Escalation Flow */}
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                            <TrendingUp size={20} />
                            Escalation Flow
                        </h2>
                        <div className="space-y-4">
                            {ESCALATION_FLOW.map(flow => (
                                <div key={`${flow.from}-${flow.to}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-text font-medium">{flow.from}</span>
                                            <ArrowUp size={14} className="text-muted rotate-90" />
                                            <span className="text-text font-medium">{flow.to}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-bold text-text">{flow.count}</span>
                                            <span className="text-muted ml-1">({flow.percentage}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500 transition-all"
                                            style={{ width: `${flow.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Peak Hours */}
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                            <Calendar size={20} />
                            Peak Usage Hours
                        </h2>
                        <div className="space-y-2">
                            {PEAK_HOURS.map(hour => {
                                const maxSessions = Math.max(...PEAK_HOURS.map(h => h.sessions));
                                const percentage = (hour.sessions / maxSessions) * 100;

                                return (
                                    <div key={hour.hour} className="flex items-center gap-3">
                                        <span className="text-sm text-muted w-16">{hour.hour}</span>
                                        <div className="flex-1 bg-surface h-8 rounded-lg overflow-hidden relative">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-text">
                                                {hour.sessions} sessions
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Common Topics */}
                <div className="bg-surface border border-border rounded-xl p-6">
                    <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                        <Target size={20} />
                        Common Discussion Topics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {COMMON_TOPICS.map(topic => (
                            <div
                                key={topic.topic}
                                className="p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-all"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-text text-sm">{topic.topic}</h3>
                                    <div className={clsx(
                                        "w-2 h-2 rounded-full",
                                        topic.trend === 'up' && "bg-green-500",
                                        topic.trend === 'down' && "bg-red-500",
                                        topic.trend === 'neutral' && "bg-gray-500"
                                    )} />
                                </div>
                                <div className="text-2xl font-bold text-text">{topic.count}</div>
                                <div className="text-xs text-muted">mentions</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Success Metrics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                        <div className="text-3xl font-bold text-green-500 mb-1">70%</div>
                        <div className="text-sm text-text">First Session Approval</div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
                        <div className="text-3xl font-bold text-blue-500 mb-1">&lt;30s</div>
                        <div className="text-sm text-text">Connection Time</div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                        <div className="text-3xl font-bold text-purple-500 mb-1">95%</div>
                        <div className="text-sm text-text">Call Quality</div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl">
                        <div className="text-3xl font-bold text-orange-500 mb-1">50%</div>
                        <div className="text-sm text-text">Email Reduction</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
