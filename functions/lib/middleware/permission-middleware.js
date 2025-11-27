"use strict";
/**
 * Permission Middleware
 * Protects API routes with permission checking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.requireAdmin = void 0;
exports.requirePermission = requirePermission;
exports.requireAnyPermission = requireAnyPermission;
exports.requireRole = requireRole;
const service_instances_1 = require("../services/service-instances");
function requirePermission(resource, action) {
    return async (req, res, next) => {
        try {
            // Get user ID from request (assuming it's set by auth middleware)
            const userId = req.headers['x-user-id'] || req.body.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized - User ID required' });
            }
            // Check permission
            const result = await (0, service_instances_1.getPermissionService)().checkPermission({
                userId,
                resource,
                action,
            });
            if (!result.allowed) {
                // Log unauthorized access attempt
                await (0, service_instances_1.getAuditService)().log(userId, userId, 'read', resource, 'access-denied', {
                    metadata: { reason: result.reason, action },
                    severity: 'high',
                });
                return res.status(403).json({
                    error: 'Forbidden - Insufficient permissions',
                    reason: result.reason
                });
            }
            // Permission granted, continue
            next();
        }
        catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: 'Permission check failed' });
        }
    };
}
/**
 * Middleware to check if user has any of the required permissions
 */
function requireAnyPermission(permissions) {
    return async (req, res, next) => {
        try {
            const userId = req.headers['x-user-id'] || req.body.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized - User ID required' });
            }
            // Check each permission
            for (const perm of permissions) {
                const result = await (0, service_instances_1.getPermissionService)().checkPermission({
                    userId,
                    resource: perm.resource,
                    action: perm.action,
                });
                if (result.allowed) {
                    // At least one permission granted
                    return next();
                }
            }
            // No permissions granted
            await (0, service_instances_1.getAuditService)().log(userId, userId, 'read', 'multiple', 'access-denied', {
                metadata: { permissions },
                severity: 'high',
            });
            return res.status(403).json({
                error: 'Forbidden - Insufficient permissions'
            });
        }
        catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: 'Permission check failed' });
        }
    };
}
/**
 * Middleware to check if user has a specific role
 */
function requireRole(roleId) {
    return async (req, res, next) => {
        try {
            const userId = req.headers['x-user-id'] || req.body.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized - User ID required' });
            }
            // Get user permissions
            const userPermissions = await (0, service_instances_1.getPermissionService)().getUserPermissions(userId);
            if (!userPermissions || userPermissions.roleId !== roleId) {
                await (0, service_instances_1.getAuditService)().log(userId, userId, 'read', 'roles', 'access-denied', {
                    metadata: { requiredRole: roleId, actualRole: userPermissions?.roleId },
                    severity: 'high',
                });
                return res.status(403).json({
                    error: 'Forbidden - Required role not assigned'
                });
            }
            next();
        }
        catch (error) {
            console.error('Role check error:', error);
            res.status(500).json({ error: 'Role check failed' });
        }
    };
}
/**
 * Middleware to require admin access
 */
exports.requireAdmin = requirePermission('system', 'admin');
/**
 * Middleware to require super-admin access
 */
exports.requireSuperAdmin = requireRole('super-admin');
//# sourceMappingURL=permission-middleware.js.map