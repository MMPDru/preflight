import { CodeChange } from './changeDetector';
export interface DocumentationOutput {
    featureDescription: string;
    stepByStepGuide: string[];
    apiDocumentation?: string;
    changeLog: string;
    migrationGuide?: string;
    bestPractices: string[];
}
export interface TrainingScript {
    title: string;
    duration: string;
    voiceoverText: string[];
    screenActions: ScreenAction[];
    highlights: Coordinate[];
    callToAction: string;
}
export interface ScreenAction {
    timestamp: number;
    action: 'click' | 'type' | 'navigate' | 'highlight';
    target: string;
    value?: string;
}
export interface Coordinate {
    x: number;
    y: number;
    width: number;
    height: number;
}
export declare class DocumentationGenerator {
    /**
     * Generate comprehensive documentation from code changes
     */
    generateDocumentation(changes: CodeChange[]): Promise<DocumentationOutput>;
    /**
     * Generate training video script from changes
     */
    generateTrainingScript(change: CodeChange): Promise<TrainingScript>;
    /**
     * Group changes by component for better organization
     */
    private groupChangesByComponent;
    /**
     * Generate feature description
     */
    private generateFeatureDescription;
    /**
     * Generate step-by-step guide
     */
    private generateStepByStep;
    /**
     * Generate API documentation
     */
    private generateAPIDoc;
    /**
     * Generate change log
     */
    private generateChangeLog;
    /**
     * Generate migration guide if breaking changes detected
     */
    private generateMigrationGuide;
    /**
     * Generate best practices
     */
    private generateBestPractices;
    /**
     * Generate title for training video
     */
    private generateTitle;
    /**
     * Estimate video duration based on complexity
     */
    private estimateDuration;
    /**
     * Generate voiceover script
     */
    private generateVoiceover;
    /**
     * Generate screen actions for video
     */
    private generateScreenActions;
    /**
     * Generate highlight coordinates
     */
    private generateHighlights;
    /**
     * Generate call to action
     */
    private generateCallToAction;
    /**
     * Group changes by type
     */
    private groupChangesByType;
}
export declare const docGenerator: DocumentationGenerator;
//# sourceMappingURL=documentationGenerator.d.ts.map