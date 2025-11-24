export interface Action {
    id: string;
    type: 'rotate' | 'delete' | 'move' | 'reorder';
    timestamp: number;
    params: {
        pageIndex?: number;
        angle?: number;
        fromIndex?: number;
        toIndex?: number;
    };
    description: string;
}

export interface Workflow {
    id: string;
    name: string;
    actions: Action[];
    createdAt: number;
}

class ActionRecorderClass {
    private actions: Action[] = [];
    private isRecording: boolean = false;
    private actionCounter: number = 0;

    startRecording() {
        this.isRecording = true;
        this.actions = [];
        this.actionCounter = 0;
    }

    stopRecording() {
        this.isRecording = false;
    }

    recordAction(type: Action['type'], params: Action['params'], description: string) {
        if (!this.isRecording) return;

        const action: Action = {
            id: `action-${++this.actionCounter}`,
            type,
            timestamp: Date.now(),
            params,
            description
        };

        this.actions.push(action);
    }

    getActions(): Action[] {
        return [...this.actions];
    }

    setActions(actions: Action[]) {
        this.actions = actions;
    }

    clearActions() {
        this.actions = [];
        this.actionCounter = 0;
    }

    getRecordingState(): boolean {
        return this.isRecording;
    }

    saveWorkflow(name: string): Workflow {
        const workflow: Workflow = {
            id: `workflow-${Date.now()}`,
            name,
            actions: [...this.actions],
            createdAt: Date.now()
        };

        // Save to localStorage
        const workflows = this.getWorkflows();
        workflows.push(workflow);
        localStorage.setItem('preflight-workflows', JSON.stringify(workflows));

        return workflow;
    }

    getWorkflows(): Workflow[] {
        const stored = localStorage.getItem('preflight-workflows');
        return stored ? JSON.parse(stored) : [];
    }

    deleteWorkflow(id: string) {
        const workflows = this.getWorkflows().filter(w => w.id !== id);
        localStorage.setItem('preflight-workflows', JSON.stringify(workflows));
    }

    removeAction(actionId: string) {
        this.actions = this.actions.filter(a => a.id !== actionId);
    }
}

export const ActionRecorder = new ActionRecorderClass();
