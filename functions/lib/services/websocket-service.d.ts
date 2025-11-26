import { Server as HTTPServer } from 'http';
export declare class WebSocketService {
    private io;
    private sessions;
    private cursors;
    private typing;
    constructor(httpServer: HTTPServer, redisUrl?: string);
    /**
     * Set up Redis adapter for multi-server support
     */
    private setupRedisAdapter;
    /**
     * Set up all event handlers
     */
    private setupEventHandlers;
    /**
     * Handle authentication
     */
    private handleAuthentication;
    /**
     * Handle session events
     */
    private handleSessionEvents;
    /**
     * Handle annotation events
     */
    private handleAnnotationEvents;
    /**
     * Handle cursor events
     */
    private handleCursorEvents;
    /**
     * Handle typing indicators
     */
    private handleTypingEvents;
    /**
     * Handle chat events
     */
    private handleChatEvents;
    /**
     * Handle disconnection
     */
    private handleDisconnect;
    /**
     * Leave session helper
     */
    private leaveSession;
    /**
     * Get session participants
     */
    private getSessionParticipants;
    /**
     * Broadcast to session
     */
    broadcastToSession(sessionId: string, event: string, data: any): void;
    /**
     * Get active sessions count
     */
    getActiveSessionsCount(): number;
    /**
     * Get total connections count
     */
    getTotalConnections(): number;
}
export declare function initializeWebSocket(httpServer: HTTPServer, redisUrl?: string): WebSocketService;
export declare function getWebSocketService(): WebSocketService;
//# sourceMappingURL=websocket-service.d.ts.map