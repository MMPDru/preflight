import { DocumentationOutput, TrainingScript } from './documentationGenerator';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const db = admin.firestore();

export interface TrainingUpdate {
    videoId: string;
    title: string;
    script: TrainingScript;
    status: 'pending' | 'recorded' | 'published';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface HelpTooltipUpdate {
    component: string;
    tooltipId: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
}

export class TrainingContentManager {
    /**
     * Update training materials based on documentation
     */
    async updateTrainingMaterials(doc: DocumentationOutput, component: string): Promise<void> {
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
    private async generateVideoScriptTrigger(component: string, doc: DocumentationOutput): Promise<void> {
        const videoId = `${component.toLowerCase()}-${Date.now()}`;

        const update: TrainingUpdate = {
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
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        await db.collection('training-updates').doc(videoId).set(update);
    }

    /**
     * Update help tooltips
     */
    private async updateHelpTooltips(component: string, doc: DocumentationOutput): Promise<void> {
        const tooltipUpdate: HelpTooltipUpdate = {
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
    private async updateChatbotKnowledge(component: string, doc: DocumentationOutput): Promise<void> {
        const knowledge = {
            component,
            questions: [
                `How do I use ${component}?`,
                `What is ${component}?`,
                `${component} not working`,
            ],
            answer: doc.featureDescription,
            steps: doc.stepByStepGuide,
            updatedAt: Timestamp.now(),
        };

        await db.collection('chatbot-knowledge').doc(component.toLowerCase()).set(knowledge);
    }

    /**
     * Update interactive tutorials
     */
    private async updateInteractiveTutorials(component: string, doc: DocumentationOutput): Promise<void> {
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
            updatedAt: Timestamp.now(),
        };

        await db.collection('interactive-tutorials').doc(component.toLowerCase()).set(tutorial);
    }

    /**
     * Update knowledge base articles
     */
    private async updateKnowledgeBase(component: string, doc: DocumentationOutput): Promise<void> {
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
            publishedAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        await db.collection('knowledge-base').doc(component.toLowerCase()).set(article);
    }

    /**
     * Notify training team of pending videos
     */
    async notifyTrainingTeam(updates: TrainingUpdate[]): Promise<void> {
        const notification = {
            type: 'training-updates',
            title: 'New Training Videos Needed',
            message: `${updates.length} new training videos need to be recorded`,
            videos: updates.map(u => ({
                id: u.videoId,
                title: u.title,
                status: u.status,
            })),
            createdAt: Timestamp.now(),
            recipients: ['training-team@company.com'],
        };

        await db.collection('notifications').add(notification);
    }

    /**
     * Get pending training updates
     */
    async getPendingUpdates(): Promise<TrainingUpdate[]> {
        const snapshot = await db.collection('training-updates')
            .where('status', '==', 'pending')
            .get();

        return snapshot.docs.map(doc => doc.data() as TrainingUpdate);
    }

    /**
     * Mark training update as completed
     */
    async markAsCompleted(videoId: string, videoUrl: string): Promise<void> {
        await db.collection('training-updates').doc(videoId).update({
            status: 'published',
            videoUrl,
            updatedAt: Timestamp.now(),
        });

        // Also update the main training videos collection
        await db.collection('training-videos').doc(videoId).set({
            id: videoId,
            videoUrl,
            publishedAt: Timestamp.now(),
        }, { merge: true });
    }
}

export const trainingManager = new TrainingContentManager();
