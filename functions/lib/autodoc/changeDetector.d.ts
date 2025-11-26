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
export declare class ChangeDetector {
    /**
     * Analyze Git commits to detect changes
     */
    analyzeCommit(commit: any): Promise<CodeChange[]>;
    /**
     * Classify a file change by analyzing its path and diff
     */
    private classifyChange;
    /**
     * Extract component name from file path
     */
    private extractComponentName;
    /**
     * Assess impact level based on number of changes
     */
    private assessImpact;
    /**
     * Detect UI changes by comparing screenshots
     */
    detectUIChanges(beforeScreenshot: string, afterScreenshot: string): Promise<UIChange[]>;
    /**
     * Analyze workflow changes
     */
    analyzeWorkflowChanges(oldRoutes: any[], newRoutes: any[]): Promise<string[]>;
}
export declare const changeDetector: ChangeDetector;
//# sourceMappingURL=changeDetector.d.ts.map