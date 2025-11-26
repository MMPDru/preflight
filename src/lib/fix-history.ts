
export interface FixHistoryEntry {
    id: string;
    timestamp: Date;
    fixType: 'metadata' | 'bleed' | 'color' | 'font' | 'image' | 'other' | 'compliance';
    description: string;
    beforeUrl: string;
    afterUrl: string;
    canRollback: boolean;
}

export interface FixHistory {
    entries: FixHistoryEntry[];
    currentVersion: string; // URL of current version
}

class FixHistoryManager {
    private history: FixHistory = {
        entries: [],
        currentVersion: ''
    };

    initialize(initialUrl: string) {
        this.history.currentVersion = initialUrl;
    }

    addFix(fixType: FixHistoryEntry['fixType'], description: string, beforeUrl: string, afterUrl: string): FixHistoryEntry {
        const entry: FixHistoryEntry = {
            id: `fix-${Date.now()}`,
            timestamp: new Date(),
            fixType,
            description,
            beforeUrl,
            afterUrl,
            canRollback: true
        };

        this.history.entries.push(entry);
        this.history.currentVersion = afterUrl;

        // Store in localStorage for persistence
        this.saveToStorage();

        return entry;
    }

    getHistory(): FixHistory {
        return { ...this.history };
    }

    getEntries(): FixHistoryEntry[] {
        return [...this.history.entries];
    }

    async rollback(entryId: string): Promise<string | null> {
        const entryIndex = this.history.entries.findIndex(e => e.id === entryId);

        if (entryIndex === -1) {
            console.error('Fix entry not found');
            return null;
        }

        const entry = this.history.entries[entryIndex];

        if (!entry.canRollback) {
            console.error('This fix cannot be rolled back');
            return null;
        }

        // Remove this entry and all subsequent entries
        this.history.entries = this.history.entries.slice(0, entryIndex);

        // Set current version to the before URL of the rolled-back fix
        this.history.currentVersion = entry.beforeUrl;

        this.saveToStorage();

        return entry.beforeUrl;
    }

    async rollbackToVersion(url: string): Promise<boolean> {
        // Find the entry that created this version
        const entryIndex = this.history.entries.findIndex(e => e.afterUrl === url);

        if (entryIndex === -1) {
            // This might be the original version
            if (this.history.entries.length > 0 && this.history.entries[0].beforeUrl === url) {
                this.history.entries = [];
                this.history.currentVersion = url;
                this.saveToStorage();
                return true;
            }
            return false;
        }

        // Keep entries up to and including this one
        this.history.entries = this.history.entries.slice(0, entryIndex + 1);
        this.history.currentVersion = url;

        this.saveToStorage();

        return true;
    }

    clear() {
        this.history.entries = [];
        this.saveToStorage();
    }

    private saveToStorage() {
        try {
            localStorage.setItem('pdf-fix-history', JSON.stringify({
                ...this.history,
                entries: this.history.entries.map(e => ({
                    ...e,
                    timestamp: e.timestamp.toISOString()
                }))
            }));
        } catch (e) {
            console.warn('Failed to save fix history to localStorage', e);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('pdf-fix-history');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.history = {
                    ...parsed,
                    entries: parsed.entries.map((e: any) => ({
                        ...e,
                        timestamp: new Date(e.timestamp)
                    }))
                };
            }
        } catch (e) {
            console.warn('Failed to load fix history from localStorage', e);
        }
    }
}

// Singleton instance
export const fixHistoryManager = new FixHistoryManager();
