"use strict";
/**
 * Routing Engine
 * Evaluates rules and automatically routes jobs to appropriate approvers
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.routingEngine = exports.RoutingEngine = void 0;
const firebase_admin_1 = require("firebase-admin");
const crypto = __importStar(require("crypto"));
class RoutingEngine {
    constructor(db) {
        this.db = db;
    }
    /**
     * Evaluate routing rules for a job
     */
    async evaluateRules(customerId, context) {
        // Get all enabled rules for customer (and global rules)
        const snapshot = await this.db
            .collection('routing-rules')
            .where('enabled', '==', true)
            .orderBy('priority', 'desc')
            .get();
        const actions = [];
        for (const doc of snapshot.docs) {
            const rule = doc.data();
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
    async evaluateConditions(conditions, context) {
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
    evaluateCondition(condition, context) {
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
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    /**
     * Create a routing rule
     */
    async createRule(rule) {
        const now = new Date();
        const id = this.db.collection('routing-rules').doc().id;
        const fullRule = {
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
    async updateRule(ruleId, updates) {
        await this.db.collection('routing-rules').doc(ruleId).update({
            ...updates,
            updatedAt: new Date(),
        });
    }
    /**
     * Delete a routing rule
     */
    async deleteRule(ruleId) {
        await this.db.collection('routing-rules').doc(ruleId).delete();
    }
    /**
     * Get all routing rules
     */
    async getRules(customerId) {
        let query = this.db.collection('routing-rules').orderBy('priority', 'desc');
        if (customerId) {
            query = query.where('createdBy', 'in', [customerId, 'global']);
        }
        const snapshot = await query.get();
        return snapshot.docs.map(doc => doc.data());
    }
    /**
     * Detect repeat jobs
     */
    async detectRepeatJob(customerId, fileName, fileBuffer) {
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
            const fingerprint = snapshot.docs[0].data();
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
                const fp = doc.data();
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
    async createFingerprint(jobId, customerId, fileName, fileBuffer, metadata) {
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        const fingerprint = {
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
    async autoAssignApprovers(customerId, jobContext) {
        const actions = await this.evaluateRules(customerId, jobContext);
        const approvers = [];
        for (const action of actions) {
            if (action.type === 'assign' && action.target) {
                approvers.push(action.target);
            }
        }
        return [...new Set(approvers)]; // Remove duplicates
    }
}
exports.RoutingEngine = RoutingEngine;
exports.routingEngine = new RoutingEngine((0, firebase_admin_1.firestore)());
//# sourceMappingURL=routing-engine.js.map