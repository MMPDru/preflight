import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Server as HTTPServer } from 'http';

// Types
interface Annotation {
    id: string;
    sessionId: string;
    userId: string;
    userName: string;
    userColor: string;
    type: string;
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

interface TypingIndicator {
    userId: string;
    userName: string;
    threadId: string;
}

interface SessionParticipant {
    userId: string;
    userName: string;
    role: 'host' | 'participant' | 'guest';
    joinedAt: Date;
}

export class WebSocketService {
    private io: SocketIOServer;
    private sessions: Map<string, Set<string>> = new Map(); // sessionId -> Set of socketIds
    private cursors: Map<string, Map<string, Cursor>> = new Map(); // sessionId -> userId -> Cursor
    private typing: Map<string, Set<string>> = new Map(); // threadId -> Set of userIds

    constructor(httpServer: HTTPServer, redisUrl?: string) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:5173',
                methods: ['GET', 'POST'],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        // Set up Redis adapter for horizontal scaling
        if (redisUrl) {
            this.setupRedisAdapter(redisUrl);
        }

        this.setupEventHandlers();
    }

    /**
     * Set up Redis adapter for multi-server support
     */
    private async setupRedisAdapter(redisUrl: string) {
        const pubClient = createClient({ url: redisUrl });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        this.io.adapter(createAdapter(pubClient, subClient));
        console.log('✅ Redis adapter configured for WebSocket scaling');
    }

    /**
     * Set up all event handlers
     */
    private setupEventHandlers() {
        this.io.on('connection', (socket: Socket) => {
            console.log(`✅ Client connected: ${socket.id}`);

            // Authentication
            this.handleAuthentication(socket);

            // Session management
            this.handleSessionEvents(socket);

            // Annotation events
            this.handleAnnotationEvents(socket);

            // Cursor events
            this.handleCursorEvents(socket);

            // Typing indicators
            this.handleTypingEvents(socket);

            // Chat events
            this.handleChatEvents(socket);

            // Disconnection
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    /**
     * Handle authentication
     */
    private handleAuthentication(socket: Socket) {
        socket.on('auth', async (data: { token: string; userId: string; userName: string }) => {
            try {
                // Verify Firebase token (implement your auth logic)
                // const decodedToken = await admin.auth().verifyIdToken(data.token);

                // Store user info
                socket.data.userId = data.userId;
                socket.data.userName = data.userName;

                socket.emit('auth:success', { userId: data.userId });
                console.log(`✅ User authenticated: ${data.userName}`);
            } catch (error) {
                socket.emit('auth:error', { message: 'Authentication failed' });
                socket.disconnect();
            }
        });
    }

    /**
     * Handle session events
     */
    private handleSessionEvents(socket: Socket) {
        // Join session
        socket.on('session:join', (data: { sessionId: string; role: string }) => {
            const { sessionId, role } = data;

            // Join socket room
            socket.join(sessionId);

            // Track session participants
            if (!this.sessions.has(sessionId)) {
                this.sessions.set(sessionId, new Set());
            }
            this.sessions.get(sessionId)!.add(socket.id);

            // Store session info
            socket.data.sessionId = sessionId;
            socket.data.role = role;

            // Notify others
            socket.to(sessionId).emit('user:joined', {
                userId: socket.data.userId,
                userName: socket.data.userName,
                role,
                timestamp: new Date()
            });

            // Send current participants to new user
            const participants = this.getSessionParticipants(sessionId);
            socket.emit('session:participants', participants);

            console.log(`✅ User ${socket.data.userName} joined session ${sessionId}`);
        });

        // Leave session
        socket.on('session:leave', (data: { sessionId: string }) => {
            this.leaveSession(socket, data.sessionId);
        });

        // Request control
        socket.on('session:request-control', (data: { sessionId: string }) => {
            socket.to(data.sessionId).emit('control:requested', {
                userId: socket.data.userId,
                userName: socket.data.userName
            });
        });

        // Grant control
        socket.on('session:grant-control', (data: { sessionId: string; userId: string }) => {
            this.io.to(data.sessionId).emit('control:granted', {
                userId: data.userId,
                grantedBy: socket.data.userId
            });
        });
    }

    /**
     * Handle annotation events
     */
    private handleAnnotationEvents(socket: Socket) {
        // Add annotation
        socket.on('annotation:add', (annotation: Annotation) => {
            const sessionId = socket.data.sessionId;
            if (!sessionId) return;

            // Broadcast to all in session except sender
            socket.to(sessionId).emit('annotation:added', annotation);

            console.log(`📝 Annotation added in session ${sessionId}`);
        });

        // Delete annotation
        socket.on('annotation:delete', (data: { annotationId: string }) => {
            const sessionId = socket.data.sessionId;
            if (!sessionId) return;

            socket.to(sessionId).emit('annotation:deleted', {
                annotationId: data.annotationId,
                deletedBy: socket.data.userId
            });
        });

        // Update annotation
        socket.on('annotation:update', (annotation: Annotation) => {
            const sessionId = socket.data.sessionId;
            if (!sessionId) return;

            socket.to(sessionId).emit('annotation:updated', annotation);
        });

        // Clear all annotations
        socket.on('annotation:clear', () => {
            const sessionId = socket.data.sessionId;
            if (!sessionId) return;

            socket.to(sessionId).emit('annotation:cleared', {
                clearedBy: socket.data.userId
            });
        });
    }

    /**
     * Handle cursor events
     */
    private handleCursorEvents(socket: Socket) {
        socket.on('cursor:move', (data: { x: number; y: number }) => {
            const sessionId = socket.data.sessionId;
            if (!sessionId) return;

            const cursor: Cursor = {
                userId: socket.data.userId,
                userName: socket.data.userName,
                x: data.x,
                y: data.y,
                color: socket.data.userColor || '#3B82F6'
            };

            // Update cursor position
            if (!this.cursors.has(sessionId)) {
                this.cursors.set(sessionId, new Map());
            }
            this.cursors.get(sessionId)!.set(socket.data.userId, cursor);

            // Broadcast to others
            socket.to(sessionId).emit('cursor:moved', cursor);
        });
    }

    /**
     * Handle typing indicators
     */
    private handleTypingEvents(socket: Socket) {
        socket.on('typing:start', (data: { threadId: string }) => {
            const { threadId } = data;

            if (!this.typing.has(threadId)) {
                this.typing.set(threadId, new Set());
            }
            this.typing.get(threadId)!.add(socket.data.userId);

            socket.to(threadId).emit('user:typing', {
                userId: socket.data.userId,
                userName: socket.data.userName,
                threadId
            });
        });

        socket.on('typing:stop', (data: { threadId: string }) => {
            const { threadId } = data;

            this.typing.get(threadId)?.delete(socket.data.userId);

            socket.to(threadId).emit('user:stopped-typing', {
                userId: socket.data.userId,
                threadId
            });
        });
    }

    /**
     * Handle chat events
     */
    private handleChatEvents(socket: Socket) {
        // Join chat thread
        socket.on('chat:join', (data: { threadId: string }) => {
            socket.join(data.threadId);
        });

        // Leave chat thread
        socket.on('chat:leave', (data: { threadId: string }) => {
            socket.leave(data.threadId);
            this.typing.get(data.threadId)?.delete(socket.data.userId);
        });

        // New message
        socket.on('chat:message', (data: { threadId: string; message: any }) => {
            socket.to(data.threadId).emit('chat:new-message', {
                ...data.message,
                userId: socket.data.userId,
                userName: socket.data.userName
            });
        });

        // Message read
        socket.on('chat:read', (data: { threadId: string; messageId: string }) => {
            socket.to(data.threadId).emit('chat:message-read', {
                messageId: data.messageId,
                userId: socket.data.userId
            });
        });

        // Reaction added
        socket.on('chat:reaction', (data: { threadId: string; messageId: string; emoji: string }) => {
            socket.to(data.threadId).emit('chat:reaction-added', {
                messageId: data.messageId,
                emoji: data.emoji,
                userId: socket.data.userId
            });
        });
    }

    /**
     * Handle disconnection
     */
    private handleDisconnect(socket: Socket) {
        const sessionId = socket.data.sessionId;
        const userId = socket.data.userId;

        if (sessionId) {
            // Remove from session
            this.sessions.get(sessionId)?.delete(socket.id);

            // Remove cursor
            this.cursors.get(sessionId)?.delete(userId);

            // Notify others
            socket.to(sessionId).emit('user:left', {
                userId,
                userName: socket.data.userName,
                timestamp: new Date()
            });
        }

        // Remove from typing indicators
        this.typing.forEach((users, threadId) => {
            if (users.has(userId)) {
                users.delete(userId);
                this.io.to(threadId).emit('user:stopped-typing', { userId, threadId });
            }
        });

        console.log(`❌ Client disconnected: ${socket.id}`);
    }

    /**
     * Leave session helper
     */
    private leaveSession(socket: Socket, sessionId: string) {
        socket.leave(sessionId);
        this.sessions.get(sessionId)?.delete(socket.id);
        this.cursors.get(sessionId)?.delete(socket.data.userId);

        socket.to(sessionId).emit('user:left', {
            userId: socket.data.userId,
            userName: socket.data.userName,
            timestamp: new Date()
        });
    }

    /**
     * Get session participants
     */
    private getSessionParticipants(sessionId: string): SessionParticipant[] {
        const socketIds = this.sessions.get(sessionId);
        if (!socketIds) return [];

        const participants: SessionParticipant[] = [];
        socketIds.forEach(socketId => {
            const socket = this.io.sockets.sockets.get(socketId);
            if (socket) {
                participants.push({
                    userId: socket.data.userId,
                    userName: socket.data.userName,
                    role: socket.data.role,
                    joinedAt: new Date()
                });
            }
        });

        return participants;
    }

    /**
     * Broadcast to session
     */
    public broadcastToSession(sessionId: string, event: string, data: any) {
        this.io.to(sessionId).emit(event, data);
    }

    /**
     * Get active sessions count
     */
    public getActiveSessionsCount(): number {
        return this.sessions.size;
    }

    /**
     * Get total connections count
     */
    public getTotalConnections(): number {
        return this.io.sockets.sockets.size;
    }
}

// Export singleton
let wsService: WebSocketService | null = null;

export function initializeWebSocket(httpServer: HTTPServer, redisUrl?: string): WebSocketService {
    if (!wsService) {
        wsService = new WebSocketService(httpServer, redisUrl);
        console.log('✅ WebSocket service initialized');
    }
    return wsService;
}

export function getWebSocketService(): WebSocketService {
    if (!wsService) {
        throw new Error('WebSocket service not initialized');
    }
    return wsService;
}
