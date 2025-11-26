/**
 * Permission Service
 * Manages roles, permissions, and access control
 */

import { firestore } from 'firebase-admin';
import type {
    Permission,
    Role,
    UserPermissions,
    PermissionCheck,
    PermissionCheckResult,
    PermissionAction,
} from '../types/admin-types';

export class PermissionService {
    private db: firestore.Firestore;

    constructor(db: firestore.Firestore) {
        this.db = db;
    }

    /**
     * Initialize default permissions and roles
     */
    async initializeDefaults(): Promise<void> {
        const defaultPermissions = this.getDefaultPermissions();
        const defaultRoles = this.getDefaultRoles();

        // Create default permissions
        for (const permission of defaultPermissions) {
            await this.db.collection('permissions').doc(permission.id).set(permission);
        }

        // Create default roles
        for (const role of defaultRoles) {
            await this.db.collection('roles').doc(role.id).set(role);
        }
    }

    /**
     * Get default permissions
     */
    private getDefaultPermissions(): Permission[] {
        return [
            // Job permissions
            { id: 'jobs.read', name: 'View Jobs', resource: 'jobs', actions: ['read'], description: 'View job details', category: 'jobs' },
            { id: 'jobs.write', name: 'Edit Jobs', resource: 'jobs', actions: ['write'], description: 'Create and edit jobs', category: 'jobs' },
            { id: 'jobs.delete', name: 'Delete Jobs', resource: 'jobs', actions: ['delete'], description: 'Delete jobs', category: 'jobs' },
            { id: 'jobs.admin', name: 'Manage Jobs', resource: 'jobs', actions: ['admin'], description: 'Full job management', category: 'jobs' },

            // User permissions
            { id: 'users.read', name: 'View Users', resource: 'users', actions: ['read'], description: 'View user details', category: 'users' },
            { id: 'users.write', name: 'Edit Users', resource: 'users', actions: ['write'], description: 'Create and edit users', category: 'users' },
            { id: 'users.delete', name: 'Delete Users', resource: 'users', actions: ['delete'], description: 'Delete users', category: 'users' },
            { id: 'users.admin', name: 'Manage Users', resource: 'users', actions: ['admin'], description: 'Full user management', category: 'users' },

            // Approval permissions
            { id: 'approvals.read', name: 'View Approvals', resource: 'approvals', actions: ['read'], description: 'View approval chains', category: 'approvals' },
            { id: 'approvals.write', name: 'Create Approvals', resource: 'approvals', actions: ['write'], description: 'Create approval chains', category: 'approvals' },
            { id: 'approvals.execute', name: 'Execute Approvals', resource: 'approvals', actions: ['execute'], description: 'Approve or reject', category: 'approvals' },

            // Settings permissions
            { id: 'settings.read', name: 'View Settings', resource: 'settings', actions: ['read'], description: 'View system settings', category: 'settings' },
            { id: 'settings.write', name: 'Edit Settings', resource: 'settings', actions: ['write'], description: 'Modify system settings', category: 'settings' },

            // Reports permissions
            { id: 'reports.read', name: 'View Reports', resource: 'reports', actions: ['read'], description: 'View reports and analytics', category: 'reports' },
            { id: 'reports.write', name: 'Create Reports', resource: 'reports', actions: ['write'], description: 'Create custom reports', category: 'reports' },

            // Billing permissions
            { id: 'billing.read', name: 'View Billing', resource: 'billing', actions: ['read'], description: 'View billing information', category: 'billing' },
            { id: 'billing.write', name: 'Manage Billing', resource: 'billing', actions: ['write'], description: 'Manage billing and pricing', category: 'billing' },

            // System permissions
            { id: 'system.admin', name: 'System Admin', resource: 'system', actions: ['admin'], description: 'Full system administration', category: 'system' },
        ];
    }

    /**
     * Get default roles
     */
    private getDefaultRoles(): Role[] {
        const now = new Date();

        return [
            {
                id: 'customer',
                name: 'Customer',
                description: 'Standard customer role',
                permissions: ['jobs.read', 'jobs.write', 'approvals.execute'],
                isCustom: false,
                isSystem: true,
                createdBy: 'system',
                createdAt: now,
                updatedAt: now,
            },
            {
                id: 'designer',
                name: 'Designer',
                description: 'Designer role with job management',
                permissions: ['jobs.read', 'jobs.write', 'jobs.admin', 'approvals.read', 'approvals.write'],
                isCustom: false,
                isSystem: true,
                createdBy: 'system',
                createdAt: now,
                updatedAt: now,
            },
            {
                id: 'admin',
                name: 'Administrator',
                description: 'Admin role with most permissions',
                permissions: [
                    'jobs.admin', 'users.read', 'users.write', 'approvals.read', 'approvals.write',
                    'settings.read', 'settings.write', 'reports.read', 'reports.write', 'billing.read', 'billing.write'
                ],
                isCustom: false,
                isSystem: true,
                createdBy: 'system',
                createdAt: now,
                updatedAt: now,
            },
            {
                id: 'super-admin',
                name: 'Super Administrator',
                description: 'Full system access',
                permissions: ['system.admin'],
                isCustom: false,
                isSystem: true,
                createdBy: 'system',
                createdAt: now,
                updatedAt: now,
            },
        ];
    }

    /**
     * Create a custom role
     */
    async createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
        const now = new Date();
        const id = this.db.collection('roles').doc().id;

        const fullRole: Role = {
            ...role,
            id,
            createdAt: now,
            updatedAt: now,
        };

        await this.db.collection('roles').doc(id).set(fullRole);
        return fullRole;
    }

    /**
     * Update a role
     */
    async updateRole(roleId: string, updates: Partial<Role>): Promise<void> {
        const roleDoc = await this.db.collection('roles').doc(roleId).get();

        if (!roleDoc.exists) {
            throw new Error('Role not found');
        }

        const role = roleDoc.data() as Role;

        if (role.isSystem) {
            throw new Error('Cannot modify system roles');
        }

        await this.db.collection('roles').doc(roleId).update({
            ...updates,
            updatedAt: new Date(),
        });
    }

    /**
     * Delete a role
     */
    async deleteRole(roleId: string): Promise<void> {
        const roleDoc = await this.db.collection('roles').doc(roleId).get();

        if (!roleDoc.exists) {
            throw new Error('Role not found');
        }

        const role = roleDoc.data() as Role;

        if (role.isSystem) {
            throw new Error('Cannot delete system roles');
        }

        await this.db.collection('roles').doc(roleId).delete();
    }

    /**
     * Get all roles
     */
    async getRoles(): Promise<Role[]> {
        const snapshot = await this.db.collection('roles').get();
        return snapshot.docs.map(doc => doc.data() as Role);
    }

    /**
     * Assign role to user
     */
    async assignRole(userId: string, roleId: string, assignedBy: string): Promise<void> {
        const userPermissions: UserPermissions = {
            userId,
            roleId,
            assignedBy,
            assignedAt: new Date(),
        };

        await this.db.collection('user-permissions').doc(userId).set(userPermissions);
    }

    /**
     * Check if user has permission
     */
    async checkPermission(check: PermissionCheck): Promise<PermissionCheckResult> {
        // Get user permissions
        const userPermDoc = await this.db.collection('user-permissions').doc(check.userId).get();

        if (!userPermDoc.exists) {
            return { allowed: false, reason: 'No permissions assigned' };
        }

        const userPerms = userPermDoc.data() as UserPermissions;

        // Check if expired
        if (userPerms.expiresAt && userPerms.expiresAt < new Date()) {
            return { allowed: false, reason: 'Permissions expired' };
        }

        // Get role
        const roleDoc = await this.db.collection('roles').doc(userPerms.roleId).get();

        if (!roleDoc.exists) {
            return { allowed: false, reason: 'Role not found' };
        }

        const role = roleDoc.data() as Role;

        // Check for system admin (has all permissions)
        if (role.permissions.includes('system.admin')) {
            return { allowed: true, matchedPermissions: ['system.admin'] };
        }

        // Build list of all permissions
        const allPermissions = [
            ...role.permissions,
            ...(userPerms.customPermissions || []),
        ].filter(p => !(userPerms.deniedPermissions || []).includes(p));

        // Check for exact permission match
        const exactMatch = `${check.resource}.${check.action}`;
        if (allPermissions.includes(exactMatch)) {
            return { allowed: true, matchedPermissions: [exactMatch] };
        }

        // Check for admin permission on resource
        const adminMatch = `${check.resource}.admin`;
        if (allPermissions.includes(adminMatch)) {
            return { allowed: true, matchedPermissions: [adminMatch] };
        }

        return { allowed: false, reason: 'Permission not granted' };
    }

    /**
     * Get user permissions
     */
    async getUserPermissions(userId: string): Promise<UserPermissions | null> {
        const doc = await this.db.collection('user-permissions').doc(userId).get();
        return doc.exists ? (doc.data() as UserPermissions) : null;
    }

    /**
     * Add custom permission to user
     */
    async addCustomPermission(userId: string, permissionId: string): Promise<void> {
        const userPerms = await this.getUserPermissions(userId);

        if (!userPerms) {
            throw new Error('User permissions not found');
        }

        const customPermissions = userPerms.customPermissions || [];

        if (!customPermissions.includes(permissionId)) {
            customPermissions.push(permissionId);

            await this.db.collection('user-permissions').doc(userId).update({
                customPermissions,
            });
        }
    }

    /**
     * Remove custom permission from user
     */
    async removeCustomPermission(userId: string, permissionId: string): Promise<void> {
        const userPerms = await this.getUserPermissions(userId);

        if (!userPerms) {
            throw new Error('User permissions not found');
        }

        const customPermissions = (userPerms.customPermissions || []).filter(p => p !== permissionId);

        await this.db.collection('user-permissions').doc(userId).update({
            customPermissions,
        });
    }

    /**
     * Get all permissions
     */
    async getPermissions(): Promise<Permission[]> {
        const snapshot = await this.db.collection('permissions').get();
        return snapshot.docs.map(doc => doc.data() as Permission);
    }
}

export const permissionService = new PermissionService(firestore());
