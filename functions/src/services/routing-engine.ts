/**
 * Routing Engine
 * Evaluates rules and automatically routes jobs to appropriate approvers
 */

import { firestore } from 'firebase-admin';
import type {
    RoutingRule,
    RoutingCondition,
    RoutingAction,
    RepeatJobMatch,
    JobFingerprint,
} from '../types/workflow-types';
import * as crypto from 'crypto';

export class RoutingEngine {
    private db: firestore.Firestore;

    constructor(db: firestore.Firestore) {
        this.db = db;
    }

    /**
     * Evaluate routing rules for a job
     */
    async evaluateRules(
        customerId: string,
        context: Record<string, any>
    ): Promise<RoutingAction[]> {
        // Get all enabled rules for customer (and global rules)
        const snapshot = await this.db
            .collection('routing-rules')
            .where('enabled', '==', true)
            .orderBy('priority', 'desc')
            .get();

        const actions: RoutingAction[] = [];

        for (const doc of snapshot.docs) {
            const rule = doc.data() as RoutingRule;

            // Check if rule applies to this customer
            if (rule.createdBy !== customerId && rule.createdBy !== 'global') {
                continue;
            }

            // Evaluate all conditions
            const conditionsMet = await this.evaluateConditions(rule.conditions, context);

            if (conditionsMet) {
                actions.push(...rule.actions);
            }
        }

        return actions;
    }

    /**
     * Evaluate routing conditions
     */
    private async evaluateConditions(
        conditions: RoutingCondition[],
        context: Record<string, any>
    ): Promise<boolean> {
        for (const condition of conditions) {
            const result = this.evaluateCondition(condition, context);
            if (!result) {
                return false; // All conditions must be true (AND logic)
            }
        }

        return true;
    }

    /**
     * Evaluate a single condition
     */
    private evaluateCondition(
        condition: RoutingCondition,
        context: Record<string, any>
    ): boolean {
        const fieldValue = this.getNestedValue(context, condition.field);

        switch (condition.operator) {
            case 'equals':
                return fieldValue === condition.value;
            case 'not-equals':
                return fieldValue !== condition.value;
            case 'contains':
                return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
            case 'greater-than':
                return Number(fieldValue) > Number(condition.value);
            case 'less-than':
                return Number(fieldValue) < Number(condition.value);
            case 'in':
                return Array.isArray(condition.value) && condition.value.includes(fieldValue);
            case 'not-in':
                return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
            default:
                return false;
        }
    }

    /**
     * Get nested object value by path
     */
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Create a routing rule
     */
    async createRule(rule: Omit<RoutingRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<RoutingRule> {
        const now = new Date();
        const id = this.db.collection('routing-rules').doc().id;

        const fullRule: RoutingRule = {
            ...rule,
            id,
            createdAt: now,
            updatedAt: now,
        };

        await this.db.collection('routing-rules').doc(id).set(fullRule);
        return fullRule;
    }

    /**
     * Update a routing rule
     */
    async updateRule(ruleId: string, updates: Partial<RoutingRule>): Promise<void> {
        await this.db.collection('routing-rules').doc(ruleId).update({
            ...updates,
            updatedAt: new Date(),
        });
    }

    /**
     * Delete a routing rule
     */
    async deleteRule(ruleId: string): Promise<void> {
        await this.db.collection('routing-rules').doc(ruleId).delete();
    }

    /**
     * Get all routing rules
     */
    async getRules(customerId?: string): Promise<RoutingRule[]> {
        let query = this.db.collection('routing-rules').orderBy('priority', 'desc');

        if (customerId) {
            query = query.where('createdBy', 'in', [customerId, 'global']);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => doc.data() as RoutingRule);
    }

    /**
     * Detect repeat jobs
     */
    async detectRepeatJob(
        customerId: string,
        fileName: string,
        fileBuffer: Buffer
    ): Promise<RepeatJobMatch | null> {
        // Calculate file hash
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

        // Look for similar jobs
        const snapshot = await this.db
            .collection('job-fingerprints')
            .where('customerId', '==', customerId)
            .where('fileHash', '==', fileHash)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const fingerprint = snapshot.docs[0].data() as JobFingerprint;

            return {
                originalJobId: fingerprint.jobId,
                similarity: 1.0, // Exact match
                matchedFields: ['fileHash'],
                suggestedWorkflow: fingerprint.metadata.workflowId,
                suggestedApprovers: fingerprint.metadata.approvers,
            };
        }

        // Check for similar file names
        const nameSnapshot = await this.db
            .collection('job-fingerprints')
            .where('customerId', '==', customerId)
            .where('fileName', '==', fileName)
            .limit(5)
            .get();

        if (!nameSnapshot.empty) {
            // Calculate similarity based on file size and metadata
            const matches = nameSnapshot.docs.map(doc => {
                const fp = doc.data() as JobFingerprint;
                const sizeDiff = Math.abs(fp.fileSize - fileBuffer.length);
                const similarity = 1 - (sizeDiff / Math.max(fp.fileSize, fileBuffer.length));

                return {
                    fingerprint: fp,
                    similarity,
                };
            });

            // Return best match if similarity > 0.8
            const bestMatch = matches.sort((a, b) => b.similarity - a.similarity)[0];

            if (bestMatch.similarity > 0.8) {
                return {
                    originalJobId: bestMatch.fingerprint.jobId,
                    similarity: bestMatch.similarity,
                    matchedFields: ['fileName', 'fileSize'],
                    suggestedWorkflow: bestMatch.fingerprint.metadata.workflowId,
                    suggestedApprovers: bestMatch.fingerprint.metadata.approvers,
                };
            }
        }

        return null;
    }

    /**
     * Create job fingerprint
     */
    async createFingerprint(
        jobId: string,
        customerId: string,
        fileName: string,
        fileBuffer: Buffer,
        metadata: Record<string, any>
    ): Promise<JobFingerprint> {
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

        const fingerprint: JobFingerprint = {
            id: this.db.collection('job-fingerprints').doc().id,
            jobId,
            customerId,
            fileHash,
            fileName,
            fileSize: fileBuffer.length,
            metadata,
            createdAt: new Date(),
        };

        await this.db.collection('job-fingerprints').doc(fingerprint.id).set(fingerprint);
        return fingerprint;
    }

    /**
     * Auto-assign approvers based on routing rules
     */
    async autoAssignApprovers(
        customerId: string,
        jobContext: Record<string, any>
    ): Promise<string[]> {
        const actions = await this.evaluateRules(customerId, jobContext);

        const approvers: string[] = [];

        for (const action of actions) {
            if (action.type === 'assign' && action.target) {
                approvers.push(action.target);
            }
        }

        return [...new Set(approvers)]; // Remove duplicates
    }
}

export const routingEngine = new RoutingEngine(firestore());
