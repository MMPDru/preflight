import React, { useEffect, useState } from 'react';
import { MousePointer2 } from 'lucide-react';

interface CursorPosition {
    x: number;
    y: number;
    userName: string;
    color: string;
}

interface CollaborativeCursorProps {
    isActive: boolean;
    userName: string;
}

export const CollaborativeCursor: React.FC<CollaborativeCursorProps> = ({ isActive, userName }) => {
    const [remoteCursors, setRemoteCursors] = useState<CursorPosition[]>([]);

    useEffect(() => {
        if (!isActive) return;

        // Simulate remote cursor movement
        const interval = setInterval(() => {
            const time = Date.now() / 1000;

            // Simulate "Support Agent" moving cursor in a figure-8 pattern
            const x = 50 + Math.cos(time) * 30;
            const y = 50 + Math.sin(time * 2) * 20;

            setRemoteCursors([
                {
                    x,
                    y,
                    userName: 'Support Agent',
                    color: '#F68321' // Secondary Orange
                }
            ]);
        }, 50);

        return () => clearInterval(interval);
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {remoteCursors.map((cursor, i) => (
                <div
                    key={i}
                    className="absolute transition-all duration-100 ease-linear flex flex-col items-start"
                    style={{
                        left: `${cursor.x}%`,
                        top: `${cursor.y}%`,
                    }}
                >
                    <MousePointer2
                        size={24}
                        className="text-secondary fill-secondary/20 transform -rotate-12"
                        style={{ color: cursor.color }}
                    />
                    <div
                        className="px-2 py-1 rounded text-xs font-bold text-white whitespace-nowrap ml-4 mt-1 shadow-sm"
                        style={{ backgroundColor: cursor.color }}
                    >
                        {cursor.userName}
                    </div>
                </div>
            ))}
        </div>
    );
};
