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

export class DocumentationGenerator {
    /**
     * Generate comprehensive documentation from code changes
     */
    async generateDocumentation(changes: CodeChange[]): Promise<DocumentationOutput> {
        const grouped = this.groupChangesByComponent(changes);

        return {
            featureDescription: this.generateFeatureDescription(changes),
            stepByStepGuide: this.generateStepByStep(changes),
            apiDocumentation: this.generateAPIDoc(changes),
            changeLog: this.generateChangeLog(changes),
            migrationGuide: this.generateMigrationGuide(changes),
            bestPractices: this.generateBestPractices(changes),
        };
    }

    /**
     * Generate training video script from changes
     */
    async generateTrainingScript(change: CodeChange): Promise<TrainingScript> {
        const title = this.generateTitle(change);
        const duration = this.estimateDuration(change);

        return {
            title,
            duration,
            voiceoverText: this.generateVoiceover(change),
            screenActions: this.generateScreenActions(change),
            highlights: this.generateHighlights(change),
            callToAction: this.generateCallToAction(change),
        };
    }

    /**
     * Group changes by component for better organization
     */
    private groupChangesByComponent(changes: CodeChange[]): Map<string, CodeChange[]> {
        const grouped = new Map<string, CodeChange[]>();

        changes.forEach(change => {
            const existing = grouped.get(change.component) || [];
            existing.push(change);
            grouped.set(change.component, existing);
        });

        return grouped;
    }

    /**
     * Generate feature description
     */
    private generateFeatureDescription(changes: CodeChange[]): string {
        const uiChanges = changes.filter(c => c.type === 'ui');
        const apiChanges = changes.filter(c => c.type === 'api');
        const featureChanges = changes.filter(c => c.type === 'feature');

        let description = '';

        if (featureChanges.length > 0) {
            description += `New Features:\n`;
            featureChanges.forEach(change => {
                description += `- ${change.component}: ${change.description}\n`;
            });
        }

        if (uiChanges.length > 0) {
            description += `\nUI Improvements:\n`;
            uiChanges.forEach(change => {
                description += `- Updated ${change.component} interface\n`;
            });
        }

        if (apiChanges.length > 0) {
            description += `\nAPI Updates:\n`;
            apiChanges.forEach(change => {
                description += `- Modified ${change.component} endpoints\n`;
            });
        }

        return description;
    }

    /**
     * Generate step-by-step guide
     */
    private generateStepByStep(changes: CodeChange[]): string[] {
        const steps: string[] = [];

        changes.forEach(change => {
            if (change.type === 'ui' || change.type === 'feature') {
                steps.push(`Navigate to ${change.component}`);
                steps.push(`${change.description}`);
                steps.push(`Verify the changes work as expected`);
            }
        });

        return steps;
    }

    /**
     * Generate API documentation
     */
    private generateAPIDoc(changes: CodeChange[]): string | undefined {
        const apiChanges = changes.filter(c => c.type === 'api');

        if (apiChanges.length === 0) return undefined;

        let doc = '# API Changes\n\n';

        apiChanges.forEach(change => {
            doc += `## ${change.component}\n`;
            doc += `${change.description}\n\n`;
            doc += `**Modified:** ${change.timestamp.toDate().toISOString()}\n`;
            doc += `**Author:** ${change.author}\n\n`;
        });

        return doc;
    }

    /**
     * Generate change log
     */
    private generateChangeLog(changes: CodeChange[]): string {
        let log = `# Change Log - ${new Date().toISOString().split('T')[0]}\n\n`;

        const byType = this.groupChangesByType(changes);

        byType.forEach((changes, type) => {
            log += `## ${type.toUpperCase()}\n\n`;
            changes.forEach(change => {
                log += `- **${change.component}**: ${change.description} (${change.commitHash.substring(0, 7)})\n`;
            });
            log += '\n';
        });

        return log;
    }

    /**
     * Generate migration guide if breaking changes detected
     */
    private generateMigrationGuide(changes: CodeChange[]): string | undefined {
        const breaking = changes.filter(c => c.impactLevel === 'high');

        if (breaking.length === 0) return undefined;

        let guide = '# Migration Guide\n\n';
        guide += 'The following breaking changes require action:\n\n';

        breaking.forEach(change => {
            guide += `## ${change.component}\n`;
            guide += `${change.description}\n\n`;
            guide += `**Action Required:** Update your code to use the new ${change.component} API.\n\n`;
        });

        return guide;
    }

    /**
     * Generate best practices
     */
    private generateBestPractices(changes: CodeChange[]): string[] {
        const practices: string[] = [];

        changes.forEach(change => {
            if (change.type === 'permission') {
                practices.push('Review and update user permissions after deployment');
            }
            if (change.type === 'api') {
                practices.push('Test API endpoints in staging before production');
            }
            if (change.type === 'workflow') {
                practices.push('Verify all workflow paths are still accessible');
            }
        });

        return [...new Set(practices)];
    }

    /**
     * Generate title for training video
     */
    private generateTitle(change: CodeChange): string {
        return `How to Use the New ${change.component} Feature`;
    }

    /**
     * Estimate video duration based on complexity
     */
    private estimateDuration(change: CodeChange): string {
        const baseMinutes = change.impactLevel === 'high' ? 5 :
            change.impactLevel === 'medium' ? 3 : 2;
        return `${baseMinutes}:00`;
    }

    /**
     * Generate voiceover script
     */
    private generateVoiceover(change: CodeChange): string[] {
        return [
            `Welcome to this tutorial on the new ${change.component} feature.`,
            `In this video, we'll show you ${change.description.toLowerCase()}.`,
            `Let's get started!`,
            `First, navigate to the ${change.component} section.`,
            `You'll notice the updated interface with the new functionality.`,
            `Let me walk you through how to use it.`,
            `And that's how you use the new ${change.component} feature!`,
            `For more tutorials, visit the Training Center.`,
        ];
    }

    /**
     * Generate screen actions for video
     */
    private generateScreenActions(change: CodeChange): ScreenAction[] {
        return [
            { timestamp: 0, action: 'navigate', target: `/${change.component.toLowerCase()}` },
            { timestamp: 2000, action: 'highlight', target: '.new-feature' },
            { timestamp: 4000, action: 'click', target: '#demo-button' },
            { timestamp: 6000, action: 'type', target: '#input-field', value: 'Example' },
        ];
    }

    /**
     * Generate highlight coordinates
     */
    private generateHighlights(change: CodeChange): Coordinate[] {
        return [
            { x: 100, y: 100, width: 200, height: 50 },
            { x: 300, y: 200, width: 150, height: 40 },
        ];
    }

    /**
     * Generate call to action
     */
    private generateCallToAction(change: CodeChange): string {
        return `Try the new ${change.component} feature today and let us know what you think!`;
    }

    /**
     * Group changes by type
     */
    private groupChangesByType(changes: CodeChange[]): Map<string, CodeChange[]> {
        const grouped = new Map<string, CodeChange[]>();

        changes.forEach(change => {
            const existing = grouped.get(change.type) || [];
            existing.push(change);
            grouped.set(change.type, existing);
        });

        return grouped;
    }
}

export const docGenerator = new DocumentationGenerator();
