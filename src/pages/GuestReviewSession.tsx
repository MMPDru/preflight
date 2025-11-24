import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Video, CheckCircle, X, Loader } from 'lucide-react';
import { PDFViewer } from '../components/PDFViewer';
import clsx from 'clsx';

interface GuestSession {
    id: string;
    proofName: string;
    proofUrl: string;
    hostName: string;
    expiresAt: Date;
    requiresConsent: boolean;
    allowAnnotations: boolean;
    allowApproval: boolean;
}

const MOCK_SESSION: GuestSession = {
    id: 'guest-123',
    proofName: 'Brand_Guidelines_Final.pdf',
    proofUrl: 'https://pdfobject.com/pdf/sample.pdf',
    hostName: 'Sarah Chen',
    expiresAt: new Date(Date.now() + 86400000), // 24 hours
    requiresConsent: true,
    allowAnnotations: true,
    allowApproval: true
};

export const GuestReviewSession = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState<GuestSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [consentGiven, setConsentGiven] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [approved, setApproved] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [signature, setSignature] = useState('');

    useEffect(() => {
        // Simulate fetching session data
        setTimeout(() => {
            setSession(MOCK_SESSION);
            setLoading(false);
        }, 1000);
    }, [sessionId]);

    const handleConsentSubmit = () => {
        if (guestName.trim() && guestEmail.trim()) {
            setConsentGiven(true);
        }
    };

    const handleApprove = () => {
        setShowApprovalModal(true);
    };

    const handleReject = () => {
        if (confirm('Are you sure you want to reject this proof?')) {
            alert('Proof rejected. The host has been notified.');
            navigate('/');
        }
    };

    const handleFinalApproval = () => {
        if (signature.trim()) {
            setApproved(true);
            setShowApprovalModal(false);
            alert('Proof approved! A confirmation email has been sent.');
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader size={48} className="text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted">Loading review session...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="text-center max-w-md">
                    <X size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-text mb-2">Session Not Found</h1>
                    <p className="text-muted mb-6">
                        This review session may have expired or the link is invalid.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    // Consent Screen
    if (session.requiresConsent && !consentGiven) {
        return (
            <div className="h-screen flex items-center justify-center bg-background p-4">
                <div className="bg-surface border border-border rounded-xl p-8 max-w-md w-full shadow-2xl">
                    <div className="text-center mb-6">
                        <Video size={48} className="text-secondary mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-text mb-2">
                            Join Review Session
                        </h1>
                        <p className="text-muted">
                            {session.hostName} has invited you to review <strong>{session.proofName}</strong>
                        </p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">
                                Your Name
                            </label>
                            <input
                                type="text"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-secondary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                placeholder="your.email@example.com"
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-secondary"
                            />
                        </div>
                    </div>

                    <div className="bg-background border border-border rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-text mb-2 text-sm">Session Permissions:</h3>
                        <ul className="space-y-1 text-sm text-muted">
                            <li className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-500" />
                                View proof document
                            </li>
                            {session.allowAnnotations && (
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-500" />
                                    Add comments and annotations
                                </li>
                            )}
                            {session.allowApproval && (
                                <li className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-500" />
                                    Approve or reject proof
                                </li>
                            )}
                        </ul>
                    </div>

                    <button
                        onClick={handleConsentSubmit}
                        disabled={!guestName.trim() || !guestEmail.trim()}
                        className={clsx(
                            "w-full py-3 rounded-lg font-semibold transition-all",
                            guestName.trim() && guestEmail.trim()
                                ? "bg-secondary hover:bg-secondary/90 text-white"
                                : "bg-surface text-muted cursor-not-allowed"
                        )}
                    >
                        Join Session
                    </button>

                    <p className="text-xs text-muted text-center mt-4">
                        By joining, you agree to the session terms. No account required.
                    </p>
                </div>
            </div>
        );
    }

    // Main Review Interface
    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface">
                <div className="flex items-center gap-4">
                    <FileText size={24} className="text-primary" />
                    <div>
                        <h1 className="text-lg font-bold text-text">{session.proofName}</h1>
                        <p className="text-xs text-muted">
                            Hosted by {session.hostName} • Guest: {guestName}
                        </p>
                    </div>
                </div>

                {/* Quick Approval Buttons */}
                {session.allowApproval && !approved && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReject}
                            className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-medium"
                        >
                            Reject
                        </button>
                        <button
                            onClick={handleApprove}
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all font-medium flex items-center gap-2"
                        >
                            <CheckCircle size={20} />
                            Approve
                        </button>
                    </div>
                )}

                {approved && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <CheckCircle size={20} className="text-green-500" />
                        <span className="text-green-500 font-semibold">Approved</span>
                    </div>
                )}
            </header>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden">
                <PDFViewer
                    fileUrl={session.proofUrl}
                    onPageChange={() => { }}
                />
            </div>

            {/* Approval Modal */}
            {showApprovalModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                            <CheckCircle size={24} className="text-green-500" />
                            Approve Proof
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div className="bg-background border border-border rounded-lg p-4">
                                <p className="text-sm text-muted mb-2">You are approving:</p>
                                <p className="font-semibold text-text">{session.proofName}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted mb-2">
                                    Digital Signature
                                </label>
                                <input
                                    type="text"
                                    value={signature}
                                    onChange={(e) => setSignature(e.target.value)}
                                    placeholder="Type your full name"
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-secondary font-signature text-2xl"
                                    style={{ fontFamily: 'cursive' }}
                                />
                                <p className="text-xs text-muted mt-1">
                                    This will serve as your digital signature
                                </p>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                <p className="text-xs text-blue-400">
                                    By signing, you confirm that you have reviewed and approve this proof for production.
                                    A confirmation email will be sent to <strong>{guestEmail}</strong>.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowApprovalModal(false)}
                                className="flex-1 px-4 py-3 border border-border rounded-lg text-muted hover:text-text hover:bg-background transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFinalApproval}
                                disabled={!signature.trim()}
                                className={clsx(
                                    "flex-1 px-4 py-3 rounded-lg font-semibold transition-all",
                                    signature.trim()
                                        ? "bg-green-500 hover:bg-green-600 text-white"
                                        : "bg-surface text-muted cursor-not-allowed"
                                )}
                            >
                                Confirm Approval
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Session Expiry Notice */}
            <div className="bg-orange-500/10 border-t border-orange-500/30 px-6 py-2">
                <p className="text-xs text-orange-400 text-center">
                    This session expires on {session.expiresAt.toLocaleString()}
                </p>
            </div>
        </div>
    );
};
