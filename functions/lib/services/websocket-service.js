"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
exports.initializeWebSocket = initializeWebSocket;
exports.getWebSocketService = getWebSocketService;
const socket_io_1 = require("socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const redis_1 = require("redis");
class WebSocketService {
    constructor(httpServer, redisUrl) {
        this.sessions = new Map(); // sessionId -> Set of socketIds
        this.cursors = new Map(); // sessionId -> userId -> Cursor
        this.typing = new Map(); // threadId -> Set of userIds
        this.io = new socket_io_1.Server(httpServer, {
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
    async setupRedisAdapter(redisUrl) {
        const pubClient = (0, redis_1.createClient)({ url: redisUrl });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        this.io.adapter((0, redis_adapter_1.createAdapter)(pubClient, subClient));
        console.log('✅ Redis adapter configured for WebSocket scaling');
    }
    /**
     * Set up all event handlers
     */
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
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
    handleAuthentication(socket) {
        socket.on('auth', async (data) => {
            try {
                // Verify Firebase token (implement your auth logic)
                // const decodedToken = await admin.auth().verifyIdToken(data.token);
                // Store user info
                socket.data.userId = data.userId;
                socket.data.userName = data.userName;
                socket.emit('auth:success', { userId: data.userId });
                console.log(`✅ User authenticated: ${data.userName}`);
            }
            catch (error) {
                socket.emit('auth:error', { message: 'Authentication failed' });
                socket.disconnect();
            }
        });
    }
    /**
     * Handle session events
     */
    handleSessionEvents(socket) {
        // Join session
        socket.on('session:join', (data) => {
            const { sessionId, role } = data;
            // Join socket room
            socket.join(sessionId);
            // Track session participants
            if (!this.sessions.has(sessionId)) {
                this.sessions.set(sessionId, new Set());
            }
            this.sessions.get(sessionId).add(socket.id);
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
        socket.on('session:leave', (data) => {
            this.leaveSession(socket, data.sessionId);
        });
        // Request control
        socket.on('session:request-control', (data) => {
            socket.to(data.sessionId).emit('control:requested', {
                userId: socket.data.userId,
                userName: socket.data.userName
            });
        });
        // Grant control
        socket.on('session:grant-control', (data) => {
            this.io.to(data.sessionId).emit('control:granted', {
                userId: data.userId,
                grantedBy: socket.data.userId
            });
        });
    }
    /**
     * Handle annotation events
     */
    handleAnnotationEvents(socket) {
        // Add annotation
        socket.on('annotation:add', (annotation) => {
            const sessionId = socket.data.sessionId;
            if (!sessionId)
                return;
            // Broadcast to all in session except sender
            socket.to(sessionId).emit('annotation:added', annotation);
            console.log(`📝 Annotation added in session ${sessionId}`);
        });
        // Delete annotation
        socket.on('annotation:delete', (data) => {
            const sessionId = socket.data.sessionId;
            if (!sessionId)
                return;
            socket.to(sessionId).emit('annotation:deleted', {
                annotationId: data.annotationId,
                deletedBy: socket.data.userId
            });
        });
        // Update annotation
        socket.on('annotation:update', (annotation) => {
            const sessionId = socket.data.sessionId;
            if (!sessionId)
                return;
            socket.to(sessionId).emit('annotation:updated', annotation);
        });
        // Clear all annotations
        socket.on('annotation:clear', () => {
            const sessionId = socket.data.sessionId;
            if (!sessionId)
                return;
            socket.to(sessionId).emit('annotation:cleared', {
                clearedBy: socket.data.userId
            });
        });
    }
    /**
     * Handle cursor events
     */
    handleCursorEvents(socket) {
        socket.on('cursor:move', (data) => {
            const sessionId = socket.data.sessionId;
            if (!sessionId)
                return;
            const cursor = {
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
            this.cursors.get(sessionId).set(socket.data.userId, cursor);
            // Broadcast to others
            socket.to(sessionId).emit('cursor:moved', cursor);
        });
    }
    /**
     * Handle typing indicators
     */
    handleTypingEvents(socket) {
        socket.on('typing:start', (data) => {
            const { threadId } = data;
            if (!this.typing.has(threadId)) {
                this.typing.set(threadId, new Set());
            }
            this.typing.get(threadId).add(socket.data.userId);
            socket.to(threadId).emit('user:typing', {
                userId: socket.data.userId,
                userName: socket.data.userName,
                threadId
            });
        });
        socket.on('typing:stop', (data) => {
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
    handleChatEvents(socket) {
        // Join chat thread
        socket.on('chat:join', (data) => {
            socket.join(data.threadId);
        });
        // Leave chat thread
        socket.on('chat:leave', (data) => {
            socket.leave(data.threadId);
            this.typing.get(data.threadId)?.delete(socket.data.userId);
        });
        // New message
        socket.on('chat:message', (data) => {
            socket.to(data.threadId).emit('chat:new-message', {
                ...data.message,
                userId: socket.data.userId,
                userName: socket.data.userName
            });
        });
        // Message read
        socket.on('chat:read', (data) => {
            socket.to(data.threadId).emit('chat:message-read', {
                messageId: data.messageId,
                userId: socket.data.userId
            });
        });
        // Reaction added
        socket.on('chat:reaction', (data) => {
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
    handleDisconnect(socket) {
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
    leaveSession(socket, sessionId) {
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
    getSessionParticipants(sessionId) {
        const socketIds = this.sessions.get(sessionId);
        if (!socketIds)
            return [];
        const participants = [];
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
    broadcastToSession(sessionId, event, data) {
        this.io.to(sessionId).emit(event, data);
    }
    /**
     * Get active sessions count
     */
    getActiveSessionsCount() {
        return this.sessions.size;
    }
    /**
     * Get total connections count
     */
    getTotalConnections() {
        return this.io.sockets.sockets.size;
    }
}
exports.WebSocketService = WebSocketService;
// Export singleton
let wsService = null;
function initializeWebSocket(httpServer, redisUrl) {
    if (!wsService) {
        wsService = new WebSocketService(httpServer, redisUrl);
        console.log('✅ WebSocket service initialized');
    }
    return wsService;
}
function getWebSocketService() {
    if (!wsService) {
        throw new Error('WebSocket service not initialized');
    }
    return wsService;
}
//# sourceMappingURL=websocket-service.js.map