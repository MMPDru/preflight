export interface CodeChange {
    type: 'ui' | 'api' | 'feature' | 'bugfix' | 'refactor';
    files: string[];
    diff: string;
    commitMessage: string;
    commitHash: string;
    author: string;
    timestamp: Date;
    jiraTicket?: string;
}
export interface Documentation {
    userDocumentation: {
        title: string;
        overview: string;
        steps: string[];
        screenshots: string[];
        tips: string[];
        troubleshooting: string[];
    };
    technicalDocumentation: {
        apiChanges: string;
        breaking: boolean;
        migration: string;
        codeExamples: string[];
    };
    trainingMaterial: {
        videoScript: string;
        duration: string;
        keyPoints: string[];
        quizQuestions: Array<{
            question: string;
            options: string[];
            correct: number;
            explanation: string;
        }>;
    };
    releaseNotes: {
        version: string;
        highlights: string[];
        improvements: string[];
        bugFixes: string[];
    };
}
export declare class AutoDocumentationService {
    private openai;
    private git;
    private repoPath;
    constructor(apiKey: string, repoPath: string);
    /**
     * Detect changes from latest commit
     */
    detectChanges(commitHash?: string): Promise<CodeChange>;
    /**
     * Determine type of change
     */
    private determineChangeType;
    /**
     * Generate comprehensive documentation
     */
    generateDocumentation(change: CodeChange): Promise<Documentation>;
    /**
     * Build documentation generation prompt
     */
    private buildDocumentationPrompt;
    /**
     * Validate and enhance generated documentation
     */
    private validateAndEnhanceDocumentation;
    /**
     * Generate video script from documentation
     */
    generateVideoScript(documentation: Documentation): Promise<{
        script: string;
        scenes: Array<{
            duration: number;
            narration: string;
            actions: string[];
            highlights: string[];
        }>;
    }>;
    /**
     * Update training modules based on changes
     */
    updateTrainingModules(documentation: Documentation, affectedModules: string[]): Promise<void>;
    /**
     * Generate module update instructions
     */
    private generateModuleUpdate;
    /**
     * Generate changelog entry
     */
    generateChangelog(changes: CodeChange[]): Promise<string>;
    /**
     * Analyze UI changes via screenshot comparison
     */
    detectUIChanges(beforeScreenshot: Buffer, afterScreenshot: Buffer): Promise<{
        hasChanges: boolean;
        changes: string[];
        severity: 'minor' | 'moderate' | 'major';
    }>;
}
export declare function getDocumentationService(apiKey?: string, repoPath?: string): AutoDocumentationService;
//# sourceMappingURL=auto-documentation.d.ts.map