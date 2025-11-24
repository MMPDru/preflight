import React, { useState, useRef, useEffect } from 'react';
import { Video, Users, Grid, Maximize2, Settings } from 'lucide-react';
import clsx from 'clsx';

interface Participant {
    id: string;
    name: string;
    stream: MediaStream | null;
    isLocal: boolean;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    isSpeaking: boolean;
}

interface VideoGalleryProps {
    participants: Participant[];
    layout?: 'grid' | 'speaker' | 'sidebar';
    onLayoutChange?: (layout: 'grid' | 'speaker' | 'sidebar') => void;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({
    participants,
    layout = 'grid',
    onLayoutChange
}) => {
    const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

    useEffect(() => {
        // Attach streams to video elements
        participants.forEach(participant => {
            const videoElement = videoRefs.current.get(participant.id);
            if (videoElement && participant.stream) {
                videoElement.srcObject = participant.stream;
            }
        });
    }, [participants]);

    // Auto-select active speaker
    useEffect(() => {
        const speakingParticipant = participants.find(p => p.isSpeaking && !p.isLocal);
        if (speakingParticipant && layout === 'speaker') {
            setSelectedSpeaker(speakingParticipant.id);
        }
    }, [participants, layout]);

    const getGridColumns = () => {
        const count = participants.length;
        if (count <= 1) return 'grid-cols-1';
        if (count <= 4) return 'grid-cols-2';
        if (count <= 9) return 'grid-cols-3';
        return 'grid-cols-4';
    };

    const renderParticipantVideo = (participant: Participant, isLarge = false) => (
        <div
            key={participant.id}
            className={clsx(
                "relative bg-black rounded-lg overflow-hidden border-2 transition-all",
                participant.isSpeaking ? "border-secondary" : "border-border",
                isLarge ? "h-full" : "aspect-video"
            )}
            onClick={() => layout === 'speaker' && setSelectedSpeaker(participant.id)}
        >
            {participant.isVideoEnabled ? (
                <video
                    ref={(el) => {
                        if (el) videoRefs.current.set(participant.id, el);
                    }}
                    autoPlay
                    playsInline
                    muted={participant.isLocal}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary/30 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-2xl font-bold text-white">
                                {participant.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <p className="text-white text-sm">{participant.name}</p>
                    </div>
                </div>
            )}

            {/* Participant Info Overlay */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                <div className="flex items-center gap-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-white text-xs">
                    <span className={clsx(
                        "w-2 h-2 rounded-full",
                        participant.isSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-500"
                    )} />
                    <span>{participant.name}</span>
                    {participant.isLocal && <span className="text-muted">(You)</span>}
                </div>
                <div className="flex gap-1">
                    {!participant.isVideoEnabled && (
                        <div className="p-1 bg-red-500/80 rounded">
                            <Video size={12} className="text-white" />
                        </div>
                    )}
                    {!participant.isAudioEnabled && (
                        <div className="p-1 bg-red-500/80 rounded">
                            <span className="text-white text-xs">🔇</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Speaking Indicator */}
            {participant.isSpeaking && (
                <div className="absolute top-2 right-2">
                    <div className="flex gap-0.5">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-green-500 rounded-full animate-pulse"
                                style={{
                                    height: `${12 + i * 4}px`,
                                    animationDelay: `${i * 100}ms`
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <Users size={20} className="text-muted" />
                    <span className="text-sm font-medium text-text">
                        {participants.length} Participant{participants.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Layout Switcher */}
                    <div className="flex gap-1 bg-surface border border-border rounded-lg p-1">
                        <button
                            onClick={() => onLayoutChange?.('grid')}
                            className={clsx(
                                "p-2 rounded transition-colors",
                                layout === 'grid' ? "bg-primary text-white" : "text-muted hover:text-text"
                            )}
                            title="Grid View"
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => onLayoutChange?.('speaker')}
                            className={clsx(
                                "p-2 rounded transition-colors",
                                layout === 'speaker' ? "bg-primary text-white" : "text-muted hover:text-text"
                            )}
                            title="Speaker View"
                        >
                            <Maximize2 size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 text-muted hover:text-text hover:bg-surface rounded-lg transition-colors"
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 p-4 overflow-auto">
                {layout === 'grid' && (
                    <div className={clsx("grid gap-4 h-full", getGridColumns())}>
                        {participants.map(participant => renderParticipantVideo(participant))}
                    </div>
                )}

                {layout === 'speaker' && (
                    <div className="h-full flex gap-4">
                        {/* Main Speaker */}
                        <div className="flex-1">
                            {selectedSpeaker ? (
                                renderParticipantVideo(
                                    participants.find(p => p.id === selectedSpeaker) || participants[0],
                                    true
                                )
                            ) : (
                                renderParticipantVideo(participants[0], true)
                            )}
                        </div>

                        {/* Sidebar Thumbnails */}
                        {participants.length > 1 && (
                            <div className="w-48 space-y-3 overflow-y-auto">
                                {participants
                                    .filter(p => p.id !== selectedSpeaker)
                                    .map(participant => renderParticipantVideo(participant))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="absolute top-16 right-4 w-80 bg-surface border border-border rounded-lg shadow-2xl p-4 z-50">
                    <h3 className="font-semibold text-text mb-4">Video Settings</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-muted mb-1">Video Quality</label>
                            <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary">
                                <option>Auto (Adaptive)</option>
                                <option>HD (1080p)</option>
                                <option>SD (720p)</option>
                                <option>Low (480p)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-1">Frame Rate</label>
                            <select className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary">
                                <option>30 FPS</option>
                                <option>24 FPS</option>
                                <option>15 FPS</option>
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted">Mirror My Video</span>
                            <input type="checkbox" className="rounded" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted">Show Network Stats</span>
                            <input type="checkbox" className="rounded" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
