"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledDocReview = exports.onDeploymentWebhook = exports.startVideoGeneratorBuild = exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const service_instances_1 = require("./services/service-instances");
const queue_worker_1 = require("./workers/queue-worker");
const busboy_1 = __importDefault(require("busboy"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://preflight-pro.vercel.app',
    'https://pre-press-app.vercel.app'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express_1.default.json({ limit: '50mb' })); // Increase limit for PDFs
// ==================== ADMIN UTILS ====================
app.post('/api/v1/admin/configure-cors', async (req, res) => {
    try {
        const bucket = admin.storage().bucket();
        await bucket.setCorsConfiguration([
            {
                origin: ["https://pre-press-app.vercel.app", "http://localhost:5173", "http://localhost:4173"],
                method: ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
                responseHeader: ["Content-Type", "Access-Control-Allow-Origin"],
                maxAgeSeconds: 3600
            }
        ]);
        console.log('CORS configuration updated for bucket:', bucket.name);
        res.json({ success: true, message: 'CORS configured successfully', bucket: bucket.name });
    }
    catch (error) {
        console.error('Error configuring CORS:', error);
        res.status(500).json({ error: error.message });
    }
});
// ==================== PDF ANALYSIS ROUTE ====================
app.post('/api/v1/analyze-pdf', async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }
    const busboyInstance = (0, busboy_1.default)({ headers: req.headers });
    const tmpdir = os.tmpdir();
    const uploads = {};
    const fileWrites = [];
    busboyInstance.on('file', (fieldname, file, info) => {
        const filepath = path.join(tmpdir, info.filename);
        uploads[fieldname] = filepath;
        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);
        const promise = new Promise((resolve, reject) => {
            file.on('end', () => {
                writeStream.end();
            });
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        fileWrites.push(promise);
    });
    busboyInstance.on('finish', async () => {
        await Promise.all(fileWrites);
        try {
            const filePath = uploads['file'];
            if (!filePath) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            const fileBuffer = fs.readFileSync(filePath);
            // Use lazy-loaded analyzer
            const analysis = await (0, service_instances_1.getPdfAnalyzer)().analyzeDocument(fileBuffer);
            // Cleanup
            fs.unlinkSync(filePath);
            res.json({ success: true, analysis });
        }
        catch (error) {
            console.error('PDF Analysis Error:', error);
            res.status(500).json({ error: error.message });
        }
    });
    if (req.rawBody) {
        busboyInstance.end(req.rawBody);
    }
    else {
        req.pipe(busboyInstance);
    }
});
// ==================== PDF FIXING ROUTE (ENHANCED) ====================
app.post('/api/v1/fix-pdf', async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }
    const busboyInstance = (0, busboy_1.default)({ headers: req.headers });
    const tmpdir = os.tmpdir();
    const uploads = {};
    const fileWrites = [];
    let fixTypes = [];
    let options = {};
    busboyInstance.on('field', (fieldname, val) => {
        if (fieldname === 'fixTypes') {
            try {
                fixTypes = JSON.parse(val);
            }
            catch (e) {
                fixTypes = [val];
            }
        }
        else if (fieldname === 'options') {
            try {
                options = JSON.parse(val);
            }
            catch (e) {
                options = {};
            }
        }
    });
    busboyInstance.on('file', (fieldname, file, info) => {
        const filepath = path.join(tmpdir, info.filename);
        uploads[fieldname] = filepath;
        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);
        const promise = new Promise((resolve, reject) => {
            file.on('end', () => {
                writeStream.end();
            });
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        fileWrites.push(promise);
    });
    busboyInstance.on('finish', async () => {
        await Promise.all(fileWrites);
        try {
            const filePath = uploads['file'];
            if (!filePath) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            const fileBuffer = fs.readFileSync(filePath);
            // Process PDF with fixes and get analysis
            const result = await (0, service_instances_1.getPdfFixer)().processPdfWithAnalysis(fileBuffer, fixTypes, options);
            // Upload fixed PDF to Firebase Storage
            const bucket = admin.storage().bucket();
            const filename = `fixed/${Date.now()}_fixed.pdf`;
            const file = bucket.file(filename);
            await file.save(result.buffer, {
                metadata: { contentType: 'application/pdf' }
            });
            await file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
            // Cleanup
            fs.unlinkSync(filePath);
            res.json({
                success: true,
                url: publicUrl,
                analysis: result.analysis,
                fixesApplied: fixTypes,
            });
        }
        catch (error) {
            console.error('PDF Fix Error:', error);
            res.status(500).json({ error: error.message });
        }
    });
    if (req.rawBody) {
        busboyInstance.end(req.rawBody);
    }
    else {
        req.pipe(busboyInstance);
    }
});
// ==================== EXISTING ROUTES (Simplified) ====================
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// ==================== APPROVAL WORKFLOW ROUTES ====================
// Create approval chain
app.post('/api/v1/approvals/create', async (req, res) => {
    try {
        const { jobId, customerId, stages } = req.body;
        if (!jobId || !customerId || !stages) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const chain = await (0, service_instances_1.getApprovalService)().createApprovalChain(jobId, customerId, stages);
        res.json({ success: true, chain });
    }
    catch (error) {
        console.error('Error creating approval chain:', error);
        res.status(500).json({ error: error.message });
    }
});
// Submit approval
app.post('/api/v1/approvals/:id/approve', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, userName, decision, feedback, partialApprovalPages } = req.body;
        if (!userId || !userName || !decision) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const chain = await (0, service_instances_1.getApprovalService)().submitApproval(id, userId, userName, decision, feedback, partialApprovalPages);
        res.json({ success: true, chain });
    }
    catch (error) {
        console.error('Error submitting approval:', error);
        res.status(500).json({ error: error.message });
    }
});
// Reject approval
app.post('/api/v1/approvals/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, userName, feedback } = req.body;
        if (!userId || !userName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const chain = await (0, service_instances_1.getApprovalService)().submitApproval(id, userId, userName, 'rejected', feedback);
        res.json({ success: true, chain });
    }
    catch (error) {
        console.error('Error rejecting approval:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get pending approvals for user
app.get('/api/v1/approvals/pending/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const approvals = await (0, service_instances_1.getApprovalService)().getPendingApprovals(userId);
        res.json({ success: true, approvals });
    }
    catch (error) {
        console.error('Error getting pending approvals:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get approval chain
app.get('/api/v1/approvals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const chain = await (0, service_instances_1.getApprovalService)().getApprovalChain(id);
        if (!chain) {
            return res.status(404).json({ error: 'Approval chain not found' });
        }
        res.json({ success: true, chain });
    }
    catch (error) {
        console.error('Error getting approval chain:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get approval history
app.get('/api/v1/approvals/:id/history', async (req, res) => {
    try {
        const { id } = req.params;
        const chain = await (0, service_instances_1.getApprovalService)().getApprovalChain(id);
        if (!chain) {
            return res.status(404).json({ error: 'Approval chain not found' });
        }
        const history = await (0, service_instances_1.getApprovalService)().getApprovalHistory(chain.jobId);
        res.json({ success: true, history });
    }
    catch (error) {
        console.error('Error getting approval history:', error);
        res.status(500).json({ error: error.message });
    }
});
// ==================== JOB QUEUE ROUTES ====================
// Add job to queue
app.post('/api/v1/queue/add', async (req, res) => {
    try {
        const { type, payload, priority, maxAttempts, dependencies } = req.body;
        if (!type || !payload) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const job = await (0, service_instances_1.getJobQueueService)().addJob(type, payload, {
            priority,
            maxAttempts,
            dependencies,
        });
        res.json({ success: true, job });
    }
    catch (error) {
        console.error('Error adding job to queue:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get job status
app.get('/api/v1/queue/status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const job = await (0, service_instances_1.getJobQueueService)().getJobStatus(id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json({ success: true, job });
    }
    catch (error) {
        console.error('Error getting job status:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get job progress
app.get('/api/v1/queue/progress/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const progress = await (0, service_instances_1.getJobQueueService)().getJobProgress(id);
        if (!progress) {
            return res.status(404).json({ error: 'Job progress not found' });
        }
        res.json({ success: true, progress });
    }
    catch (error) {
        console.error('Error getting job progress:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get queue statistics
app.get('/api/v1/queue/stats', async (req, res) => {
    try {
        const stats = await (0, service_instances_1.getJobQueueService)().getQueueStats();
        res.json({ success: true, stats });
    }
    catch (error) {
        console.error('Error getting queue stats:', error);
        res.status(500).json({ error: error.message });
    }
});
// Retry failed job
app.post('/api/v1/queue/retry/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await (0, service_instances_1.getJobQueueService)().retryJob(id);
        res.json({ success: true, message: 'Job queued for retry' });
    }
    catch (error) {
        console.error('Error retrying job:', error);
        res.status(500).json({ error: error.message });
    }
});
// Cancel job
app.post('/api/v1/queue/cancel/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await (0, service_instances_1.getJobQueueService)().cancelJob(id);
        res.json({ success: true, message: 'Job cancelled' });
    }
    catch (error) {
        console.error('Error cancelling job:', error);
        res.status(500).json({ error: error.message });
    }
});
// ==================== NOTIFICATION ROUTES ====================
// Send notification
app.post('/api/v1/notifications/send', async (req, res) => {
    try {
        const { userId, type, title, message, options } = req.body;
        if (!userId || !type || !title || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const notification = await (0, service_instances_1.getNotificationService)().sendNotification(userId, type, title, message, options);
        res.json({ success: true, notification });
    }
    catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get user notifications
app.get('/api/v1/notifications/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { unreadOnly, limit } = req.query;
        const notifications = await (0, service_instances_1.getNotificationService)().getUserNotifications(userId, {
            unreadOnly: unreadOnly === 'true',
            limit: limit ? parseInt(limit) : undefined,
        });
        res.json({ success: true, notifications });
    }
    catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ error: error.message });
    }
});
// Mark notification as read
app.post('/api/v1/notifications/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        await (0, service_instances_1.getNotificationService)().markAsRead(id);
        res.json({ success: true, message: 'Notification marked as read' });
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: error.message });
    }
});
// Mark all notifications as read
app.post('/api/v1/notifications/user/:userId/read-all', async (req, res) => {
    try {
        const { userId } = req.params;
        await (0, service_instances_1.getNotificationService)().markAllAsRead(userId);
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get/Update notification preferences
app.get('/api/v1/notifications/preferences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const preferences = await (0, service_instances_1.getNotificationService)().getUserPreferences(userId);
        res.json({ success: true, preferences });
    }
    catch (error) {
        console.error('Error getting notification preferences:', error);
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/v1/notifications/preferences/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const preferences = req.body;
        await (0, service_instances_1.getNotificationService)().updateUserPreferences(userId, preferences);
        res.json({ success: true, message: 'Preferences updated' });
    }
    catch (error) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({ error: error.message });
    }
});
// ==================== ROUTING ROUTES ====================
// Create routing rule
app.post('/api/v1/routing/rules', async (req, res) => {
    try {
        const rule = await (0, service_instances_1.getRoutingEngine)().createRule(req.body);
        res.json({ success: true, rule });
    }
    catch (error) {
        console.error('Error creating routing rule:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get routing rules
app.get('/api/v1/routing/rules', async (req, res) => {
    try {
        const { customerId } = req.query;
        const rules = await (0, service_instances_1.getRoutingEngine)().getRules(customerId);
        res.json({ success: true, rules });
    }
    catch (error) {
        console.error('Error getting routing rules:', error);
        res.status(500).json({ error: error.message });
    }
});
// Update routing rule
app.put('/api/v1/routing/rules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await (0, service_instances_1.getRoutingEngine)().updateRule(id, req.body);
        res.json({ success: true, message: 'Rule updated' });
    }
    catch (error) {
        console.error('Error updating routing rule:', error);
        res.status(500).json({ error: error.message });
    }
});
// Delete routing rule
app.delete('/api/v1/routing/rules/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await (0, service_instances_1.getRoutingEngine)().deleteRule(id);
        res.json({ success: true, message: 'Rule deleted' });
    }
    catch (error) {
        console.error('Error deleting routing rule:', error);
        res.status(500).json({ error: error.message });
    }
});
// Auto-assign approvers
app.post('/api/v1/routing/auto-assign', async (req, res) => {
    try {
        const { customerId, jobContext } = req.body;
        if (!customerId || !jobContext) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const approvers = await (0, service_instances_1.getRoutingEngine)().autoAssignApprovers(customerId, jobContext);
        res.json({ success: true, approvers });
    }
    catch (error) {
        console.error('Error auto-assigning approvers:', error);
        res.status(500).json({ error: error.message });
    }
});
// ==================== PERMISSION ROUTES ====================
// Create custom role
app.post('/api/v1/permissions/roles', async (req, res) => {
    try {
        const role = await (0, service_instances_1.getPermissionService)().createRole(req.body);
        // Log the action
        await (0, service_instances_1.getAuditService)().log(req.body.createdBy || 'system', req.body.createdBy || 'system', 'create', 'roles', role.id, { severity: 'medium' });
        res.json({ success: true, role });
    }
    catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get all roles
app.get('/api/v1/permissions/roles', async (req, res) => {
    try {
        const roles = await (0, service_instances_1.getPermissionService)().getRoles();
        res.json({ success: true, roles });
    }
    catch (error) {
        console.error('Error getting roles:', error);
        res.status(500).json({ error: error.message });
    }
});
// Update role
app.put('/api/v1/permissions/roles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await (0, service_instances_1.getPermissionService)().updateRole(id, req.body);
        // Log the action
        await (0, service_instances_1.getAuditService)().log(req.body.updatedBy || 'system', req.body.updatedBy || 'system', 'update', 'roles', id, { severity: 'medium' });
        res.json({ success: true, message: 'Role updated' });
    }
    catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: error.message });
    }
});
// Delete role
app.delete('/api/v1/permissions/roles/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await (0, service_instances_1.getPermissionService)().deleteRole(id);
        // Log the action
        await (0, service_instances_1.getAuditService)().log('system', 'system', 'delete', 'roles', id, { severity: 'high' });
        res.json({ success: true, message: 'Role deleted' });
    }
    catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ error: error.message });
    }
});
// Check permission
app.post('/api/v1/permissions/check', async (req, res) => {
    try {
        const result = await (0, service_instances_1.getPermissionService)().checkPermission(req.body);
        res.json({ success: true, result });
    }
    catch (error) {
        console.error('Error checking permission:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get user permissions
app.get('/api/v1/permissions/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const permissions = await (0, service_instances_1.getPermissionService)().getUserPermissions(userId);
        res.json({ success: true, permissions });
    }
    catch (error) {
        console.error('Error getting user permissions:', error);
        res.status(500).json({ error: error.message });
    }
});
// Assign role to user
app.put('/api/v1/permissions/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { roleId, assignedBy } = req.body;
        if (!roleId || !assignedBy) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        await (0, service_instances_1.getPermissionService)().assignRole(userId, roleId, assignedBy);
        // Log the action
        await (0, service_instances_1.getAuditService)().log(assignedBy, assignedBy, 'permission-change', 'users', userId, {
            metadata: { roleId },
            severity: 'high'
        });
        res.json({ success: true, message: 'Role assigned' });
    }
    catch (error) {
        console.error('Error assigning role:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get all permissions
app.get('/api/v1/permissions', async (req, res) => {
    try {
        const permissions = await (0, service_instances_1.getPermissionService)().getPermissions();
        res.json({ success: true, permissions });
    }
    catch (error) {
        console.error('Error getting permissions:', error);
        res.status(500).json({ error: error.message });
    }
});
// ==================== AUDIT ROUTES ====================
// Query audit logs
app.get('/api/v1/audit/logs', async (req, res) => {
    try {
        const query = {};
        if (req.query.userId)
            query.userId = req.query.userId;
        if (req.query.action)
            query.action = req.query.action;
        if (req.query.resource)
            query.resource = req.query.resource;
        if (req.query.severity)
            query.severity = req.query.severity;
        if (req.query.startDate)
            query.startDate = new Date(req.query.startDate);
        if (req.query.endDate)
            query.endDate = new Date(req.query.endDate);
        if (req.query.limit)
            query.limit = parseInt(req.query.limit);
        if (req.query.offset)
            query.offset = parseInt(req.query.offset);
        const logs = await (0, service_instances_1.getAuditService)().query(query);
        res.json({ success: true, logs });
    }
    catch (error) {
        console.error('Error querying audit logs:', error);
        res.status(500).json({ error: error.message });
    }
});
// Get specific audit log
app.get('/api/v1/audit/logs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const log = await (0, service_instances_1.getAuditService)().getLog(id);
        if (!log) {
            return res.status(404).json({ error: 'Audit log not found' });
        }
        res.json({ success: true, log });
    }
    catch (error) {
        console.error('Error getting audit log:', error);
        res.status(500).json({ error: error.message });
    }
});
// Export audit logs
app.post('/api/v1/audit/export', async (req, res) => {
    try {
        const { query, format } = req.body;
        if (!format || !['json', 'csv'].includes(format)) {
            return res.status(400).json({ error: 'Invalid format. Use json or csv' });
        }
        const exportData = await (0, service_instances_1.getAuditService)().exportLogs(query || {}, format);
        // Log the export action
        await (0, service_instances_1.getAuditService)().log(req.body.userId || 'system', req.body.userName || 'system', 'export', 'audit-logs', 'export', { severity: 'medium' });
        res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=audit-logs.${format}`);
        res.send(exportData);
    }
    catch (error) {
        console.error('Error exporting audit logs:', error);
        res.status(500).json({ error: error.message });
    }
});
// Generate compliance report
app.post('/api/v1/audit/compliance', async (req, res) => {
    try {
        const { type, startDate, endDate, generatedBy } = req.body;
        if (!type || !startDate || !endDate || !generatedBy) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (!['gdpr', 'data-access', 'retention', 'deletion'].includes(type)) {
            return res.status(400).json({ error: 'Invalid report type' });
        }
        const report = await (0, service_instances_1.getAuditService)().generateComplianceReport(type, new Date(startDate), new Date(endDate), generatedBy);
        res.json({ success: true, report });
    }
    catch (error) {
        console.error('Error generating compliance report:', error);
        res.status(500).json({ error: error.message });
    }
});
// ==================== SYSTEM ROUTES ====================
// Initialize default permissions and roles
app.post('/api/v1/system/initialize', async (req, res) => {
    try {
        await (0, service_instances_1.getPermissionService)().initializeDefaults();
        res.json({ success: true, message: 'System initialized with default permissions and roles' });
    }
    catch (error) {
        console.error('Error initializing system:', error);
        res.status(500).json({ error: error.message });
    }
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
// Export other functions
var startVideoGeneratorBuild_1 = require("./startVideoGeneratorBuild");
Object.defineProperty(exports, "startVideoGeneratorBuild", { enumerable: true, get: function () { return startVideoGeneratorBuild_1.startVideoGeneratorBuild; } });
// Start queue worker
queue_worker_1.queueWorker.start();
// Export auto-documentation webhook and scheduled functions
var autodoc_1 = require("./autodoc");
Object.defineProperty(exports, "onDeploymentWebhook", { enumerable: true, get: function () { return autodoc_1.onDeploymentWebhook; } });
Object.defineProperty(exports, "scheduledDocReview", { enumerable: true, get: function () { return autodoc_1.scheduledDocReview; } });
//# sourceMappingURL=index.js.map