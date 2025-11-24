import React, { useState } from 'react';
import {
    Users, Clock, Coffee, AlertCircle, CheckCircle, XCircle,
    ArrowRight, Filter, Search, BarChart3, TrendingUp, UserCheck
} from 'lucide-react';
import clsx from 'clsx';

// Types
interface Agent {
    id: string;
    name: string;
    avatar: string;
    status: 'available' | 'busy' | 'break' | 'offline';
    skills: string[];
    currentLoad: number;
    maxLoad: number;
    activeCustomers: number;
    avgResponseTime: string;
    satisfaction: number;
}

interface QueueItem {
    id: string;
    customerId: string;
    customerName: string;
    company: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    waitTime: number; // seconds
    issue: string;
    requiredSkills: string[];
    estimatedDuration: number; // minutes
    preferredAgent?: string;
}

interface QueueManagementProps {
    onAssign: (queueItem: QueueItem, agentId: string) => void;
    onTransfer: (queueItem: QueueItem, fromAgent: string, toAgent: string) => void;
}

const SKILLS = [
    'Color Management',
    'Preflight',
    'PDF Standards',
    'Bleed Settings',
    'Print Production',
    'File Prep',
    'Design Review',
    'Technical Support'
];

const MOCK_AGENTS: Agent[] = [
    {
        id: 'agent-1',
        name: 'Sarah Chen',
        avatar: '👩‍💼',
        status: 'available',
        skills: ['Color Management', 'Preflight', 'PDF Standards'],
        currentLoad: 2,
        maxLoad: 5,
        activeCustomers: 2,
        avgResponseTime: '45s',
        satisfaction: 4.9
    },
    {
        id: 'agent-2',
        name: 'Mike Rodriguez',
        avatar: '👨‍💻',
        status: 'busy',
        skills: ['Bleed Settings', 'Print Production', 'File Prep'],
        currentLoad: 5,
        maxLoad: 5,
        activeCustomers: 5,
        avgResponseTime: '2m 15s',
        satisfaction: 4.8
    },
    {
        id: 'agent-3',
        name: 'Emma Watson',
        avatar: '👩‍🎨',
        status: 'break',
        skills: ['Design Review', 'Color Management'],
        currentLoad: 0,
        maxLoad: 4,
        activeCustomers: 0,
        avgResponseTime: '30s',
        satisfaction: 5.0
    },
    {
        id: 'agent-4',
        name: 'James Lee',
        avatar: '👨‍🔧',
        status: 'available',
        skills: ['Technical Support', 'Preflight', 'File Prep'],
        currentLoad: 1,
        maxLoad: 6,
        activeCustomers: 1,
        avgResponseTime: '1m 10s',
        satisfaction: 4.7
    }
];

const MOCK_QUEUE: QueueItem[] = [
    {
        id: 'q-1',
        customerId: 'cust-1',
        customerName: 'Alice Johnson',
        company: 'Design Co.',
        priority: 'critical',
        waitTime: 180, // 3 minutes
        issue: 'Urgent bleed settings error blocking production',
        requiredSkills: ['Bleed Settings', 'Print Production'],
        estimatedDuration: 15
    },
    {
        id: 'q-2',
        customerId: 'cust-2',
        customerName: 'Bob Smith',
        company: 'Print Fast',
        priority: 'high',
        waitTime: 120,
        issue: 'Color profile not converting correctly',
        requiredSkills: ['Color Management', 'Preflight'],
        estimatedDuration: 20,
        preferredAgent: 'agent-1'
    },
    {
        id: 'q-3',
        customerId: 'cust-3',
        customerName: 'Carol White',
        company: 'Marketing Pros',
        priority: 'medium',
        waitTime: 45,
        issue: 'PDF export settings question',
        requiredSkills: ['PDF Standards', 'Technical Support'],
        estimatedDuration: 10
    },
    {
        id: 'q-4',
        customerId: 'cust-4',
        customerName: 'David Brown',
        company: 'Creative Studio',
        priority: 'low',
        waitTime: 15,
        issue: 'General workflow inquiry',
        requiredSkills: ['Technical Support'],
        estimatedDuration: 5
    }
];

export const QueueManagement: React.FC<QueueManagementProps> = ({ onAssign, onTransfer }) => {
    const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
    const [queue, setQueue] = useState<QueueItem[]>(MOCK_QUEUE);
    const [selectedSkillFilter, setSelectedSkillFilter] = useState<string[]>([]);
    const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
    const [showAgentDetails, setShowAgentDetails] = useState(false);

    // Skill-based routing algorithm
    const findBestAgent = (queueItem: QueueItem): Agent | null => {
        const availableAgents = agents.filter(a =>
            a.status === 'available' && a.currentLoad < a.maxLoad
        );

        if (availableAgents.length === 0) return null;

        // Score agents based on:
        // 1. Skill match
        // 2. Current load
        // 3. Satisfaction rating
        // 4. Preferred agent
        const scoredAgents = availableAgents.map(agent => {
            let score = 0;

            // Skill match (40 points max)
            const matchingSkills = queueItem.requiredSkills.filter(skill =>
                agent.skills.includes(skill)
            );
            score += (matchingSkills.length / queueItem.requiredSkills.length) * 40;

            // Load balance (30 points max)
            const loadPercentage = agent.currentLoad / agent.maxLoad;
            score += (1 - loadPercentage) * 30;

            // Satisfaction (20 points max)
            score += (agent.satisfaction / 5) * 20;

            // Preferred agent bonus (10 points)
            if (queueItem.preferredAgent === agent.id) {
                score += 10;
            }

            return { agent, score };
        });

        scoredAgents.sort((a, b) => b.score - a.score);
        return scoredAgents[0]?.agent || null;
    };

    const handleAutoAssign = (queueItem: QueueItem) => {
        const bestAgent = findBestAgent(queueItem);
        if (bestAgent) {
            onAssign(queueItem, bestAgent.id);
            setQueue(prev => prev.filter(q => q.id !== queueItem.id));
            setAgents(prev => prev.map(a =>
                a.id === bestAgent.id
                    ? { ...a, currentLoad: a.currentLoad + 1, activeCustomers: a.activeCustomers + 1 }
                    : a
            ));
        }
    };

    const handleManualAssign = (queueItem: QueueItem, agentId: string) => {
        onAssign(queueItem, agentId);
        setQueue(prev => prev.filter(q => q.id !== queueItem.id));
        setAgents(prev => prev.map(a =>
            a.id === agentId
                ? { ...a, currentLoad: a.currentLoad + 1, activeCustomers: a.activeCustomers + 1 }
                : a
        ));
    };

    const handleAgentStatusChange = (agentId: string, status: Agent['status']) => {
        setAgents(prev => prev.map(a =>
            a.id === agentId ? { ...a, status } : a
        ));
    };

    const formatWaitTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-500 text-white';
            case 'high': return 'bg-orange-500 text-white';
            case 'medium': return 'bg-yellow-500 text-black';
            case 'low': return 'bg-green-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-500';
            case 'busy': return 'bg-red-500';
            case 'break': return 'bg-yellow-500';
            case 'offline': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const filteredQueue = queue.filter(item => {
        if (selectedPriorityFilter.length > 0 && !selectedPriorityFilter.includes(item.priority)) {
            return false;
        }
        if (selectedSkillFilter.length > 0) {
            const hasSkill = item.requiredSkills.some(skill => selectedSkillFilter.includes(skill));
            if (!hasSkill) return false;
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                item.customerName.toLowerCase().includes(query) ||
                item.company.toLowerCase().includes(query) ||
                item.issue.toLowerCase().includes(query)
            );
        }
        return true;
    });

    return (
        <div className="h-full bg-background flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border bg-surface">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-text">Queue Management</h2>
                        <p className="text-sm text-muted">Skill-based routing & load balancing</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoAssignEnabled}
                                onChange={(e) => setAutoAssignEnabled(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm font-medium text-text">Auto-Assign</span>
                        </label>
                        <button
                            onClick={() => setShowAgentDetails(!showAgentDetails)}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                        >
                            <BarChart3 size={18} />
                            {showAgentDetails ? 'Hide' : 'Show'} Agent Stats
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search customers, companies, or issues..."
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                        />
                    </div>
                    <select
                        multiple
                        value={selectedPriorityFilter}
                        onChange={(e) => setSelectedPriorityFilter(Array.from(e.target.selectedOptions, o => o.value))}
                        className="px-4 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                    >
                        <option value="">All Priorities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Queue List */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="space-y-4">
                        {filteredQueue.map(item => {
                            const bestAgent = findBestAgent(item);
                            return (
                                <div
                                    key={item.id}
                                    className="bg-surface border border-border rounded-xl p-4 hover:border-primary/50 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-full text-xs font-bold uppercase",
                                                getPriorityColor(item.priority)
                                            )}>
                                                {item.priority}
                                            </span>
                                            <div>
                                                <h3 className="font-bold text-text">{item.customerName}</h3>
                                                <p className="text-sm text-muted">{item.company}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 text-orange-500">
                                                <Clock size={16} />
                                                <span className="font-mono font-bold">{formatWaitTime(item.waitTime)}</span>
                                            </div>
                                            <p className="text-xs text-muted">Est. {item.estimatedDuration}min</p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-text mb-3">{item.issue}</p>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {item.requiredSkills.map(skill => (
                                            <span
                                                key={skill}
                                                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    {bestAgent && (
                                        <div className="bg-background border border-border rounded-lg p-3 mb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck size={16} className="text-green-500" />
                                                    <span className="text-sm font-medium text-text">Best Match:</span>
                                                    <span className="text-sm text-text">{bestAgent.avatar} {bestAgent.name}</span>
                                                </div>
                                                <div className="text-xs text-muted">
                                                    Load: {bestAgent.currentLoad}/{bestAgent.maxLoad}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        {autoAssignEnabled && bestAgent && (
                                            <button
                                                onClick={() => handleAutoAssign(item)}
                                                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={18} />
                                                Auto-Assign to {bestAgent.name}
                                            </button>
                                        )}
                                        <button className="px-4 py-2 bg-surface border border-border hover:bg-background text-text rounded-lg font-medium transition-colors">
                                            Manual Assign
                                        </button>
                                        <button className="px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 rounded-lg font-medium transition-colors">
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Agent Panel */}
                {showAgentDetails && (
                    <div className="w-96 border-l border-border bg-surface/50 overflow-auto p-6">
                        <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                            <Users size={20} />
                            Agent Status
                        </h3>
                        <div className="space-y-3">
                            {agents.map(agent => (
                                <div
                                    key={agent.id}
                                    className="bg-background border border-border rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{agent.avatar}</span>
                                            <div>
                                                <h4 className="font-bold text-text">{agent.name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className={clsx(
                                                        "w-2 h-2 rounded-full",
                                                        getStatusColor(agent.status)
                                                    )} />
                                                    <span className="text-xs text-muted capitalize">{agent.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <select
                                            value={agent.status}
                                            onChange={(e) => handleAgentStatusChange(agent.id, e.target.value as Agent['status'])}
                                            className="px-2 py-1 bg-surface border border-border rounded text-xs text-text"
                                        >
                                            <option value="available">Available</option>
                                            <option value="busy">Busy</option>
                                            <option value="break">Break</option>
                                            <option value="offline">Offline</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="text-center p-2 bg-surface rounded">
                                            <div className="text-lg font-bold text-text">{agent.currentLoad}/{agent.maxLoad}</div>
                                            <div className="text-xs text-muted">Load</div>
                                        </div>
                                        <div className="text-center p-2 bg-surface rounded">
                                            <div className="text-lg font-bold text-text">{agent.satisfaction}</div>
                                            <div className="text-xs text-muted">Rating</div>
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <div className="flex justify-between text-xs text-muted mb-1">
                                            <span>Capacity</span>
                                            <span>{Math.round((agent.currentLoad / agent.maxLoad) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
                                            <div
                                                className={clsx(
                                                    "h-full transition-all",
                                                    agent.currentLoad >= agent.maxLoad ? "bg-red-500" :
                                                        agent.currentLoad >= agent.maxLoad * 0.7 ? "bg-yellow-500" :
                                                            "bg-green-500"
                                                )}
                                                style={{ width: `${(agent.currentLoad / agent.maxLoad) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {agent.skills.slice(0, 2).map(skill => (
                                            <span
                                                key={skill}
                                                className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {agent.skills.length > 2 && (
                                            <span className="px-2 py-0.5 bg-muted/10 text-muted text-[10px] rounded-full">
                                                +{agent.skills.length - 2}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
