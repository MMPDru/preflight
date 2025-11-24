import { PDFDocument } from 'pdf-lib';

export interface CustomerPreset {
    id: string;
    customerName: string;
    preferences: {
        colorSpace: 'CMYK' | 'RGB' | 'auto';
        resolution: number; // DPI
        bleedRequired: boolean;
        bleedSize?: number; // in points
        fontEmbedding: 'required' | 'outline' | 'optional';
        spotColorsAllowed: boolean;
        maxInkCoverage?: number; // percentage (e.g., 300 for 300%)
        pageSize?: { width: number; height: number }; // in points
        approvalRequired: boolean;
        notificationEmail: string;
        autoRoute: 'designer' | 'auto-fix' | 'smart';
    };
    createdAt: Date;
    lastUsed?: Date;
}

// Sample presets for demonstration
export const defaultCustomerPresets: CustomerPreset[] = [
    {
        id: 'preset-001',
        customerName: 'Acme Corporation',
        preferences: {
            colorSpace: 'CMYK',
            resolution: 300,
            bleedRequired: true,
            bleedSize: 9, // 0.125 inch = 9 points
            fontEmbedding: 'required',
            spotColorsAllowed: false,
            maxInkCoverage: 300,
            approvalRequired: true,
            notificationEmail: 'print@acmecorp.com',
            autoRoute: 'smart'
        },
        createdAt: new Date('2024-01-15'),
        lastUsed: new Date('2024-11-20')
    },
    {
        id: 'preset-002',
        customerName: 'Creative Studios',
        preferences: {
            colorSpace: 'auto',
            resolution: 300,
            bleedRequired: true,
            bleedSize: 9,
            fontEmbedding: 'required',
            spotColorsAllowed: true, // They use Pantone colors
            approvalRequired: false,
            notificationEmail: 'design@creativestudios.com',
            autoRoute: 'designer'
        },
        createdAt: new Date('2024-02-10'),
        lastUsed: new Date('2024-11-22')
    },
    {
        id: 'preset-003',
        customerName: 'Quick Print Co',
        preferences: {
            colorSpace: 'CMYK',
            resolution: 150,
            bleedRequired: false,
            fontEmbedding: 'optional',
            spotColorsAllowed: false,
            approvalRequired: false,
            notificationEmail: 'orders@quickprint.com',
            autoRoute: 'auto-fix'
        },
        createdAt: new Date('2024-03-05'),
        lastUsed: new Date('2024-11-18')
    }
];

/**
 * Apply customer preset preferences to preflight analysis
 * This can be used to customize checks based on customer requirements
 */
export function applyPresetToChecks(checks: any[], preset: CustomerPreset): any[] {
    // Clone checks to avoid mutation
    const modifiedChecks = [...checks];

    // Example: If customer doesn't require bleed, downgrade bleed warnings
    if (!preset.preferences.bleedRequired) {
        const bleedCheckIndex = modifiedChecks.findIndex(c => c.id === 'geo-bleed');
        if (bleedCheckIndex !== -1 && modifiedChecks[bleedCheckIndex].status === 'warning') {
            modifiedChecks[bleedCheckIndex] = {
                ...modifiedChecks[bleedCheckIndex],
                status: 'pass',
                message: 'Bleed not required for this customer.'
            };
        }
    }

    // Example: If customer doesn't allow spot colors, escalate to error
    if (!preset.preferences.spotColorsAllowed) {
        const spotCheckIndex = modifiedChecks.findIndex(c => c.id === 'img-color-spot');
        if (spotCheckIndex !== -1 && modifiedChecks[spotCheckIndex].status === 'warning') {
            modifiedChecks[spotCheckIndex] = {
                ...modifiedChecks[spotCheckIndex],
                status: 'error',
                message: `${modifiedChecks[spotCheckIndex].message} - Not allowed for this customer.`
            };
        }
    }

    return modifiedChecks;
}

/**
 * Get preset by customer name or ID
 */
export function getPresetByCustomer(customerIdentifier: string): CustomerPreset | null {
    return defaultCustomerPresets.find(
        p => p.id === customerIdentifier ||
            p.customerName.toLowerCase() === customerIdentifier.toLowerCase()
    ) || null;
}

/**
 * Save or update a customer preset
 */
export function saveCustomerPreset(preset: CustomerPreset): void {
    // In a real app, this would save to a database
    console.log('Saving preset:', preset);
    // For now, just log it
}
