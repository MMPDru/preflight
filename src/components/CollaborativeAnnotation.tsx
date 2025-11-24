import React, { useState, useRef, useEffect } from 'react';
import {
    Pencil, Highlighter, Type, Square, Circle, ArrowRight,
    Ruler, Droplet, StickyNote, CheckCircle, XCircle, Trash2,
    Download, Layers, Users, Undo, Redo, Save
} from 'lucide-react';
import clsx from 'clsx';

// Types
interface Annotation {
    id: string;
    type: 'pen' | 'highlight' | 'text' | 'shape' | 'measurement' | 'note' | 'stamp';
    userId: string;
    userName: string;
    userColor: string;
    data: any;
    timestamp: Date;
    layer: number;
}

interface Cursor {
    userId: string;
    userName: string;
    x: number;
    y: number;
    color: string;
}

interface CollaborativeAnnotationProps {
    documentUrl: string;
    sessionId: string;
    currentUserId: string;
    currentUserName: string;
    participants: Array<{ id: string; name: string; color: string }>;
    onAnnotationAdd?: (annotation: Annotation) => void;
    onAnnotationDelete?: (annotationId: string) => void;
}

const TOOLS = [
    { id: 'pen', label: 'Pen', icon: Pencil, color: 'text-blue-500' },
    { id: 'highlight', label: 'Highlight', icon: Highlighter, color: 'text-yellow-500' },
    { id: 'text', label: 'Text', icon: Type, color: 'text-purple-500' },
    { id: 'rectangle', label: 'Rectangle', icon: Square, color: 'text-green-500' },
    { id: 'circle', label: 'Circle', icon: Circle, color: 'text-pink-500' },
    { id: 'arrow', label: 'Arrow', icon: ArrowRight, color: 'text-orange-500' },
    { id: 'ruler', label: 'Measure', icon: Ruler, color: 'text-cyan-500' },
    { id: 'color-picker', label: 'Color', icon: Droplet, color: 'text-red-500' },
    { id: 'note', label: 'Note', icon: StickyNote, color: 'text-amber-500' },
    { id: 'approve', label: 'Approve', icon: CheckCircle, color: 'text-green-500' },
    { id: 'reject', label: 'Reject', icon: XCircle, color: 'text-red-500' }
];

const COLORS = [
    '#EF4444', // red
    '#F59E0B', // amber
    '#10B981', // green
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#000000', // black
    '#FFFFFF'  // white
];

export const CollaborativeAnnotation: React.FC<CollaborativeAnnotationProps> = ({
    documentUrl,
    sessionId,
    currentUserId,
    currentUserName,
    participants,
    onAnnotationAdd,
    onAnnotationDelete
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool, setSelectedTool] = useState<string>('pen');
    const [selectedColor, setSelectedColor] = useState<string>('#EF4444');
    const [lineWidth, setLineWidth] = useState<number>(3);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [cursors, setCursors] = useState<Cursor[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState<Array<{ x: number, y: number }>>([]);
    const [showLayers, setShowLayers] = useState(false);
    const [activeLayer, setActiveLayer] = useState(0);
    const [history, setHistory] = useState<Annotation[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [textInput, setTextInput] = useState<{ x: number, y: number, show: boolean }>({ x: 0, y: 0, show: false });
    const [textValue, setTextValue] = useState('');

    // Get user color
    const userColor = participants.find(p => p.id === currentUserId)?.color || '#3B82F6';

    // Mouse/Touch handlers
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (selectedTool === 'text') {
            setTextInput({ x, y, show: true });
            return;
        }

        if (selectedTool === 'note') {
            addNote(x, y);
            return;
        }

        if (selectedTool === 'approve' || selectedTool === 'reject') {
            addStamp(x, y, selectedTool);
            return;
        }

        setIsDrawing(true);
        setCurrentPath([{ x, y }]);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Update cursor position for other users
        updateCursor(x, y);

        if (!isDrawing) return;

        setCurrentPath(prev => [...prev, { x, y }]);
        drawPath([...currentPath, { x, y }]);
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (currentPath.length > 0) {
            const annotation: Annotation = {
                id: `${currentUserId}-${Date.now()}`,
                type: selectedTool as any,
                userId: currentUserId,
                userName: currentUserName,
                userColor,
                data: {
                    path: currentPath,
                    color: selectedColor,
                    lineWidth,
                    tool: selectedTool
                },
                timestamp: new Date(),
                layer: activeLayer
            };

            addAnnotation(annotation);
            setCurrentPath([]);
        }
    };

    const drawPath = (path: Array<{ x: number, y: number }>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (selectedTool === 'highlight') {
            ctx.globalAlpha = 0.3;
            ctx.lineWidth = lineWidth * 3;
        } else {
            ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);

        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }

        ctx.stroke();
    };

    const addAnnotation = (annotation: Annotation) => {
        setAnnotations(prev => [...prev, annotation]);
        onAnnotationAdd?.(annotation);

        // Add to history
        setHistory(prev => [...prev.slice(0, historyIndex + 1), [...annotations, annotation]]);
        setHistoryIndex(prev => prev + 1);
    };

    const addNote = (x: number, y: number) => {
        const note = prompt('Enter note:');
        if (!note) return;

        const annotation: Annotation = {
            id: `${currentUserId}-${Date.now()}`,
            type: 'note',
            userId: currentUserId,
            userName: currentUserName,
            userColor,
            data: { x, y, text: note },
            timestamp: new Date(),
            layer: activeLayer
        };

        addAnnotation(annotation);
    };

    const addStamp = (x: number, y: number, type: string) => {
        const annotation: Annotation = {
            id: `${currentUserId}-${Date.now()}`,
            type: 'stamp',
            userId: currentUserId,
            userName: currentUserName,
            userColor,
            data: { x, y, stampType: type },
            timestamp: new Date(),
            layer: activeLayer
        };

        addAnnotation(annotation);
    };

    const addTextAnnotation = () => {
        if (!textValue.trim()) {
            setTextInput({ x: 0, y: 0, show: false });
            return;
        }

        const annotation: Annotation = {
            id: `${currentUserId}-${Date.now()}`,
            type: 'text',
            userId: currentUserId,
            userName: currentUserName,
            userColor,
            data: {
                x: textInput.x,
                y: textInput.y,
                text: textValue,
                color: selectedColor
            },
            timestamp: new Date(),
            layer: activeLayer
        };

        addAnnotation(annotation);
        setTextInput({ x: 0, y: 0, show: false });
        setTextValue('');
    };

    const updateCursor = (x: number, y: number) => {
        // In production, emit to WebSocket
        setCursors(prev => {
            const filtered = prev.filter(c => c.userId !== currentUserId);
            return [...filtered, {
                userId: currentUserId,
                userName: currentUserName,
                x,
                y,
                color: userColor
            }];
        });
    };

    const deleteAnnotation = (id: string) => {
        setAnnotations(prev => prev.filter(a => a.id !== id));
        onAnnotationDelete?.(id);
    };

    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            setAnnotations(history[historyIndex - 1] || []);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            setAnnotations(history[historyIndex + 1]);
        }
    };

    const clearAll = () => {
        if (confirm('Clear all annotations?')) {
            setAnnotations([]);
            setHistory([]);
            setHistoryIndex(-1);
        }
    };

    const exportAnnotations = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `annotations-${sessionId}.png`;
        link.href = dataUrl;
        link.click();
    };

    // Redraw all annotations
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all annotations
        annotations.forEach(annotation => {
            if (annotation.type === 'pen' || annotation.type === 'highlight') {
                ctx.strokeStyle = annotation.data.color;
                ctx.lineWidth = annotation.data.lineWidth;
                ctx.globalAlpha = annotation.type === 'highlight' ? 0.3 : 1;

                const path = annotation.data.path;
                ctx.beginPath();
                ctx.moveTo(path[0].x, path[0].y);
                for (let i = 1; i < path.length; i++) {
                    ctx.lineTo(path[i].x, path[i].y);
                }
                ctx.stroke();
            } else if (annotation.type === 'text') {
                ctx.fillStyle = annotation.data.color;
                ctx.font = '16px Arial';
                ctx.globalAlpha = 1;
                ctx.fillText(annotation.data.text, annotation.data.x, annotation.data.y);
            } else if (annotation.type === 'note') {
                // Draw note icon
                ctx.fillStyle = annotation.userColor;
                ctx.globalAlpha = 1;
                ctx.fillRect(annotation.data.x, annotation.data.y, 30, 30);
            } else if (annotation.type === 'stamp') {
                // Draw stamp
                ctx.globalAlpha = 1;
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = annotation.data.stampType === 'approve' ? '#10B981' : '#EF4444';
                ctx.fillText(annotation.data.stampType === 'approve' ? '✓' : '✗', annotation.data.x, annotation.data.y);
            }
        });
    }, [annotations]);

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Toolbar */}
            <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Tools */}
                    <div className="flex gap-1 bg-background border border-border rounded-lg p-1">
                        {TOOLS.slice(0, 6).map(tool => {
                            const Icon = tool.icon;
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => setSelectedTool(tool.id)}
                                    className={clsx(
                                        "p-2 rounded transition-colors",
                                        selectedTool === tool.id
                                            ? "bg-primary text-white"
                                            : `${tool.color} hover:bg-surface`
                                    )}
                                    title={tool.label}
                                >
                                    <Icon size={18} />
                                </button>
                            );
                        })}
                    </div>

                    {/* More Tools */}
                    <div className="flex gap-1 bg-background border border-border rounded-lg p-1">
                        {TOOLS.slice(6).map(tool => {
                            const Icon = tool.icon;
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => setSelectedTool(tool.id)}
                                    className={clsx(
                                        "p-2 rounded transition-colors",
                                        selectedTool === tool.id
                                            ? "bg-primary text-white"
                                            : `${tool.color} hover:bg-surface`
                                    )}
                                    title={tool.label}
                                >
                                    <Icon size={18} />
                                </button>
                            );
                        })}
                    </div>

                    {/* Color Picker */}
                    <div className="flex gap-1 bg-background border border-border rounded-lg p-1">
                        {COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={clsx(
                                    "w-6 h-6 rounded border-2 transition-all",
                                    selectedColor === color ? "border-primary scale-110" : "border-transparent"
                                )}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>

                    {/* Line Width */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-background border border-border rounded-lg">
                        <span className="text-xs text-muted">Width:</span>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={lineWidth}
                            onChange={(e) => setLineWidth(Number(e.target.value))}
                            className="w-20"
                        />
                        <span className="text-xs text-text w-6">{lineWidth}px</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* History */}
                    <button
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        className="p-2 text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Undo"
                    >
                        <Undo size={18} />
                    </button>
                    <button
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-2 text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Redo"
                    >
                        <Redo size={18} />
                    </button>

                    {/* Actions */}
                    <div className="w-px h-6 bg-border" />
                    <button
                        onClick={() => setShowLayers(!showLayers)}
                        className="p-2 text-muted hover:text-text"
                        title="Layers"
                    >
                        <Layers size={18} />
                    </button>
                    <button
                        onClick={exportAnnotations}
                        className="p-2 text-muted hover:text-text"
                        title="Export"
                    >
                        <Download size={18} />
                    </button>
                    <button
                        onClick={clearAll}
                        className="p-2 text-red-500 hover:text-red-600"
                        title="Clear All"
                    >
                        <Trash2 size={18} />
                    </button>

                    {/* Participants */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-background border border-border rounded-lg">
                        <Users size={16} className="text-muted" />
                        <span className="text-sm text-text">{participants.length}</span>
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-auto bg-gray-100">
                <canvas
                    ref={canvasRef}
                    width={1200}
                    height={1600}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="cursor-crosshair bg-white shadow-lg mx-auto my-4"
                    style={{ display: 'block' }}
                />

                {/* Collaborative Cursors */}
                {cursors.filter(c => c.userId !== currentUserId).map(cursor => (
                    <div
                        key={cursor.userId}
                        className="absolute pointer-events-none"
                        style={{
                            left: cursor.x,
                            top: cursor.y,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div
                            className="w-4 h-4 rounded-full border-2 border-white"
                            style={{ backgroundColor: cursor.color }}
                        />
                        <div
                            className="mt-1 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
                            style={{ backgroundColor: cursor.color }}
                        >
                            {cursor.userName}
                        </div>
                    </div>
                ))}

                {/* Text Input */}
                {textInput.show && (
                    <div
                        className="absolute"
                        style={{ left: textInput.x, top: textInput.y }}
                    >
                        <input
                            type="text"
                            value={textValue}
                            onChange={(e) => setTextValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTextAnnotation()}
                            onBlur={addTextAnnotation}
                            autoFocus
                            className="px-2 py-1 border-2 border-primary rounded text-sm"
                            placeholder="Type text..."
                        />
                    </div>
                )}
            </div>

            {/* Annotation List */}
            <div className="h-48 border-t border-border bg-surface p-4 overflow-auto">
                <h3 className="font-bold text-text mb-2 flex items-center gap-2">
                    <Layers size={16} />
                    Annotations ({annotations.length})
                </h3>
                <div className="space-y-2">
                    {annotations.map(annotation => (
                        <div
                            key={annotation.id}
                            className="flex items-center justify-between p-2 bg-background rounded border border-border"
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: annotation.userColor }}
                                />
                                <span className="text-sm text-text">{annotation.userName}</span>
                                <span className="text-xs text-muted capitalize">{annotation.type}</span>
                                {annotation.type === 'note' && (
                                    <span className="text-xs text-muted">"{annotation.data.text}"</span>
                                )}
                            </div>
                            <button
                                onClick={() => deleteAnnotation(annotation.id)}
                                className="p-1 text-red-500 hover:text-red-600"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
