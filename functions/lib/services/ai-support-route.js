"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportRouteAI = void 0;
exports.getAIService = getAIService;
const openai_1 = __importDefault(require("openai"));
class SupportRouteAI {
    constructor(apiKey) {
        this.openai = new openai_1.default({ apiKey });
    }
    /**
     * Recommend the best support channel based on issue analysis
     */
    async recommendRoute(request) {
        // Extract keywords and analyze complexity
        const analysis = await this.analyzeIssue(request.issue);
        // Score each route
        const scores = this.scoreRoutes(analysis, request.urgency, request.customerHistory);
        // Get AI recommendation
        const aiRecommendation = await this.getAIRecommendation(request, analysis);
        // Combine scores with AI recommendation
        const finalScores = this.combineScores(scores, aiRecommendation);
        // Sort and return
        const sortedRoutes = Object.entries(finalScores)
            .map(([route, score]) => ({ route, score: score }))
            .sort((a, b) => b.score - a.score);
        return {
            recommendedRoute: sortedRoutes[0].route,
            confidence: sortedRoutes[0].score,
            reasoning: aiRecommendation.reasoning,
            alternativeRoutes: sortedRoutes.slice(1).map(r => ({
                route: r.route,
                score: r.score,
                reason: this.getRouteReason(r.route, analysis)
            }))
        };
    }
    /**
     * Analyze issue complexity and extract keywords
     */
    async analyzeIssue(issue) {
        const prompt = `Analyze this support request and return JSON:
    
Request: "${issue}"

Return:
{
  "complexity": <1-10>,
  "keywords": ["keyword1", "keyword2"],
  "requiresVisual": <true/false>,
  "isUrgent": <true/false>,
  "sentiment": "positive|neutral|negative"
}`;
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3
        });
        return JSON.parse(response.choices[0].message.content || '{}');
    }
    /**
     * Score each support route based on analysis
     */
    scoreRoutes(analysis, urgency, history) {
        const scores = {
            'ai-chatbot': 0,
            'live-chat': 0,
            'co-browse': 0,
            'video-call': 0
        };
        // AI Chatbot scoring
        scores['ai-chatbot'] += (10 - analysis.complexity) * 10; // Simple issues
        if (!analysis.requiresVisual)
            scores['ai-chatbot'] += 20;
        if (urgency === 'low')
            scores['ai-chatbot'] += 15;
        if (analysis.keywords.some((k) => ['how', 'what', 'where'].includes(k.toLowerCase()))) {
            scores['ai-chatbot'] += 10;
        }
        // Live Chat scoring
        scores['live-chat'] += analysis.complexity * 5; // Moderate complexity
        if (urgency === 'medium')
            scores['live-chat'] += 20;
        if (!analysis.requiresVisual)
            scores['live-chat'] += 10;
        if (analysis.sentiment === 'negative')
            scores['live-chat'] += 15; // Human touch
        // Co-Browse/Screen Share scoring
        if (analysis.requiresVisual)
            scores['co-browse'] += 40;
        scores['co-browse'] += analysis.complexity * 7;
        if (urgency === 'high')
            scores['co-browse'] += 15;
        if (analysis.keywords.some((k) => ['screen', 'visual', 'show', 'see', 'display'].includes(k.toLowerCase()))) {
            scores['co-browse'] += 20;
        }
        // Video Call scoring
        if (urgency === 'critical')
            scores['video-call'] += 30;
        if (analysis.complexity >= 8)
            scores['video-call'] += 20;
        if (analysis.requiresVisual && analysis.complexity >= 7)
            scores['video-call'] += 25;
        if (analysis.sentiment === 'negative' && urgency !== 'low')
            scores['video-call'] += 15;
        // Apply historical preferences
        if (history?.preferredChannel) {
            scores[history.preferredChannel] += 15;
        }
        if (history?.successfulChannels) {
            history.successfulChannels.forEach(channel => {
                scores[channel] = (scores[channel] || 0) + 10;
            });
        }
        // Normalize scores to 0-1
        const maxScore = Math.max(...Object.values(scores));
        Object.keys(scores).forEach(key => {
            scores[key] = scores[key] / maxScore;
        });
        return scores;
    }
    /**
     * Get AI-powered recommendation
     */
    async getAIRecommendation(request, analysis) {
        const prompt = `You are a support routing expert. Recommend the best support channel for this request:

Issue: "${request.issue}"
Urgency: ${request.urgency}
Complexity: ${analysis.complexity}/10
Requires Visual: ${analysis.requiresVisual}
Sentiment: ${analysis.sentiment}

Available channels:
1. AI Chatbot - Instant, best for simple questions (85% success rate)
2. Live Chat - <2 min wait, human agent via text (92% success rate)
3. Screen Share - <5 min wait, visual co-browsing (95% success rate)
4. Video Call - <10 min wait, face-to-face support (98% success rate)

Recommend ONE channel and explain why. Return JSON:
{
  "route": "ai-chatbot|live-chat|co-browse|video-call",
  "reasoning": "detailed explanation",
  "confidence": <0-1>
}`;
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.5
        });
        return JSON.parse(response.choices[0].message.content || '{}');
    }
    /**
     * Combine algorithmic scores with AI recommendation
     */
    combineScores(algorithmicScores, aiRecommendation) {
        const combined = {};
        Object.keys(algorithmicScores).forEach(route => {
            // Weight: 60% algorithmic, 40% AI
            const algorithmicWeight = algorithmicScores[route] * 0.6;
            const aiWeight = (route === aiRecommendation.route ? aiRecommendation.confidence : 0.3) * 0.4;
            combined[route] = algorithmicWeight + aiWeight;
        });
        return combined;
    }
    /**
     * Get reason for route score
     */
    getRouteReason(route, analysis) {
        const reasons = {
            'ai-chatbot': `Low complexity (${analysis.complexity}/10), instant response available`,
            'live-chat': `Moderate complexity, human touch beneficial`,
            'co-browse': `Visual assistance ${analysis.requiresVisual ? 'required' : 'helpful'}`,
            'video-call': `High complexity (${analysis.complexity}/10), face-to-face support optimal`
        };
        return reasons[route] || 'Alternative option';
    }
    /**
     * Analyze sentiment of message
     */
    async analyzeSentiment(message) {
        const prompt = `Analyze the sentiment and emotions in this message:

"${message}"

Return JSON:
{
  "sentiment": "positive|neutral|negative",
  "score": <0-1>,
  "emotions": {
    "joy": <0-1>,
    "anger": <0-1>,
    "frustration": <0-1>,
    "satisfaction": <0-1>
  },
  "urgencyLevel": <1-10>
}`;
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3
        });
        return JSON.parse(response.choices[0].message.content || '{}');
    }
    /**
     * Auto-categorize support request
     */
    async categorize(issue) {
        const prompt = `Categorize this support request:

"${issue}"

Categories:
- approval: Customer wants to approve/sign off
- revision: Customer needs changes/fixes
- question: Customer has a question
- urgent: Time-sensitive issue
- technical: Technical problem/error
- general: General inquiry

Return JSON:
{
  "category": "<category>",
  "confidence": <0-1>,
  "subcategories": ["sub1", "sub2"]
}`;
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.3
        });
        return JSON.parse(response.choices[0].message.content || '{}');
    }
    /**
     * Generate suggested responses
     */
    async generateSuggestions(context, messageHistory) {
        const prompt = `Given this conversation context and history, suggest 3 helpful response options:

Context: ${context}

Recent messages:
${messageHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Generate 3 short, helpful responses (max 50 words each). Return as JSON array:
["response1", "response2", "response3"]`;
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 200
        });
        const result = JSON.parse(response.choices[0].message.content || '{}');
        return result.suggestions || [];
    }
}
exports.SupportRouteAI = SupportRouteAI;
// Export singleton instance
let aiService = null;
function getAIService(apiKey) {
    if (!aiService) {
        const key = apiKey || process.env.OPENAI_API_KEY;
        if (!key) {
            throw new Error('OpenAI API key not provided');
        }
        aiService = new SupportRouteAI(key);
    }
    return aiService;
}
//# sourceMappingURL=ai-support-route.js.map