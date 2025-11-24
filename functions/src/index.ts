import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { initializeWebSocket } from './services/websocket-service';
import { getAIService } from './services/ai-support-route';
import { getDocumentationService } from './services/auto-documentation';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});

const db = admin.firestore();

// Create Express app
const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Authentication middleware
const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Initialize WebSocket
const wsService = initializeWebSocket(httpServer, process.env.REDIS_URL);

// ==================== ROUTES ====================

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        websocket: {
            connections: wsService.getTotalConnections(),
            sessions: wsService.getActiveSessionsCount()
        }
    });
});

// ==================== SUPPORT ROUTING ====================

// Get route recommendation
app.post('/api/v1/support/route', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { issue, urgency, customerHistory } = req.body;

        const aiService = getAIService();
        const recommendation = await aiService.recommendRoute({
            issue,
            urgency,
            customerHistory
        });

        // Log recommendation
        await db.collection('supportRouteRecommendations').add({
            userId: req.user.uid,
            issue,
            urgency,
            recommendation,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json(recommendation);
    } catch (error: any) {
        console.error('Route recommendation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Analyze sentiment
app.post('/api/v1/support/sentiment', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { message } = req.body;

        const aiService = getAIService();
        const sentiment = await aiService.analyzeSentiment(message);

        res.json(sentiment);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Categorize request
app.post('/api/v1/support/categorize', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { issue } = req.body;

        const aiService = getAIService();
        const category = await aiService.categorize(issue);

        res.json(category);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Generate suggestions
app.post('/api/v1/support/suggestions', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { context, messageHistory } = req.body;

        const aiService = getAIService();
        const suggestions = await aiService.generateSuggestions(context, messageHistory);

        res.json({ suggestions });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ANNOTATIONS ====================

// Get annotations for session
app.get('/api/v1/annotations/:sessionId', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;

        const snapshot = await db.collection('annotations')
            .where('sessionId', '==', sessionId)
            .orderBy('timestamp', 'asc')
            .get();

        const annotations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ annotations });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Save annotation
app.post('/api/v1/annotations', authenticateUser, async (req: Request, res: Response) => {
    try {
        const annotation = {
            ...req.body,
            userId: req.user.uid,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('annotations').add(annotation);

        res.json({ id: docRef.id, ...annotation });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete annotation
app.delete('/api/v1/annotations/:id', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await db.collection('annotations').doc(id).delete();

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ANALYTICS ====================

// Get session analytics
app.get('/api/v1/analytics/sessions', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, channel } = req.query;

        let query = db.collection('supportSessions').orderBy('startTime', 'desc');

        if (startDate) {
            query = query.where('startTime', '>=', new Date(startDate as string));
        }
        if (endDate) {
            query = query.where('startTime', '<=', new Date(endDate as string));
        }
        if (channel) {
            query = query.where('type', '==', channel);
        }

        const snapshot = await query.limit(100).get();
        const sessions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Calculate metrics
        const metrics = {
            totalSessions: sessions.length,
            avgDuration: sessions.reduce((sum, s: any) => sum + (s.duration || 0), 0) / sessions.length,
            resolutionRate: sessions.filter((s: any) => s.resolution === 'resolved').length / sessions.length,
            avgSatisfaction: sessions.reduce((sum, s: any) => sum + (s.satisfaction || 0), 0) / sessions.length,
            channelBreakdown: {} as any
        };

        // Channel breakdown
        sessions.forEach((s: any) => {
            if (!metrics.channelBreakdown[s.type]) {
                metrics.channelBreakdown[s.type] = { count: 0, avgDuration: 0, resolution: 0 };
            }
            metrics.channelBreakdown[s.type].count++;
            metrics.channelBreakdown[s.type].avgDuration += s.duration || 0;
        });

        res.json({ sessions, metrics });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== TRAINING ====================

// Get training modules
app.get('/api/v1/training/modules', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { category } = req.query;

        let query = db.collection('trainingModules').where('status', '==', 'published');

        if (category) {
            query = query.where('category', '==', category);
        }

        const snapshot = await query.get();
        const modules = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ modules });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get user progress
app.get('/api/v1/training/progress/:userId', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Verify user can access this data
        if (userId !== req.user.uid && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const snapshot = await db.collection('userProgress')
            .where('userId', '==', userId)
            .get();

        const progress = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ progress });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update user progress
app.post('/api/v1/training/progress', authenticateUser, async (req: Request, res: Response) => {
    try {
        const progress = {
            ...req.body,
            userId: req.user.uid,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('userProgress').add(progress);

        res.json({ id: docRef.id, ...progress });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== DOCUMENTATION ====================

// Generate documentation for commit
app.post('/api/v1/documentation/generate', authenticateUser, async (req: Request, res: Response) => {
    try {
        // Admin only
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { commitHash } = req.body;

        const docService = getDocumentationService();
        const changes = await docService.detectChanges(commitHash);
        const documentation = await docService.generateDocumentation(changes);

        // Save to database
        await db.collection('documentation').add({
            ...documentation,
            commitHash: changes.commitHash,
            autoGenerated: true,
            reviewed: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ documentation, changes });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get documentation
app.get('/api/v1/documentation', authenticateUser, async (req: Request, res: Response) => {
    try {
        const { type, version } = req.query;

        let query = db.collection('documentation').orderBy('createdAt', 'desc');

        if (type) {
            query = query.where('type', '==', type);
        }
        if (version) {
            query = query.where('releaseNotes.version', '==', version);
        }

        const snapshot = await query.limit(50).get();
        const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ documentation: docs });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

httpServer.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 PreFlight Pro Backend Server                         ║
║                                                            ║
║   Server:     http://localhost:${PORT}                        ║
║   WebSocket:  ws://localhost:${PORT}                          ║
║   Status:     ✅ Running                                   ║
║                                                            ║
║   Services:                                                ║
║   - API Gateway         ✅                                 ║
║   - WebSocket Server    ✅                                 ║
║   - AI Services         ✅                                 ║
║   - Auto-Documentation  ✅                                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

export default app;
