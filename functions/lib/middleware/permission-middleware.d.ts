/**
 * Permission Middleware
 * Protects API routes with permission checking
 */
import { Request, Response, NextFunction } from 'express';
import type { PermissionAction } from '../types/admin-types';
/**
 * Middleware to check if user has required permission
 */
export declare function requirePermission(resource: string, action: PermissionAction): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware to check if user has any of the required permissions
 */
export declare function requireAnyPermission(permissions: Array<{
    resource: string;
    action: PermissionAction;
}>): (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Middleware to check if user has a specific role
 */
export declare function requireRole(roleId: string): (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware to require admin access
 */
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware to require super-admin access
 */
export declare const requireSuperAdmin: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=permission-middleware.d.ts.map