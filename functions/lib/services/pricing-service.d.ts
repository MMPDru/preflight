/**
 * Pricing Service
 * Manages pricing rules, quote generation, and price calculation
 */
import { firestore } from 'firebase-admin';
import type { PricingRule, Quote } from '../types/admin-types';
export declare class PricingService {
    private db;
    constructor(db: firestore.Firestore);
    /**
     * Create pricing rule
     */
    createRule(rule: Omit<PricingRule, 'id' | 'createdAt'>): Promise<PricingRule>;
    /**
     * Get all pricing rules
     */
    getRules(filters?: {
        type?: string;
        enabled?: boolean;
    }): Promise<PricingRule[]>;
    /**
     * Update pricing rule
     */
    updateRule(ruleId: string, updates: Partial<PricingRule>): Promise<void>;
    /**
     * Delete pricing rule
     */
    deleteRule(ruleId: string): Promise<void>;
    /**
     * Evaluate pricing conditions
     */
    private evaluateCondition;
    /**
     * Find applicable pricing rules
     */
    findApplicableRules(context: Record<string, any>): Promise<PricingRule[]>;
    /**
     * Calculate price for a job
     */
    calculatePrice(context: {
        customerId?: string;
        pageCount: number;
        jobType?: string;
        priority?: string;
        quantity?: number;
    }): Promise<{
        basePrice: number;
        appliedRules: PricingRule[];
        total: number;
    }>;
    /**
     * Generate quote for a job
     */
    generateQuote(jobId: string, customerId: string, items: Array<{
        description: string;
        quantity: number;
        context: Record<string, any>;
    }>, validDays?: number): Promise<Quote>;
    /**
     * Get quote by ID
     */
    getQuote(quoteId: string): Promise<Quote | null>;
    /**
     * Update quote status
     */
    updateQuoteStatus(quoteId: string, status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'): Promise<void>;
    /**
     * Get quotes for customer
     */
    getCustomerQuotes(customerId: string): Promise<Quote[]>;
    /**
     * Initialize default pricing rules
     */
    initializeDefaultRules(): Promise<void>;
}
//# sourceMappingURL=pricing-service.d.ts.map