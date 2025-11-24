import React, { useState } from 'react';
import { ContextualChat } from '../components/ContextualChat';
import { MessageSquare, Users, Hash, TrendingUp, AlertCircle } from 'lucide-react';

export const ChatDemo = () => {
    const [showChat, setShowChat] = useState(true);
    const [chatMode, setChatMode] = useState<'customer' | 'internal' | 'group' | 'broadcast' | 'support'>('customer');

    const modes = [
        { id: 'customer', label: 'Customer Chat', icon: Users, color: 'bg-blue-500' },
        { id: 'internal', label: 'Team Chat', icon: Hash, color: 'bg-green-500' },
        { id: 'group', label: 'Group Discussion', icon: Users, color: 'bg-purple-500' },
        { id: 'broadcast', label: 'Announcements', icon: TrendingUp, color: 'bg-orange-500' },
        { id: 'support', label: 'Support Ticket', icon: AlertCircle, color: 'bg-red-500' }
    ] as const;

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text mb-2">Chat System Demo</h1>
                    <p className="text-muted">
                        Comprehensive contextual chat with AI enhancement and multiple modes
                    </p>
                </div>

                {/* Mode Selector */}
                <div className="bg-surface border border-border rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-text mb-4">Select Chat Mode</h2>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {modes.map((mode) => {
                            const Icon = mode.icon;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => {
                                        setChatMode(mode.id as any);
                                        setShowChat(true);
                                    }}
                                    className={`p-4 rounded-lg border-2 transition-all ${chatMode === mode.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    <div className={`w-12 h-12 ${mode.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                                        <Icon size={24} className="text-white" />
                                    </div>
                                    <p className="text-sm font-medium text-text text-center">
                                        {mode.label}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-surface border border-border rounded-xl p-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                            <MessageSquare size={24} className="text-primary" />
                        </div>
                        <h3 className="font-bold text-text mb-2">Real-time Messaging</h3>
                        <ul className="text-sm text-muted space-y-1">
                            <li>• Typing indicators</li>
                            <li>• Read receipts</li>
                            <li>• File sharing</li>
                            <li>• Proof linking</li>
                        </ul>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-6">
                        <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                            <span className="text-2xl">✨</span>
                        </div>
                        <h3 className="font-bold text-text mb-2">AI Enhancement</h3>
                        <ul className="text-sm text-muted space-y-1">
                            <li>• Suggested responses</li>
                            <li>• Sentiment analysis</li>
                            <li>• Auto-categorization</li>
                            <li>• Escalation triggers</li>
                        </ul>
                    </div>

                    <div className="bg-surface border border-border rounded-xl p-6">
                        <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                            <Users size={24} className="text-green-500" />
                        </div>
                        <h3 className="font-bold text-text mb-2">Collaboration</h3>
                        <ul className="text-sm text-muted space-y-1">
                            <li>• @Mentions</li>
                            <li>• Thread organization</li>
                            <li>• Emoji reactions</li>
                            <li>• Translation support</li>
                        </ul>
                    </div>
                </div>

                {/* Demo Instructions */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
                    <h3 className="font-bold text-text mb-3">Demo Instructions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text">
                        <div>
                            <p className="font-medium mb-2">Try these features:</p>
                            <ul className="space-y-1 text-muted">
                                <li>• Type a message and watch typing indicators</li>
                                <li>• Click attachment button for file/proof sharing</li>
                                <li>• Use @ to mention team members</li>
                                <li>• React to messages with emojis</li>
                                <li>• Reply to specific messages</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-medium mb-2">AI Features:</p>
                            <ul className="space-y-1 text-muted">
                                <li>• Click "AI Suggest" for quick responses</li>
                                <li>• Messages auto-categorize by content</li>
                                <li>• Sentiment indicators show message tone</li>
                                <li>• Urgent messages auto-escalate</li>
                                <li>• Translate messages to other languages</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Toggle Chat Button */}
                <div className="fixed bottom-6 left-6 z-50">
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg shadow-2xl transition-all flex items-center gap-2 font-medium"
                    >
                        <MessageSquare size={20} />
                        {showChat ? 'Hide Chat' : 'Show Chat'}
                    </button>
                </div>
            </div>

            {/* Chat Component */}
            {showChat && (
                <ContextualChat
                    mode={chatMode}
                    threadId={`demo-${chatMode}`}
                    onClose={() => setShowChat(false)}
                    isCollapsed={false}
                />
            )}
        </div>
    );
};
