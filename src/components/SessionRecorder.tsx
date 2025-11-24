import React, { useState, useRef, useEffect } from 'react';
import { Circle, Square, Play, Pause, Download, Trash2, Clock } from 'lucide-react';
import clsx from 'clsx';

interface RecordingChapter {
    timestamp: number;
    title: string;
    description?: string;
}

interface SessionRecorderProps {
    sessionId: string;
    onRecordingComplete?: (blob: Blob, duration: number, chapters: RecordingChapter[]) => void;
    autoStart?: boolean;
}

export const SessionRecorder: React.FC<SessionRecorderProps> = ({
    sessionId,
    onRecordingComplete,
    autoStart = false
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [chapters, setChapters] = useState<RecordingChapter[]>([]);
    const [showChapterInput, setShowChapterInput] = useState(false);
    const [chapterTitle, setChapterTitle] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        if (autoStart) {
            handleStartRecording();
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [autoStart]);

    const handleStartRecording = async () => {
        try {
            // Get screen + audio stream
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    mediaSource: 'screen',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                } as any,
                audio: true
            });

            // Get microphone audio
            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            // Combine streams
            const combinedStream = new MediaStream([
                ...displayStream.getVideoTracks(),
                ...displayStream.getAudioTracks(),
                ...audioStream.getAudioTracks()
            ]);

            // Create MediaRecorder
            const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                ? 'video/webm;codecs=vp9'
                : 'video/webm';

            const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType,
                videoBitsPerSecond: 2500000 // 2.5 Mbps for HD quality
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setRecordedBlob(blob);
                onRecordingComplete?.(blob, duration, chapters);
                chunksRef.current = [];
            };

            // Handle stream end (user stops sharing)
            displayStream.getVideoTracks()[0].onended = () => {
                handleStopRecording();
            };

            mediaRecorder.start(1000); // Collect data every second
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            startTimeRef.current = Date.now();

            // Start timer
            timerRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Failed to start recording. Please check permissions.');
        }
    };

    const handlePauseRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                setIsPaused(false);
            } else {
                mediaRecorderRef.current.pause();
                setIsPaused(true);
            }
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            setIsPaused(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const handleAddChapter = () => {
        if (chapterTitle.trim()) {
            const chapter: RecordingChapter = {
                timestamp: duration,
                title: chapterTitle.trim(),
                description: `Added at ${formatDuration(duration)}`
            };
            setChapters([...chapters, chapter]);
            setChapterTitle('');
            setShowChapterInput(false);
        }
    };

    const handleDownload = () => {
        if (recordedBlob) {
            const url = URL.createObjectURL(recordedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `session-${sessionId}-${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handleDiscard = () => {
        if (confirm('Are you sure you want to discard this recording?')) {
            setRecordedBlob(null);
            setDuration(0);
            setChapters([]);
        }
    };

    const formatDuration = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-surface border border-border rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "w-3 h-3 rounded-full",
                        isRecording && !isPaused ? "bg-red-500 animate-pulse" :
                            isPaused ? "bg-orange-500" :
                                recordedBlob ? "bg-green-500" : "bg-gray-500"
                    )} />
                    <div>
                        <h3 className="font-semibold text-text">Session Recording</h3>
                        <p className="text-xs text-muted">
                            {isRecording && !isPaused ? 'Recording...' :
                                isPaused ? 'Paused' :
                                    recordedBlob ? 'Recording Complete' : 'Ready to Record'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-text font-mono text-lg">
                    <Clock size={18} />
                    {formatDuration(duration)}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 mb-4">
                {!isRecording && !recordedBlob && (
                    <button
                        onClick={handleStartRecording}
                        className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <Circle size={18} />
                        Start Recording
                    </button>
                )}

                {isRecording && (
                    <>
                        <button
                            onClick={handlePauseRecording}
                            className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            {isPaused ? <Play size={18} /> : <Pause size={18} />}
                            {isPaused ? 'Resume' : 'Pause'}
                        </button>
                        <button
                            onClick={handleStopRecording}
                            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <Square size={18} />
                            Stop
                        </button>
                        <button
                            onClick={() => setShowChapterInput(true)}
                            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium"
                        >
                            + Chapter
                        </button>
                    </>
                )}

                {recordedBlob && (
                    <>
                        <button
                            onClick={handleDownload}
                            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <Download size={18} />
                            Download
                        </button>
                        <button
                            onClick={handleDiscard}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 size={18} />
                        </button>
                    </>
                )}
            </div>

            {/* Chapter Input */}
            {showChapterInput && (
                <div className="mb-4 p-3 bg-background border border-border rounded-lg">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={chapterTitle}
                            onChange={(e) => setChapterTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddChapter()}
                            placeholder="Chapter title..."
                            className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                            autoFocus
                        />
                        <button
                            onClick={handleAddChapter}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => setShowChapterInput(false)}
                            className="px-4 py-2 bg-surface text-muted rounded-lg hover:bg-background transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Chapters List */}
            {chapters.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted">Chapters ({chapters.length})</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {chapters.map((chapter, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-background border border-border rounded text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-primary font-mono">{formatDuration(chapter.timestamp)}</span>
                                    <span className="text-text">{chapter.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recording Info */}
            {recordedBlob && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-400">
                        Recording saved • {(recordedBlob.size / 1024 / 1024).toFixed(2)} MB • {chapters.length} chapters
                    </p>
                </div>
            )}
        </div>
    );
};
