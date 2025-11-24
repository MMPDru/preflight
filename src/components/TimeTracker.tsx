import React, { useState } from 'react';
import { Clock, Play, Pause, Square } from 'lucide-react';

export interface TimeEntry {
    jobId: string;
    startTime: Date;
    endTime?: Date;
    duration: number; // in seconds
    isActive: boolean;
}

interface TimeTrackerProps {
    jobId: string;
    jobName: string;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({ jobId, jobName }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timer, setTimer] = useState<number | null>(null);
    const [entries, setEntries] = useState<TimeEntry[]>([]);

    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTracking) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTracking]);

    const handleStart = () => {
        setIsTracking(true);
        setElapsedTime(0);
    };

    const handlePause = () => {
        setIsTracking(false);
    };

    const handleStop = () => {
        const entry: TimeEntry = {
            jobId,
            startTime: new Date(Date.now() - elapsedTime * 1000),
            endTime: new Date(),
            duration: elapsedTime,
            isActive: false
        };
        setEntries(prev => [...prev, entry]);
        setIsTracking(false);
        setElapsedTime(0);
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const totalTime = entries.reduce((sum, entry) => sum + entry.duration, 0) + elapsedTime;

    return (
        <div className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Clock size={18} className="text-primary" />
                    <span className="font-medium text-text">Time Tracking</span>
                </div>
                <div className="text-sm text-muted">{jobName}</div>
            </div>

            <div className="text-center mb-4">
                <div className="text-4xl font-bold text-text mb-1">{formatTime(elapsedTime)}</div>
                <div className="text-xs text-muted">Current Session</div>
            </div>

            <div className="flex gap-2 mb-4">
                {!isTracking && elapsedTime === 0 && (
                    <button
                        onClick={handleStart}
                        className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <Play size={16} />
                        Start
                    </button>
                )}
                {isTracking && (
                    <>
                        <button
                            onClick={handlePause}
                            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <Pause size={16} />
                            Pause
                        </button>
                        <button
                            onClick={handleStop}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <Square size={16} />
                            Stop
                        </button>
                    </>
                )}
                {!isTracking && elapsedTime > 0 && (
                    <>
                        <button
                            onClick={handleStart}
                            className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <Play size={16} />
                            Resume
                        </button>
                        <button
                            onClick={handleStop}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <Square size={16} />
                            Stop
                        </button>
                    </>
                )}
            </div>

            <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                    <span className="text-muted">Total Time</span>
                    <span className="font-bold text-text">{formatTime(totalTime)}</span>
                </div>
                {entries.length > 0 && (
                    <div className="text-xs text-muted mt-2">
                        {entries.length} session{entries.length > 1 ? 's' : ''} logged
                    </div>
                )}
            </div>
        </div>
    );
};
