import React, { useRef, useEffect, useState } from 'react';
import { type AnnotationTool } from './AnnotationToolbar';

export interface DrawingAnnotation {
    id: string;
    type: 'rect' | 'circle' | 'highlight' | 'pen';
    page: number;
    points?: { x: number, y: number }[]; // For pen
    rect?: { x: number, y: number, w: number, h: number }; // For shapes
    color: string;
    strokeWidth: number;
    opacity?: number;
}

interface CanvasOverlayProps {
    width: number;
    height: number;
    scale: number;
    page: number;
    tool: AnnotationTool;
    annotations: DrawingAnnotation[];
    onAddAnnotation: (annotation: DrawingAnnotation) => void;
}

export const CanvasOverlay: React.FC<CanvasOverlayProps> = ({
    width,
    height,
    scale,
    page,
    tool,
    annotations,
    onAddAnnotation
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
    const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

    // Render existing annotations
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.scale(scale, scale);

        annotations.forEach(ann => {
            if (ann.page !== page) return;

            ctx.strokeStyle = ann.color;
            ctx.lineWidth = ann.strokeWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            if (ann.opacity) ctx.globalAlpha = ann.opacity;

            if (ann.type === 'rect' && ann.rect) {
                ctx.strokeRect(ann.rect.x, ann.rect.y, ann.rect.w, ann.rect.h);
            } else if (ann.type === 'circle' && ann.rect) {
                ctx.beginPath();
                const rx = ann.rect.w / 2;
                const ry = ann.rect.h / 2;
                const cx = ann.rect.x + rx;
                const cy = ann.rect.y + ry;
                ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (ann.type === 'highlight' && ann.rect) {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = ann.color;
                ctx.fillRect(ann.rect.x, ann.rect.y, ann.rect.w, ann.rect.h);
                ctx.globalAlpha = 1.0;
            } else if (ann.type === 'pen' && ann.points) {
                if (ann.points.length < 2) return;
                ctx.beginPath();
                ctx.moveTo(ann.points[0].x, ann.points[0].y);
                for (let i = 1; i < ann.points.length; i++) {
                    ctx.lineTo(ann.points[i].x, ann.points[i].y);
                }
                ctx.stroke();
            }
            ctx.globalAlpha = 1.0;
        });

        // Draw current shape being drawn
        if (isDrawing && startPos && currentPos) {
            const sx = startPos.x / scale;
            const sy = startPos.y / scale;
            const cx = currentPos.x / scale;
            const cy = currentPos.y / scale;
            const w = cx - sx;
            const h = cy - sy;

            ctx.strokeStyle = '#ef4444'; // Default red for drawing
            ctx.lineWidth = 2;

            if (tool === 'rect') {
                ctx.strokeRect(sx, sy, w, h);
            } else if (tool === 'circle') {
                ctx.beginPath();
                const rx = w / 2;
                const ry = h / 2;
                ctx.ellipse(sx + rx, sy + ry, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (tool === 'highlight') {
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#facc15';
                ctx.fillRect(sx, sy, w, h);
                ctx.globalAlpha = 1.0;
            } else if (tool === 'pen') {
                ctx.beginPath();
                if (currentPath.length > 0) {
                    ctx.moveTo(currentPath[0].x, currentPath[0].y);
                    for (let i = 1; i < currentPath.length; i++) {
                        ctx.lineTo(currentPath[i].x, currentPath[i].y);
                    }
                }
                ctx.stroke();
            }
        }

        ctx.restore();
    }, [width, height, scale, page, annotations, isDrawing, startPos, currentPos, currentPath, tool]);

    const getCoords = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (tool === 'select') return;
        e.preventDefault(); // Prevent text selection
        setIsDrawing(true);
        const coords = getCoords(e);
        setStartPos(coords);
        setCurrentPos(coords);
        if (tool === 'pen') {
            setCurrentPath([{ x: coords.x / scale, y: coords.y / scale }]);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const coords = getCoords(e);
        setCurrentPos(coords);
        if (tool === 'pen') {
            setCurrentPath(prev => [...prev, { x: coords.x / scale, y: coords.y / scale }]);
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing || !startPos || !currentPos) return;
        setIsDrawing(false);

        const sx = startPos.x / scale;
        const sy = startPos.y / scale;
        const cx = currentPos.x / scale;
        const cy = currentPos.y / scale;
        const w = cx - sx;
        const h = cy - sy;

        // Don't add if too small
        if (tool !== 'pen' && Math.abs(w) < 2 && Math.abs(h) < 2) return;

        const newAnnotation: DrawingAnnotation = {
            id: Date.now().toString(),
            type: tool as any,
            page,
            color: tool === 'highlight' ? '#facc15' : '#ef4444',
            strokeWidth: 2,
            opacity: tool === 'highlight' ? 0.3 : 1.0,
        };

        if (tool === 'pen') {
            newAnnotation.points = currentPath;
        } else {
            newAnnotation.rect = { x: sx, y: sy, w, h };
        }

        onAddAnnotation(newAnnotation);
        setStartPos(null);
        setCurrentPos(null);
        setCurrentPath([]);
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={tool === 'select' ? 'pointer-events-none' : 'cursor-crosshair'}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${width}px`,
                height: `${height}px`,
                zIndex: 10 // Above PDF, below text layer if any
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        />
    );
};
