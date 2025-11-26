import { DocumentationOutput, TrainingScript } from './documentationGenerator';
import { Timestamp } from 'firebase-admin/firestore';
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
export declare class TrainingContentManager {
    /**
     * Update training materials based on documentation
     */
    updateTrainingMaterials(doc: DocumentationOutput, component: string): Promise<void>;
    /**
     * Trigger video script generation
     */
    private generateVideoScriptTrigger;
    /**
     * Update help tooltips
     */
    private updateHelpTooltips;
    /**
     * Update chatbot knowledge base
     */
    private updateChatbotKnowledge;
    /**
     * Update interactive tutorials
     */
    private updateInteractiveTutorials;
    /**
     * Update knowledge base articles
     */
    private updateKnowledgeBase;
    /**
     * Notify training team of pending videos
     */
    notifyTrainingTeam(updates: TrainingUpdate[]): Promise<void>;
    /**
     * Get pending training updates
     */
    getPendingUpdates(): Promise<TrainingUpdate[]>;
    /**
     * Mark training update as completed
     */
    markAsCompleted(videoId: string, videoUrl: string): Promise<void>;
}
export declare const trainingManager: TrainingContentManager;
//# sourceMappingURL=trainingContentManager.d.ts.map