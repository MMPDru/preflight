import React, { useState } from 'react';
import {
    MessageSquare, Video, Monitor, Bot, ArrowRight, Zap,
    Users, TrendingUp, CheckCircle, Clock, Star
} from 'lucide-react';
import clsx from 'clsx';

// Types
interface SupportRequest {
    customerId: string;
    customerName: string;
    issue: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    preferredMethod?: 'chat' | 'video' | 'screen-share';
}

interface SupportFlowRouterProps {
    request: SupportRequest;
    onRouteSelected: (route: SupportRoute) => void;
}

type SupportRoute =
    | { type: 'ai-chatbot'; confidence: number }
    | { type: 'live-chat'; agentId: string; estimatedWait: number }
    | { type: 'co-browse'; sessionId: string }
    | { type: 'video-call'; roomId: string };

interface RouteOption {
    id: string;
    type: 'ai-chatbot' | 'live-chat' | 'co-browse' | 'video-call';
    title: string;
    description: string;
    icon: any;
    color: string;
    estimatedTime: string;
    successRate: number;
    recommended?: boolean;
    escalatesTo?: string;
}

const ROUTE_OPTIONS: RouteOption[] = [
    {
        id: 'ai-chatbot',
        type: 'ai-chatbot',
        title: 'AI Assistant',
        description: 'Get instant answers from our intelligent chatbot',
        icon: Bot,
        color: 'from-purple-500 to-pink-500',
        estimatedTime: 'Instant',
        successRate: 85,
        escalatesTo: 'live-chat'
    },
    {
        id: 'live-chat',
        type: 'live-chat',
        title: 'Live Chat',
        description: 'Connect with a support agent via text chat',
        icon: MessageSquare,
        color: 'from-blue-500 to-cyan-500',
        estimatedTime: '< 2 min',
        successRate: 92,
        escalatesTo: 'co-browse'
    },
    {
        id: 'co-browse',
        type: 'co-browse',
        title: 'Screen Share',
        description: 'Share your screen for visual assistance',
        icon: Monitor,
        color: 'from-green-500 to-emerald-500',
        estimatedTime: '< 5 min',
        successRate: 95,
        escalatesTo: 'video-call'
    },
    {
        id: 'video-call',
        type: 'video-call',
        title: 'Video Call',
        description: 'Face-to-face support for complex issues',
        icon: Video,
        color: 'from-orange-500 to-red-500',
        estimatedTime: '< 10 min',
        successRate: 98
    }
];

export const SupportFlowRouter: React.FC<SupportFlowRouterProps> = ({
    request,
    onRouteSelected
}) => {
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
    const [showFlowDiagram, setShowFlowDiagram] = useState(false);

    // AI-powered route recommendation
    const getRecommendedRoute = (): RouteOption => {
        // Simple heuristic - in production, this would use ML
        if (request.urgency === 'critical') {
            return ROUTE_OPTIONS.find(r => r.type === 'video-call')!;
        }
        if (request.issue.toLowerCase().includes('visual') ||
            request.issue.toLowerCase().includes('screen')) {
            return ROUTE_OPTIONS.find(r => r.type === 'co-browse')!;
        }
        if (request.issue.toLowerCase().includes('quick') ||
            request.issue.toLowerCase().includes('simple')) {
            return ROUTE_OPTIONS.find(r => r.type === 'ai-chatbot')!;
        }
        return ROUTE_OPTIONS.find(r => r.type === 'live-chat')!;
    };

    const recommendedRoute = getRecommendedRoute();

    const handleRouteSelect = (option: RouteOption) => {
        setSelectedRoute(option.id);

        // Create route object based on type
        let route: SupportRoute;
        switch (option.type) {
            case 'ai-chatbot':
                route = { type: 'ai-chatbot', confidence: 0.85 };
                break;
            case 'live-chat':
                route = { type: 'live-chat', agentId: 'agent-1', estimatedWait: 120 };
                break;
            case 'co-browse':
                route = { type: 'co-browse', sessionId: `session-${Date.now()}` };
                break;
            case 'video-call':
                route = { type: 'video-call', roomId: `room-${Date.now()}` };
                break;
        }

        onRouteSelected(route);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-text mb-2">How can we help you?</h1>
                <p className="text-muted">
                    We've analyzed your request: <span className="font-medium text-text">"{request.issue}"</span>
                </p>
            </div>

            {/* Recommended Route */}
            <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                    <Zap size={24} className="text-primary" />
                    <h2 className="text-xl font-bold text-text">Recommended for You</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className={clsx(
                        "w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br",
                        recommendedRoute.color
                    )}>
                        <recommendedRoute.icon size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-text text-lg">{recommendedRoute.title}</h3>
                        <p className="text-sm text-muted">{recommendedRoute.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-xs text-muted">
                                <Clock size={12} />
                                {recommendedRoute.estimatedTime}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-green-500">
                                <CheckCircle size={12} />
                                {recommendedRoute.successRate}% success rate
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => handleRouteSelect(recommendedRoute)}
                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                    >
                        Start Now
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            {/* All Options */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-text mb-4">Or choose your preferred method:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ROUTE_OPTIONS.map(option => (
                        <div
                            key={option.id}
                            onClick={() => handleRouteSelect(option)}
                            className={clsx(
                                "p-6 border-2 rounded-xl cursor-pointer transition-all hover:scale-105",
                                selectedRoute === option.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-surface hover:border-primary/50"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={clsx(
                                    "w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br",
                                    option.color
                                )}>
                                    <option.icon size={24} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-text mb-1">{option.title}</h4>
                                    <p className="text-sm text-muted mb-3">{option.description}</p>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="flex items-center gap-1 text-muted">
                                            <Clock size={12} />
                                            {option.estimatedTime}
                                        </span>
                                        <span className="flex items-center gap-1 text-green-500">
                                            <Star size={12} fill="currentColor" />
                                            {option.successRate}%
                                        </span>
                                    </div>
                                    {option.escalatesTo && (
                                        <div className="mt-2 text-xs text-muted flex items-center gap-1">
                                            <TrendingUp size={12} />
                                            Can escalate to {ROUTE_OPTIONS.find(r => r.id === option.escalatesTo)?.title}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Flow Diagram Toggle */}
            <div className="text-center">
                <button
                    onClick={() => setShowFlowDiagram(!showFlowDiagram)}
                    className="text-sm text-primary hover:text-primary/80 underline"
                >
                    {showFlowDiagram ? 'Hide' : 'Show'} Support Flow Diagram
                </button>
            </div>

            {/* Flow Diagram */}
            {showFlowDiagram && (
                <div className="mt-6 p-6 bg-surface border border-border rounded-xl">
                    <h3 className="font-bold text-text mb-4">Support Escalation Flow</h3>
                    <div className="space-y-4">
                        {/* AI Chatbot */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Bot size={20} className="text-white" />
                            </div>
                            <ArrowRight size={16} className="text-muted" />
                            <div className="flex-1 p-3 bg-background rounded-lg">
                                <p className="text-sm font-medium text-text">AI Assistant</p>
                                <p className="text-xs text-muted">Self-service • Instant • 85% resolution</p>
                            </div>
                        </div>

                        {/* Escalation Arrow */}
                        <div className="ml-5 flex items-center gap-2 text-xs text-muted">
                            <div className="w-px h-6 bg-border" />
                            <span>If unresolved ↓</span>
                        </div>

                        {/* Live Chat */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <MessageSquare size={20} className="text-white" />
                            </div>
                            <ArrowRight size={16} className="text-muted" />
                            <div className="flex-1 p-3 bg-background rounded-lg">
                                <p className="text-sm font-medium text-text">Live Chat</p>
                                <p className="text-xs text-muted">Agent support • &lt;2 min • 92% resolution</p>
                            </div>
                        </div>

                        {/* Escalation Arrow */}
                        <div className="ml-5 flex items-center gap-2 text-xs text-muted">
                            <div className="w-px h-6 bg-border" />
                            <span>If needs visual ↓</span>
                        </div>

                        {/* Screen Share */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                <Monitor size={20} className="text-white" />
                            </div>
                            <ArrowRight size={16} className="text-muted" />
                            <div className="flex-1 p-3 bg-background rounded-lg">
                                <p className="text-sm font-medium text-text">Screen Share</p>
                                <p className="text-xs text-muted">Co-browsing • &lt;5 min • 95% resolution</p>
                            </div>
                        </div>

                        {/* Escalation Arrow */}
                        <div className="ml-5 flex items-center gap-2 text-xs text-muted">
                            <div className="w-px h-6 bg-border" />
                            <span>If complex ↓</span>
                        </div>

                        {/* Video Call */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                <Video size={20} className="text-white" />
                            </div>
                            <ArrowRight size={16} className="text-muted" />
                            <div className="flex-1 p-3 bg-background rounded-lg">
                                <p className="text-sm font-medium text-text">Video Call</p>
                                <p className="text-xs text-muted">Face-to-face • &lt;10 min • 98% resolution</p>
                            </div>
                        </div>

                        {/* Resolution */}
                        <div className="ml-5 flex items-center gap-2 text-xs text-muted">
                            <div className="w-px h-6 bg-border" />
                            <span>↓</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <CheckCircle size={20} className="text-white" />
                            </div>
                            <ArrowRight size={16} className="text-muted" />
                            <div className="flex-1 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-sm font-medium text-green-500">Resolution & Feedback</p>
                                <p className="text-xs text-green-400">Survey → Training Update</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="p-4 bg-surface border border-border rounded-lg text-center">
                    <div className="text-2xl font-bold text-text">95%</div>
                    <div className="text-xs text-muted">First Contact Resolution</div>
                </div>
                <div className="p-4 bg-surface border border-border rounded-lg text-center">
                    <div className="text-2xl font-bold text-text">&lt;30s</div>
                    <div className="text-xs text-muted">Avg Connection Time</div>
                </div>
                <div className="p-4 bg-surface border border-border rounded-lg text-center">
                    <div className="text-2xl font-bold text-text">4.8★</div>
                    <div className="text-xs text-muted">Customer Satisfaction</div>
                </div>
            </div>
        </div>
    );
};
