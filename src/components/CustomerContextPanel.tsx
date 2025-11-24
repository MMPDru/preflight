import React, { useState } from 'react';
import {
    User, Building, Mail, Phone, Calendar, FileText, AlertCircle,
    TrendingUp, MessageSquare, Eye, Download, ExternalLink, Clock,
    Star, Award, DollarSign, Package, Activity
} from 'lucide-react';
import clsx from 'clsx';

interface CustomerContextProps {
    customerId: string;
    onClose?: () => void;
}

interface CustomerData {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    role: string;
    plan: string;
    joinedDate: Date;
    lastActive: Date;
    avatar?: string;

    // Account Details
    totalSpent: number;
    totalOrders: number;
    activeProjects: number;
    satisfaction: number;
    lifetimeValue: number;

    // Communication Preferences
    preferredChannel: 'email' | 'phone' | 'chat' | 'video';
    timezone: string;
    language: string;
    communicationStyle: 'formal' | 'casual' | 'technical';

    // AI Insights
    sentiment: 'positive' | 'neutral' | 'negative';
    churnRisk: 'low' | 'medium' | 'high';
    upsellOpportunity: boolean;

    // History
    recentActions: Action[];
    previousIssues: Issue[];
    orderHistory: Order[];
    notes: Note[];
}

interface Action {
    id: string;
    type: 'login' | 'upload' | 'download' | 'approval' | 'message' | 'call';
    description: string;
    timestamp: Date;
    metadata?: any;
}

interface Issue {
    id: string;
    title: string;
    status: 'open' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    resolvedAt?: Date;
    resolution?: string;
}

interface Order {
    id: string;
    name: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'cancelled';
    date: Date;
}

interface Note {
    id: string;
    content: string;
    author: string;
    timestamp: Date;
    type: 'general' | 'important' | 'warning';
}

const MOCK_CUSTOMER: CustomerData = {
    id: 'cust-1',
    name: 'Alice Johnson',
    email: 'alice.johnson@designco.com',
    phone: '+1 (555) 123-4567',
    company: 'Design Co.',
    role: 'Creative Director',
    plan: 'Pro Enterprise',
    joinedDate: new Date('2023-01-15'),
    lastActive: new Date(),
    avatar: '👩‍💼',

    totalSpent: 45780,
    totalOrders: 145,
    activeProjects: 8,
    satisfaction: 4.8,
    lifetimeValue: 52000,

    preferredChannel: 'video',
    timezone: 'EST',
    language: 'English',
    communicationStyle: 'technical',

    sentiment: 'positive',
    churnRisk: 'low',
    upsellOpportunity: true,

    recentActions: [
        {
            id: 'a1',
            type: 'upload',
            description: 'Uploaded Brand_Guidelines_v3.pdf',
            timestamp: new Date(Date.now() - 300000)
        },
        {
            id: 'a2',
            type: 'message',
            description: 'Sent message about bleed settings',
            timestamp: new Date(Date.now() - 600000)
        },
        {
            id: 'a3',
            type: 'approval',
            description: 'Approved proof for Project Alpha',
            timestamp: new Date(Date.now() - 3600000)
        },
        {
            id: 'a4',
            type: 'login',
            description: 'Logged in from Chrome on MacOS',
            timestamp: new Date(Date.now() - 7200000)
        }
    ],

    previousIssues: [
        {
            id: 'i1',
            title: 'Color profile conversion error',
            status: 'resolved',
            priority: 'high',
            createdAt: new Date('2024-11-20'),
            resolvedAt: new Date('2024-11-20'),
            resolution: 'Updated CMYK settings and re-exported'
        },
        {
            id: 'i2',
            title: 'Login authentication failure',
            status: 'resolved',
            priority: 'medium',
            createdAt: new Date('2024-11-15'),
            resolvedAt: new Date('2024-11-15'),
            resolution: 'Reset password and cleared cache'
        },
        {
            id: 'i3',
            title: 'Invoice discrepancy',
            status: 'closed',
            priority: 'low',
            createdAt: new Date('2024-11-10'),
            resolvedAt: new Date('2024-11-12'),
            resolution: 'Billing error corrected, refund issued'
        }
    ],

    orderHistory: [
        {
            id: 'ord-1',
            name: 'Brand Guidelines Print',
            amount: 2450,
            status: 'completed',
            date: new Date('2024-11-22')
        },
        {
            id: 'ord-2',
            name: 'Marketing Collateral',
            amount: 1890,
            status: 'processing',
            date: new Date('2024-11-23')
        },
        {
            id: 'ord-3',
            name: 'Product Catalog',
            amount: 3200,
            status: 'pending',
            date: new Date('2024-11-23')
        }
    ],

    notes: [
        {
            id: 'n1',
            content: 'Prefers detailed technical explanations. Very knowledgeable about print production.',
            author: 'Sarah Chen',
            timestamp: new Date('2024-11-20'),
            type: 'important'
        },
        {
            id: 'n2',
            content: 'Large account - handle with priority. Potential for upsell to Premium tier.',
            author: 'Mike Rodriguez',
            timestamp: new Date('2024-11-15'),
            type: 'important'
        }
    ]
};

export const CustomerContextPanel: React.FC<CustomerContextProps> = ({ customerId, onClose }) => {
    const [customer] = useState<CustomerData>(MOCK_CUSTOMER);
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'issues' | 'orders' | 'notes'>('overview');

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'login': return <User size={14} />;
            case 'upload': return <FileText size={14} />;
            case 'download': return <Download size={14} />;
            case 'approval': return <Star size={14} />;
            case 'message': return <MessageSquare size={14} />;
            case 'call': return <Phone size={14} />;
            default: return <Activity size={14} />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="w-96 h-full border-l border-border bg-surface flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border bg-background">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-text flex items-center gap-2">
                        <User size={20} />
                        Customer Context
                    </h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-surface rounded text-muted hover:text-text"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Profile Summary */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-3xl">
                        {customer.avatar || customer.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-text">{customer.name}</h3>
                        <p className="text-sm text-muted">{customer.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/20">
                                {customer.plan}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-yellow-500">
                                <Star size={12} fill="currentColor" />
                                {customer.satisfaction}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-surface rounded-lg text-center">
                        <div className="text-lg font-bold text-text">{customer.totalOrders}</div>
                        <div className="text-[10px] text-muted uppercase">Orders</div>
                    </div>
                    <div className="p-2 bg-surface rounded-lg text-center">
                        <div className="text-lg font-bold text-text">{formatCurrency(customer.totalSpent)}</div>
                        <div className="text-[10px] text-muted uppercase">Spent</div>
                    </div>
                    <div className="p-2 bg-surface rounded-lg text-center">
                        <div className="text-lg font-bold text-text">{customer.activeProjects}</div>
                        <div className="text-[10px] text-muted uppercase">Active</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border bg-background">
                {(['overview', 'history', 'issues', 'orders', 'notes'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={clsx(
                            "flex-1 px-3 py-2 text-xs font-medium capitalize transition-colors",
                            activeTab === tab
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted hover:text-text"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {activeTab === 'overview' && (
                    <div className="space-y-4">
                        {/* Contact Info */}
                        <div>
                            <h4 className="text-xs font-bold text-muted uppercase mb-2">Contact Information</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-text">
                                    <Building size={14} className="text-muted" />
                                    {customer.company}
                                </div>
                                <div className="flex items-center gap-2 text-text">
                                    <Mail size={14} className="text-muted" />
                                    {customer.email}
                                </div>
                                <div className="flex items-center gap-2 text-text">
                                    <Phone size={14} className="text-muted" />
                                    {customer.phone}
                                </div>
                                <div className="flex items-center gap-2 text-text">
                                    <Calendar size={14} className="text-muted" />
                                    Joined {formatDate(customer.joinedDate)}
                                </div>
                            </div>
                        </div>

                        {/* Communication Preferences */}
                        <div>
                            <h4 className="text-xs font-bold text-muted uppercase mb-2">Communication Style</h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted">Preferred Channel:</span>
                                    <span className="text-text font-medium capitalize">{customer.preferredChannel}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted">Style:</span>
                                    <span className="text-text font-medium capitalize">{customer.communicationStyle}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted">Timezone:</span>
                                    <span className="text-text font-medium">{customer.timezone}</span>
                                </div>
                            </div>
                        </div>

                        {/* AI Insights */}
                        <div>
                            <h4 className="text-xs font-bold text-muted uppercase mb-2">AI Insights</h4>
                            <div className="space-y-2">
                                <div className="p-3 bg-background border border-border rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-text">Sentiment</span>
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded-full text-xs font-medium",
                                            customer.sentiment === 'positive' && "bg-green-500/10 text-green-500",
                                            customer.sentiment === 'neutral' && "bg-yellow-500/10 text-yellow-500",
                                            customer.sentiment === 'negative' && "bg-red-500/10 text-red-500"
                                        )}>
                                            {customer.sentiment === 'positive' && '😊 Positive'}
                                            {customer.sentiment === 'neutral' && '😐 Neutral'}
                                            {customer.sentiment === 'negative' && '😟 Negative'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted">
                                        Customer is satisfied with recent interactions
                                    </p>
                                </div>

                                <div className="p-3 bg-background border border-border rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-text">Churn Risk</span>
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded-full text-xs font-medium",
                                            customer.churnRisk === 'low' && "bg-green-500/10 text-green-500",
                                            customer.churnRisk === 'medium' && "bg-yellow-500/10 text-yellow-500",
                                            customer.churnRisk === 'high' && "bg-red-500/10 text-red-500"
                                        )}>
                                            {customer.churnRisk.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted">
                                        High engagement, low risk of cancellation
                                    </p>
                                </div>

                                {customer.upsellOpportunity && (
                                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp size={14} className="text-green-500" />
                                            <span className="text-sm font-medium text-green-500">Upsell Opportunity</span>
                                        </div>
                                        <p className="text-xs text-green-400">
                                            High usage suggests Premium tier upgrade
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-muted uppercase">Recent Activity</h4>
                        {customer.recentActions.map(action => (
                            <div key={action.id} className="flex items-start gap-3 text-sm">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                                    {getActionIcon(action.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-text">{action.description}</p>
                                    <p className="text-xs text-muted">{formatRelativeTime(action.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'issues' && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-muted uppercase">Previous Issues</h4>
                        {customer.previousIssues.map(issue => (
                            <div key={issue.id} className="p-3 bg-background border border-border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-text text-sm">{issue.title}</h5>
                                    <span className={clsx(
                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                        issue.status === 'resolved' && "bg-green-500/10 text-green-500",
                                        issue.status === 'open' && "bg-orange-500/10 text-orange-500",
                                        issue.status === 'closed' && "bg-gray-500/10 text-gray-500"
                                    )}>
                                        {issue.status}
                                    </span>
                                </div>
                                <p className="text-xs text-muted mb-2">
                                    {formatDate(issue.createdAt)}
                                    {issue.resolvedAt && ` • Resolved ${formatDate(issue.resolvedAt)}`}
                                </p>
                                {issue.resolution && (
                                    <p className="text-xs text-text bg-surface p-2 rounded">
                                        {issue.resolution}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-muted uppercase">Order History</h4>
                        {customer.orderHistory.map(order => (
                            <div key={order.id} className="p-3 bg-background border border-border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-medium text-text text-sm">{order.name}</h5>
                                    <span className="text-sm font-bold text-text">{formatCurrency(order.amount)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted">{formatDate(order.date)}</span>
                                    <span className={clsx(
                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                        order.status === 'completed' && "bg-green-500/10 text-green-500",
                                        order.status === 'processing' && "bg-blue-500/10 text-blue-500",
                                        order.status === 'pending' && "bg-yellow-500/10 text-yellow-500",
                                        order.status === 'cancelled' && "bg-red-500/10 text-red-500"
                                    )}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-muted uppercase">Agent Notes</h4>
                            <button className="px-3 py-1 bg-primary text-white rounded text-xs font-medium">
                                Add Note
                            </button>
                        </div>
                        {customer.notes.map(note => (
                            <div key={note.id} className={clsx(
                                "p-3 rounded-lg border",
                                note.type === 'important' && "bg-yellow-500/10 border-yellow-500/20",
                                note.type === 'warning' && "bg-red-500/10 border-red-500/20",
                                note.type === 'general' && "bg-background border-border"
                            )}>
                                <p className="text-sm text-text mb-2">{note.content}</p>
                                <div className="flex items-center justify-between text-xs text-muted">
                                    <span>{note.author}</span>
                                    <span>{formatDate(note.timestamp)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
