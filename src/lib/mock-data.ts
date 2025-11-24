export type JobStatus = 'queue' | 'pending' | 'completed';

export interface Job {
    id: string;
    name: string;
    date: string;
    status: JobStatus;
    priority?: 'high' | 'normal' | 'low';
}

export const MOCK_JOBS: Job[] = [
    { id: 'JOB-1001', name: 'Brochure_Summer_2025.pdf', date: '2025-11-22', status: 'queue', priority: 'high' },
    { id: 'JOB-1002', name: 'Business_Cards_Acme.pdf', date: '2025-11-22', status: 'queue', priority: 'normal' },
    { id: 'JOB-1003', name: 'Poster_Concert.pdf', date: '2025-11-22', status: 'queue', priority: 'low' },
    { id: 'JOB-1004', name: 'Flyer_Sale.pdf', date: '2025-11-22', status: 'queue', priority: 'normal' },
    { id: 'JOB-1005', name: 'Menu_Restaurant.pdf', date: '2025-11-21', status: 'pending', priority: 'high' },
    { id: 'JOB-1006', name: 'Catalog_Winter.pdf', date: '2025-11-21', status: 'pending', priority: 'normal' },
    { id: 'JOB-1007', name: 'Newsletter_Nov.pdf', date: '2025-11-20', status: 'completed' },
    { id: 'JOB-1008', name: 'Invoice_Template.pdf', date: '2025-11-20', status: 'completed' },
    { id: 'JOB-1009', name: 'Label_Product.pdf', date: '2025-11-20', status: 'completed' },
];

export interface TrainingModule {
    id: string;
    title: string;
    description: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    category: 'onboarding' | 'advanced' | 'admin';
    image: string;
}

export interface DocUpdate {
    id: string;
    title: string;
    type: 'feature' | 'workflow' | 'fix';
    timestamp: string;
    summary: string;
}

export const MOCK_MODULES: TrainingModule[] = [
    {
        id: 'mod-1',
        title: 'PreFlight Pro Essentials',
        description: 'Master the basics of file upload, preflight checks, and proof approval.',
        progress: 100,
        totalLessons: 5,
        completedLessons: 5,
        category: 'onboarding',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'
    },
    {
        id: 'mod-2',
        title: 'Advanced Color Management',
        description: 'Deep dive into ICC profiles, spot colors, and ink coverage.',
        progress: 45,
        totalLessons: 8,
        completedLessons: 3,
        category: 'advanced',
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80'
    },
    {
        id: 'mod-3',
        title: 'Workflow Automation',
        description: 'Learn how to build and manage custom automation workflows.',
        progress: 0,
        totalLessons: 6,
        completedLessons: 0,
        category: 'admin',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80'
    }
];

export const MOCK_DOCS: DocUpdate[] = [
    {
        id: 'doc-1',
        title: 'New: Live Support Integration',
        type: 'feature',
        timestamp: '2 hours ago',
        summary: 'Added video conferencing and screen sharing capabilities to the editor.'
    },
    {
        id: 'doc-2',
        title: 'Updated: Bleed Correction Logic',
        type: 'fix',
        timestamp: '1 day ago',
        summary: 'Improved mirroring algorithm for complex gradients in bleed areas.'
    },
    {
        id: 'doc-3',
        title: 'Workflow: Batch Processing',
        type: 'workflow',
        timestamp: '2 days ago',
        summary: 'Guide on using the new bulk operations for multiple files.'
    }
];
