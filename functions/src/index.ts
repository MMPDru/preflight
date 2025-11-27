import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import {
    getApprovalService,
    getJobQueueService,
    getNotificationService,
    getRoutingEngine,
    getPermissionService,
    getAuditService,
    getPdfFixer,
    getPdfAnalyzer,
} from './services/service-instances';
import { queueWorker } from './workers/queue-worker';
import busboy from 'busboy';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Create Express app
const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true })); // Allow all origins for now
app.use(express.json({ limit: '50mb' })); // Increase limit for PDFs

// ==================== PDF ANALYSIS ROUTE ====================

app.post('/api/v1/analyze-pdf', async (req: Request, res: Response) => {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const busboyInstance = busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();
    const uploads: { [key: string]: string } = {};
    const fileWrites: Promise<void>[] = [];

    busboyInstance.on('file', (fieldname, file, info) => {
        const filepath = path.join(tmpdir, info.filename);
        uploads[fieldname] = filepath;

        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);

        const promise = new Promise<void>((resolve, reject) => {
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
            const analysis = await getPdfAnalyzer().analyzeDocument(fileBuffer);

            // Cleanup
            fs.unlinkSync(filePath);

            res.json({ success: true, analysis });
        } catch (error: any) {
            console.error('PDF Analysis Error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    if ((req as any).rawBody) {
        busboyInstance.end((req as any).rawBody);
    } else {
        req.pipe(busboyInstance);
    }
});

// ==================== PDF FIXING ROUTE (ENHANCED) ====================

app.post('/api/v1/fix-pdf', async (req: Request, res: Response) => {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const busboyInstance = busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();
    const uploads: { [key: string]: string } = {};
    const fileWrites: Promise<void>[] = [];
    let fixTypes: string[] = [];
    let options: any = {};

    busboyInstance.on('field', (fieldname, val) => {
        if (fieldname === 'fixTypes') {
            try {
                fixTypes = JSON.parse(val);
            } catch (e) {
                fixTypes = [val];
            }
        } else if (fieldname === 'options') {
            try {
                options = JSON.parse(val);
            } catch (e) {
                options = {};
            }
        }
    });

    busboyInstance.on('file', (fieldname, file, info) => {
        const filepath = path.join(tmpdir, info.filename);
        uploads[fieldname] = filepath;

        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);

        const promise = new Promise<void>((resolve, reject) => {
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
            const result = await getPdfFixer().processPdfWithAnalysis(fileBuffer, fixTypes, options);

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
        } catch (error: any) {
            console.error('PDF Fix Error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    if ((req as any).rawBody) {
        busboyInstance.end((req as any).rawBody);
    } else {
        req.pipe(busboyInstance);
    }
});

// ==================== EXISTING ROUTES (Simplified) ====================

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ==================== APPROVAL WORKFLOW ROUTES ====================

// Create approval chain
app.post('/api/v1/approvals/create', async (req: Request, res: Response) => {
    try {
        const { jobId, customerId, stages } = req.body;

        if (!jobId || !customerId || !stages) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const chain = await getApprovalService().createApprovalChain(jobId, customerId, stages);

        res.json({ success: true, chain });
    } catch (error: any) {
        console.error('Error creating approval chain:', error);
        res.status(500).json({ error: error.message });
    }
});

// Submit approval
app.post('/api/v1/approvals/:id/approve', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId, userName, decision, feedback, partialApprovalPages } = req.body;

        if (!userId || !userName || !decision) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const chain = await getApprovalService().submitApproval(
            id,
            userId,
            userName,
            decision,
            feedback,
            partialApprovalPages
        );

        res.json({ success: true, chain });
    } catch (error: any) {
        console.error('Error submitting approval:', error);
        res.status(500).json({ error: error.message });
    }
});

// Reject approval
app.post('/api/v1/approvals/:id/reject', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId, userName, feedback } = req.body;

        if (!userId || !userName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const chain = await getApprovalService().submitApproval(
            id,
            userId,
            userName,
            'rejected',
            feedback
        );

        res.json({ success: true, chain });
    } catch (error: any) {
        console.error('Error rejecting approval:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get pending approvals for user
app.get('/api/v1/approvals/pending/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const approvals = await getApprovalService().getPendingApprovals(userId);

        res.json({ success: true, approvals });
    } catch (error: any) {
        console.error('Error getting pending approvals:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get approval chain
app.get('/api/v1/approvals/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const chain = await getApprovalService().getApprovalChain(id);

        if (!chain) {
            return res.status(404).json({ error: 'Approval chain not found' });
        }

        res.json({ success: true, chain });
    } catch (error: any) {
        console.error('Error getting approval chain:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get approval history
app.get('/api/v1/approvals/:id/history', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const chain = await getApprovalService().getApprovalChain(id);
        if (!chain) {
            return res.status(404).json({ error: 'Approval chain not found' });
        }

        const history = await getApprovalService().getApprovalHistory(chain.jobId);

        res.json({ success: true, history });
    } catch (error: any) {
        console.error('Error getting approval history:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== JOB QUEUE ROUTES ====================

// Add job to queue
app.post('/api/v1/queue/add', async (req: Request, res: Response) => {
    try {
        const { type, payload, priority, maxAttempts, dependencies } = req.body;

        if (!type || !payload) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const job = await getJobQueueService().addJob(type, payload, {
            priority,
            maxAttempts,
            dependencies,
        });

        res.json({ success: true, job });
    } catch (error: any) {
        console.error('Error adding job to queue:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get job status
app.get('/api/v1/queue/status/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const job = await getJobQueueService().getJobStatus(id);

        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        res.json({ success: true, job });
    } catch (error: any) {
        console.error('Error getting job status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get job progress
app.get('/api/v1/queue/progress/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const progress = await getJobQueueService().getJobProgress(id);

        if (!progress) {
            return res.status(404).json({ error: 'Job progress not found' });
        }

        res.json({ success: true, progress });
    } catch (error: any) {
        console.error('Error getting job progress:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get queue statistics
app.get('/api/v1/queue/stats', async (req: Request, res: Response) => {
    try {
        const stats = await getJobQueueService().getQueueStats();

        res.json({ success: true, stats });
    } catch (error: any) {
        console.error('Error getting queue stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// Retry failed job
app.post('/api/v1/queue/retry/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await getJobQueueService().retryJob(id);

        res.json({ success: true, message: 'Job queued for retry' });
    } catch (error: any) {
        console.error('Error retrying job:', error);
        res.status(500).json({ error: error.message });
    }
});

// Cancel job
app.post('/api/v1/queue/cancel/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await getJobQueueService().cancelJob(id);

        res.json({ success: true, message: 'Job cancelled' });
    } catch (error: any) {
        console.error('Error cancelling job:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== NOTIFICATION ROUTES ====================

// Send notification
app.post('/api/v1/notifications/send', async (req: Request, res: Response) => {
    try {
        const { userId, type, title, message, options } = req.body;

        if (!userId || !type || !title || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const notification = await getNotificationService().sendNotification(
            userId,
            type,
            title,
            message,
            options
        );

        res.json({ success: true, notification });
    } catch (error: any) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user notifications
app.get('/api/v1/notifications/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { unreadOnly, limit } = req.query;

        const notifications = await getNotificationService().getUserNotifications(userId, {
            unreadOnly: unreadOnly === 'true',
            limit: limit ? parseInt(limit as string) : undefined,
        });

        res.json({ success: true, notifications });
    } catch (error: any) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark notification as read
app.post('/api/v1/notifications/:id/read', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await getNotificationService().markAsRead(id);

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error: any) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: error.message });
    }
});

// Mark all notifications as read
app.post('/api/v1/notifications/user/:userId/read-all', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        await getNotificationService().markAllAsRead(userId);

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get/Update notification preferences
app.get('/api/v1/notifications/preferences/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const preferences = await getNotificationService().getUserPreferences(userId);

        res.json({ success: true, preferences });
    } catch (error: any) {
        console.error('Error getting notification preferences:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/v1/notifications/preferences/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const preferences = req.body;

        await getNotificationService().updateUserPreferences(userId, preferences);

        res.json({ success: true, message: 'Preferences updated' });
    } catch (error: any) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== ROUTING ROUTES ====================

// Create routing rule
app.post('/api/v1/routing/rules', async (req: Request, res: Response) => {
    try {
        const rule = await getRoutingEngine().createRule(req.body);

        res.json({ success: true, rule });
    } catch (error: any) {
        console.error('Error creating routing rule:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get routing rules
app.get('/api/v1/routing/rules', async (req: Request, res: Response) => {
    try {
        const { customerId } = req.query;

        const rules = await getRoutingEngine().getRules(customerId as string);

        res.json({ success: true, rules });
    } catch (error: any) {
        console.error('Error getting routing rules:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update routing rule
app.put('/api/v1/routing/rules/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await getRoutingEngine().updateRule(id, req.body);

        res.json({ success: true, message: 'Rule updated' });
    } catch (error: any) {
        console.error('Error updating routing rule:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete routing rule
app.delete('/api/v1/routing/rules/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await getRoutingEngine().deleteRule(id);

        res.json({ success: true, message: 'Rule deleted' });
    } catch (error: any) {
        console.error('Error deleting routing rule:', error);
        res.status(500).json({ error: error.message });
    }
});

// Auto-assign approvers
app.post('/api/v1/routing/auto-assign', async (req: Request, res: Response) => {
    try {
        const { customerId, jobContext } = req.body;

        if (!customerId || !jobContext) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const approvers = await getRoutingEngine().autoAssignApprovers(customerId, jobContext);

        res.json({ success: true, approvers });
    } catch (error: any) {
        console.error('Error auto-assigning approvers:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== PERMISSION ROUTES ====================

// Create custom role
app.post('/api/v1/permissions/roles', async (req: Request, res: Response) => {
    try {
        const role = await getPermissionService().createRole(req.body);

        // Log the action
        await getAuditService().log(
            req.body.createdBy || 'system',
            req.body.createdBy || 'system',
            'create',
            'roles',
            role.id,
            { severity: 'medium' }
        );

        res.json({ success: true, role });
    } catch (error: any) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all roles
app.get('/api/v1/permissions/roles', async (req: Request, res: Response) => {
    try {
        const roles = await getPermissionService().getRoles();
        res.json({ success: true, roles });
    } catch (error: any) {
        console.error('Error getting roles:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update role
app.put('/api/v1/permissions/roles/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await getPermissionService().updateRole(id, req.body);

        // Log the action
        await getAuditService().log(
            req.body.updatedBy || 'system',
            req.body.updatedBy || 'system',
            'update',
            'roles',
            id,
            { severity: 'medium' }
        );

        res.json({ success: true, message: 'Role updated' });
    } catch (error: any) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete role
app.delete('/api/v1/permissions/roles/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await getPermissionService().deleteRole(id);

        // Log the action
        await getAuditService().log(
            'system',
            'system',
            'delete',
            'roles',
            id,
            { severity: 'high' }
        );

        res.json({ success: true, message: 'Role deleted' });
    } catch (error: any) {
        console.error('Error deleting role:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check permission
app.post('/api/v1/permissions/check', async (req: Request, res: Response) => {
    try {
        const result = await getPermissionService().checkPermission(req.body);
        res.json({ success: true, result });
    } catch (error: any) {
        console.error('Error checking permission:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user permissions
app.get('/api/v1/permissions/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const permissions = await getPermissionService().getUserPermissions(userId);
        res.json({ success: true, permissions });
    } catch (error: any) {
        console.error('Error getting user permissions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Assign role to user
app.put('/api/v1/permissions/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { roleId, assignedBy } = req.body;

        if (!roleId || !assignedBy) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await getPermissionService().assignRole(userId, roleId, assignedBy);

        // Log the action
        await getAuditService().log(
            assignedBy,
            assignedBy,
            'permission-change',
            'users',
            userId,
            {
                metadata: { roleId },
                severity: 'high'
            }
        );

        res.json({ success: true, message: 'Role assigned' });
    } catch (error: any) {
        console.error('Error assigning role:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all permissions
app.get('/api/v1/permissions', async (req: Request, res: Response) => {
    try {
        const permissions = await getPermissionService().getPermissions();
        res.json({ success: true, permissions });
    } catch (error: any) {
        console.error('Error getting permissions:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== AUDIT ROUTES ====================

// Query audit logs
app.get('/api/v1/audit/logs', async (req: Request, res: Response) => {
    try {
        const query: any = {};

        if (req.query.userId) query.userId = req.query.userId as string;
        if (req.query.action) query.action = req.query.action as string;
        if (req.query.resource) query.resource = req.query.resource as string;
        if (req.query.severity) query.severity = req.query.severity as string;
        if (req.query.startDate) query.startDate = new Date(req.query.startDate as string);
        if (req.query.endDate) query.endDate = new Date(req.query.endDate as string);
        if (req.query.limit) query.limit = parseInt(req.query.limit as string);
        if (req.query.offset) query.offset = parseInt(req.query.offset as string);

        const logs = await getAuditService().query(query);
        res.json({ success: true, logs });
    } catch (error: any) {
        console.error('Error querying audit logs:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific audit log
app.get('/api/v1/audit/logs/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const log = await getAuditService().getLog(id);

        if (!log) {
            return res.status(404).json({ error: 'Audit log not found' });
        }

        res.json({ success: true, log });
    } catch (error: any) {
        console.error('Error getting audit log:', error);
        res.status(500).json({ error: error.message });
    }
});

// Export audit logs
app.post('/api/v1/audit/export', async (req: Request, res: Response) => {
    try {
        const { query, format } = req.body;

        if (!format || !['json', 'csv'].includes(format)) {
            return res.status(400).json({ error: 'Invalid format. Use json or csv' });
        }

        const exportData = await getAuditService().exportLogs(query || {}, format);

        // Log the export action
        await getAuditService().log(
            req.body.userId || 'system',
            req.body.userName || 'system',
            'export',
            'audit-logs',
            'export',
            { severity: 'medium' }
        );

        res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=audit-logs.${format}`);
        res.send(exportData);
    } catch (error: any) {
        console.error('Error exporting audit logs:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate compliance report
app.post('/api/v1/audit/compliance', async (req: Request, res: Response) => {
    try {
        const { type, startDate, endDate, generatedBy } = req.body;

        if (!type || !startDate || !endDate || !generatedBy) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        if (!['gdpr', 'data-access', 'retention', 'deletion'].includes(type)) {
            return res.status(400).json({ error: 'Invalid report type' });
        }

        const report = await getAuditService().generateComplianceReport(
            type,
            new Date(startDate),
            new Date(endDate),
            generatedBy
        );

        res.json({ success: true, report });
    } catch (error: any) {
        console.error('Error generating compliance report:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== SYSTEM ROUTES ====================

// Initialize default permissions and roles
app.post('/api/v1/system/initialize', async (req: Request, res: Response) => {
    try {
        await getPermissionService().initializeDefaults();
        res.json({ success: true, message: 'System initialized with default permissions and roles' });
    } catch (error: any) {
        console.error('Error initializing system:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);

// Export other functions
export { startVideoGeneratorBuild } from './startVideoGeneratorBuild';

// Start queue worker
queueWorker.start();

// Export auto-documentation webhook and scheduled functions
export { onDeploymentWebhook, scheduledDocReview } from './autodoc';
