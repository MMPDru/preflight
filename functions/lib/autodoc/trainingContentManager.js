"use strict";
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
exports.trainingManager = exports.TrainingContentManager = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const db = admin.firestore();
class TrainingContentManager {
    /**
     * Update training materials based on documentation
     */
    async updateTrainingMaterials(doc, component) {
        // Update video scripts
        await this.generateVideoScriptTrigger(component, doc);
        // Update help tooltips
        await this.updateHelpTooltips(component, doc);
        // Update chatbot responses
        await this.updateChatbotKnowledge(component, doc);
        // Update interactive tutorials
        await this.updateInteractiveTutorials(component, doc);
        // Update knowledge base
        await this.updateKnowledgeBase(component, doc);
    }
    /**
     * Trigger video script generation
     */
    async generateVideoScriptTrigger(component, doc) {
        const videoId = `${component.toLowerCase()}-${Date.now()}`;
        const update = {
            videoId,
            title: `How to Use ${component}`,
            script: {
                title: `How to Use ${component}`,
                duration: '5:00',
                voiceoverText: doc.stepByStepGuide,
                screenActions: [],
                highlights: [],
                callToAction: 'Try it yourself in the app!',
            },
            status: 'pending',
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        };
        await db.collection('training-updates').doc(videoId).set(update);
    }
    /**
     * Update help tooltips
     */
    async updateHelpTooltips(component, doc) {
        const tooltipUpdate = {
            component,
            tooltipId: `${component}-help`,
            content: doc.featureDescription,
            priority: 'medium',
        };
        await db.collection('help-tooltips').doc(tooltipUpdate.tooltipId).set(tooltipUpdate);
    }
    /**
     * Update chatbot knowledge base
     */
    async updateChatbotKnowledge(component, doc) {
        const knowledge = {
            component,
            questions: [
                `How do I use ${component}?`,
                `What is ${component}?`,
                `${component} not working`,
            ],
            answer: doc.featureDescription,
            steps: doc.stepByStepGuide,
            updatedAt: firestore_1.Timestamp.now(),
        };
        await db.collection('chatbot-knowledge').doc(component.toLowerCase()).set(knowledge);
    }
    /**
     * Update interactive tutorials
     */
    async updateInteractiveTutorials(component, doc) {
        const tutorial = {
            component,
            title: `${component} Tutorial`,
            steps: doc.stepByStepGuide.map((step, index) => ({
                id: `step-${index + 1}`,
                title: step,
                description: '',
                action: 'click',
                target: '',
            })),
            difficulty: 'beginner',
            estimatedTime: '5 minutes',
            updatedAt: firestore_1.Timestamp.now(),
        };
        await db.collection('interactive-tutorials').doc(component.toLowerCase()).set(tutorial);
    }
    /**
     * Update knowledge base articles
     */
    async updateKnowledgeBase(component, doc) {
        const article = {
            component,
            title: `${component} Guide`,
            content: doc.featureDescription,
            steps: doc.stepByStepGuide,
            apiDocs: doc.apiDocumentation,
            bestPractices: doc.bestPractices,
            changeLog: doc.changeLog,
            migrationGuide: doc.migrationGuide,
            category: 'features',
            tags: [component.toLowerCase(), 'guide', 'tutorial'],
            publishedAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
        };
        await db.collection('knowledge-base').doc(component.toLowerCase()).set(article);
    }
    /**
     * Notify training team of pending videos
     */
    async notifyTrainingTeam(updates) {
        const notification = {
            type: 'training-updates',
            title: 'New Training Videos Needed',
            message: `${updates.length} new training videos need to be recorded`,
            videos: updates.map(u => ({
                id: u.videoId,
                title: u.title,
                status: u.status,
            })),
            createdAt: firestore_1.Timestamp.now(),
            recipients: ['training-team@company.com'],
        };
        await db.collection('notifications').add(notification);
    }
    /**
     * Get pending training updates
     */
    async getPendingUpdates() {
        const snapshot = await db.collection('training-updates')
            .where('status', '==', 'pending')
            .get();
        return snapshot.docs.map(doc => doc.data());
    }
    /**
     * Mark training update as completed
     */
    async markAsCompleted(videoId, videoUrl) {
        await db.collection('training-updates').doc(videoId).update({
            status: 'published',
            videoUrl,
            updatedAt: firestore_1.Timestamp.now(),
        });
        // Also update the main training videos collection
        await db.collection('training-videos').doc(videoId).set({
            id: videoId,
            videoUrl,
            publishedAt: firestore_1.Timestamp.now(),
        }, { merge: true });
    }
}
exports.TrainingContentManager = TrainingContentManager;
exports.trainingManager = new TrainingContentManager();
//# sourceMappingURL=trainingContentManager.js.map