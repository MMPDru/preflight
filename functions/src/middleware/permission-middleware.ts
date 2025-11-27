/**
 * Permission Middleware
 * Protects API routes with permission checking
 */

import { Request, Response, NextFunction } from 'express';
import { getPermissionService, getAuditService } from '../services/service-instances';
import type { PermissionAction } from '../types/admin-types';

export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email?: string;
        role?: string;
    };
}/**
 * Middleware to check if user has required permission
 */
export function requirePermission(resource: string, action: PermissionAction) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user ID from request (assuming it's set by auth middleware)
            const userId = req.headers['x-user-id'] as string || req.body.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized - User ID required' });
            }

            // Check permission
            const result = await getPermissionService().checkPermission({
                userId,
                resource,
                action,
            });

            if (!result.allowed) {
                // Log unauthorized access attempt
                await getAuditService().log(
                    userId,
                    userId,
                    'read',
                    resource,
                    'access-denied',
                    {
                        metadata: { reason: result.reason, action },
                        severity: 'high',
                    }
                );

                return res.status(403).json({
                    error: 'Forbidden - Insufficient permissions',
                    reason: result.reason
                });
            }

            // Permission granted, continue
            next();
        } catch (error: any) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: 'Permission check failed' });
        }
    };
}

/**
 * Middleware to check if user has any of the required permissions
 */
export function requireAnyPermission(permissions: Array<{ resource: string; action: PermissionAction }>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.headers['x-user-id'] as string || req.body.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized - User ID required' });
            }

            // Check each permission
            for (const perm of permissions) {
                const result = await getPermissionService().checkPermission({
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
            await getAuditService().log(
                userId,
                userId,
                'read',
                'multiple',
                'access-denied',
                {
                    metadata: { permissions },
                    severity: 'high',
                }
            );

            return res.status(403).json({
                error: 'Forbidden - Insufficient permissions'
            });
        } catch (error: any) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: 'Permission check failed' });
        }
    };
}

/**
 * Middleware to check if user has a specific role
 */
export function requireRole(roleId: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.headers['x-user-id'] as string || req.body.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized - User ID required' });
            }

            // Get user permissions
            const userPermissions = await getPermissionService().getUserPermissions(userId);

            if (!userPermissions || userPermissions.roleId !== roleId) {
                await getAuditService().log(
                    userId,
                    userId,
                    'read',
                    'roles',
                    'access-denied',
                    {
                        metadata: { requiredRole: roleId, actualRole: userPermissions?.roleId },
                        severity: 'high',
                    }
                );

                return res.status(403).json({
                    error: 'Forbidden - Required role not assigned'
                });
            }

            next();
        } catch (error: any) {
            console.error('Role check error:', error);
            res.status(500).json({ error: 'Role check failed' });
        }
    };
}

/**
 * Middleware to require admin access
 */
export const requireAdmin = requirePermission('system', 'admin');

/**
 * Middleware to require super-admin access
 */
export const requireSuperAdmin = requireRole('super-admin');
