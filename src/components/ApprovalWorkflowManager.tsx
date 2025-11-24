import React, { useState } from 'react';
import {
    CheckCircle, XCircle, Clock, AlertCircle, User, Calendar,
    FileText, MessageSquare, Download, Send, ArrowRight, Lock
} from 'lucide-react';
import clsx from 'clsx';

// Types
export interface ApprovalStage {
    id: string;
    name: string;
    order: number;
    approvers: string[]; // User IDs
    requiredApprovals: number; // How many approvals needed
    currentApprovals: number;
    status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'skipped';
    deadline?: Date;
    completedAt?: Date;
    completedBy?: string[];
    comments?: ApprovalComment[];
}

export interface ApprovalComment {
    id: string;
    userId: string;
    userName: string;
    comment: string;
    timestamp: Date;
    type: 'approval' | 'rejection' | 'revision' | 'question';
}

export interface ApprovalWorkflow {
    id: string;
    jobId: string;
    jobName: string;
    stages: ApprovalStage[];
    currentStage: number;
    overallStatus: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'revision-requested';
    createdAt: Date;
    deadline?: Date;
    conditionalRouting: boolean;
    autoAdvance: boolean;
    requireAllApprovers: boolean;
}

export interface ApprovalWorkflowProps {
    workflow: ApprovalWorkflow;
    currentUserId: string;
    onApprove: (stageId: string, comment?: string) => void;
    onReject: (stageId: string, reason: string, revisionNotes?: string) => void;
    onRequestRevision: (stageId: string, changes: string[]) => void;
    onAddComment: (stageId: string, comment: string) => void;
    onDownloadProof: () => void;
    onLockForProduction: () => void;
}

export const ApprovalWorkflowManager: React.FC<ApprovalWorkflowProps> = ({
    workflow,
    currentUserId,
    onApprove,
    onReject,
    onRequestRevision,
    onAddComment,
    onDownloadProof,
    onLockForProduction
}) => {
    const [selectedStage, setSelectedStage] = useState<string | null>(null);
    const [approvalComment, setApprovalComment] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [revisionNotes, setRevisionNotes] = useState('');
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [showRejectionDialog, setShowRejectionDialog] = useState(false);
    const [showRevisionDialog, setShowRevisionDialog] = useState(false);
    const [revisionChanges, setRevisionChanges] = useState<string[]>([]);
    const [newChange, setNewChange] = useState('');

    const currentStage = workflow.stages[workflow.currentStage];
    const isApprover = currentStage?.approvers.includes(currentUserId);
    const hasApproved = currentStage?.completedBy?.includes(currentUserId);
    const isComplete = workflow.overallStatus === 'approved';
    const isRejected = workflow.overallStatus === 'rejected';

    const getStageIcon = (stage: ApprovalStage) => {
        switch (stage.status) {
            case 'approved':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'rejected':
                return <XCircle className="text-red-500" size={20} />;
            case 'in-progress':
                return <Clock className="text-blue-500" size={20} />;
            case 'pending':
                return <Clock className="text-gray-400" size={20} />;
            default:
                return <AlertCircle className="text-gray-400" size={20} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-500';
            case 'rejected':
                return 'bg-red-500';
            case 'in-progress':
                return 'bg-blue-500';
            case 'revision-requested':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-400';
        }
    };

    const handleApprove = () => {
        if (currentStage) {
            onApprove(currentStage.id, approvalComment);
            setApprovalComment('');
            setShowApprovalDialog(false);
        }
    };

    const handleReject = () => {
        if (currentStage && rejectionReason.trim()) {
            onReject(currentStage.id, rejectionReason, revisionNotes);
            setRejectionReason('');
            setRevisionNotes('');
            setShowRejectionDialog(false);
        }
    };

    const handleRequestRevision = () => {
        if (currentStage && revisionChanges.length > 0) {
            onRequestRevision(currentStage.id, revisionChanges);
            setRevisionChanges([]);
            setShowRevisionDialog(false);
        }
    };

    const addRevisionChange = () => {
        if (newChange.trim()) {
            setRevisionChanges([...revisionChanges, newChange]);
            setNewChange('');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text">{workflow.jobName}</h1>
                        <p className="text-sm text-muted">Approval Workflow</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={clsx(
                            "px-4 py-2 rounded-lg text-white font-medium",
                            getStatusColor(workflow.overallStatus)
                        )}>
                            {workflow.overallStatus.replace('-', ' ').toUpperCase()}
                        </div>
                        {isComplete && (
                            <button
                                onClick={onLockForProduction}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-2"
                            >
                                <Lock size={18} />
                                Lock for Production
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{
                                width: `${((workflow.currentStage + 1) / workflow.stages.length) * 100}%`
                            }}
                        />
                    </div>
                    <div className="mt-2 text-sm text-muted text-center">
                        Stage {workflow.currentStage + 1} of {workflow.stages.length}
                    </div>
                </div>
            </div>

            {/* Stages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {workflow.stages.map((stage, index) => (
                    <div
                        key={stage.id}
                        onClick={() => setSelectedStage(stage.id)}
                        className={clsx(
                            "p-6 border-2 rounded-xl cursor-pointer transition-all",
                            selectedStage === stage.id
                                ? "border-primary bg-primary/5"
                                : "border-border bg-surface hover:border-primary/50",
                            index === workflow.currentStage && "ring-2 ring-primary ring-offset-2"
                        )}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                                {getStageIcon(stage)}
                                <h3 className="font-bold text-text">{stage.name}</h3>
                            </div>
                            <span className="text-xs text-muted">Stage {stage.order}</span>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted">
                                <User size={14} />
                                <span>{stage.approvers.length} approver(s)</span>
                            </div>

                            <div className="flex items-center gap-2 text-muted">
                                <CheckCircle size={14} />
                                <span>{stage.currentApprovals}/{stage.requiredApprovals} approved</span>
                            </div>

                            {stage.deadline && (
                                <div className="flex items-center gap-2 text-muted">
                                    <Calendar size={14} />
                                    <span>{new Date(stage.deadline).toLocaleDateString()}</span>
                                </div>
                            )}

                            {stage.completedAt && (
                                <div className="text-xs text-green-500">
                                    ✓ Completed {new Date(stage.completedAt).toLocaleString()}
                                </div>
                            )}
                        </div>

                        {/* Comments Count */}
                        {stage.comments && stage.comments.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex items-center gap-2 text-sm text-muted">
                                    <MessageSquare size={14} />
                                    <span>{stage.comments.length} comment(s)</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Current Stage Actions */}
            {isApprover && !hasApproved && !isComplete && !isRejected && (
                <div className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-xl mb-8">
                    <h2 className="text-xl font-bold text-text mb-4">Your Action Required</h2>
                    <p className="text-muted mb-6">
                        You are an approver for <strong>{currentStage.name}</strong>. Please review the proof and take action.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setShowApprovalDialog(true)}
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-2"
                        >
                            <CheckCircle size={18} />
                            Approve
                        </button>

                        <button
                            onClick={() => setShowRevisionDialog(true)}
                            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium flex items-center gap-2"
                        >
                            <FileText size={18} />
                            Request Revision
                        </button>

                        <button
                            onClick={() => setShowRejectionDialog(true)}
                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center gap-2"
                        >
                            <XCircle size={18} />
                            Reject
                        </button>

                        <button
                            onClick={onDownloadProof}
                            className="px-6 py-3 bg-surface border border-border hover:bg-background text-text rounded-lg font-medium flex items-center gap-2"
                        >
                            <Download size={18} />
                            Download Proof
                        </button>
                    </div>
                </div>
            )}

            {/* Approval Dialog */}
            {showApprovalDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-surface p-8 rounded-xl max-w-md w-full">
                        <h3 className="text-2xl font-bold text-text mb-4">Approve Proof</h3>
                        <p className="text-muted mb-6">
                            By approving, you confirm this proof is ready to proceed to the next stage.
                        </p>

                        <textarea
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                            placeholder="Add optional comment..."
                            className="w-full p-3 border border-border rounded-lg mb-6 bg-background text-text"
                            rows={4}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={handleApprove}
                                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                            >
                                Confirm Approval
                            </button>
                            <button
                                onClick={() => setShowApprovalDialog(false)}
                                className="px-6 py-3 bg-surface border border-border hover:bg-background text-text rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Dialog */}
            {showRejectionDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-surface p-8 rounded-xl max-w-md w-full">
                        <h3 className="text-2xl font-bold text-text mb-4">Reject Proof</h3>
                        <p className="text-muted mb-6">
                            Please provide a reason for rejection. This will stop the approval workflow.
                        </p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection (required)..."
                            className="w-full p-3 border border-border rounded-lg mb-4 bg-background text-text"
                            rows={4}
                            required
                        />

                        <textarea
                            value={revisionNotes}
                            onChange={(e) => setRevisionNotes(e.target.value)}
                            placeholder="Additional notes for revision..."
                            className="w-full p-3 border border-border rounded-lg mb-6 bg-background text-text"
                            rows={3}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Rejection
                            </button>
                            <button
                                onClick={() => setShowRejectionDialog(false)}
                                className="px-6 py-3 bg-surface border border-border hover:bg-background text-text rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Revision Dialog */}
            {showRevisionDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-surface p-8 rounded-xl max-w-2xl w-full">
                        <h3 className="text-2xl font-bold text-text mb-4">Request Revisions</h3>
                        <p className="text-muted mb-6">
                            List the specific changes needed. The proof will be sent back for revision.
                        </p>

                        <div className="mb-4">
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newChange}
                                    onChange={(e) => setNewChange(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addRevisionChange()}
                                    placeholder="Describe a required change..."
                                    className="flex-1 p-3 border border-border rounded-lg bg-background text-text"
                                />
                                <button
                                    onClick={addRevisionChange}
                                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium"
                                >
                                    Add
                                </button>
                            </div>

                            {revisionChanges.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-text">Required Changes:</p>
                                    {revisionChanges.map((change, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-background rounded-lg"
                                        >
                                            <span className="text-sm text-text">{index + 1}. {change}</span>
                                            <button
                                                onClick={() => setRevisionChanges(revisionChanges.filter((_, i) => i !== index))}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleRequestRevision}
                                disabled={revisionChanges.length === 0}
                                className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send for Revision
                            </button>
                            <button
                                onClick={() => setShowRevisionDialog(false)}
                                className="px-6 py-3 bg-surface border border-border hover:bg-background text-text rounded-lg font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stage Details */}
            {selectedStage && (
                <div className="p-6 bg-surface border border-border rounded-xl">
                    <h3 className="text-xl font-bold text-text mb-4">
                        {workflow.stages.find(s => s.id === selectedStage)?.name} - Details
                    </h3>

                    {/* Comments */}
                    <div className="space-y-3">
                        {workflow.stages
                            .find(s => s.id === selectedStage)
                            ?.comments?.map(comment => (
                                <div
                                    key={comment.id}
                                    className="p-4 bg-background rounded-lg"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-text">{comment.userName}</span>
                                        <span className="text-xs text-muted">
                                            {new Date(comment.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted">{comment.comment}</p>
                                    <span className={clsx(
                                        "inline-block mt-2 px-2 py-1 rounded text-xs font-medium",
                                        comment.type === 'approval' && "bg-green-500/20 text-green-500",
                                        comment.type === 'rejection' && "bg-red-500/20 text-red-500",
                                        comment.type === 'revision' && "bg-yellow-500/20 text-yellow-500",
                                        comment.type === 'question' && "bg-blue-500/20 text-blue-500"
                                    )}>
                                        {comment.type}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};
