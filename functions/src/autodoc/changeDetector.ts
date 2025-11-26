import { Timestamp } from 'firebase-admin/firestore';

export interface CodeChange {
    type: 'feature' | 'bugfix' | 'ui' | 'api' | 'permission' | 'workflow';
    component: string;
    description: string;
    files: string[];
    commitHash: string;
    author: string;
    timestamp: Timestamp;
    impactLevel: 'low' | 'medium' | 'high';
}

export interface UIChange {
    component: string;
    changeType: 'added' | 'modified' | 'removed';
    elementsAffected: string[];
    screenshot?: string;
    workflow?: string;
}

export class ChangeDetector {
    /**
     * Analyze Git commits to detect changes
     */
    async analyzeCommit(commit: any): Promise<CodeChange[]> {
        const changes: CodeChange[] = [];
        const files = commit.files || [];

        for (const file of files) {
            const change = this.classifyChange(file, commit);
            if (change) {
                changes.push(change);
            }
        }

        return changes;
    }

    /**
     * Classify a file change by analyzing its path and diff
     */
    private classifyChange(file: any, commit: any): CodeChange | null {
        const path = file.filename;

        // Detect UI changes
        if (path.includes('/components/') || path.includes('/pages/')) {
            return {
                type: 'ui',
                component: this.extractComponentName(path),
                description: commit.message,
                files: [path],
                commitHash: commit.sha,
                author: commit.author.name,
                timestamp: Timestamp.fromDate(new Date(commit.timestamp)),
                impactLevel: this.assessImpact(file.changes),
            };
        }

        // Detect API changes
        if (path.includes('/api/') || path.includes('-service.ts')) {
            return {
                type: 'api',
                component: this.extractComponentName(path),
                description: commit.message,
                files: [path],
                commitHash: commit.sha,
                author: commit.author.name,
                timestamp: Timestamp.fromDate(new Date(commit.timestamp)),
                impactLevel: 'high',
            };
        }

        // Detect permission changes
        if (path.includes('permissions') || path.includes('auth')) {
            return {
                type: 'permission',
                component: 'Authorization',
                description: commit.message,
                files: [path],
                commitHash: commit.sha,
                author: commit.author.name,
                timestamp: Timestamp.fromDate(new Date(commit.timestamp)),
                impactLevel: 'high',
            };
        }

        return null;
    }

    /**
     * Extract component name from file path
     */
    private extractComponentName(path: string): string {
        const parts = path.split('/');
        const filename = parts[parts.length - 1];
        return filename.replace(/\.[jt]sx?$/, '');
    }

    /**
     * Assess impact level based on number of changes
     */
    private assessImpact(changes: number): 'low' | 'medium' | 'high' {
        if (changes > 100) return 'high';
        if (changes > 30) return 'medium';
        return 'low';
    }

    /**
     * Detect UI changes by comparing screenshots
     */
    async detectUIChanges(beforeScreenshot: string, afterScreenshot: string): Promise<UIChange[]> {
        // This would integrate with a visual regression testing tool
        // For now, return placeholder
        return [];
    }

    /**
     * Analyze workflow changes
     */
    async analyzeWorkflowChanges(oldRoutes: any[], newRoutes: any[]): Promise<string[]> {
        const changes: string[] = [];

        // Detect new routes
        newRoutes.forEach(route => {
            if (!oldRoutes.find(r => r.path === route.path)) {
                changes.push(`New route added: ${route.path}`);
            }
        });

        // Detect removed routes
        oldRoutes.forEach(route => {
            if (!newRoutes.find(r => r.path === route.path)) {
                changes.push(`Route removed: ${route.path}`);
            }
        });

        return changes;
    }
}

export const changeDetector = new ChangeDetector();
