import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, FileText } from 'lucide-react';
import { TrainingVideo } from '../lib/training-videos';
import clsx from 'clsx';

interface VideoPlayerModalProps {
    video: TrainingVideo;
    onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === ' ') {
                e.preventDefault();
                togglePlay();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                videoRef.current.requestFullscreen();
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-bold text-text">{video.title}</h2>
                        <p className="text-sm text-muted mt-1">{video.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className={clsx(
                                "px-2 py-1 rounded text-xs font-medium",
                                video.difficulty === 'beginner' && "bg-green-500/10 text-green-400 border border-green-500/20",
                                video.difficulty === 'intermediate' && "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
                                video.difficulty === 'advanced' && "bg-red-500/10 text-red-400 border border-red-500/20"
                            )}>
                                {video.difficulty.charAt(0).toUpperCase() + video.difficulty.slice(1)}
                            </span>
                            <span className="text-xs text-muted">Duration: {video.duration}</span>
                            <span className="text-xs text-muted capitalize">Category: {video.category.replace('-', ' ')}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-text transition-colors p-2 hover:bg-background rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Video Player */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="bg-black rounded-lg overflow-hidden mb-4">
                        <video
                            ref={videoRef}
                            className="w-full aspect-video"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            poster={video.thumbnailUrl}
                        >
                            <source src={video.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>

                        {/* Video Controls */}
                        <div className="bg-black/90 p-4">
                            {/* Progress Bar */}
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full mb-3 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
                                }}
                            />

                            {/* Control Buttons */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={togglePlay}
                                        className="text-white hover:text-primary transition-colors"
                                    >
                                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                                    </button>
                                    <button
                                        onClick={toggleMute}
                                        className="text-white hover:text-primary transition-colors"
                                    >
                                        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                    </button>
                                    <span className="text-white text-sm">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setShowTranscript(!showTranscript)}
                                        className={clsx(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                            showTranscript
                                                ? "bg-primary text-white"
                                                : "text-white hover:bg-white/10"
                                        )}
                                    >
                                        <FileText size={16} />
                                        Transcript
                                    </button>
                                    <button
                                        onClick={toggleFullscreen}
                                        className="text-white hover:text-primary transition-colors"
                                    >
                                        <Maximize size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transcript */}
                    {showTranscript && (
                        <div className="bg-background border border-border rounded-lg p-6">
                            <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                                <FileText size={20} />
                                Video Transcript
                            </h3>
                            <div className="text-sm text-muted leading-relaxed whitespace-pre-wrap">
                                {video.transcript}
                            </div>
                        </div>
                    )}

                    {/* Related Features */}
                    {video.relatedFeatures.length > 0 && (
                        <div className="mt-4 p-4 bg-background border border-border rounded-lg">
                            <h4 className="text-sm font-bold text-text mb-2">Related Features:</h4>
                            <div className="flex flex-wrap gap-2">
                                {video.relatedFeatures.map(feature => (
                                    <span
                                        key={feature}
                                        className="px-2 py-1 bg-surface border border-border rounded text-xs text-muted capitalize"
                                    >
                                        {feature.replace('-', ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {video.tags.length > 0 && (
                        <div className="mt-4 p-4 bg-background border border-border rounded-lg">
                            <h4 className="text-sm font-bold text-text mb-2">Tags:</h4>
                            <div className="flex flex-wrap gap-2">
                                {video.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-xs text-primary"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-background/50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted">
                            Press <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs">Space</kbd> to play/pause,{' '}
                            <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs">Esc</kbd> to close
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
