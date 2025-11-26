import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Clock, CheckCircle, XCircle, AlertCircle, History } from 'lucide-react';

interface ApprovalChain {
    id: string;
    jobId: string;
    customerId: string;
    stages: ApprovalStage[];
    currentStageIndex: number;
    status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'cancelled' | 'expired';
    createdAt: Date;
    updatedAt: Date;
}

interface ApprovalStage {
    id: string;
    name: string;
    description?: string;
    approvers: StageApprover[];
    requiredApprovals: number;
    allowPartialApproval: boolean;
    deadline?: Date;
    status: 'pending' | 'in-progress' | 'approved' | 'rejected' | 'skipped';
    approvals: Approval[];
    createdAt: Date;
}

interface StageApprover {
    userId: string;
    role: 'required' | 'optional' | 'cc';
    notified: boolean;
}

interface Approval {
    id: string;
    userId: string;
    userName: string;
    decision: 'approved' | 'rejected' | 'partial' | 'conditional';
    feedback?: string;
    timestamp: Date;
}

export const ApprovalDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const [pendingApprovals, setPendingApprovals] = useState<ApprovalChain[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApproval, setSelectedApproval] = useState<ApprovalChain | null>(null);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchPendingApprovals();
        }
    }, [currentUser]);

    const fetchPendingApprovals = async () => {
        try {
            const response = await fetch(`/api/v1/approvals/pending/${currentUser?.uid}`);
            const data = await response.json();

            if (data.success) {
                setPendingApprovals(data.approvals);
            }
        } catch (error) {
            console.error('Error fetching pending approvals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (chainId: string) => {
        setSubmitting(true);
        try {
            const response = await fetch(`/api/v1/approvals/${chainId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser?.uid,
                    userName: currentUser?.displayName || currentUser?.email,
                    decision: 'approved',
                    feedback: feedback || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Refresh the list
                await fetchPendingApprovals();
                setSelectedApproval(null);
                setFeedback('');
            }
        } catch (error) {
            console.error('Error approving:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async (chainId: string) => {
        if (!feedback.trim()) {
            alert('Please provide feedback for rejection');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`/api/v1/approvals/${chainId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser?.uid,
                    userName: currentUser?.displayName || currentUser?.email,
                    feedback,
                }),
            });

            const data = await response.json();

            if (data.success) {
                await fetchPendingApprovals();
                setSelectedApproval(null);
                setFeedback('');
            }
        } catch (error) {
            console.error('Error rejecting:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getDeadlineStatus = (deadline?: Date) => {
        if (!deadline) return null;

        const now = new Date();
        const deadlineDate = new Date(deadline);
        const hoursRemaining = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursRemaining < 0) {
            return { status: 'overdue', color: 'text-red-600', bg: 'bg-red-50' };
        } else if (hoursRemaining < 24) {
            return { status: 'urgent', color: 'text-orange-600', bg: 'bg-orange-50' };
        } else if (hoursRemaining < 72) {
            return { status: 'soon', color: 'text-yellow-600', bg: 'bg-yellow-50' };
        }
        return { status: 'normal', color: 'text-gray-600', bg: 'bg-gray-50' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{pendingApprovals.length} pending</span>
                </div>
            </div>

            {pendingApprovals.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">You have no pending approvals at this time.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pendingApprovals.map((chain) => {
                        const currentStage = chain.stages[chain.currentStageIndex];
                        const deadlineStatus = getDeadlineStatus(currentStage.deadline);

                        return (
                            <div
                                key={chain.id}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {currentStage.name}
                                        </h3>
                                        {currentStage.description && (
                                            <p className="text-sm text-gray-600 mb-2">{currentStage.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>Stage {chain.currentStageIndex + 1} of {chain.stages.length}</span>
                                            <span>•</span>
                                            <span>{currentStage.approvals.length} / {currentStage.requiredApprovals} approved</span>
                                        </div>
                                    </div>

                                    {deadlineStatus && (
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${deadlineStatus.bg} ${deadlineStatus.color}`}>
                                            {deadlineStatus.status === 'overdue' && '⚠️ Overdue'}
                                            {deadlineStatus.status === 'urgent' && '🔥 Due Soon'}
                                            {deadlineStatus.status === 'soon' && '⏰ Upcoming'}
                                            {deadlineStatus.status === 'normal' && '📅 Scheduled'}
                                        </div>
                                    )}
                                </div>

                                {currentStage.deadline && (
                                    <div className="mb-4 text-sm text-gray-600">
                                        <strong>Deadline:</strong> {new Date(currentStage.deadline).toLocaleString()}
                                    </div>
                                )}

                                {selectedApproval?.id === chain.id ? (
                                    <div className="space-y-4 mt-4 pt-4 border-t">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Feedback (optional for approval, required for rejection)
                                            </label>
                                            <textarea
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                rows={3}
                                                placeholder="Add your comments..."
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleApprove(chain.id)}
                                                disabled={submitting}
                                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                {submitting ? 'Approving...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(chain.id)}
                                                disabled={submitting}
                                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                {submitting ? 'Rejecting...' : 'Reject'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedApproval(null);
                                                    setFeedback('');
                                                }}
                                                disabled={submitting}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => setSelectedApproval(chain)}
                                            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Review & Decide
                                        </button>
                                        <button
                                            className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                        >
                                            <History className="w-4 h-4" />
                                            View History
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
