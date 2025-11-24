import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, FileSignature } from 'lucide-react';
import clsx from 'clsx';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes-requested';

export interface ApprovalStage {
    id: string;
    name: string;
    approver: string;
    status: ApprovalStatus;
    timestamp?: Date;
    comments?: string;
}

interface ApprovalWorkflowProps {
    stages: ApprovalStage[];
    onApprove: (stageId: string, comments?: string) => void;
    onReject: (stageId: string, comments: string) => void;
    onRequestChanges: (stageId: string, comments: string) => void;
    currentUserStage?: string;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
    stages,
    onApprove,
    onReject,
    onRequestChanges,
    currentUserStage
}) => {
    const [activeStage, setActiveStage] = useState<string | null>(null);
    const [comments, setComments] = useState('');

    const statusConfig = {
        pending: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock, label: 'Pending' },
        approved: { color: 'text-green-400', bg: 'bg-green-400/10', icon: CheckCircle, label: 'Approved' },
        rejected: { color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle, label: 'Rejected' },
        'changes-requested': { color: 'text-orange-400', bg: 'bg-orange-400/10', icon: FileSignature, label: 'Changes Requested' },
    };

    const handleAction = (stageId: string, action: 'approve' | 'reject' | 'changes') => {
        if (action === 'approve') {
            onApprove(stageId, comments || undefined);
        } else if (action === 'reject') {
            onReject(stageId, comments);
        } else {
            onRequestChanges(stageId, comments);
        }
        setComments('');
        setActiveStage(null);
    };

    return (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <FileSignature size={20} className="text-primary" />
                <h3 className="font-semibold text-text">Approval Workflow</h3>
            </div>

            <div className="space-y-3">
                {stages.map((stage, index) => {
                    const config = statusConfig[stage.status];
                    const StatusIcon = config.icon;
                    const isCurrentUser = currentUserStage === stage.id;
                    const canAct = isCurrentUser && stage.status === 'pending';

                    return (
                        <div
                            key={stage.id}
                            className={clsx(
                                "border rounded-lg p-4 transition-all",
                                isCurrentUser ? "border-primary/50 bg-primary/5" : "border-border"
                            )}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-muted">
                                                Stage {index + 1}:
                                            </span>
                                            <span className="font-semibold text-text">{stage.name}</span>
                                        </div>
                                        <div className={clsx('flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
                                            <StatusIcon size={12} />
                                            {config.label}
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted">Approver: {stage.approver}</p>

                                    {stage.timestamp && (
                                        <p className="text-xs text-muted mt-1">
                                            {new Date(stage.timestamp).toLocaleString()}
                                        </p>
                                    )}

                                    {stage.comments && (
                                        <div className="mt-2 p-2 bg-background rounded-md">
                                            <p className="text-sm text-text">{stage.comments}</p>
                                        </div>
                                    )}

                                    {canAct && activeStage === stage.id && (
                                        <div className="mt-3 space-y-2">
                                            <textarea
                                                value={comments}
                                                onChange={(e) => setComments(e.target.value)}
                                                placeholder="Add comments (optional for approval, required for rejection)"
                                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text placeholder-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAction(stage.id, 'approve')}
                                                    className="px-3 py-1.5 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(stage.id, 'changes')}
                                                    disabled={!comments.trim()}
                                                    className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Request Changes
                                                </button>
                                                <button
                                                    onClick={() => handleAction(stage.id, 'reject')}
                                                    disabled={!comments.trim()}
                                                    className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => setActiveStage(null)}
                                                    className="px-3 py-1.5 bg-surface text-text rounded-md text-sm font-medium hover:bg-background transition-colors border border-border"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {canAct && activeStage !== stage.id && (
                                    <button
                                        onClick={() => setActiveStage(stage.id)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Review
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {stages.every(s => s.status === 'approved') && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle size={20} />
                        <span className="font-semibold">All stages approved - Ready for print!</span>
                    </div>
                </div>
            )}
        </div>
    );
};
