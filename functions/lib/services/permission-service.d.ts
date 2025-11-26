/**
 * Permission Service
 * Manages roles, permissions, and access control
 */
import { firestore } from 'firebase-admin';
import type { Permission, Role, UserPermissions, PermissionCheck, PermissionCheckResult } from '../types/admin-types';
export declare class PermissionService {
    private db;
    constructor(db: firestore.Firestore);
    /**
     * Initialize default permissions and roles
     */
    initializeDefaults(): Promise<void>;
    /**
     * Get default permissions
     */
    private getDefaultPermissions;
    /**
     * Get default roles
     */
    private getDefaultRoles;
    /**
     * Create a custom role
     */
    createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role>;
    /**
     * Update a role
     */
    updateRole(roleId: string, updates: Partial<Role>): Promise<void>;
    /**
     * Delete a role
     */
    deleteRole(roleId: string): Promise<void>;
    /**
     * Get all roles
     */
    getRoles(): Promise<Role[]>;
    /**
     * Assign role to user
     */
    assignRole(userId: string, roleId: string, assignedBy: string): Promise<void>;
    /**
     * Check if user has permission
     */
    checkPermission(check: PermissionCheck): Promise<PermissionCheckResult>;
    /**
     * Get user permissions
     */
    getUserPermissions(userId: string): Promise<UserPermissions | null>;
    /**
     * Add custom permission to user
     */
    addCustomPermission(userId: string, permissionId: string): Promise<void>;
    /**
     * Remove custom permission from user
     */
    removeCustomPermission(userId: string, permissionId: string): Promise<void>;
    /**
     * Get all permissions
     */
    getPermissions(): Promise<Permission[]>;
}
//# sourceMappingURL=permission-service.d.ts.map