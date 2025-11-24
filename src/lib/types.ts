import { Timestamp } from 'firebase/firestore';

// User Types
export type UserRole = 'admin' | 'agent' | 'customer';

export interface User {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
    photoURL?: string;
    company?: string;
    createdAt: Timestamp;
    lastLogin: Timestamp;
    preferences: {
        theme: string;
        notifications: boolean;
    };
}

// Job Types
export type JobStatus = 'queue' | 'processing' | 'pending' | 'approved' | 'completed';
export type JobPriority = 'low' | 'medium' | 'high';

export interface PreflightCheck {
    status: 'pass' | 'warning' | 'error';
    message: string;
}

export interface PreflightReport {
    bleed: PreflightCheck;
    colorSpace: PreflightCheck;
    fonts: PreflightCheck;
    metadata: PreflightCheck;
}

export interface JobVersion {
    versionNumber: number;
    timestamp: Timestamp;
    fileUrl: string;
    changes: string;
    userId: string;
}

export interface Job {
    id: string;
    userId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadDate: Timestamp;
    status: JobStatus;
    preflightReport?: PreflightReport;
    assignedTo?: string;
    priority: JobPriority;
    dueDate?: Timestamp;
    versions: JobVersion[];
    tags?: string[];
    notes?: string;
}

// Annotation Types
export type AnnotationType = 'pin' | 'highlight' | 'drawing' | 'text';

export interface AnnotationPosition {
    x: number;
    y: number;
    width?: number;
    height?: number;
}

export interface Annotation {
    id: string;
    jobId: string;
    userId: string;
    userName: string;
    page: number;
    type: AnnotationType;
    position: AnnotationPosition;
    content: string;
    color: string;
    createdAt: Timestamp;
    resolved: boolean;
    resolvedBy?: string;
    resolvedAt?: Timestamp;
}

// Comment Types
export interface Comment {
    id: string;
    jobId: string;
    annotationId?: string;
    userId: string;
    userName: string;
    userPhotoURL?: string;
    text: string;
    createdAt: Timestamp;
    updatedAt?: Timestamp;
    mentions: string[];
    isEdited: boolean;
}

// Workflow Types
export interface WorkflowNode {
    id: string;
    type: string;
    label: string;
    config: Record<string, any>;
    position: { x: number; y: number };
}

export interface WorkflowConnection {
    id: string;
    source: string;
    target: string;
    condition?: string;
}

export interface Workflow {
    id: string;
    name: string;
    description?: string;
    userId: string;
    isTemplate: boolean;
    isActive: boolean;
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
    createdAt: Timestamp;
    updatedAt?: Timestamp;
    lastUsed?: Timestamp;
    usageCount: number;
}

// Analytics Types
export type AnalyticsEventType = 'session' | 'support' | 'job_completion' | 'user_action';

export interface AnalyticsMetrics {
    duration?: number;
    satisfaction?: number;
    resolved?: boolean;
    errorCount?: number;
}

export interface AnalyticsEvent {
    id: string;
    type: AnalyticsEventType;
    userId?: string;
    timestamp: Timestamp;
    metadata: Record<string, any>;
    metrics: AnalyticsMetrics;
    sessionId?: string;
}

// Auth Context Types
export interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateUserProfile: (data: Partial<User>) => Promise<void>;
    hasRole: (role: UserRole | UserRole[]) => boolean;
}

// Firestore Service Types
export interface QueryOptions {
    orderBy?: { field: string; direction: 'asc' | 'desc' };
    limit?: number;
    where?: Array<{ field: string; operator: any; value: any }>;
}

export interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    percentage: number;
}
