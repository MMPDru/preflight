import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PDFViewer } from '../components/PDFViewer';
import { type PreflightCheck } from '../components/PreflightReport';
import { InspectorPanel } from '../components/InspectorPanel';
import { AutomationPanel } from '../components/AutomationPanel';
import { SmartRoutingPanel } from '../components/SmartRoutingPanel';
import { analyzePDF, getPageObjects, getPageGeometry, getLayers, calculateComplexity, type PageObject, type PageGeometry, type Layer, type ComplexityResult } from '../lib/preflight-engine';
import { rotatePage, deletePage, movePage, getPageInfo } from '../lib/pdf-editor';
import { fixBleed } from '../lib/bleed-fixer';
import { ActionRecorder } from '../lib/action-recorder';
import { fixHistoryManager } from '../lib/fix-history';
import { Zap, MessageSquare, FileSignature, GitCompare, History, Bot, Mail, Video } from 'lucide-react';
import { HelpButton } from '../components/HelpButton';
import { AddAnnotationDialog } from '../components/AddAnnotationDialog';
import { type DrawingAnnotation } from '../components/CanvasOverlay';
import { CommentThread, type Comment } from '../components/CommentThread';
import { ApprovalWorkflow, type ApprovalStage } from '../components/ApprovalWorkflow';
import { VersionComparison } from '../components/VersionComparison';
import { RevisionHistory, type Revision } from '../components/RevisionHistory';
import { MetadataFixDialog } from '../components/MetadataFixDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmailTemplatePreview } from '../components/EmailTemplatePreview';
import { LiveSupport } from '../components/LiveSupport';

// Sample PDF for demo purposes if none uploaded
const DEMO_PDF = "/sample.pdf";

interface Annotation {
    id: string;
    x: number;
    y: number;
    page: number;
    content: string;
}

export const Editor = () => {
    const { id } = useParams();
    const location = useLocation();
    const fileName = location.state?.fileName || "Unknown File.pdf";
    const [fileUrl, setFileUrl] = useState<string>(location.state?.fileUrl || DEMO_PDF);

    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [drawingAnnotations, setDrawingAnnotations] = useState<DrawingAnnotation[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [activeCommentThread, setActiveCommentThread] = useState<string | null>(null);
    const [checks, setChecks] = useState<PreflightCheck[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Editor State
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageInfo, setPageInfo] = useState<{ width: number; height: number; rotation: number } | null>(null);
    const [pageObjects, setPageObjects] = useState<PageObject[]>([]);
    const [pageGeometry, setPageGeometry] = useState<PageGeometry | null>(null);
    const [layers, setLayers] = useState<Layer[]>([]);
    const [showAutomation, setShowAutomation] = useState(false);
    const [showApproval, setShowApproval] = useState(false);
    const [showSmartRouting, setShowSmartRouting] = useState(false);
    const [complexityResult, setComplexityResult] = useState<ComplexityResult | null>(null);

    // Annotation Dialog State
    const [annotationDialog, setAnnotationDialog] = useState<{ isOpen: boolean; x: number; y: number; page: number } | null>(null);
    const [pendingAnnotation, setPendingAnnotation] = useState<{ x: number; y: number; page: number } | null>(null);

    // Approval Workflow State
    const [approvalStages, setApprovalStages] = useState<ApprovalStage[]>([
        { id: 'design', name: 'Design Review', approver: 'Designer', status: 'pending' },
        { id: 'client', name: 'Client Approval', approver: 'Client', status: 'pending' },
        { id: 'production', name: 'Production Check', approver: 'Production Manager', status: 'pending' },
    ]);

    // Revision History State
    const [revisions, setRevisions] = useState<Revision[]>([
        {
            id: 'rev-3',
            version: 3,
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            author: 'Designer',
            changes: 'Fixed bleed issues and updated metadata',
            fileUrl: fileUrl,
        },
        {
            id: 'rev-2',
            version: 2,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            author: 'Designer',
            changes: 'Corrected color profile to CMYK',
            fileUrl: DEMO_PDF,
        },
        {
            id: 'rev-1',
            version: 1,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            author: 'Client',
            changes: 'Initial upload',
            fileUrl: DEMO_PDF,
        },
    ]);
    const [currentRevision, setCurrentRevision] = useState('rev-3');
    const [showRevisionHistory, setShowRevisionHistory] = useState(false);
    const [showVersionComparison, setShowVersionComparison] = useState(false);
    const [comparisonVersions, setComparisonVersions] = useState<{ original: string; revised: string } | null>(null);
    const [showMetadataDialog, setShowMetadataDialog] = useState(false);
    const [showBleedConfirm, setShowBleedConfirm] = useState(false);
    const [showEmailTemplates, setShowEmailTemplates] = useState(false);
    const [showLiveSupport, setShowLiveSupport] = useState(false);
    const pendingBytesRef = useRef<Uint8Array | null>(null);

    useEffect(() => {
        const runAnalysis = async () => {
            setIsAnalyzing(true);
            setChecks([
                { id: 'status', label: 'Analysis Status', status: 'warning', message: 'Analyzing document...' }
            ]);

            try {
                // Use pending bytes if available (from a fix), otherwise use the URL
                const fileToAnalyze = pendingBytesRef.current || fileUrl;

                const results = await analyzePDF(fileToAnalyze);
                setChecks(results);

                // Calculate Complexity
                // We need page count, which we can get from pdf-lib or just pass a placeholder if not ready
                // Actually we can get it from the loaded doc in analyzePDF but it returns checks.
                // Let's assume we can get it from pageInfo or just pass 1 for now if not available, 
                // or better, update analyzePDF to return metadata too.
                // For this MVP, I'll use a separate call or just estimate.
                // Wait, I can get page count from the PDFViewer state if I lift it up, 
                // or just use a default.
                // Let's use a default of 5 for now to test, or better, use the pdf-lib doc if we had it.
                // Actually, I can use the `checks` to find page count if I added a check for it.
                // I'll just pass a dummy value for now as I don't have easy access to page count here without re-parsing.
                const complexity = calculateComplexity(results, 5);
                setComplexityResult(complexity);

                // Fetch layers once per file
                const fetchedLayers = await getLayers(fileUrl);
                setLayers(fetchedLayers);

                // Clear pending bytes after successful analysis
                if (pendingBytesRef.current) {
                    pendingBytesRef.current = null;
                }
            } catch (err) {
                console.error(err);
                setChecks([{ id: 'error', label: 'Error', status: 'error', message: 'Analysis failed.' }]);
            } finally {
                setIsAnalyzing(false);
            }
        };

        if (fileUrl) {
            // Initialize fix history with the current file URL
            fixHistoryManager.initialize(fileUrl);
            runAnalysis();
        }
    }, [fileUrl]);

    // Update page info when page changes or file loads
    useEffect(() => {
        const fetchPageInfo = async () => {
            try {
                const info = await getPageInfo(fileUrl, currentPage - 1); // pdf-lib is 0-indexed
                setPageInfo(info);

                const objects = await getPageObjects(fileUrl, currentPage - 1);
                setPageObjects(objects);

                const geometry = await getPageGeometry(fileUrl, currentPage - 1);
                setPageGeometry(geometry);
            } catch (err) {
                console.error("Failed to get page info", err);
            }
        };
        fetchPageInfo();
    }, [fileUrl, currentPage]);

    const handlePageClick = (page: number, x: number, y: number) => {
        setCurrentPage(page);
        // Open dialog centered for now, or we could use mouse event if passed
        // Using fixed center position for stability
        setAnnotationDialog({
            isOpen: true,
            x: window.innerWidth / 2 - 160,
            y: window.innerHeight / 2 - 100,
            page
        });
        setPendingAnnotation({ x, y, page });
    };

    const handleAnnotationSubmit = (content: string) => {
        if (pendingAnnotation) {
            const id = (annotations.length + 1).toString();
            setAnnotations(prev => [...prev, {
                id,
                x: pendingAnnotation.x,
                y: pendingAnnotation.y,
                page: pendingAnnotation.page,
                content
            }]);
            setPendingAnnotation(null);
        }
    };

    const handleAddDrawingAnnotation = (annotation: DrawingAnnotation) => {
        setDrawingAnnotations(prev => [...prev, annotation]);
    };

    const handleAddComment = (annotationId: string, content: string, mentions: string[]) => {
        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            annotationId,
            author: 'Current User', // In production, get from auth
            content,
            timestamp: new Date(),
            mentions,
        };
        setComments(prev => [...prev, newComment]);
    };

    const handleApprove = (stageId: string, comments?: string) => {
        setApprovalStages(prev => prev.map(stage =>
            stage.id === stageId
                ? { ...stage, status: 'approved' as const, timestamp: new Date(), comments }
                : stage
        ));
    };

    const handleReject = (stageId: string, comments: string) => {
        setApprovalStages(prev => prev.map(stage =>
            stage.id === stageId
                ? { ...stage, status: 'rejected' as const, timestamp: new Date(), comments }
                : stage
        ));
    };

    const handleRequestChanges = (stageId: string, comments: string) => {
        setApprovalStages(prev => prev.map(stage =>
            stage.id === stageId
                ? { ...stage, status: 'changes-requested' as const, timestamp: new Date(), comments }
                : stage
        ));
    };

    const handleSelectRevision = (revisionId: string) => {
        const revision = revisions.find(r => r.id === revisionId);
        if (revision) {
            setFileUrl(revision.fileUrl);
            setCurrentRevision(revisionId);
        }
    };

    const handleCompareRevisions = (rev1: string, rev2: string) => {
        const revision1 = revisions.find(r => r.id === rev1);
        const revision2 = revisions.find(r => r.id === rev2);
        if (revision1 && revision2) {
            setComparisonVersions({
                original: revision1.fileUrl,
                revised: revision2.fileUrl,
            });
            setShowVersionComparison(true);
        }
    };

    const handleDeleteRevision = (revisionId: string) => {
        if (confirm('Are you sure you want to delete this revision?')) {
            setRevisions(prev => prev.filter(r => r.id !== revisionId));
        }
    };

    const handleRotatePage = async () => {
        try {
            const newUrl = await rotatePage(fileUrl, currentPage - 1, 90);
            setFileUrl(newUrl);
            ActionRecorder.recordAction('rotate', { pageIndex: currentPage - 1, angle: 90 }, `Rotate page ${currentPage} by 90°`);
        } catch (err) {
            console.error("Failed to rotate page", err);
            alert("Failed to rotate page.");
        }
    };

    const handleDeletePage = async () => {
        if (!confirm("Are you sure you want to delete this page?")) return;
        try {
            const newUrl = await deletePage(fileUrl, currentPage - 1);
            setFileUrl(newUrl);
            ActionRecorder.recordAction('delete', { pageIndex: currentPage - 1 }, `Delete page ${currentPage}`);
            // Adjust current page if necessary
            if (currentPage > 1) setCurrentPage(prev => prev - 1);
        } catch (err) {
            console.error("Failed to delete page", err);
            alert("Failed to delete page.");
        }
    };

    const handleMovePageUp = async () => {
        if (currentPage <= 1) return;
        try {
            // Move current page (index) to index - 1
            const newUrl = await movePage(fileUrl, currentPage - 1, currentPage - 2);
            setFileUrl(newUrl);
            ActionRecorder.recordAction('move', { fromIndex: currentPage - 1, toIndex: currentPage - 2 }, `Move page ${currentPage} up`);
            setCurrentPage(prev => prev - 1);
        } catch (err) {
            console.error("Failed to move page up", err);
            alert("Failed to move page up.");
        }
    };

    const handleMovePageDown = async () => {
        // We don't know total pages easily here without storing it, but pdf-lib handles out of bounds gracefully usually,
        // or we should track numPages. For now, let's just try.
        try {
            // Move current page (index) to index + 1
            const newUrl = await movePage(fileUrl, currentPage - 1, currentPage);
            setFileUrl(newUrl);
            ActionRecorder.recordAction('move', { fromIndex: currentPage - 1, toIndex: currentPage }, `Move page ${currentPage} down`);
            setCurrentPage(prev => prev + 1);
        } catch (err) {
            console.error("Failed to move page down", err);
            alert("Failed to move page down.");
        }
    };

    const handleFixBleed = () => {
        setShowBleedConfirm(true);
    };

    const handleFixBleedConfirmed = async () => {
        try {
            console.log('[BLEED FIX] Starting fix process...');
            const beforeUrl = fileUrl;
            console.log('[BLEED FIX] Before URL:', beforeUrl);

            console.log('[BLEED FIX] Calling fixBleed function...');
            const { url: newUrl, bytes: newPdfBytes } = await fixBleed(fileUrl);
            console.log('[BLEED FIX] fixBleed returned new URL:', newUrl);
            console.log('[BLEED FIX] newPdfBytes type:', typeof newPdfBytes);
            console.log('[BLEED FIX] newPdfBytes is instance of Uint8Array:', newPdfBytes instanceof Uint8Array);
            console.log('[BLEED FIX] newPdfBytes length:', newPdfBytes?.length);
            console.log('[BLEED FIX] newPdfBytes first 10 bytes:', newPdfBytes ? Array.from(newPdfBytes.slice(0, 10)) : 'null');

            // Store bytes for the useEffect to use for analysis
            pendingBytesRef.current = newPdfBytes;

            // Track this fix in history
            console.log('[BLEED FIX] Adding fix to history...');
            fixHistoryManager.addFix(
                'other',
                'Applied bleed fix with mirrored edges',
                beforeUrl,
                newUrl
            );
            console.log('[BLEED FIX] Fix added to history');

            console.log('[BLEED FIX] Updating file URL...');
            // This will trigger the useEffect to re-run analysis using pendingBytesRef.current
            setFileUrl(newUrl);
            console.log('[BLEED FIX] File URL updated');

            ActionRecorder.recordAction('rotate', { angle: 0 }, `Fix Bleed (Mirror Edges)`);

            console.log('[BLEED FIX] Bleed fix completed successfully');
        } catch (err) {
            console.error("[BLEED FIX] ERROR - Failed to fix bleed:", err);
            console.error("[BLEED FIX] ERROR - Error stack:", err instanceof Error ? err.stack : 'No stack trace');
            alert(`Failed to fix bleed: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Main Viewer */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-text">{fileName}</h2>
                        <p className="text-sm text-muted">Job ID: {id}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAutomation(true)}
                            className="px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <Zap size={16} />
                            Automation
                        </button>
                        <button
                            onClick={() => setShowSmartRouting(true)}
                            className="px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <Bot size={16} />
                            Smart Route
                        </button>
                        <button
                            onClick={() => setShowRevisionHistory(!showRevisionHistory)}
                            className="px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <History size={16} />
                            Revisions
                        </button>
                        <button
                            onClick={() => {
                                if (revisions.length >= 2) {
                                    handleCompareRevisions(revisions[0].id, revisions[1].id);
                                }
                            }}
                            disabled={revisions.length < 2}
                            className="px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <GitCompare size={16} />
                            Compare
                        </button>
                        <button
                            onClick={() => setShowApproval(!showApproval)}
                            className="px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <FileSignature size={16} />
                            Approval
                        </button>
                        <button
                            onClick={() => setActiveCommentThread(annotations[0]?.id || null)}
                            className="px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <MessageSquare size={16} />
                            Comments ({comments.length})
                        </button>
                        <button className="px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors text-sm font-medium">
                            Download Report
                        </button>
                        <button
                            onClick={() => setShowEmailTemplates(true)}
                            className="px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <Mail size={16} />
                            Email Templates
                        </button>
                        <button
                            onClick={() => setShowLiveSupport(true)}
                            className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <Video size={16} />
                            Live Support
                        </button>
                        <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-sm font-medium">
                            Approve Proof
                        </button>
                        <HelpButton
                            videoId="annotations-and-markups"
                            variant="icon"
                            size="md"
                            className="bg-surface hover:bg-surface/80 border border-border rounded-lg h-9 w-9 flex items-center justify-center ml-2"
                        />
                    </div>
                </div>

                <PDFViewer
                    fileUrl={fileUrl}
                    annotations={annotations}
                    drawingAnnotations={drawingAnnotations}
                    onPageClick={handlePageClick}
                    onPageChange={setCurrentPage}
                    onAddDrawingAnnotation={handleAddDrawingAnnotation}
                />
            </div>

            {/* Right Sidebar - Inspector Panel */}
            <InspectorPanel
                checks={checks}
                pageInfo={pageInfo}
                onRotatePage={handleRotatePage}
                onDeletePage={handleDeletePage}
                onMovePageUp={handleMovePageUp}
                onMovePageDown={handleMovePageDown}
                onFixBleed={handleFixBleed}
                annotations={annotations}
                currentPage={currentPage}
                pageObjects={pageObjects}
                pageGeometry={pageGeometry}
                layers={layers}
                onFix={async (checkId) => {
                    console.log('[EDITOR] onFix called with checkId:', checkId);
                    if (checkId === 'geo-bleed') {
                        console.log('[EDITOR] Calling handleFixBleed');
                        await handleFixBleed();
                    } else if (checkId === 'meta-title' || checkId === 'meta-author') {
                        console.log('[EDITOR] Opening metadata dialog');
                        setShowMetadataDialog(true);
                    } else if (checkId === 'img-color-rgb') {
                        if (confirm('Convert RGB images to CMYK? (Simulated for this demo)')) {
                            const beforeUrl = fileUrl;
                            const { fixColors } = await import('../lib/auto-fixer');
                            const result = await fixColors(fileUrl);

                            if (result.success && result.newUrl) {
                                fixHistoryManager.addFix(
                                    'color',
                                    'Converted RGB images to CMYK (Simulated)',
                                    beforeUrl,
                                    result.newUrl
                                );
                                setFileUrl(result.newUrl);
                                // Re-run analysis
                                setTimeout(async () => {
                                    const newResults = await analyzePDF(result.newUrl!);
                                    setChecks(newResults);
                                }, 500);
                            }
                        }
                    } else if (checkId === 'font-embed') {
                        if (confirm('Embed/Outline fonts? (Simulated for this demo)')) {
                            const beforeUrl = fileUrl;
                            const { fixFonts } = await import('../lib/auto-fixer');
                            const result = await fixFonts(fileUrl);

                            if (result.success && result.newUrl) {
                                fixHistoryManager.addFix(
                                    'font',
                                    'Embedded/Outlined fonts (Simulated)',
                                    beforeUrl,
                                    result.newUrl
                                );
                                setFileUrl(result.newUrl);
                                // Re-run analysis
                                setTimeout(async () => {
                                    const newResults = await analyzePDF(result.newUrl!);
                                    setChecks(newResults);
                                }, 500);
                            }
                        }
                    } else if (checkId === 'adv-pdfx') {
                        if (confirm('Convert to PDF/X-1a compliant file? This will set output intents and metadata.')) {
                            const beforeUrl = fileUrl;
                            const { fixPDFX } = await import('../lib/auto-fixer');
                            const result = await fixPDFX(fileUrl);

                            if (result.success && result.newUrl) {
                                fixHistoryManager.addFix(
                                    'compliance',
                                    'Converted to PDF/X-1a (Simulated)',
                                    beforeUrl,
                                    result.newUrl
                                );
                                setFileUrl(result.newUrl);
                                // Re-run analysis
                                setTimeout(async () => {
                                    const newResults = await analyzePDF(result.newUrl!);
                                    setChecks(newResults);
                                }, 500);
                            } else {
                                alert(result.message);
                            }
                        }
                    }
                }}
            />

            {/* Automation Panel */}
            {showAutomation && <AutomationPanel onClose={() => setShowAutomation(false)} fileUrl={fileUrl} />}

            {/* Smart Routing Panel */}
            {showSmartRouting && complexityResult && (
                <SmartRoutingPanel
                    complexity={complexityResult}
                    onClose={() => setShowSmartRouting(false)}
                    onRoute={(route) => {
                        console.log(`Routed to: ${route}`);
                        setShowSmartRouting(false);
                        alert(`File routed to ${route === 'auto' ? 'Auto-Fix' : 'Designer'} queue.`);
                    }}
                />
            )}

            {/* Revision History */}
            {showRevisionHistory && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRevisionHistory(false)}>
                    <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                        <RevisionHistory
                            revisions={revisions}
                            currentRevision={currentRevision}
                            onSelectRevision={handleSelectRevision}
                            onCompareRevisions={handleCompareRevisions}
                            onDeleteRevision={handleDeleteRevision}
                        />
                    </div>
                </div>
            )}

            {/* Version Comparison */}
            {showVersionComparison && comparisonVersions && (
                <VersionComparison
                    originalUrl={comparisonVersions.original}
                    revisedUrl={comparisonVersions.revised}
                    onClose={() => setShowVersionComparison(false)}
                />
            )}

            {/* Approval Workflow */}
            {showApproval && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowApproval(false)}>
                    <div className="max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <ApprovalWorkflow
                            stages={approvalStages}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onRequestChanges={handleRequestChanges}
                            currentUserStage="design"
                        />
                    </div>
                </div>
            )}

            {/* Comment Thread */}
            {activeCommentThread && (
                <CommentThread
                    annotationId={activeCommentThread}
                    comments={comments.filter(c => c.annotationId === activeCommentThread)}
                    onAddComment={(content, mentions) => handleAddComment(activeCommentThread, content, mentions)}
                    onClose={() => setActiveCommentThread(null)}
                />
            )}

            {/* Annotation Dialog */}
            {annotationDialog && (
                <AddAnnotationDialog
                    isOpen={annotationDialog.isOpen}
                    onClose={() => setAnnotationDialog(null)}
                    onSubmit={handleAnnotationSubmit}
                    x={annotationDialog.x}
                    y={annotationDialog.y}
                />
            )}

            {/* Metadata Fix Dialog */}
            <MetadataFixDialog
                isOpen={showMetadataDialog}
                onClose={() => setShowMetadataDialog(false)}
                onSubmit={async (title, author) => {
                    try {
                        // Only proceed if at least one field has a value
                        if (!title && !author) {
                            setShowMetadataDialog(false);
                            return;
                        }

                        const beforeUrl = fileUrl;
                        const { fixMetadata } = await import('../lib/auto-fixer');
                        const result = await fixMetadata(fileUrl, {
                            title: title || undefined,
                            author: author || undefined
                        });

                        if (result.success && result.newUrl) {
                            // Track this fix in history
                            const description = [];
                            if (title) description.push(`Title: "${title}"`);
                            if (author) description.push(`Author: "${author}"`);

                            fixHistoryManager.addFix(
                                'metadata',
                                `Updated metadata - ${description.join(', ')}`,
                                beforeUrl,
                                result.newUrl
                            );

                            // Update the file URL
                            setFileUrl(result.newUrl);

                            // Re-run preflight analysis with the new URL
                            setTimeout(async () => {
                                const newResults = await analyzePDF(result.newUrl!);
                                setChecks(newResults);
                            }, 500);
                        } else {
                            console.error('Fix failed:', result.message);
                        }
                    } catch (e) {
                        console.error('Failed to fix metadata:', e);
                    }
                }}
            />
            {/* Email Templates */}
            {showEmailTemplates && (
                <EmailTemplatePreview
                    onClose={() => setShowEmailTemplates(false)}
                    jobData={{
                        jobId: id || 'DEMO-001',
                        customerName: 'Customer Name',
                        fileName: fileName,
                        uploadDate: new Date().toLocaleDateString(),
                        proofLink: window.location.href
                    }}
                />
            )}
            {/* Live Support */}
            {showLiveSupport && (
                <LiveSupport
                    onClose={() => setShowLiveSupport(false)}
                    userName="Current User"
                    userRole="customer"
                />
            )}
            <ConfirmDialog
                isOpen={showBleedConfirm}
                onClose={() => setShowBleedConfirm(false)}
                onConfirm={handleFixBleedConfirmed}
                title="Fix Bleed Issues"
                message="This will create a new document with mirrored bleed edges added to all pages. This action cannot be undone directly, but a new version will be created. Continue?"
            />
        </div>
    );
};

