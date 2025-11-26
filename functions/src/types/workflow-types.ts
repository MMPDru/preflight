/**
 * Workflow and Approval System Type Definitions
 * Phase 2: Approval Workflow & Automation
 */

// ==================== APPROVAL WORKFLOW TYPES ====================

export interface ApprovalChain {
    id: string;
    jobId: string;
    customerId: string;
    stages: ApprovalStage[];
    currentStageIndex: number;
    status: ApprovalChainStatus;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    metadata?: Record<string, any>;
}

export type ApprovalChainStatus =
    | 'pending'
    | 'in-progress'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'expired';

export interface ApprovalStage {
    id: string;
    name: string;
    description?: string;
    approvers: StageApprover[];
    requiredApprovals: number; // Minimum number of approvals needed
    allowPartialApproval: boolean;
    deadline?: Date;
    status: StageStatus;
    approvals: Approval[];
    conditions?: RoutingCondition[];
    createdAt: Date;
    completedAt?: Date;
}

export type StageStatus =
    | 'pending'
    | 'in-progress'
    | 'approved'
    | 'rejected'
    | 'skipped';

export interface StageApprover {
    userId: string;
    role: 'required' | 'optional' | 'cc';
    notified: boolean;
    notifiedAt?: Date;
}

export interface Approval {
    id: string;
    userId: string;
    userName: string;
    decision: ApprovalDecision;
    feedback?: string;
    timestamp: Date;
    partialApprovalPages?: number[];
    partialApprovalSections?: string[];
    attachments?: string[];
    ipAddress?: string;
}

export type ApprovalDecision =
    | 'approved'
    | 'rejected'
    | 'partial'
    | 'conditional';

// ==================== ROUTING & AUTOMATION TYPES ====================

export interface RoutingCondition {
    id: string;
    type: ConditionType;
    field: string;
    operator: ConditionOperator;
    value: any;
    action: RoutingAction;
}

export type ConditionType =
    | 'file-property'
    | 'customer-property'
    | 'time-based'
    | 'approval-based'
    | 'issue-based';

export type ConditionOperator =
    | 'equals'
    | 'not-equals'
    | 'contains'
    | 'greater-than'
    | 'less-than'
    | 'in'
    | 'not-in';

export interface RoutingAction {
    type: 'assign' | 'skip' | 'notify' | 'escalate';
    target?: string; // User ID or role
    message?: string;
}

export interface RoutingRule {
    id: string;
    name: string;
    description?: string;
    enabled: boolean;
    priority: number;
    conditions: RoutingCondition[];
    actions: RoutingAction[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== JOB QUEUE TYPES ====================

export interface QueueJob {
    id: string;
    type: JobType;
    payload: any;
    priority: number; // 1 (lowest) to 10 (highest)
    status: JobStatus;
    attempts: number;
    maxAttempts: number;
    error?: JobError;
    result?: any;
    progress?: number; // 0-100
    dependencies?: string[]; // Job IDs that must complete first
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    estimatedDuration?: number; // milliseconds
    actualDuration?: number; // milliseconds
}

export type JobType =
    | 'pdf-analysis'
    | 'pdf-fix'
    | 'email'
    | 'notification'
    | 'file-processing'
    | 'report-generation'
    | 'backup'
    | 'cleanup';

export type JobStatus =
    | 'queued'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'retrying';

export interface JobError {
    message: string;
    stack?: string;
    code?: string;
    timestamp: Date;
    recoverable: boolean;
}

export interface JobProgress {
    jobId: string;
    progress: number;
    message?: string;
    currentStep?: string;
    totalSteps?: number;
    eta?: Date;
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
    read: boolean;
    readAt?: Date;
    actionUrl?: string;
    actionLabel?: string;
    priority: NotificationPriority;
    channels: NotificationChannel[];
    createdAt: Date;
    expiresAt?: Date;
}

export type NotificationType =
    | 'proof-ready'
    | 'approval-request'
    | 'approval-approved'
    | 'approval-rejected'
    | 'reminder'
    | 'issue-detected'
    | 'revision-uploaded'
    | 'print-confirmation'
    | 'deadline-approaching'
    | 'deadline-passed'
    | 'escalation'
    | 'system';

export type NotificationPriority =
    | 'low'
    | 'normal'
    | 'high'
    | 'urgent';

export type NotificationChannel =
    | 'in-app'
    | 'email'
    | 'sms'
    | 'push';

export interface NotificationPreferences {
    userId: string;
    channels: {
        [key in NotificationType]?: NotificationChannel[];
    };
    quietHours?: {
        enabled: boolean;
        start: string; // HH:MM format
        end: string;
    };
    digest?: {
        enabled: boolean;
        frequency: 'daily' | 'weekly';
        time: string; // HH:MM format
    };
    updatedAt: Date;
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    htmlBody: string;
    textBody: string;
    variables: string[]; // List of template variables
    category: NotificationType;
    createdAt: Date;
    updatedAt: Date;
}

// ==================== DEADLINE & SLA TYPES ====================

export interface Deadline {
    id: string;
    jobId: string;
    stageId?: string;
    type: DeadlineType;
    dueDate: Date;
    status: DeadlineStatus;
    escalationRules?: EscalationRule[];
    createdAt: Date;
    completedAt?: Date;
}

export type DeadlineType =
    | 'approval'
    | 'revision'
    | 'production'
    | 'delivery';

export type DeadlineStatus =
    | 'on-track'
    | 'at-risk'
    | 'overdue'
    | 'completed';

export interface EscalationRule {
    id: string;
    triggerOffset: number; // Hours before deadline
    action: 'notify' | 'reassign' | 'escalate';
    target: string; // User ID or role
    message?: string;
    executed: boolean;
    executedAt?: Date;
}

export interface SLA {
    id: string;
    customerId: string;
    name: string;
    rules: SLARule[];
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface SLARule {
    jobType: string;
    priority: number;
    targetDuration: number; // hours
    escalationPath: string[]; // User IDs
}

// ==================== ANALYTICS TYPES ====================

export interface WorkflowAnalytics {
    totalApprovals: number;
    approvalRate: number; // percentage
    averageApprovalTime: number; // hours
    rejectionRate: number;
    escalationRate: number;
    deadlineComplianceRate: number;
    byStage: {
        [stageName: string]: {
            count: number;
            averageTime: number;
            approvalRate: number;
        };
    };
    byApprover: {
        [userId: string]: {
            count: number;
            averageTime: number;
            approvalRate: number;
        };
    };
}

export interface QueueAnalytics {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    averageProcessingTime: number; // milliseconds
    averageQueueTime: number; // milliseconds
    successRate: number; // percentage
    byType: {
        [type in JobType]?: {
            count: number;
            averageTime: number;
            successRate: number;
        };
    };
}

// ==================== REPEAT JOB DETECTION TYPES ====================

export interface JobFingerprint {
    id: string;
    jobId: string;
    customerId: string;
    fileHash: string;
    fileName: string;
    fileSize: number;
    metadata: Record<string, any>;
    createdAt: Date;
}

export interface RepeatJobMatch {
    originalJobId: string;
    similarity: number; // 0-1
    matchedFields: string[];
    suggestedWorkflow?: string;
    suggestedApprovers?: string[];
}

// ==================== HELPER TYPES ====================

export interface ApprovalChainTemplate {
    id: string;
    name: string;
    description?: string;
    stages: Omit<ApprovalStage, 'id' | 'status' | 'approvals' | 'createdAt' | 'completedAt'>[];
    customerId?: string; // null for global templates
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WorkflowEvent {
    id: string;
    type: WorkflowEventType;
    jobId: string;
    userId?: string;
    data: Record<string, any>;
    timestamp: Date;
}

export type WorkflowEventType =
    | 'approval-created'
    | 'approval-started'
    | 'stage-completed'
    | 'approval-approved'
    | 'approval-rejected'
    | 'deadline-set'
    | 'deadline-approaching'
    | 'deadline-missed'
    | 'escalation-triggered'
    | 'job-queued'
    | 'job-started'
    | 'job-completed'
    | 'job-failed'
    | 'notification-sent';
