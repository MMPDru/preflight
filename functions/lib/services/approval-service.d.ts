/**
 * Approval Service
 * Manages approval chains, stages, and decisions
 */
import { firestore } from 'firebase-admin';
import type { ApprovalChain, ApprovalStage, ApprovalDecision, RoutingCondition, WorkflowEvent } from '../types/workflow-types';
export declare class ApprovalService {
    private db;
    constructor(db: firestore.Firestore);
    /**
     * Create a new approval chain for a job
     */
    createApprovalChain(jobId: string, customerId: string, stages: Omit<ApprovalStage, 'id' | 'status' | 'approvals' | 'createdAt' | 'completedAt'>[]): Promise<ApprovalChain>;
    /**
     * Submit an approval decision
     */
    submitApproval(chainId: string, userId: string, userName: string, decision: ApprovalDecision, feedback?: string, partialApprovalPages?: number[]): Promise<ApprovalChain>;
    /**
     * Get pending approvals for a user
     */
    getPendingApprovals(userId: string): Promise<ApprovalChain[]>;
    /**
     * Get approval chain by ID
     */
    getApprovalChain(chainId: string): Promise<ApprovalChain | null>;
    /**
     * Get approval chain by job ID
     */
    getApprovalChainByJobId(jobId: string): Promise<ApprovalChain | null>;
    /**
     * Cancel an approval chain
     */
    cancelApprovalChain(chainId: string, reason?: string): Promise<void>;
    /**
     * Check and process deadline expiration
     */
    checkDeadlines(): Promise<void>;
    /**
     * Handle deadline expiration
     */
    private handleDeadlineExpired;
    /**
     * Notify stage approvers
     */
    private notifyStageApprovers;
    /**
     * Log workflow event
     */
    private logEvent;
    /**
     * Get approval history for a job
     */
    getApprovalHistory(jobId: string): Promise<WorkflowEvent[]>;
    /**
     * Evaluate routing conditions
     */
    evaluateConditions(conditions: RoutingCondition[], context: Record<string, any>): Promise<boolean>;
}
export declare const approvalService: ApprovalService;
//# sourceMappingURL=approval-service.d.ts.map