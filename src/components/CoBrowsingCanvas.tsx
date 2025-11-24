import React, { useRef, useEffect, useState } from 'react';

interface Point {
    x: number;
    y: number;
}

interface Annotation {
    id: string;
    type: 'pen' | 'highlight' | 'laser';
    points: Point[];
    color: string;
    width: number;
    userId: string;
}

interface CoBrowsingCanvasProps {
    isActive: boolean;
    tool: 'cursor' | 'laser' | 'pen' | 'highlight' | 'measure';
    color: string;
    onAnnotationAdd?: (annotation: Annotation) => void;
}

export const CoBrowsingCanvas: React.FC<CoBrowsingCanvasProps> = ({
    isActive,
    tool,
    color,
    onAnnotationAdd
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState<Point[]>([]);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [laserPosition, setLaserPosition] = useState<Point | null>(null);

    // Clear laser after inactivity
    useEffect(() => {
        if (tool !== 'laser' || !laserPosition) return;
        const timer = setTimeout(() => setLaserPosition(null), 2000);
        return () => clearTimeout(timer);
    }, [laserPosition, tool]);

    // Draw function
    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw existing annotations
        annotations.forEach(ann => {
            if (ann.points.length < 2) return;

            ctx.beginPath();
            ctx.moveTo(ann.points[0].x, ann.points[0].y);
            ann.points.forEach((p, i) => {
                if (i > 0) ctx.lineTo(p.x, p.y);
            });

            ctx.strokeStyle = ann.color;
            ctx.lineWidth = ann.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (ann.type === 'highlight') {
                ctx.globalAlpha = 0.3;
            } else {
                ctx.globalAlpha = 1.0;
            }

            ctx.stroke();
            ctx.globalAlpha = 1.0;
        });

        // Draw current path
        if (currentPath.length > 1) {
            ctx.beginPath();
            ctx.moveTo(currentPath[0].x, currentPath[0].y);
            currentPath.forEach((p, i) => {
                if (i > 0) ctx.lineTo(p.x, p.y);
            });

            ctx.strokeStyle = color;
            ctx.lineWidth = tool === 'highlight' ? 20 : 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (tool === 'highlight') {
                ctx.globalAlpha = 0.3;
            }

            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }

        // Draw laser
        if (laserPosition && tool === 'laser') {
            ctx.beginPath();
            ctx.arc(laserPosition.x, laserPosition.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'red';
            ctx.fill();

            // Laser trail effect
            ctx.beginPath();
            ctx.arc(laserPosition.x, laserPosition.y, 15, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fill();
        }
    };

    useEffect(() => {
        draw();
    }, [annotations, currentPath, laserPosition, tool]);

    // Resize handler
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = canvasRef.current.offsetWidth;
                canvasRef.current.height = canvasRef.current.offsetHeight;
                draw();
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getPoint = (e: React.MouseEvent | React.TouchEvent): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isActive || tool === 'cursor') return;
        e.preventDefault();
        setIsDrawing(true);
        const point = getPoint(e);

        if (tool === 'laser') {
            setLaserPosition(point);
        } else {
            setCurrentPath([point]);
        }
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isActive || tool === 'cursor') return;
        e.preventDefault();
        const point = getPoint(e);

        if (tool === 'laser') {
            setLaserPosition(point);
        } else if (isDrawing) {
            setCurrentPath(prev => [...prev, point]);
        }
    };

    const handleEnd = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        if (tool !== 'laser' && currentPath.length > 0) {
            const newAnnotation: Annotation = {
                id: Date.now().toString(),
                type: tool as 'pen' | 'highlight',
                points: currentPath,
                color: color,
                width: tool === 'highlight' ? 20 : 3,
                userId: 'local'
            };
            setAnnotations(prev => [...prev, newAnnotation]);
            onAnnotationAdd?.(newAnnotation);
            setCurrentPath([]);
        }
    };

    if (!isActive) return null;

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-40 cursor-crosshair touch-none"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
        />
    );
};
