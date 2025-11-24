import React from 'react';

// Role-based Access Control System

export type UserRole = 'customer' | 'designer' | 'admin';

export interface User {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    permissions: Permission[];
    customerId?: string; // For customers
    designerId?: string; // For designers
    isActive: boolean;
    createdAt: Date;
    lastLogin?: Date;
    metadata?: {
        department?: string;
        tier?: 'free' | 'pro' | 'enterprise'; // For customers
        specializations?: string[]; // For designers
    };
}

export type Permission =
    // File Management
    | 'files:upload'
    | 'files:download'
    | 'files:delete'
    | 'files:view-own'
    | 'files:view-all'

    // Jobs
    | 'jobs:create'
    | 'jobs:view-own'
    | 'jobs:view-all'
    | 'jobs:edit-own'
    | 'jobs:edit-all'
    | 'jobs:delete-own'
    | 'jobs:delete-all'
    | 'jobs:assign'

    // Proofs
    | 'proofs:view-own'
    | 'proofs:view-all'
    | 'proofs:approve'
    | 'proofs:reject'
    | 'proofs:annotate'
    | 'proofs:create'

    // Orders
    | 'orders:create'
    | 'orders:view-own'
    | 'orders:view-all'
    | 'orders:reorder'
    | 'orders:cancel-own'
    | 'orders:cancel-all'

    // Processing
    | 'processing:preflight'
    | 'processing:autofix'
    | 'processing:batch'
    | 'processing:priority'

    // Analytics
    | 'analytics:view-own'
    | 'analytics:view-all'
    | 'analytics:export'

    // Users
    | 'users:view'
    | 'users:create'
    | 'users:edit'
    | 'users:delete'
    | 'users:manage-roles'

    // Settings
    | 'settings:view'
    | 'settings:edit'
    | 'settings:workflows'
    | 'settings:pricing'
    | 'settings:email-templates'

    // Support
    | 'support:request'
    | 'support:provide'
    | 'support:view-queue'
    | 'support:assign';

// Role definitions with default permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    // CUSTOMER ROLE
    customer: [
        'files:upload',
        'files:download',
        'files:view-own',

        // Can create and view their own jobs
        'jobs:create',
        'jobs:view-own',
        'jobs:edit-own',

        // Can view and approve their own proofs
        'proofs:view-own',
        'proofs:approve',
        'proofs:reject',
        'proofs:annotate',

        // Can create and manage their own orders
        'orders:create',
        'orders:view-own',
        'orders:reorder',
        'orders:cancel-own',

        // Can view their own analytics
        'analytics:view-own',

        // Can request support
        'support:request',

        // Can view basic settings
        'settings:view'
    ],

    // DESIGNER/GRAPHIC DESIGNER ROLE
    designer: [
        // Can view and download all files
        'files:view-all',
        'files:download',
        'files:upload', // Can upload fixed versions

        // Can view and edit all jobs assigned to them
        'jobs:view-all',
        'jobs:edit-all',

        // Can create and view all proofs
        'proofs:view-all',
        'proofs:create',
        'proofs:annotate',

        // Can view all orders
        'orders:view-all',

        // Can use all processing tools
        'processing:preflight',
        'processing:autofix',
        'processing:batch',

        // Can view analytics
        'analytics:view-all',

        // Can provide support
        'support:provide',
        'support:view-queue',

        // Can view settings
        'settings:view'
    ],

    // ADMIN/ADMINISTRATOR ROLE
    admin: [
        // Full file access
        'files:upload',
        'files:download',
        'files:delete',
        'files:view-all',

        // Full job access
        'jobs:create',
        'jobs:view-all',
        'jobs:edit-all',
        'jobs:delete-all',
        'jobs:assign',

        // Full proof access
        'proofs:view-all',
        'proofs:create',
        'proofs:approve',
        'proofs:reject',
        'proofs:annotate',

        // Full order access
        'orders:create',
        'orders:view-all',
        'orders:reorder',
        'orders:cancel-all',

        // Full processing access with priority
        'processing:preflight',
        'processing:autofix',
        'processing:batch',
        'processing:priority',

        // Full analytics access
        'analytics:view-all',
        'analytics:export',

        // User management
        'users:view',
        'users:create',
        'users:edit',
        'users:delete',
        'users:manage-roles',

        // Full settings access
        'settings:view',
        'settings:edit',
        'settings:workflows',
        'settings:pricing',
        'settings:email-templates',

        // Full support access
        'support:request',
        'support:provide',
        'support:view-queue',
        'support:assign'
    ]
};

// Permission checker class
export class PermissionChecker {
    constructor(private user: User) { }

    /**
     * Check if user has a specific permission
     */
    hasPermission(permission: Permission): boolean {
        return this.user.permissions.includes(permission);
    }

    /**
     * Check if user has ANY of the specified permissions
     */
    hasAnyPermission(permissions: Permission[]): boolean {
        return permissions.some(p => this.hasPermission(p));
    }

    /**
     * Check if user has ALL of the specified permissions
     */
    hasAllPermissions(permissions: Permission[]): boolean {
        return permissions.every(p => this.hasPermission(p));
    }

    /**
     * Check if user has a specific role
     */
    hasRole(role: UserRole): boolean {
        return this.user.role === role;
    }

    /**
     * Check if user is admin
     */
    isAdmin(): boolean {
        return this.hasRole('admin');
    }

    /**
     * Check if user is designer
     */
    isDesigner(): boolean {
        return this.hasRole('designer');
    }

    /**
     * Check if user is customer
     */
    isCustomer(): boolean {
        return this.hasRole('customer');
    }

    /**
     * Check if user can view a specific job
     */
    canViewJob(job: { customerId?: string; assignedTo?: string }): boolean {
        if (this.hasPermission('jobs:view-all')) return true;
        if (this.hasPermission('jobs:view-own')) {
            // Customers can view their own jobs
            if (this.isCustomer() && job.customerId === this.user.customerId) return true;
            // Designers can view jobs assigned to them
            if (this.isDesigner() && job.assignedTo === this.user.designerId) return true;
        }
        return false;
    }

    /**
     * Check if user can edit a specific job
     */
    canEditJob(job: { customerId?: string; assignedTo?: string }): boolean {
        if (this.hasPermission('jobs:edit-all')) return true;
        if (this.hasPermission('jobs:edit-own')) {
            if (this.isCustomer() && job.customerId === this.user.customerId) return true;
            if (this.isDesigner() && job.assignedTo === this.user.designerId) return true;
        }
        return false;
    }

    /**
     * Check if user can approve a proof
     */
    canApproveProof(proof: { customerId?: string }): boolean {
        if (!this.hasPermission('proofs:approve')) return false;
        // Customers can only approve their own proofs
        if (this.isCustomer()) {
            return proof.customerId === this.user.customerId;
        }
        // Admins can approve any proof
        return this.isAdmin();
    }

    /**
     * Get allowed navigation items based on permissions
     */
    getAllowedNavigation(): NavigationItem[] {
        const items: NavigationItem[] = [];

        // Dashboard (everyone)
        items.push({ path: '/dashboard', label: 'Dashboard', icon: 'Home' });

        // Jobs
        if (this.hasAnyPermission(['jobs:view-own', 'jobs:view-all'])) {
            items.push({ path: '/jobs', label: 'Jobs', icon: 'Briefcase' });
        }

        // Orders (customers and admins)
        if (this.hasAnyPermission(['orders:view-own', 'orders:view-all'])) {
            items.push({ path: '/orders', label: 'Orders', icon: 'ShoppingCart' });
        }

        // Queue (designers and admins)
        if (this.hasPermission('support:view-queue')) {
            items.push({ path: '/queue', label: 'Queue', icon: 'List' });
        }

        // Batch Processing (designers and admins)
        if (this.hasPermission('processing:batch')) {
            items.push({ path: '/batch', label: 'Batch Processing', icon: 'Package' });
        }

        // Analytics
        if (this.hasAnyPermission(['analytics:view-own', 'analytics:view-all'])) {
            items.push({ path: '/analytics', label: 'Analytics', icon: 'BarChart' });
        }

        // Users (admin only)
        if (this.hasPermission('users:view')) {
            items.push({ path: '/users', label: 'Users', icon: 'Users' });
        }

        // Settings
        if (this.hasPermission('settings:view')) {
            items.push({ path: '/settings', label: 'Settings', icon: 'Settings' });
        }

        return items;
    }
}

interface NavigationItem {
    path: string;
    label: string;
    icon: string;
}

/**
 * Create user with role
 */
export function createUserWithRole(
    uid: string,
    email: string,
    displayName: string,
    role: UserRole,
    additionalData?: Partial<User>
): User {
    return {
        uid,
        email,
        displayName,
        role,
        permissions: ROLE_PERMISSIONS[role],
        isActive: true,
        createdAt: new Date(),
        ...additionalData
    };
}

/**
 * Get permission checker for user
 */
export function getPermissionChecker(user: User): PermissionChecker {
    return new PermissionChecker(user);
}

/**
 * React hook for permissions
 */
export function usePermissions(user: User | null) {
    if (!user) {
        return {
            hasPermission: () => false,
            hasAnyPermission: () => false,
            hasAllPermissions: () => false,
            hasRole: () => false,
            isAdmin: () => false,
            isDesigner: () => false,
            isCustomer: () => false,
            canViewJob: () => false,
            canEditJob: () => false,
            canApproveProof: () => false,
            getAllowedNavigation: () => []
        };
    }

    const checker = new PermissionChecker(user);

    return {
        hasPermission: (p: Permission) => checker.hasPermission(p),
        hasAnyPermission: (p: Permission[]) => checker.hasAnyPermission(p),
        hasAllPermissions: (p: Permission[]) => checker.hasAllPermissions(p),
        hasRole: (r: UserRole) => checker.hasRole(r),
        isAdmin: () => checker.isAdmin(),
        isDesigner: () => checker.isDesigner(),
        isCustomer: () => checker.isCustomer(),
        canViewJob: (job: any) => checker.canViewJob(job),
        canEditJob: (job: any) => checker.canEditJob(job),
        canApproveProof: (proof: any) => checker.canApproveProof(proof),
        getAllowedNavigation: () => checker.getAllowedNavigation()
    };
}

/**
 * Higher-order component for permission-based rendering
 */
export function withPermission(permission: Permission) {
    return function <P extends object>(Component: React.ComponentType<P>) {
        return function PermissionWrapper(props: P & { user: User }) {
            const checker = new PermissionChecker(props.user);

            if (!checker.hasPermission(permission)) {
                return null; // Return null instead of JSX - component should handle this
            }

            return React.createElement(Component, props);
        };
    };
}

/**
 * Route guard component
 */
export function ProtectedRoute({
    user,
    requiredPermission,
    requiredRole,
    children
}: {
    user: User | null;
    requiredPermission?: Permission;
    requiredRole?: UserRole;
    children: React.ReactNode;
}) {
    if (!user) {
        return null; // Redirect to login should be handled by router
    }

    const checker = new PermissionChecker(user);

    if (requiredPermission && !checker.hasPermission(requiredPermission)) {
        return null; // Access denied - redirect handled by router
    }

    if (requiredRole && !checker.hasRole(requiredRole)) {
        return null; // Access denied - redirect handled by router
    }

    return children as any;
}
