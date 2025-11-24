import React, { useState } from 'react';
import { BarChart2, TrendingUp, Users, FileText, Clock, ThumbsUp, ArrowUp, ArrowDown } from 'lucide-react';
import clsx from 'clsx';

interface MetricCardProps {
    title: string;
    value: string;
    change: number;
    icon: React.ElementType;
    color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
            <div className={clsx("p-3 rounded-lg", `bg-${color}-500/10 text-${color}-500`)}>
                <Icon size={24} />
            </div>
            <div className={clsx(
                "flex items-center gap-1 text-sm font-medium",
                change >= 0 ? "text-green-500" : "text-red-500"
            )}>
                {change >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                {Math.abs(change)}%
            </div>
        </div>
        <h3 className="text-3xl font-bold text-text mb-1">{value}</h3>
        <p className="text-sm text-muted">{title}</p>
    </div>
);

const SimpleBarChart: React.FC<{ data: number[]; labels: string[]; color: string }> = ({ data, labels, color }) => {
    const max = Math.max(...data);
    return (
        <div className="h-48 flex items-end gap-2">
            {data.map((value, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full flex items-end justify-center h-full">
                        <div
                            className={clsx(
                                "w-full rounded-t-sm transition-all duration-500 group-hover:opacity-80",
                                `bg-${color}-500`
                            )}
                            style={{ height: `${(value / max) * 100}%` }}
                        />
                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {value}
                        </div>
                    </div>
                    <span className="text-xs text-muted truncate w-full text-center">{labels[i]}</span>
                </div>
            ))}
        </div>
    );
};

export const AnalyticsDashboard: React.FC = () => {
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-text">Analytics & Monitoring</h1>
                        <p className="text-muted mt-1">Real-time insights on support and documentation</p>
                    </div>
                    <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1">
                        {['day', 'week', 'month'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range as any)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
                                    timeRange === range
                                        ? "bg-primary text-white"
                                        : "text-muted hover:text-text"
                                )}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Sessions"
                        value="1,248"
                        change={12.5}
                        icon={Users}
                        color="blue"
                    />
                    <MetricCard
                        title="Avg. Resolution Time"
                        value="4m 12s"
                        change={-8.3}
                        icon={Clock}
                        color="green"
                    />
                    <MetricCard
                        title="Doc Effectiveness"
                        value="94%"
                        change={2.1}
                        icon={FileText}
                        color="purple"
                    />
                    <MetricCard
                        title="User Satisfaction"
                        value="4.8/5"
                        change={0.5}
                        icon={ThumbsUp}
                        color="yellow"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Session Volume */}
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-text flex items-center gap-2">
                                <BarChart2 className="text-primary" size={20} />
                                Support Session Volume
                            </h3>
                        </div>
                        <SimpleBarChart
                            data={[45, 62, 58, 71, 85, 66, 48]}
                            labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                            color="blue"
                        />
                    </div>

                    {/* Documentation Usage */}
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-text flex items-center gap-2">
                                <TrendingUp className="text-green-500" size={20} />
                                Documentation Engagement
                            </h3>
                        </div>
                        <SimpleBarChart
                            data={[120, 145, 132, 168, 190, 110, 95]}
                            labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
                            color="green"
                        />
                    </div>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Top Issues */}
                    <div className="bg-surface border border-border rounded-xl p-6 lg:col-span-2">
                        <h3 className="text-lg font-bold text-text mb-4">Top Support Topics</h3>
                        <div className="space-y-4">
                            {[
                                { topic: 'Bleed Settings', count: 342, percentage: 35 },
                                { topic: 'Color Profile Mismatch', count: 215, percentage: 22 },
                                { topic: 'Font Embedding', count: 184, percentage: 19 },
                                { topic: 'Workflow Automation', count: 126, percentage: 13 },
                                { topic: 'Account Access', count: 98, percentage: 11 }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-sm font-medium text-text w-48">{item.topic}</span>
                                    <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-muted w-12 text-right">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Agent Performance */}
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <h3 className="text-lg font-bold text-text mb-4">Top Agents</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Sarah Connor', rating: 4.9, solved: 145 },
                                { name: 'John Doe', rating: 4.8, solved: 132 },
                                { name: 'Jane Smith', rating: 4.7, solved: 128 },
                                { name: 'Mike Ross', rating: 4.6, solved: 115 }
                            ].map((agent, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                                            {agent.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-text">{agent.name}</div>
                                            <div className="text-xs text-muted">{agent.solved} tickets</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                        <ThumbsUp size={14} />
                                        {agent.rating}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
