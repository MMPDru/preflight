import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare, Send, Paperclip, Image, Smile, Search, X,
    MoreVertical, Pin, Archive, Bell, BellOff, Users, Hash,
    FileText, Link as LinkIcon, AtSign, Languages, Check, CheckCheck,
    Sparkles, AlertCircle, TrendingUp, Calendar
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

// Types
interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    content: string;
    timestamp: Date;
    type: 'text' | 'file' | 'image' | 'proof' | 'system';
    attachments?: Attachment[];
    proofLink?: ProofLink;
    mentions?: string[];
    reactions?: Reaction[];
    threadId?: string;
    replyTo?: string;
    isRead: boolean;
    isEdited: boolean;
    sentiment?: 'positive' | 'neutral' | 'negative';
    aiSuggested?: boolean;
    translated?: boolean;
    originalLanguage?: string;
}

interface Attachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

interface ProofLink {
    proofId: string;
    proofName: string;
    thumbnailUrl: string;
    page?: number;
}

interface Reaction {
    emoji: string;
    userId: string;
    userName: string;
}

interface ChatThread {
    id: string;
    title: string;
    participants: string[];
    lastMessage?: ChatMessage;
    unreadCount: number;
    isPinned: boolean;
    isMuted: boolean;
    mode: 'customer' | 'internal' | 'group' | 'broadcast' | 'support';
}

interface TypingIndicator {
    userId: string;
    userName: string;
}

interface ContextualChatProps {
    mode?: 'customer' | 'internal' | 'group' | 'broadcast' | 'support';
    threadId?: string;
    onClose?: () => void;
    isCollapsed?: boolean;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😊', '🎉', '👏', '🔥', '✅', '❌'];

const AI_SUGGESTED_RESPONSES = [
    "I'll review this and get back to you shortly.",
    "Could you share the proof file?",
    "Let me check with the team.",
    "This looks good to approve!",
    "I've made the requested changes.",
    "When do you need this completed?"
];

export const ContextualChat: React.FC<ContextualChatProps> = ({
    mode = 'customer',
    threadId,
    onClose,
    isCollapsed = false
}) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [activeThread, setActiveThread] = useState<string | null>(threadId || null);
    const [messageInput, setMessageInput] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showSuggestedResponses, setShowSuggestedResponses] = useState(false);
    const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [showTranslate, setShowTranslate] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock data
    useEffect(() => {
        const mockThreads: ChatThread[] = [
            {
                id: '1',
                title: 'Acme Corp - Brand Guidelines',
                participants: ['user1', 'user2'],
                unreadCount: 3,
                isPinned: true,
                isMuted: false,
                mode: 'customer',
                lastMessage: {
                    id: '1',
                    senderId: 'user2',
                    senderName: 'Sarah Chen',
                    content: 'The proof looks great! Just one small change needed.',
                    timestamp: new Date(Date.now() - 300000),
                    type: 'text',
                    isRead: false,
                    isEdited: false,
                    sentiment: 'positive'
                }
            },
            {
                id: '2',
                title: 'Design Team',
                participants: ['user1', 'user3', 'user4'],
                unreadCount: 0,
                isPinned: false,
                isMuted: false,
                mode: 'internal',
                lastMessage: {
                    id: '2',
                    senderId: 'user3',
                    senderName: 'Mike Rodriguez',
                    content: 'Updated the color profile',
                    timestamp: new Date(Date.now() - 3600000),
                    type: 'text',
                    isRead: true,
                    isEdited: false
                }
            }
        ];
        setThreads(mockThreads);

        if (activeThread) {
            const mockMessages: ChatMessage[] = [
                {
                    id: '1',
                    senderId: 'user2',
                    senderName: 'Sarah Chen',
                    senderAvatar: '👩‍💼',
                    content: 'Hi! I uploaded the new brand guidelines proof.',
                    timestamp: new Date(Date.now() - 7200000),
                    type: 'text',
                    isRead: true,
                    isEdited: false,
                    reactions: [{ emoji: '👍', userId: 'user1', userName: 'You' }]
                },
                {
                    id: '2',
                    senderId: 'user2',
                    senderName: 'Sarah Chen',
                    senderAvatar: '👩‍💼',
                    content: 'Here\'s the file:',
                    timestamp: new Date(Date.now() - 7100000),
                    type: 'proof',
                    proofLink: {
                        proofId: 'proof-123',
                        proofName: 'Brand_Guidelines_v3.pdf',
                        thumbnailUrl: '/api/placeholder/200/150',
                        page: 1
                    },
                    isRead: true,
                    isEdited: false
                },
                {
                    id: '3',
                    senderId: 'user1',
                    senderName: 'You',
                    content: 'Thanks! I\'ll review this now.',
                    timestamp: new Date(Date.now() - 3600000),
                    type: 'text',
                    isRead: true,
                    isEdited: false,
                    aiSuggested: true
                },
                {
                    id: '4',
                    senderId: 'user2',
                    senderName: 'Sarah Chen',
                    senderAvatar: '👩‍💼',
                    content: 'The proof looks great! Just one small change needed on page 3.',
                    timestamp: new Date(Date.now() - 300000),
                    type: 'text',
                    mentions: ['user1'],
                    isRead: false,
                    isEdited: false,
                    sentiment: 'positive'
                }
            ];
            setMessages(mockMessages);
        }
    }, [activeThread]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Simulate typing indicator
    useEffect(() => {
        if (messageInput.length > 0) {
            // In real app, emit typing event to other users
            const timer = setTimeout(() => {
                setTypingUsers([{ userId: 'user2', userName: 'Sarah Chen' }]);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setTypingUsers([]);
        }
    }, [messageInput]);

    const handleSendMessage = () => {
        if (messageInput.trim()) {
            const newMessage: ChatMessage = {
                id: Date.now().toString(),
                senderId: currentUser?.uid || 'user1',
                senderName: currentUser?.displayName || 'You',
                content: messageInput,
                timestamp: new Date(),
                type: 'text',
                isRead: false,
                isEdited: false,
                replyTo: replyingTo?.id
            };

            setMessages([...messages, newMessage]);
            setMessageInput('');
            setReplyingTo(null);
            setShowSuggestedResponses(false);

            // Mark as read
            setTimeout(() => {
                setMessages(prev => prev.map(msg =>
                    msg.id === newMessage.id ? { ...msg, isRead: true } : msg
                ));
            }, 1000);
        }
    };

    const handleReaction = (messageId: string, emoji: string) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const reactions = msg.reactions || [];
                const existingReaction = reactions.find(r => r.userId === currentUser?.uid);

                if (existingReaction) {
                    return {
                        ...msg,
                        reactions: reactions.filter(r => r.userId !== currentUser?.uid)
                    };
                } else {
                    return {
                        ...msg,
                        reactions: [...reactions, {
                            emoji,
                            userId: currentUser?.uid || 'user1',
                            userName: currentUser?.displayName || 'You'
                        }]
                    };
                }
            }
            return msg;
        }));
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const newMessage: ChatMessage = {
                id: Date.now().toString(),
                senderId: currentUser?.uid || 'user1',
                senderName: currentUser?.displayName || 'You',
                content: `Shared file: ${file.name}`,
                timestamp: new Date(),
                type: 'file',
                attachments: [{
                    id: Date.now().toString(),
                    name: file.name,
                    url: URL.createObjectURL(file),
                    type: file.type,
                    size: file.size
                }],
                isRead: false,
                isEdited: false
            };
            setMessages([...messages, newMessage]);
            setShowAttachMenu(false);
        }
    };

    const handleMention = () => {
        setMessageInput(prev => prev + '@');
    };

    const handleTranslate = (messageId: string) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                return {
                    ...msg,
                    translated: !msg.translated,
                    originalLanguage: msg.originalLanguage || 'es'
                };
            }
            return msg;
        }));
    };

    const getModeIcon = () => {
        switch (mode) {
            case 'customer': return <Users size={16} />;
            case 'internal': return <Hash size={16} />;
            case 'group': return <Users size={16} />;
            case 'broadcast': return <TrendingUp size={16} />;
            case 'support': return <AlertCircle size={16} />;
            default: return <MessageSquare size={16} />;
        }
    };

    const getModeLabel = () => {
        switch (mode) {
            case 'customer': return 'Customer Chat';
            case 'internal': return 'Team Chat';
            case 'group': return 'Group Discussion';
            case 'broadcast': return 'Announcements';
            case 'support': return 'Support Ticket';
            default: return 'Chat';
        }
    };

    if (isCollapsed) {
        return (
            <button
                onClick={onClose}
                className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-2xl flex items-center justify-center transition-all z-50"
            >
                <MessageSquare size={24} />
                {threads.reduce((sum, t) => sum + t.unreadCount, 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {threads.reduce((sum, t) => sum + t.unreadCount, 0)}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className="fixed right-0 top-0 h-screen w-96 bg-surface border-l border-border shadow-2xl flex flex-col z-40">
            {/* Header */}
            <div className="p-4 border-b border-border bg-background">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            {getModeIcon()}
                        </div>
                        <div>
                            <h3 className="font-bold text-text">{getModeLabel()}</h3>
                            <p className="text-xs text-muted">
                                {threads.find(t => t.id === activeThread)?.participants.length || 0} participants
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="p-2 hover:bg-surface rounded-lg text-muted hover:text-text transition-colors"
                        >
                            <Search size={18} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-surface rounded-lg text-muted hover:text-text transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                {showSearch && (
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search messages..."
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm focus:outline-none focus:border-primary"
                    />
                )}
            </div>

            {/* Thread List / Messages */}
            {!activeThread ? (
                <div className="flex-1 overflow-y-auto">
                    {threads.map(thread => (
                        <div
                            key={thread.id}
                            onClick={() => setActiveThread(thread.id)}
                            className={clsx(
                                "p-4 border-b border-border cursor-pointer hover:bg-background transition-colors",
                                thread.unreadCount > 0 && "bg-primary/5"
                            )}
                        >
                            <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    {thread.isPinned && <Pin size={14} className="text-primary" />}
                                    <h4 className="font-semibold text-text text-sm">{thread.title}</h4>
                                </div>
                                {thread.unreadCount > 0 && (
                                    <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                                        {thread.unreadCount}
                                    </span>
                                )}
                            </div>
                            {thread.lastMessage && (
                                <p className="text-xs text-muted truncate">
                                    {thread.lastMessage.senderName}: {thread.lastMessage.content}
                                </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted">
                                    {thread.lastMessage?.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {thread.isMuted && <BellOff size={12} className="text-muted" />}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.filter(msg =>
                            !searchQuery || msg.content.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map(message => (
                            <div
                                key={message.id}
                                className={clsx(
                                    "flex gap-3",
                                    message.senderId === (currentUser?.uid || 'user1') && "flex-row-reverse"
                                )}
                            >
                                {/* Avatar */}
                                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                                    {message.senderAvatar || message.senderName.charAt(0)}
                                </div>

                                {/* Message Content */}
                                <div className={clsx(
                                    "flex-1 max-w-[75%]",
                                    message.senderId === (currentUser?.uid || 'user1') && "flex flex-col items-end"
                                )}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-medium text-text">{message.senderName}</span>
                                        <span className="text-xs text-muted">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {message.isRead && message.senderId === (currentUser?.uid || 'user1') && (
                                            <CheckCheck size={12} className="text-primary" />
                                        )}
                                        {message.aiSuggested && (
                                            <Sparkles size={12} className="text-secondary" title="AI Suggested" />
                                        )}
                                    </div>

                                    {/* Reply To */}
                                    {message.replyTo && (
                                        <div className="bg-background border-l-2 border-primary px-2 py-1 mb-1 rounded text-xs text-muted">
                                            Replying to previous message
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div className={clsx(
                                        "px-4 py-2 rounded-lg",
                                        message.senderId === (currentUser?.uid || 'user1')
                                            ? "bg-primary text-white"
                                            : "bg-background border border-border text-text"
                                    )}>
                                        {message.type === 'text' && (
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        )}

                                        {message.type === 'proof' && message.proofLink && (
                                            <div className="space-y-2">
                                                <p className="text-sm">{message.content}</p>
                                                <div className="bg-black/10 rounded-lg p-2 flex items-center gap-2">
                                                    <FileText size={16} />
                                                    <div className="flex-1">
                                                        <p className="text-xs font-medium">{message.proofLink.proofName}</p>
                                                        <p className="text-xs opacity-70">Page {message.proofLink.page}</p>
                                                    </div>
                                                    <LinkIcon size={14} />
                                                </div>
                                            </div>
                                        )}

                                        {message.type === 'file' && message.attachments && (
                                            <div className="space-y-2">
                                                {message.attachments.map(att => (
                                                    <div key={att.id} className="flex items-center gap-2 bg-black/10 rounded p-2">
                                                        <Paperclip size={14} />
                                                        <span className="text-xs flex-1">{att.name}</span>
                                                        <span className="text-xs opacity-70">
                                                            {(att.size / 1024).toFixed(1)}KB
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {message.translated && (
                                            <div className="mt-2 pt-2 border-t border-white/20">
                                                <div className="flex items-center gap-1 text-xs opacity-70 mb-1">
                                                    <Languages size={12} />
                                                    Translated from {message.originalLanguage}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sentiment Indicator */}
                                    {message.sentiment && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className={clsx(
                                                "text-xs",
                                                message.sentiment === 'positive' && "text-green-500",
                                                message.sentiment === 'negative' && "text-red-500",
                                                message.sentiment === 'neutral' && "text-gray-500"
                                            )}>
                                                {message.sentiment === 'positive' && '😊'}
                                                {message.sentiment === 'negative' && '😟'}
                                                {message.sentiment === 'neutral' && '😐'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Reactions */}
                                    {message.reactions && message.reactions.length > 0 && (
                                        <div className="flex gap-1 mt-1">
                                            {message.reactions.map((reaction, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-0.5 bg-background border border-border rounded-full text-xs flex items-center gap-1"
                                                    title={reaction.userName}
                                                >
                                                    {reaction.emoji}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Message Actions */}
                                    <div className="flex items-center gap-2 mt-1 opacity-0 hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setReplyingTo(message)}
                                            className="text-xs text-muted hover:text-text"
                                        >
                                            Reply
                                        </button>
                                        <button
                                            onClick={() => handleReaction(message.id, '👍')}
                                            className="text-xs text-muted hover:text-text"
                                        >
                                            React
                                        </button>
                                        {message.senderId !== (currentUser?.uid || 'user1') && (
                                            <button
                                                onClick={() => handleTranslate(message.id)}
                                                className="text-xs text-muted hover:text-text flex items-center gap-1"
                                            >
                                                <Languages size={12} />
                                                Translate
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {typingUsers.length > 0 && (
                            <div className="flex items-center gap-2 text-muted text-sm">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span>{typingUsers[0].userName} is typing...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* AI Suggested Responses */}
                    {showSuggestedResponses && (
                        <div className="px-4 py-2 bg-background border-t border-border">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={14} className="text-secondary" />
                                <span className="text-xs font-medium text-muted">Suggested Responses</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {AI_SUGGESTED_RESPONSES.slice(0, 3).map((response, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setMessageInput(response);
                                            setShowSuggestedResponses(false);
                                        }}
                                        className="px-3 py-1 bg-surface border border-border rounded-full text-xs text-text hover:border-secondary transition-colors"
                                    >
                                        {response}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reply Preview */}
                    {replyingTo && (
                        <div className="px-4 py-2 bg-background border-t border-border flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-xs text-muted">Replying to {replyingTo.senderName}</p>
                                <p className="text-sm text-text truncate">{replyingTo.content}</p>
                            </div>
                            <button
                                onClick={() => setReplyingTo(null)}
                                className="p-1 hover:bg-surface rounded"
                            >
                                <X size={16} className="text-muted" />
                            </button>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t border-border bg-background">
                        <div className="flex items-end gap-2">
                            {/* Attachment Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                                    className="p-2 hover:bg-surface rounded-lg text-muted hover:text-text transition-colors"
                                >
                                    <Paperclip size={20} />
                                </button>
                                {showAttachMenu && (
                                    <div className="absolute bottom-full left-0 mb-2 bg-surface border border-border rounded-lg shadow-lg p-2 space-y-1">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-background rounded flex items-center gap-2"
                                        >
                                            <FileText size={16} />
                                            File
                                        </button>
                                        <button className="w-full px-3 py-2 text-left text-sm hover:bg-background rounded flex items-center gap-2">
                                            <Image size={16} />
                                            Screenshot
                                        </button>
                                        <button className="w-full px-3 py-2 text-left text-sm hover:bg-background rounded flex items-center gap-2">
                                            <LinkIcon size={16} />
                                            Proof Link
                                        </button>
                                        <button
                                            onClick={() => setShowSuggestedResponses(!showSuggestedResponses)}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-background rounded flex items-center gap-2"
                                        >
                                            <Sparkles size={16} />
                                            AI Suggest
                                        </button>
                                        <button className="w-full px-3 py-2 text-left text-sm hover:bg-background rounded flex items-center gap-2">
                                            <Calendar size={16} />
                                            Schedule Meeting
                                        </button>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </div>

                            {/* Message Input */}
                            <div className="flex-1 relative">
                                <textarea
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Type a message..."
                                    className="w-full px-3 py-2 pr-20 bg-surface border border-border rounded-lg text-text resize-none focus:outline-none focus:border-primary"
                                    rows={1}
                                    style={{ minHeight: '40px', maxHeight: '120px' }}
                                />
                                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                                    <button
                                        onClick={handleMention}
                                        className="p-1 hover:bg-background rounded text-muted hover:text-text"
                                        title="Mention"
                                    >
                                        <AtSign size={16} />
                                    </button>
                                    <button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="p-1 hover:bg-background rounded text-muted hover:text-text"
                                    >
                                        <Smile size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={handleSendMessage}
                                disabled={!messageInput.trim()}
                                className={clsx(
                                    "p-2 rounded-lg transition-colors",
                                    messageInput.trim()
                                        ? "bg-primary hover:bg-primary/90 text-white"
                                        : "bg-surface text-muted cursor-not-allowed"
                                )}
                            >
                                <Send size={20} />
                            </button>
                        </div>

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div className="mt-2 p-2 bg-surface border border-border rounded-lg">
                                <div className="flex flex-wrap gap-2">
                                    {EMOJI_REACTIONS.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => {
                                                setMessageInput(prev => prev + emoji);
                                                setShowEmojiPicker(false);
                                            }}
                                            className="text-2xl hover:scale-125 transition-transform"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
