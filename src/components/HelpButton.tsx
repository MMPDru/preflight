import React, { useState } from 'react';
import { HelpCircle, Play } from 'lucide-react';
import { getVideoById } from '../lib/training-videos';
import { VideoPlayerModal } from './VideoPlayerModal';
import clsx from 'clsx';

interface HelpButtonProps {
    videoId: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'icon' | 'button' | 'inline';
    label?: string;
    className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({
    videoId,
    size = 'md',
    variant = 'icon',
    label,
    className
}) => {
    const [showVideo, setShowVideo] = useState(false);
    const video = getVideoById(videoId);

    if (!video) {
        console.warn(`Video not found: ${videoId}`);
        return null;
    }

    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    const buttonSizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    if (variant === 'icon') {
        return (
            <>
                <button
                    onClick={() => setShowVideo(true)}
                    className={clsx(
                        "text-primary hover:text-primary/80 transition-colors",
                        "hover:scale-110 transform",
                        className
                    )}
                    title={`Watch: ${video.title}`}
                    aria-label={`Help video: ${video.title}`}
                >
                    <HelpCircle className={sizeClasses[size]} />
                </button>
                {showVideo && (
                    <VideoPlayerModal
                        video={video}
                        onClose={() => setShowVideo(false)}
                    />
                )}
            </>
        );
    }

    if (variant === 'button') {
        return (
            <>
                <button
                    onClick={() => setShowVideo(true)}
                    className={clsx(
                        "flex items-center gap-2 rounded-lg font-medium transition-colors",
                        "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20",
                        buttonSizeClasses[size],
                        className
                    )}
                >
                    <Play className={sizeClasses[size]} />
                    {label || 'Watch Tutorial'}
                </button>
                {showVideo && (
                    <VideoPlayerModal
                        video={video}
                        onClose={() => setShowVideo(false)}
                    />
                )}
            </>
        );
    }

    // inline variant
    return (
        <>
            <button
                onClick={() => setShowVideo(true)}
                className={clsx(
                    "inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors",
                    "underline decoration-dotted underline-offset-2",
                    className
                )}
            >
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm">{label || 'Watch how'}</span>
            </button>
            {showVideo && (
                <VideoPlayerModal
                    video={video}
                    onClose={() => setShowVideo(false)}
                />
            )}
        </>
    );
};
