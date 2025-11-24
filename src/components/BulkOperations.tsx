import React, { useState } from 'react';
import { X, Play, Filter, CheckSquare, Square, Search } from 'lucide-react';
import { analyzePDF } from '../lib/preflight-engine';
import { savedWorkflows, executeWorkflow, type SavedWorkflow } from '../lib/saved-workflows';
import clsx from 'clsx';

interface ProofFile {
    id: string;
    fileName: string;
    fileUrl: string;
    customerName: string;
    company: string;
    workOrderNumber: string;
    uploadedAt: Date;
    status: 'pending' | 'checked' | 'processing';
}

// Sample proof files
const sampleProofs: ProofFile[] = [
    {
        id: 'proof-001',
        fileName: 'business-card.pdf',
        fileUrl: '/sample.pdf',
        customerName: 'John Doe',
        company: 'Acme Corp',
        workOrderNumber: 'WO-2024-001',
        uploadedAt: new Date('2024-11-20T10:30:00'),
        status: 'pending'
    },
    {
        id: 'proof-002',
        fileName: 'brochure.pdf',
        fileUrl: '/sample.pdf',
        customerName: 'Jane Smith',
        company: 'Creative Studios',
        workOrderNumber: 'WO-2024-002',
        uploadedAt: new Date('2024-11-20T14:15:00'),
        status: 'pending'
    },
    {
        id: 'proof-003',
        fileName: 'flyer.pdf',
        fileUrl: '/sample.pdf',
        customerName: 'Bob Johnson',
        company: 'Marketing Plus',
        workOrderNumber: 'WO-2024-003',
        uploadedAt: new Date('2024-11-21T09:00:00'),
        status: 'pending'
    },
    {
        id: 'proof-004',
        fileName: 'poster.pdf',
        fileUrl: '/sample.pdf',
        customerName: 'Alice Brown',
        company: 'Event Co',
        workOrderNumber: 'WO-2024-004',
        uploadedAt: new Date('2024-11-21T11:30:00'),
        status: 'pending'
    },
    {
        id: 'proof-005',
        fileName: 'catalog.pdf',
        fileUrl: '/sample.pdf',
        customerName: 'Charlie Wilson',
        company: 'Retail Inc',
        workOrderNumber: 'WO-2024-005',
        uploadedAt: new Date('2024-11-22T08:45:00'),
        status: 'pending'
    }
];

interface BulkOperationsProps {
    onClose: () => void;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({ onClose }) => {
    const [proofs, setProofs] = useState<ProofFile[]>(sampleProofs);
    const [selectedProofs, setSelectedProofs] = useState<Set<string>>(new Set());
    const [filterCustomer, setFilterCustomer] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedWorkflow, setSelectedWorkflow] = useState<SavedWorkflow | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processResults, setProcessResults] = useState<Map<string, any>>(new Map());
    const [viewingDetails, setViewingDetails] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const customers = ['all', ...Array.from(new Set(proofs.map(p => p.company)))];

    const filteredProofs = proofs.filter(proof => {
        const customerMatch = filterCustomer === 'all' || proof.company === filterCustomer;
        const statusMatch = filterStatus === 'all' || proof.status === filterStatus;

        const searchLower = searchQuery.toLowerCase();
        const searchMatch = !searchQuery ||
            proof.fileName.toLowerCase().includes(searchLower) ||
            proof.customerName.toLowerCase().includes(searchLower) ||
            proof.company.toLowerCase().includes(searchLower) ||
            proof.workOrderNumber.toLowerCase().includes(searchLower);

        return customerMatch && statusMatch && searchMatch;
    });

    const handleToggleProof = (id: string) => {
        const newSelected = new Set(selectedProofs);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedProofs(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedProofs.size === filteredProofs.length) {
            setSelectedProofs(new Set());
        } else {
            setSelectedProofs(new Set(filteredProofs.map(p => p.id)));
        }
    };

    const handleBulkPreflight = async () => {
        if (selectedProofs.size === 0) {
            alert('Please select at least one proof');
            return;
        }

        setIsProcessing(true);
        const results = new Map();

        for (const proofId of selectedProofs) {
            const proof = proofs.find(p => p.id === proofId);
            if (!proof) continue;

            // Update status to processing
            setProofs(prev => prev.map(p =>
                p.id === proofId ? { ...p, status: 'processing' as const } : p
            ));

            try {
                // Run preflight analysis
                const checks = await analyzePDF(proof.fileUrl);
                results.set(proofId, {
                    success: true,
                    checks,
                    errorCount: checks.filter(c => c.status === 'error').length,
                    warningCount: checks.filter(c => c.status === 'warning').length
                });

                // Update status to checked
                setProofs(prev => prev.map(p =>
                    p.id === proofId ? { ...p, status: 'checked' as const } : p
                ));
            } catch (e) {
                results.set(proofId, {
                    success: false,
                    error: 'Preflight failed'
                });
            }

            // Small delay between files
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        setProcessResults(results);
        setIsProcessing(false);
    };

    const handleBulkWorkflow = async () => {
        if (selectedProofs.size === 0) {
            alert('Please select at least one proof');
            return;
        }

        if (!selectedWorkflow) {
            alert('Please select a workflow');
            return;
        }

        setIsProcessing(true);
        const results = new Map();

        for (const proofId of selectedProofs) {
            const proof = proofs.find(p => p.id === proofId);
            if (!proof) continue;

            setProofs(prev => prev.map(p =>
                p.id === proofId ? { ...p, status: 'processing' as const } : p
            ));

            try {
                const result = await executeWorkflow(selectedWorkflow, proof.fileUrl);
                results.set(proofId, result);

                setProofs(prev => prev.map(p =>
                    p.id === proofId ? { ...p, status: 'checked' as const } : p
                ));
            } catch (e) {
                results.set(proofId, {
                    success: false,
                    message: 'Workflow failed'
                });
            }

            await new Promise(resolve => setTimeout(resolve, 300));
        }

        setProcessResults(results);
        setIsProcessing(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-bold text-text">Bulk Operations</h2>
                        <p className="text-sm text-muted mt-1">
                            Filter and process multiple proofs at once
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-text transition-colors p-2 hover:bg-background rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-border bg-background/50 flex flex-col gap-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        <input
                            type="text"
                            placeholder="Search by file, customer, company, or work order..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2 text-sm">
                            <Filter size={16} className="text-muted" />
                            <span className="text-muted">Filter:</span>
                        </div>
                        <select
                            value={filterCustomer}
                            onChange={(e) => setFilterCustomer(e.target.value)}
                            className="px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm"
                        >
                            {customers.map(c => (
                                <option key={c} value={c}>{c === 'all' ? 'All Companies' : c}</option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="checked">Checked</option>
                            <option value="processing">Processing</option>
                        </select>
                        <div className="flex-1" />
                        <div className="text-sm text-muted">
                            {selectedProofs.size} of {filteredProofs.length} selected
                        </div>
                    </div>
                </div>

                {/* Proof List */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <button
                            onClick={handleSelectAll}
                            className="px-3 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            {selectedProofs.size === filteredProofs.length ? <CheckSquare size={16} /> : <Square size={16} />}
                            {selectedProofs.size === filteredProofs.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div className="space-y-2">
                        {filteredProofs.map(proof => {
                            const isSelected = selectedProofs.has(proof.id);
                            const result = processResults.get(proof.id);

                            return (
                                <div
                                    key={proof.id}
                                    className={clsx(
                                        "bg-background border rounded-lg p-4 transition-all cursor-pointer",
                                        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/30"
                                    )}
                                    onClick={() => handleToggleProof(proof.id)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="pt-1">
                                            {isSelected ? (
                                                <CheckSquare size={20} className="text-primary" />
                                            ) : (
                                                <Square size={20} className="text-muted" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium text-text">{proof.fileName}</h3>
                                                <span className={clsx(
                                                    "px-2 py-1 rounded text-xs font-medium",
                                                    proof.status === 'pending' && "bg-yellow-500/10 text-yellow-500",
                                                    proof.status === 'checked' && "bg-green-500/10 text-green-500",
                                                    proof.status === 'processing' && "bg-blue-500/10 text-blue-500"
                                                )}>
                                                    {proof.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted space-y-1">
                                                <div className="flex gap-4">
                                                    <span>Company: {proof.company}</span>
                                                    <span>Contact: {proof.customerName}</span>
                                                </div>
                                                <div className="flex gap-4">
                                                    <span>WO: {proof.workOrderNumber}</span>
                                                    <span>Uploaded: {proof.uploadedAt.toLocaleString()}</span>
                                                </div>
                                                {result && (
                                                    <div className="mt-2 pt-2 border-t border-border">
                                                        {result.success ? (
                                                            <div
                                                                className="text-text hover:text-primary cursor-pointer hover:underline"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setViewingDetails(proof.id);
                                                                }}
                                                            >
                                                                ✓ {result.checks ? `${result.errorCount} errors, ${result.warningCount} warnings` : result.message}
                                                            </div>
                                                        ) : (
                                                            <div className="text-red-500">✗ {result.error || result.message}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {filteredProofs.length === 0 && (
                        <div className="text-center py-12 text-muted">
                            No proofs match the selected filters
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-border bg-background/50">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-muted uppercase mb-2 block">
                                Select Workflow (Optional)
                            </label>
                            <select
                                value={selectedWorkflow?.id || ''}
                                onChange={(e) => {
                                    const workflow = savedWorkflows.find(w => w.id === e.target.value);
                                    setSelectedWorkflow(workflow || null);
                                }}
                                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text"
                                disabled={isProcessing}
                            >
                                <option value="">No workflow selected</option>
                                {savedWorkflows.map(w => (
                                    <option key={w.id} value={w.id}>{w.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-3">
                            <button
                                onClick={handleBulkPreflight}
                                disabled={selectedProofs.size === 0 || isProcessing}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Play size={16} />
                                {isProcessing ? 'Processing...' : 'Run Preflight'}
                            </button>
                            <button
                                onClick={handleBulkWorkflow}
                                disabled={selectedProofs.size === 0 || !selectedWorkflow || isProcessing}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Play size={16} />
                                {isProcessing ? 'Processing...' : 'Run Workflow'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {viewingDetails && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setViewingDetails(null)}>
                    <div className="bg-surface border border-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h3 className="text-xl font-bold text-text">Preflight Results</h3>
                            <button onClick={() => setViewingDetails(null)} className="text-muted hover:text-text">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-6 space-y-4">
                            {processResults.get(viewingDetails)?.checks?.map((check: any) => (
                                <div key={check.id} className="flex items-start gap-3 p-3 bg-background border border-border rounded-lg">
                                    <div className={clsx(
                                        "mt-0.5",
                                        check.status === 'error' ? "text-red-500" :
                                            check.status === 'warning' ? "text-yellow-500" : "text-green-500"
                                    )}>
                                        {check.status === 'error' ? '✗' : check.status === 'warning' ? '!' : '✓'}
                                    </div>
                                    <div>
                                        <div className="font-medium text-text">{check.label}</div>
                                        <div className="text-sm text-muted">{check.message}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
