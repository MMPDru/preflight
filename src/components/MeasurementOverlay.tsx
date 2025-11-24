import React, { useState, useRef, useEffect } from 'react';

interface MeasurementOverlayProps {
    width: number;
    height: number;
    scale: number;
    active: boolean;
}

export const MeasurementOverlay: React.FC<MeasurementOverlayProps> = ({ width, height, scale, active }) => {
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!active) {
            setStartPoint(null);
            setCurrentPoint(null);
            setIsDrawing(false);
        }
    }, [active]);

    const getCoordinates = (e: React.MouseEvent) => {
        if (!containerRef.current) return { x: 0, y: 0 };
        const rect = containerRef.current.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!active) return;
        const coords = getCoordinates(e);
        setStartPoint(coords);
        setCurrentPoint(coords);
        setIsDrawing(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!active || !isDrawing) return;
        const coords = getCoordinates(e);
        setCurrentPoint(coords);
    };

    const handleMouseUp = () => {
        if (!active) return;
        setIsDrawing(false);
        // We keep the line visible until the next click starts a new one
    };

    const calculateDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        // Distance in screen pixels
        const distPx = Math.sqrt(dx * dx + dy * dy);
        // Convert to PDF points (1/72 inch)
        const distPts = distPx / scale;
        // Convert to inches
        const distIn = distPts / 72;

        return {
            pts: Math.round(distPts * 10) / 10,
            in: Math.round(distIn * 100) / 100
        };
    };

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-50 cursor-crosshair"
            style={{ width, height, pointerEvents: active ? 'auto' : 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {startPoint && currentPoint && (
                <svg width="100%" height="100%" className="absolute top-0 left-0 pointer-events-none">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                        </marker>
                    </defs>

                    {/* Measurement Line */}
                    <line
                        x1={startPoint.x}
                        y1={startPoint.y}
                        x2={currentPoint.x}
                        y2={currentPoint.y}
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        markerEnd="url(#arrowhead)"
                        markerStart="url(#arrowhead)"
                    />

                    {/* Distance Label */}
                    <g transform={`translate(${(startPoint.x + currentPoint.x) / 2}, ${(startPoint.y + currentPoint.y) / 2})`}>
                        <rect x="-40" y="-15" width="80" height="30" rx="4" fill="rgba(0,0,0,0.7)" />
                        <text
                            x="0"
                            y="5"
                            textAnchor="middle"
                            fill="white"
                            fontSize="12"
                            fontWeight="bold"
                            fontFamily="sans-serif"
                        >
                            {calculateDistance(startPoint, currentPoint).in} in
                        </text>
                    </g>
                </svg>
            )}
        </div>
    );
};
