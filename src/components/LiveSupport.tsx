import React, { useState, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Phone, MessageSquare, X, Users, Sparkles, MousePointer2, FileText, Pen, Highlighter, Crosshair, Ruler, Eraser, Circle } from 'lucide-react';
import clsx from 'clsx';
import { CollaborativeCursor } from './CollaborativeCursor';
import { CoBrowsingCanvas } from './CoBrowsingCanvas';

interface LiveSupportProps {
    onClose: () => void;
    userName?: string;
    isInline?: boolean;
}

interface ChatMessage {
    id: string;
    sender: string;
    message: string;
    timestamp: Date;
    isAiSuggested?: boolean;
    attachment?: string;
}

const SUGGESTED_RESPONSES = [
    "I'm having trouble with bleed settings.",
    "Can you check my color profile?",
    "How do I approve this proof?",
    "The resolution looks low."
];

export const LiveSupport: React.FC<LiveSupportProps> = ({
    onClose,
    userName = 'Guest',
    isInline = false
}) => {
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [isCoBrowsing, setIsCoBrowsing] = useState(false);
    const [activeTool, setActiveTool] = useState<'cursor' | 'laser' | 'pen' | 'highlight' | 'measure'>('cursor');
    const [toolColor, setToolColor] = useState('#E30613'); // Primary Red

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            sender: 'Support Agent',
            message: 'Hello! How can I help you today?',
            timestamp: new Date()
        }
    ]);
    const [messageInput, setMessageInput] = useState('');
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const handleStartCall = async () => {
        try {
            setIsConnected(true);
            setIsAudioEnabled(true);
            setIsCoBrowsing(true); // Auto-start co-browsing simulation

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                setIsVideoEnabled(true);
            }
        } catch (err) {
            console.error('Error accessing media devices:', err);
            alert('Unable to access camera/microphone. Please check permissions.');
        }
    };

    const handleEndCall = () => {
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }
        setIsConnected(false);
        setIsVideoEnabled(false);
        setIsAudioEnabled(false);
        setIsScreenSharing(false);
        setIsCoBrowsing(false);
    };

    const handleToggleVideo = () => {
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const handleToggleAudio = () => {
        if (localVideoRef.current?.srcObject) {
            const stream = localVideoRef.current.srcObject as MediaStream;
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    const handleToggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                // @ts-ignore
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { mediaSource: 'screen' } as any
                });

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                }

                setIsScreenSharing(true);

                screenStream.getVideoTracks()[0].onended = () => {
                    setIsScreenSharing(false);
                    handleStartCall();
                };
            } else {
                handleStartCall();
                setIsScreenSharing(false);
            }
        } catch (err) {
            console.error('Error sharing screen:', err);
            alert('Unable to share screen. Please check permissions.');
        }
    };

    const handleSendMessage = (text: string = messageInput) => {
        if (text.trim()) {
            const newMessage: ChatMessage = {
                id: Date.now().toString(),
                sender: userName,
                message: text,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, newMessage]);
            setMessageInput('');

            // Simulate AI/Agent response
            setTimeout(() => {
                const response: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'Support Agent',
                    message: 'I see what you mean. Let me highlight that area for you.',
                    timestamp: new Date(),
                    isAiSuggested: true
                };
                setChatMessages(prev => [...prev, response]);
            }, 1500);
        }
    };

    return (
        <div className={clsx(
            isInline ? "w-full h-full flex flex-col" : "fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        )}>
            {/* Co-browsing Overlay */}
            <CollaborativeCursor isActive={isCoBrowsing} userName="Support Agent" />

            <div className={clsx(
                "bg-surface border border-border flex flex-col shadow-2xl relative overflow-hidden",
                isInline ? "w-full h-full border-0 rounded-none shadow-none" : "rounded-xl w-full max-w-7xl h-[90vh] z-10"
            )}>
                {/* Canvas Overlay */}
                <CoBrowsingCanvas
                    isActive={isCoBrowsing}
                    tool={activeTool}
                    color={toolColor}
                />

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-background/50 z-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Video size={24} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text">Live Support Session</h2>
                            <p className="text-sm text-muted">
                                {isConnected ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        Connected • Co-browsing Active
                                    </span>
                                ) : (
                                    'Not connected'
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Collaboration Toolbar */}
                    {isConnected && isCoBrowsing && (
                        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1 shadow-sm">
                            <button
                                onClick={() => setActiveTool('cursor')}
                                className={clsx("p-2 rounded transition-colors", activeTool === 'cursor' ? "bg-primary text-white" : "hover:bg-background text-muted")}
                                title="Cursor"
                            >
                                <MousePointer2 size={18} />
                            </button>
                            <button
                                onClick={() => setActiveTool('laser')}
                                className={clsx("p-2 rounded transition-colors", activeTool === 'laser' ? "bg-primary text-white" : "hover:bg-background text-muted")}
                                title="Laser Pointer"
                            >
                                <Crosshair size={18} />
                            </button>
                            <button
                                onClick={() => setActiveTool('pen')}
                                className={clsx("p-2 rounded transition-colors", activeTool === 'pen' ? "bg-primary text-white" : "hover:bg-background text-muted")}
                                title="Pen"
                            >
                                <Pen size={18} />
                            </button>
                            <button
                                onClick={() => setActiveTool('highlight')}
                                className={clsx("p-2 rounded transition-colors", activeTool === 'highlight' ? "bg-primary text-white" : "hover:bg-background text-muted")}
                                title="Highlighter"
                            >
                                <Highlighter size={18} />
                            </button>
                            <div className="w-px h-6 bg-border mx-1" />
                            <input
                                type="color"
                                value={toolColor}
                                onChange={(e) => setToolColor(e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                title="Tool Color"
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowChat(!showChat)}
                            className={clsx(
                                "p-2 rounded-lg transition-colors",
                                showChat ? "bg-primary text-white" : "bg-surface text-muted hover:text-text"
                            )}
                        >
                            <MessageSquare size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-muted hover:text-text transition-colors hover:bg-background rounded-lg"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden relative z-0">
                    {/* Video Area */}
                    <div className="flex-1 relative bg-black">
                        {/* Remote Video (Full screen) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {isConnected ? (
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-center">
                                    <Users size={64} className="mx-auto text-muted mb-4" />
                                    <p className="text-text font-medium mb-2">Start a session</p>
                                    <p className="text-sm text-muted mb-6">
                                        Share your screen or enable video to collaborate
                                    </p>
                                    <button
                                        onClick={handleStartCall}
                                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium flex items-center gap-2 mx-auto"
                                    >
                                        <Video size={20} />
                                        Start Session
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Local Video (Picture-in-Picture) */}
                        {isConnected && (
                            <div className="absolute bottom-4 right-4 w-64 h-48 bg-background border-2 border-border rounded-lg overflow-hidden shadow-2xl z-50">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                                    You {isScreenSharing && '(Screen)'}
                                </div>
                            </div>
                        )}

                        {/* Control Bar */}
                        {isConnected && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3 bg-background/90 backdrop-blur-sm p-3 rounded-xl border border-border z-50">
                                <button
                                    onClick={handleToggleAudio}
                                    className={clsx(
                                        "p-3 rounded-lg transition-colors",
                                        isAudioEnabled
                                            ? "bg-surface hover:bg-surface/80 text-text"
                                            : "bg-red-600 hover:bg-red-700 text-white"
                                    )}
                                >
                                    {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                                </button>
                                <button
                                    onClick={handleToggleVideo}
                                    className={clsx(
                                        "p-3 rounded-lg transition-colors",
                                        isVideoEnabled
                                            ? "bg-surface hover:bg-surface/80 text-text"
                                            : "bg-red-600 hover:bg-red-700 text-white"
                                    )}
                                >
                                    {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                                </button>
                                <button
                                    onClick={handleToggleScreenShare}
                                    className={clsx(
                                        "p-3 rounded-lg transition-colors",
                                        isScreenSharing
                                            ? "bg-primary text-white"
                                            : "bg-surface hover:bg-surface/80 text-text"
                                    )}
                                >
                                    {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
                                </button>
                                <button
                                    onClick={() => setIsCoBrowsing(!isCoBrowsing)}
                                    className={clsx(
                                        "p-3 rounded-lg transition-colors",
                                        isCoBrowsing
                                            ? "bg-secondary text-white"
                                            : "bg-surface hover:bg-surface/80 text-text"
                                    )}
                                    title="Toggle Co-browsing"
                                >
                                    <MousePointer2 size={20} />
                                </button>
                                <div className="w-px bg-border" />
                                <button
                                    onClick={handleEndCall}
                                    className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    <Phone size={20} className="rotate-[135deg]" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Chat Sidebar */}
                    {showChat && (
                        <div className="w-80 border-l border-border flex flex-col bg-surface z-50">
                            <div className="p-4 border-b border-border">
                                <h3 className="font-bold text-text flex items-center gap-2">
                                    <MessageSquare size={16} />
                                    Smart Chat
                                </h3>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-auto p-4 space-y-3">
                                {chatMessages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={clsx(
                                            "flex flex-col gap-1",
                                            msg.sender === userName ? "items-end" : "items-start"
                                        )}
                                    >
                                        <div className="text-xs text-muted flex items-center gap-1">
                                            {msg.sender}
                                            {msg.isAiSuggested && <Sparkles size={10} className="text-secondary" />}
                                        </div>
                                        <div
                                            className={clsx(
                                                "px-3 py-2 rounded-lg max-w-[80%]",
                                                msg.sender === userName
                                                    ? "bg-primary text-white"
                                                    : "bg-background text-text border border-border"
                                            )}
                                        >
                                            {msg.message}
                                        </div>
                                        <div className="text-xs text-muted">
                                            {msg.timestamp.toLocaleTimeString()}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Suggested Responses */}
                            <div className="p-2 bg-background border-t border-border">
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {SUGGESTED_RESPONSES.map((response, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(response)}
                                            className="whitespace-nowrap px-3 py-1 bg-surface border border-border rounded-full text-xs text-muted hover:text-primary hover:border-primary transition-colors flex items-center gap-1"
                                        >
                                            <Sparkles size={10} />
                                            {response}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-border bg-background">
                                <div className="flex gap-2">
                                    <button className="p-2 text-muted hover:text-text hover:bg-surface rounded-lg transition-colors">
                                        <FileText size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type a message..."
                                        className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:border-primary"
                                    />
                                    <button
                                        onClick={() => handleSendMessage()}
                                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
