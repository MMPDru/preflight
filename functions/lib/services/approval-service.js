"use strict";
/**
 * Approval Service
 * Manages approval chains, stages, and decisions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalService = void 0;
class ApprovalService {
    constructor(db) {
        this.db = db;
    }
    /**
     * Create a new approval chain for a job
     */
    async createApprovalChain(jobId, customerId, stages) {
        const now = new Date();
        const approvalStages = stages.map((stage, index) => ({
            ...stage,
            id: `stage-${index + 1}`,
            status: index === 0 ? 'in-progress' : 'pending',
            approvals: [],
            createdAt: now,
        }));
        const chain = {
            id: this.db.collection('approval-chains').doc().id,
            jobId,
            customerId,
            stages: approvalStages,
            currentStageIndex: 0,
            status: 'in-progress',
            createdAt: now,
            updatedAt: now,
        };
        await this.db.collection('approval-chains').doc(chain.id).set(chain);
        // Log event
        await this.logEvent({
            id: this.db.collection('workflow-events').doc().id,
            type: 'approval-created',
            jobId,
            data: { chainId: chain.id, stageCount: stages.length },
            timestamp: now,
        });
        // Notify approvers of first stage
        await this.notifyStageApprovers(chain.id, 0);
        return chain;
    }
    /**
     * Submit an approval decision
     */
    async submitApproval(chainId, userId, userName, decision, feedback, partialApprovalPages) {
        const chainRef = this.db.collection('approval-chains').doc(chainId);
        const chainDoc = await chainRef.get();
        if (!chainDoc.exists) {
            throw new Error('Approval chain not found');
        }
        const chain = chainDoc.data();
        const currentStage = chain.stages[chain.currentStageIndex];
        // Check if user is authorized to approve
        const isAuthorized = currentStage.approvers.some(a => a.userId === userId);
        if (!isAuthorized) {
            throw new Error('User not authorized to approve this stage');
        }
        // Check if user already approved
        const alreadyApproved = currentStage.approvals.some(a => a.userId === userId);
        if (alreadyApproved) {
            throw new Error('User has already submitted an approval for this stage');
        }
        // Create approval record
        const approval = {
            id: this.db.collection('approvals').doc().id,
            userId,
            userName,
            decision,
            feedback,
            timestamp: new Date(),
            partialApprovalPages,
        };
        // Add approval to stage
        currentStage.approvals.push(approval);
        // Check if stage is complete
        const approvalCount = currentStage.approvals.filter(a => a.decision === 'approved' || a.decision === 'partial').length;
        const rejectionCount = currentStage.approvals.filter(a => a.decision === 'rejected').length;
        // Update stage status
        if (rejectionCount > 0) {
            // Any rejection fails the stage
            currentStage.status = 'rejected';
            chain.status = 'rejected';
            chain.completedAt = new Date();
        }
        else if (approvalCount >= currentStage.requiredApprovals) {
            // Stage approved
            currentStage.status = 'approved';
            currentStage.completedAt = new Date();
            // Move to next stage or complete chain
            if (chain.currentStageIndex < chain.stages.length - 1) {
                chain.currentStageIndex++;
                chain.stages[chain.currentStageIndex].status = 'in-progress';
                await this.notifyStageApprovers(chainId, chain.currentStageIndex);
            }
            else {
                // All stages complete
                chain.status = 'approved';
                chain.completedAt = new Date();
            }
        }
        chain.updatedAt = new Date();
        // Save updated chain
        await chainRef.update({
            stages: chain.stages,
            currentStageIndex: chain.currentStageIndex,
            status: chain.status,
            updatedAt: chain.updatedAt,
            completedAt: chain.completedAt,
        });
        // Log event
        await this.logEvent({
            id: this.db.collection('workflow-events').doc().id,
            type: decision === 'approved' ? 'approval-approved' : 'approval-rejected',
            jobId: chain.jobId,
            userId,
            data: {
                chainId,
                stageIndex: chain.currentStageIndex,
                decision,
                feedback,
            },
            timestamp: new Date(),
        });
        return chain;
    }
    /**
     * Get pending approvals for a user
     */
    async getPendingApprovals(userId) {
        const snapshot = await this.db
            .collection('approval-chains')
            .where('status', '==', 'in-progress')
            .get();
        const chains = [];
        snapshot.forEach(doc => {
            const chain = doc.data();
            const currentStage = chain.stages[chain.currentStageIndex];
            // Check if user is an approver for current stage
            const isApprover = currentStage.approvers.some(a => a.userId === userId);
            const hasApproved = currentStage.approvals.some(a => a.userId === userId);
            if (isApprover && !hasApproved) {
                chains.push(chain);
            }
        });
        return chains;
    }
    /**
     * Get approval chain by ID
     */
    async getApprovalChain(chainId) {
        const doc = await this.db.collection('approval-chains').doc(chainId).get();
        return doc.exists ? doc.data() : null;
    }
    /**
     * Get approval chain by job ID
     */
    async getApprovalChainByJobId(jobId) {
        const snapshot = await this.db
            .collection('approval-chains')
            .where('jobId', '==', jobId)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return null;
        }
        return snapshot.docs[0].data();
    }
    /**
     * Cancel an approval chain
     */
    async cancelApprovalChain(chainId, reason) {
        const chainRef = this.db.collection('approval-chains').doc(chainId);
        const chainDoc = await chainRef.get();
        if (!chainDoc.exists) {
            throw new Error('Approval chain not found');
        }
        const chain = chainDoc.data();
        await chainRef.update({
            status: 'cancelled',
            updatedAt: new Date(),
            completedAt: new Date(),
            metadata: {
                ...chain.metadata,
                cancellationReason: reason,
            },
        });
        await this.logEvent({
            id: this.db.collection('workflow-events').doc().id,
            type: 'approval-rejected',
            jobId: chain.jobId,
            data: { chainId, reason },
            timestamp: new Date(),
        });
    }
    /**
     * Check and process deadline expiration
     */
    async checkDeadlines() {
        const now = new Date();
        const snapshot = await this.db
            .collection('approval-chains')
            .where('status', '==', 'in-progress')
            .get();
        for (const doc of snapshot.docs) {
            const chain = doc.data();
            const currentStage = chain.stages[chain.currentStageIndex];
            if (currentStage.deadline && currentStage.deadline < now) {
                // Deadline expired
                await this.handleDeadlineExpired(chain.id, chain.currentStageIndex);
            }
        }
    }
    /**
     * Handle deadline expiration
     */
    async handleDeadlineExpired(chainId, stageIndex) {
        // Log event
        await this.logEvent({
            id: this.db.collection('workflow-events').doc().id,
            type: 'deadline-missed',
            jobId: chainId,
            data: { chainId, stageIndex },
            timestamp: new Date(),
        });
        // Trigger escalation (would integrate with notification service)
        // For now, just log
        console.log(`Deadline expired for chain ${chainId}, stage ${stageIndex}`);
    }
    /**
     * Notify stage approvers
     */
    async notifyStageApprovers(chainId, stageIndex) {
        const chain = await this.getApprovalChain(chainId);
        if (!chain)
            return;
        const stage = chain.stages[stageIndex];
        // Mark approvers as notified
        for (const approver of stage.approvers) {
            approver.notified = true;
            approver.notifiedAt = new Date();
        }
        await this.db.collection('approval-chains').doc(chainId).update({
            stages: chain.stages,
            updatedAt: new Date(),
        });
        // Would integrate with notification service here
        console.log(`Notified approvers for chain ${chainId}, stage ${stageIndex}`);
    }
    /**
     * Log workflow event
     */
    async logEvent(event) {
        await this.db.collection('workflow-events').doc(event.id).set(event);
    }
    /**
     * Get approval history for a job
     */
    async getApprovalHistory(jobId) {
        const snapshot = await this.db
            .collection('workflow-events')
            .where('jobId', '==', jobId)
            .orderBy('timestamp', 'desc')
            .get();
        return snapshot.docs.map(doc => doc.data());
    }
    /**
     * Evaluate routing conditions
     */
    async evaluateConditions(conditions, context) {
        for (const condition of conditions) {
            const fieldValue = context[condition.field];
            let result = false;
            switch (condition.operator) {
                case 'equals':
                    result = fieldValue === condition.value;
                    break;
                case 'not-equals':
                    result = fieldValue !== condition.value;
                    break;
                case 'contains':
                    result = String(fieldValue).includes(String(condition.value));
                    break;
                case 'greater-than':
                    result = fieldValue > condition.value;
                    break;
                case 'less-than':
                    result = fieldValue < condition.value;
                    break;
                case 'in':
                    result = Array.isArray(condition.value) && condition.value.includes(fieldValue);
                    break;
                case 'not-in':
                    result = Array.isArray(condition.value) && !condition.value.includes(fieldValue);
                    break;
            }
            if (!result) {
                return false; // All conditions must be true
            }
        }
        return true;
    }
}
exports.ApprovalService = ApprovalService;
//# sourceMappingURL=approval-service.js.map