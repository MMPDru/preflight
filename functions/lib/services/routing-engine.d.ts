/**
 * Routing Engine
 * Evaluates rules and automatically routes jobs to appropriate approvers
 */
import { firestore } from 'firebase-admin';
import type { RoutingRule, RoutingAction, RepeatJobMatch, JobFingerprint } from '../types/workflow-types';
export declare class RoutingEngine {
    private db;
    constructor(db: firestore.Firestore);
    /**
     * Evaluate routing rules for a job
     */
    evaluateRules(customerId: string, context: Record<string, any>): Promise<RoutingAction[]>;
    /**
     * Evaluate routing conditions
     */
    private evaluateConditions;
    /**
     * Evaluate a single condition
     */
    private evaluateCondition;
    /**
     * Get nested object value by path
     */
    private getNestedValue;
    /**
     * Create a routing rule
     */
    createRule(rule: Omit<RoutingRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoutingRule>;
    /**
     * Update a routing rule
     */
    updateRule(ruleId: string, updates: Partial<RoutingRule>): Promise<void>;
    /**
     * Delete a routing rule
     */
    deleteRule(ruleId: string): Promise<void>;
    /**
     * Get all routing rules
     */
    getRules(customerId?: string): Promise<RoutingRule[]>;
    /**
     * Detect repeat jobs
     */
    detectRepeatJob(customerId: string, fileName: string, fileBuffer: Buffer): Promise<RepeatJobMatch | null>;
    /**
     * Create job fingerprint
     */
    createFingerprint(jobId: string, customerId: string, fileName: string, fileBuffer: Buffer, metadata: Record<string, any>): Promise<JobFingerprint>;
    /**
     * Auto-assign approvers based on routing rules
     */
    autoAssignApprovers(customerId: string, jobContext: Record<string, any>): Promise<string[]>;
}
//# sourceMappingURL=routing-engine.d.ts.map