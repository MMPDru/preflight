export interface SupportRequest {
    issue: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    customerHistory?: {
        previousIssues: string[];
        preferredChannel?: string;
        successfulChannels: string[];
    };
}
export interface RouteRecommendation {
    recommendedRoute: 'ai-chatbot' | 'live-chat' | 'co-browse' | 'video-call';
    confidence: number;
    reasoning: string;
    alternativeRoutes: Array<{
        route: string;
        score: number;
        reason: string;
    }>;
}
export declare class SupportRouteAI {
    private openai;
    constructor(apiKey: string);
    /**
     * Recommend the best support channel based on issue analysis
     */
    recommendRoute(request: SupportRequest): Promise<RouteRecommendation>;
    /**
     * Analyze issue complexity and extract keywords
     */
    private analyzeIssue;
    /**
     * Score each support route based on analysis
     */
    private scoreRoutes;
    /**
     * Get AI-powered recommendation
     */
    private getAIRecommendation;
    /**
     * Combine algorithmic scores with AI recommendation
     */
    private combineScores;
    /**
     * Get reason for route score
     */
    private getRouteReason;
    /**
     * Analyze sentiment of message
     */
    analyzeSentiment(message: string): Promise<{
        sentiment: 'positive' | 'neutral' | 'negative';
        score: number;
        emotions: {
            joy: number;
            anger: number;
            frustration: number;
            satisfaction: number;
        };
        urgencyLevel: number;
    }>;
    /**
     * Auto-categorize support request
     */
    categorize(issue: string): Promise<{
        category: 'approval' | 'revision' | 'question' | 'urgent' | 'technical' | 'general';
        confidence: number;
        subcategories: string[];
    }>;
    /**
     * Generate suggested responses
     */
    generateSuggestions(context: string, messageHistory: Array<{
        role: string;
        content: string;
    }>): Promise<string[]>;
}
export declare function getAIService(apiKey?: string): SupportRouteAI;
//# sourceMappingURL=ai-support-route.d.ts.map