/**
 * Workflow and Approval System Type Definitions
 * Phase 2: Approval Workflow & Automation
 */
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
export type ApprovalChainStatus = 'pending' | 'in-progress' | 'approved' | 'rejected' | 'cancelled' | 'expired';
export interface ApprovalStage {
    id: string;
    name: string;
    description?: string;
    approvers: StageApprover[];
    requiredApprovals: number;
    allowPartialApproval: boolean;
    deadline?: Date;
    status: StageStatus;
    approvals: Approval[];
    conditions?: RoutingCondition[];
    createdAt: Date;
    completedAt?: Date;
}
export type StageStatus = 'pending' | 'in-progress' | 'approved' | 'rejected' | 'skipped';
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
export type ApprovalDecision = 'approved' | 'rejected' | 'partial' | 'conditional';
export interface RoutingCondition {
    id: string;
    type: ConditionType;
    field: string;
    operator: ConditionOperator;
    value: any;
    action: RoutingAction;
}
export type ConditionType = 'file-property' | 'customer-property' | 'time-based' | 'approval-based' | 'issue-based';
export type ConditionOperator = 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than' | 'in' | 'not-in';
export interface RoutingAction {
    type: 'assign' | 'skip' | 'notify' | 'escalate';
    target?: string;
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
export interface QueueJob {
    id: string;
    type: JobType;
    payload: any;
    priority: number;
    status: JobStatus;
    attempts: number;
    maxAttempts: number;
    error?: JobError;
    result?: any;
    progress?: number;
    dependencies?: string[];
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    estimatedDuration?: number;
    actualDuration?: number;
}
export type JobType = 'pdf-analysis' | 'pdf-fix' | 'email' | 'notification' | 'file-processing' | 'report-generation' | 'backup' | 'cleanup';
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'retrying';
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
export type NotificationType = 'proof-ready' | 'approval-request' | 'approval-approved' | 'approval-rejected' | 'reminder' | 'issue-detected' | 'revision-uploaded' | 'print-confirmation' | 'deadline-approaching' | 'deadline-passed' | 'escalation' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationChannel = 'in-app' | 'email' | 'sms' | 'push';
export interface NotificationPreferences {
    userId: string;
    channels: {
        [key in NotificationType]?: NotificationChannel[];
    };
    quietHours?: {
        enabled: boolean;
        start: string;
        end: string;
    };
    digest?: {
        enabled: boolean;
        frequency: 'daily' | 'weekly';
        time: string;
    };
    updatedAt: Date;
}
export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    htmlBody: string;
    textBody: string;
    variables: string[];
    category: NotificationType;
    createdAt: Date;
    updatedAt: Date;
}
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
export type DeadlineType = 'approval' | 'revision' | 'production' | 'delivery';
export type DeadlineStatus = 'on-track' | 'at-risk' | 'overdue' | 'completed';
export interface EscalationRule {
    id: string;
    triggerOffset: number;
    action: 'notify' | 'reassign' | 'escalate';
    target: string;
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
    targetDuration: number;
    escalationPath: string[];
}
export interface WorkflowAnalytics {
    totalApprovals: number;
    approvalRate: number;
    averageApprovalTime: number;
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
    averageProcessingTime: number;
    averageQueueTime: number;
    successRate: number;
    byType: {
        [type in JobType]?: {
            count: number;
            averageTime: number;
            successRate: number;
        };
    };
}
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
    similarity: number;
    matchedFields: string[];
    suggestedWorkflow?: string;
    suggestedApprovers?: string[];
}
export interface ApprovalChainTemplate {
    id: string;
    name: string;
    description?: string;
    stages: Omit<ApprovalStage, 'id' | 'status' | 'approvals' | 'createdAt' | 'completedAt'>[];
    customerId?: string;
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
export type WorkflowEventType = 'approval-created' | 'approval-started' | 'stage-completed' | 'approval-approved' | 'approval-rejected' | 'deadline-set' | 'deadline-approaching' | 'deadline-missed' | 'escalation-triggered' | 'job-queued' | 'job-started' | 'job-completed' | 'job-failed' | 'notification-sent';
//# sourceMappingURL=workflow-types.d.ts.map