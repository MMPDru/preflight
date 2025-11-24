import { automationTemplates, type AutomationTemplate } from './automation-templates';

export interface WorkflowStep {
    templateId: string;
    order: number;
    enabled: boolean;
}

export interface SavedWorkflow {
    id: string;
    name: string;
    description: string;
    steps: WorkflowStep[];
    category: 'quality' | 'production' | 'custom';
    createdAt: Date;
    updatedAt: Date;
    usageCount: number;
}

// Sample saved workflows
export const savedWorkflows: SavedWorkflow[] = [
    {
        id: 'workflow-001',
        name: 'Standard Print Prep',
        description: 'Convert RGB to CMYK, embed fonts, and check resolution',
        steps: [
            { templateId: 'color-rgb-cmyk', order: 1, enabled: true },
            { templateId: 'font-embed', order: 2, enabled: true },
            { templateId: 'img-res-check', order: 3, enabled: true }
        ],
        category: 'production',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        usageCount: 45
    },
    {
        id: 'workflow-002',
        name: 'Quick Quality Check',
        description: 'Fast quality verification for simple jobs',
        steps: [
            { templateId: 'img-res-check', order: 1, enabled: true },
            { templateId: 'font-check', order: 2, enabled: true },
            { templateId: 'bleed-check', order: 3, enabled: true }
        ],
        category: 'quality',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-10'),
        usageCount: 28
    },
    {
        id: 'workflow-003',
        name: 'Print-Ready Package',
        description: 'Full print production workflow with all fixes',
        steps: [
            { templateId: 'color-rgb-cmyk', order: 1, enabled: true },
            { templateId: 'font-embed', order: 2, enabled: true },
            { templateId: 'bleed-fix', order: 3, enabled: true },
            { templateId: 'transparency-flatten', order: 4, enabled: true },
            { templateId: 'img-res-check', order: 5, enabled: true }
        ],
        category: 'production',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-11-20'),
        usageCount: 67
    }
];

/**
 * Execute a saved workflow on a file
 */
export async function executeWorkflow(
    workflow: SavedWorkflow,
    fileUrl: string,
    onProgress?: (step: number, total: number, message: string) => void
): Promise<{ success: boolean; results: any[]; message: string }> {
    const results: any[] = [];
    const enabledSteps = workflow.steps.filter(s => s.enabled).sort((a, b) => a.order - b.order);

    for (let i = 0; i < enabledSteps.length; i++) {
        const step = enabledSteps[i];
        const template = automationTemplates.find(t => t.id === step.templateId);

        if (!template) continue;

        onProgress?.(i + 1, enabledSteps.length, `Executing: ${template.name}`);

        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // In production, this would actually execute the template
        results.push({
            templateId: step.templateId,
            success: true,
            message: `${template.name} completed successfully`
        });
    }

    return {
        success: true,
        results,
        message: `Workflow "${workflow.name}" completed successfully`
    };
}

/**
 * Save a new custom workflow
 */
export function saveWorkflow(workflow: Omit<SavedWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): SavedWorkflow {
    const newWorkflow: SavedWorkflow = {
        ...workflow,
        id: `workflow-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
    };

    savedWorkflows.push(newWorkflow);

    // Persist to localStorage
    try {
        const customWorkflows = savedWorkflows.filter(w => w.category === 'custom');
        localStorage.setItem('customWorkflows', JSON.stringify(customWorkflows));
    } catch (e) {
        console.error('Failed to save workflow to localStorage', e);
    }

    console.log('Workflow saved:', newWorkflow);

    return newWorkflow;
}

/**
 * Load custom workflows from localStorage
 */
export function loadCustomWorkflows(): void {
    try {
        const stored = localStorage.getItem('customWorkflows');
        if (stored) {
            const customWorkflows = JSON.parse(stored) as SavedWorkflow[];
            // Remove existing custom workflows
            const preBuilt = savedWorkflows.filter(w => w.category !== 'custom');
            savedWorkflows.length = 0;
            savedWorkflows.push(...preBuilt, ...customWorkflows);
        }
    } catch (e) {
        console.error('Failed to load custom workflows from localStorage', e);
    }
}

// Load custom workflows on module initialization
loadCustomWorkflows();

/**
 * Get workflow by ID
 */
export function getWorkflow(id: string): SavedWorkflow | undefined {
    return savedWorkflows.find(w => w.id === id);
}

/**
 * Delete workflow
 */
export function deleteWorkflow(id: string): boolean {
    const index = savedWorkflows.findIndex(w => w.id === id);
    if (index !== -1) {
        savedWorkflows.splice(index, 1);
        return true;
    }
    return false;
}
