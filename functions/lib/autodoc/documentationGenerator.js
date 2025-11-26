"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.docGenerator = exports.DocumentationGenerator = void 0;
class DocumentationGenerator {
    /**
     * Generate comprehensive documentation from code changes
     */
    async generateDocumentation(changes) {
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
    async generateTrainingScript(change) {
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
    groupChangesByComponent(changes) {
        const grouped = new Map();
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
    generateFeatureDescription(changes) {
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
    generateStepByStep(changes) {
        const steps = [];
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
    generateAPIDoc(changes) {
        const apiChanges = changes.filter(c => c.type === 'api');
        if (apiChanges.length === 0)
            return undefined;
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
    generateChangeLog(changes) {
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
    generateMigrationGuide(changes) {
        const breaking = changes.filter(c => c.impactLevel === 'high');
        if (breaking.length === 0)
            return undefined;
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
    generateBestPractices(changes) {
        const practices = [];
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
    generateTitle(change) {
        return `How to Use the New ${change.component} Feature`;
    }
    /**
     * Estimate video duration based on complexity
     */
    estimateDuration(change) {
        const baseMinutes = change.impactLevel === 'high' ? 5 :
            change.impactLevel === 'medium' ? 3 : 2;
        return `${baseMinutes}:00`;
    }
    /**
     * Generate voiceover script
     */
    generateVoiceover(change) {
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
    generateScreenActions(change) {
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
    generateHighlights(change) {
        return [
            { x: 100, y: 100, width: 200, height: 50 },
            { x: 300, y: 200, width: 150, height: 40 },
        ];
    }
    /**
     * Generate call to action
     */
    generateCallToAction(change) {
        return `Try the new ${change.component} feature today and let us know what you think!`;
    }
    /**
     * Group changes by type
     */
    groupChangesByType(changes) {
        const grouped = new Map();
        changes.forEach(change => {
            const existing = grouped.get(change.type) || [];
            existing.push(change);
            grouped.set(change.type, existing);
        });
        return grouped;
    }
}
exports.DocumentationGenerator = DocumentationGenerator;
exports.docGenerator = new DocumentationGenerator();
//# sourceMappingURL=documentationGenerator.js.map