"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeDetector = exports.ChangeDetector = void 0;
const firestore_1 = require("firebase-admin/firestore");
class ChangeDetector {
    /**
     * Analyze Git commits to detect changes
     */
    async analyzeCommit(commit) {
        const changes = [];
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
    classifyChange(file, commit) {
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
                timestamp: firestore_1.Timestamp.fromDate(new Date(commit.timestamp)),
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
                timestamp: firestore_1.Timestamp.fromDate(new Date(commit.timestamp)),
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
                timestamp: firestore_1.Timestamp.fromDate(new Date(commit.timestamp)),
                impactLevel: 'high',
            };
        }
        return null;
    }
    /**
     * Extract component name from file path
     */
    extractComponentName(path) {
        const parts = path.split('/');
        const filename = parts[parts.length - 1];
        return filename.replace(/\.[jt]sx?$/, '');
    }
    /**
     * Assess impact level based on number of changes
     */
    assessImpact(changes) {
        if (changes > 100)
            return 'high';
        if (changes > 30)
            return 'medium';
        return 'low';
    }
    /**
     * Detect UI changes by comparing screenshots
     */
    async detectUIChanges(beforeScreenshot, afterScreenshot) {
        // This would integrate with a visual regression testing tool
        // For now, return placeholder
        return [];
    }
    /**
     * Analyze workflow changes
     */
    async analyzeWorkflowChanges(oldRoutes, newRoutes) {
        const changes = [];
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
exports.ChangeDetector = ChangeDetector;
exports.changeDetector = new ChangeDetector();
//# sourceMappingURL=changeDetector.js.map