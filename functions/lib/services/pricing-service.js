"use strict";
/**
 * Pricing Service
 * Manages pricing rules, quote generation, and price calculation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingService = void 0;
class PricingService {
    constructor(db) {
        this.db = db;
    }
    /**
     * Create pricing rule
     */
    async createRule(rule) {
        const id = this.db.collection('pricing-rules').doc().id;
        const fullRule = {
            ...rule,
            id,
            createdAt: new Date(),
        };
        await this.db.collection('pricing-rules').doc(id).set(fullRule);
        return fullRule;
    }
    /**
     * Get all pricing rules
     */
    async getRules(filters) {
        let query = this.db.collection('pricing-rules').orderBy('priority', 'desc');
        if (filters?.type) {
            query = query.where('type', '==', filters.type);
        }
        if (filters?.enabled !== undefined) {
            query = query.where('enabled', '==', filters.enabled);
        }
        const snapshot = await query.get();
        return snapshot.docs.map(doc => doc.data());
    }
    /**
     * Update pricing rule
     */
    async updateRule(ruleId, updates) {
        await this.db.collection('pricing-rules').doc(ruleId).update(updates);
    }
    /**
     * Delete pricing rule
     */
    async deleteRule(ruleId) {
        await this.db.collection('pricing-rules').doc(ruleId).delete();
    }
    /**
     * Evaluate pricing conditions
     */
    evaluateCondition(condition, context) {
        const value = context[condition.field];
        if (value === undefined) {
            return false;
        }
        switch (condition.operator) {
            case 'equals':
                return value === condition.value;
            case 'greater-than':
                return value > condition.value;
            case 'less-than':
                return value < condition.value;
            case 'in':
                return Array.isArray(condition.value) && condition.value.includes(value);
            case 'between':
                return Array.isArray(condition.value) &&
                    value >= condition.value[0] &&
                    value <= condition.value[1];
            default:
                return false;
        }
    }
    /**
     * Find applicable pricing rules
     */
    async findApplicableRules(context) {
        const allRules = await this.getRules({ enabled: true });
        const applicableRules = [];
        for (const rule of allRules) {
            // Check if rule is within valid date range
            if (rule.validFrom && new Date(rule.validFrom) > new Date()) {
                continue;
            }
            if (rule.validUntil && new Date(rule.validUntil) < new Date()) {
                continue;
            }
            // Check all conditions
            const allConditionsMet = rule.conditions.every(condition => this.evaluateCondition(condition, context));
            if (allConditionsMet) {
                applicableRules.push(rule);
            }
        }
        // Sort by priority (highest first)
        return applicableRules.sort((a, b) => b.priority - a.priority);
    }
    /**
     * Calculate price for a job
     */
    async calculatePrice(context) {
        const applicableRules = await this.findApplicableRules(context);
        let basePrice = 0;
        const appliedRules = [];
        // Apply base pricing rule first
        const baseRule = applicableRules.find(r => r.type === 'base');
        if (baseRule) {
            if (baseRule.unit === 'page') {
                basePrice = baseRule.price * (context.pageCount || 1);
            }
            else if (baseRule.unit === 'job') {
                basePrice = baseRule.price;
            }
            appliedRules.push(baseRule);
        }
        // Apply volume discounts
        const volumeRules = applicableRules.filter(r => r.type === 'volume');
        for (const rule of volumeRules) {
            if (rule.unit === 'percentage') {
                basePrice = basePrice * (1 - rule.price / 100);
            }
            else {
                basePrice -= rule.price;
            }
            appliedRules.push(rule);
        }
        // Apply customer-specific pricing
        const customerRules = applicableRules.filter(r => r.type === 'customer');
        for (const rule of customerRules) {
            if (rule.unit === 'percentage') {
                basePrice = basePrice * (1 - rule.price / 100);
            }
            else {
                basePrice -= rule.price;
            }
            appliedRules.push(rule);
        }
        // Apply add-ons and surcharges
        const addonRules = applicableRules.filter(r => r.type === 'addon' || r.type === 'surcharge');
        for (const rule of addonRules) {
            if (rule.unit === 'percentage') {
                basePrice = basePrice * (1 + rule.price / 100);
            }
            else {
                basePrice += rule.price;
            }
            appliedRules.push(rule);
        }
        return {
            basePrice,
            appliedRules,
            total: Math.max(0, basePrice), // Ensure non-negative
        };
    }
    /**
     * Generate quote for a job
     */
    async generateQuote(jobId, customerId, items, validDays = 30) {
        const quoteItems = [];
        const discounts = [];
        let subtotal = 0;
        // Calculate price for each item
        for (const item of items) {
            const pricing = await this.calculatePrice({
                pageCount: 1, // Default to 1 page
                ...item.context,
                customerId,
            });
            const itemTotal = pricing.total * item.quantity;
            subtotal += itemTotal;
            quoteItems.push({
                id: this.db.collection('quotes').doc().id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: pricing.total,
                total: itemTotal,
                appliedRules: pricing.appliedRules.map(r => r.id),
            });
            // Track discounts
            const discountRules = pricing.appliedRules.filter(r => r.type === 'discount' || r.type === 'volume' || r.type === 'customer');
            for (const rule of discountRules) {
                discounts.push({
                    id: this.db.collection('quotes').doc().id,
                    description: rule.name,
                    amount: rule.price,
                    type: rule.unit === 'percentage' ? 'percentage' : 'fixed',
                    ruleId: rule.id,
                });
            }
        }
        // Calculate tax (example: 8%)
        const tax = subtotal * 0.08;
        const total = subtotal + tax;
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + validDays);
        const quote = {
            id: this.db.collection('quotes').doc().id,
            jobId,
            customerId,
            items: quoteItems,
            subtotal,
            discounts,
            tax,
            total,
            status: 'draft',
            validUntil,
            createdAt: new Date(),
        };
        await this.db.collection('quotes').doc(quote.id).set(quote);
        return quote;
    }
    /**
     * Get quote by ID
     */
    async getQuote(quoteId) {
        const doc = await this.db.collection('quotes').doc(quoteId).get();
        return doc.exists ? doc.data() : null;
    }
    /**
     * Update quote status
     */
    async updateQuoteStatus(quoteId, status) {
        const updates = { status };
        if (status === 'accepted') {
            updates.acceptedAt = new Date();
        }
        await this.db.collection('quotes').doc(quoteId).update(updates);
    }
    /**
     * Get quotes for customer
     */
    async getCustomerQuotes(customerId) {
        const snapshot = await this.db
            .collection('quotes')
            .where('customerId', '==', customerId)
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => doc.data());
    }
    /**
     * Initialize default pricing rules
     */
    async initializeDefaultRules() {
        const defaultRules = [
            {
                name: 'Base Page Price',
                description: 'Standard price per page',
                type: 'base',
                conditions: [],
                price: 0.50,
                unit: 'page',
                priority: 100,
                enabled: true,
                createdBy: 'system',
            },
            {
                name: 'Volume Discount - 100+ pages',
                description: '10% discount for jobs over 100 pages',
                type: 'volume',
                conditions: [
                    { field: 'pageCount', operator: 'greater-than', value: 100 },
                ],
                price: 10,
                unit: 'percentage',
                priority: 50,
                enabled: true,
                createdBy: 'system',
            },
            {
                name: 'Rush Fee',
                description: '50% surcharge for rush jobs',
                type: 'surcharge',
                conditions: [
                    { field: 'priority', operator: 'equals', value: 'rush' },
                ],
                price: 50,
                unit: 'percentage',
                priority: 75,
                enabled: true,
                createdBy: 'system',
            },
        ];
        for (const rule of defaultRules) {
            await this.createRule(rule);
        }
    }
}
exports.PricingService = PricingService;
//# sourceMappingURL=pricing-service.js.map