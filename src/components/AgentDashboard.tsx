import React, { useState } from 'react';
import { Users, MessageSquare, Video, Monitor, Clock, CheckCircle, AlertCircle, Phone, Search, MoreVertical, User } from 'lucide-react';
import clsx from 'clsx';
import { LiveSupport } from './LiveSupport';

interface SupportRequest {
    id: string;
    customerName: string;
    company: string;
    type: 'chat' | 'video' | 'screen_share';
    status: 'queue' | 'active' | 'completed';
    waitTime: string;
    priority: 'low' | 'medium' | 'high';
    issue: string;
}

interface CustomerContext {
    id: string;
    name: string;
    company: string;
    plan: string;
    totalOrders: number;
    lastActive: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    recentIssues: string[];
}

const mockQueue: SupportRequest[] = [
    {
        id: 'req-1',
        customerName: 'Alice Johnson',
        company: 'Design Co.',
        type: 'video',
        status: 'queue',
        waitTime: '2m 30s',
        priority: 'high',
        issue: 'Bleed settings help'
    },
    {
        id: 'req-2',
        customerName: 'Bob Smith',
        company: 'Print Fast',
        type: 'screen_share',
        status: 'queue',
        waitTime: '45s',
        priority: 'medium',
        issue: 'Workflow error'
    },
    {
        id: 'req-3',
        customerName: 'Carol White',
        company: 'Marketing Pros',
        type: 'chat',
        status: 'queue',
        waitTime: '10s',
        priority: 'low',
        issue: 'Pricing question'
    }
];

const mockActiveSessions: SupportRequest[] = [
    {
        id: 'sess-1',
        customerName: 'David Brown',
        company: 'Creative Studio',
        type: 'video',
        status: 'active',
        waitTime: '0s',
        priority: 'medium',
        issue: 'Color profile check'
    }
];

export const AgentDashboard: React.FC = () => {
    const [queue, setQueue] = useState<SupportRequest[]>(mockQueue);
    const [activeSessions, setActiveSessions] = useState<SupportRequest[]>(mockActiveSessions);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerContext | null>(null);
    const [currentSession, setCurrentSession] = useState<SupportRequest | null>(null);

    const loadCustomerContext = (request: SupportRequest) => {
        setSelectedCustomer({
            id: request.id,
            name: request.customerName,
            company: request.company,
            plan: 'Pro Enterprise',
            totalOrders: 145,
            lastActive: 'Now',
            sentiment: 'neutral',
            recentIssues: ['Login failure (2 days ago)', 'Invoice query (1 week ago)']
        });
    };

    const handleAcceptRequest = (request: SupportRequest) => {
        setQueue(prev => prev.filter(r => r.id !== request.id));
        const newSession = { ...request, status: 'active' as const, waitTime: '0s' };
        setActiveSessions(prev => [...prev, newSession]);
        loadCustomerContext(request);
        setCurrentSession(newSession);
    };

    const handleSelectSession = (session: SupportRequest) => {
        loadCustomerContext(session);
        setCurrentSession(session);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-green-500 bg-green-500/10 border-green-500/20';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video size={16} />;
            case 'screen_share': return <Monitor size={16} />;
            default: return <MessageSquare size={16} />;
        }
    };

    return (
        <div className="h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-border bg-surface px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-text">Agent Dashboard</h1>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-green-500">Online • Accepting Requests</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <Clock size={16} />
                        <span>Shift: 4h 30m</span>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                            JD
                        </div>
                        <div className="text-sm">
                            <div className="font-medium text-text">John Doe</div>
                            <div className="text-xs text-muted">Senior Agent</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Queue & Active */}
                <div className="w-96 border-r border-border bg-surface/50 flex flex-col">
                    {/* Active Sessions */}
                    <div className="p-4 border-b border-border">
                        <h2 className="text-xs font-bold text-muted uppercase mb-3 flex items-center justify-between">
                            Active Sessions
                            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px]">
                                {activeSessions.length}
                            </span>
                        </h2>
                        <div className="space-y-2">
                            {activeSessions.map(session => (
                                <div
                                    key={session.id}
                                    onClick={() => handleSelectSession(session)} // Re-select context
                                    className="p-3 bg-surface border border-primary/50 rounded-lg shadow-sm cursor-pointer hover:bg-surface/80 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded bg-primary/10 text-primary">
                                                {getTypeIcon(session.type)}
                                            </div>
                                            <span className="font-medium text-text">{session.customerName}</span>
                                        </div>
                                        <span className="text-xs text-green-500 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Live
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted truncate">{session.issue}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Queue */}
                    <div className="flex-1 p-4 overflow-auto">
                        <h2 className="text-xs font-bold text-muted uppercase mb-3 flex items-center justify-between">
                            Incoming Queue
                            <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded-full text-[10px]">
                                {queue.length}
                            </span>
                        </h2>
                        <div className="space-y-2">
                            {queue.map(request => (
                                <div
                                    key={request.id}
                                    className="p-3 bg-background border border-border rounded-lg hover:border-primary/30 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                "px-1.5 py-0.5 rounded text-[10px] font-medium border uppercase",
                                                getPriorityColor(request.priority)
                                            )}>
                                                {request.priority}
                                            </span>
                                            <span className="font-medium text-text">{request.customerName}</span>
                                        </div>
                                        <span className="text-xs text-muted flex items-center gap-1">
                                            <Clock size={12} />
                                            {request.waitTime}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1 rounded bg-muted/10 text-muted">
                                            {getTypeIcon(request.type)}
                                        </div>
                                        <p className="text-xs text-muted truncate flex-1">{request.issue}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAcceptRequest(request)}
                                        className="w-full py-1.5 bg-primary text-white rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Accept Request
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content - Workspace */}
                <div className="flex-1 bg-background flex flex-col items-center justify-center text-muted relative">
                    {currentSession ? (
                        <LiveSupport
                            isInline
                            userName="Agent"
                            onClose={() => setCurrentSession(null)}
                        />
                    ) : (
                        <div className="text-center p-8 max-w-md">
                            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                                <Users size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-text mb-2">Ready for Support</h3>
                            <p className="text-sm">
                                Select an active session or accept a new request from the queue to start helping customers.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Customer Context */}
                {selectedCustomer && (
                    <div className="w-80 border-l border-border bg-surface/50 flex flex-col">
                        <div className="p-4 border-b border-border">
                            <h2 className="text-sm font-bold text-text flex items-center gap-2">
                                <User size={16} />
                                Customer Context
                            </h2>
                        </div>

                        <div className="flex-1 overflow-auto p-4 space-y-6">
                            {/* Profile */}
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 text-primary font-bold text-xl">
                                    {selectedCustomer.name.charAt(0)}
                                </div>
                                <h3 className="font-bold text-text">{selectedCustomer.name}</h3>
                                <p className="text-sm text-muted">{selectedCustomer.company}</p>
                                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">
                                    {selectedCustomer.plan}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-background rounded-lg border border-border text-center">
                                    <div className="text-lg font-bold text-text">{selectedCustomer.totalOrders}</div>
                                    <div className="text-[10px] text-muted uppercase">Total Orders</div>
                                </div>
                                <div className="p-3 bg-background rounded-lg border border-border text-center">
                                    <div className="text-lg font-bold text-text">4.8</div>
                                    <div className="text-[10px] text-muted uppercase">Satisfaction</div>
                                </div>
                            </div>

                            {/* Sentiment Analysis */}
                            <div>
                                <h4 className="text-xs font-bold text-muted uppercase mb-2">AI Sentiment Analysis</h4>
                                <div className="p-3 bg-background rounded-lg border border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-text">Current Mood</span>
                                        <span className={clsx(
                                            "text-xs font-medium px-2 py-0.5 rounded capitalize",
                                            selectedCustomer.sentiment === 'positive' && "bg-green-500/10 text-green-500",
                                            selectedCustomer.sentiment === 'neutral' && "bg-yellow-500/10 text-yellow-500",
                                            selectedCustomer.sentiment === 'negative' && "bg-red-500/10 text-red-500"
                                        )}>
                                            {selectedCustomer.sentiment}
                                        </span>
                                    </div>
                                    <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500 w-[60%]" />
                                    </div>
                                    <p className="text-xs text-muted mt-2">
                                        Customer seems slightly frustrated with recent technical issues but generally cooperative.
                                    </p>
                                </div>
                            </div>

                            {/* Recent Issues */}
                            <div>
                                <h4 className="text-xs font-bold text-muted uppercase mb-2">Recent History</h4>
                                <div className="space-y-2">
                                    {selectedCustomer.recentIssues.map((issue, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-muted">
                                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                            <span>{issue}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-2 pt-4 border-t border-border">
                                <button className="w-full py-2 bg-surface hover:bg-surface/80 text-text border border-border rounded-lg text-sm font-medium transition-colors">
                                    View Full Profile
                                </button>
                                <button className="w-full py-2 bg-surface hover:bg-surface/80 text-text border border-border rounded-lg text-sm font-medium transition-colors">
                                    Create Ticket
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
