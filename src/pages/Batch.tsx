import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { ActionRecorder, type Workflow } from '../lib/action-recorder';
import { rotatePage, deletePage, movePage } from '../lib/pdf-editor';
import { Play, Download } from 'lucide-react';

export const Batch = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState<File[]>([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<{ file: string; status: 'success' | 'error'; message: string }[]>([]);

    const workflows = ActionRecorder.getWorkflows();

    const handleFilesSelected = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
    };

    const applyWorkflow = async (fileUrl: string, workflow: Workflow): Promise<void> => {
        let currentUrl = fileUrl;

        for (const action of workflow.actions) {
            switch (action.type) {
                case 'rotate':
                    if (action.params.pageIndex !== undefined && action.params.angle !== undefined) {
                        currentUrl = await rotatePage(currentUrl, action.params.pageIndex, action.params.angle);
                    }
                    break;
                case 'delete':
                    if (action.params.pageIndex !== undefined) {
                        currentUrl = await deletePage(currentUrl, action.params.pageIndex);
                    }
                    break;
                case 'move':
                    if (action.params.fromIndex !== undefined && action.params.toIndex !== undefined) {
                        currentUrl = await movePage(currentUrl, action.params.fromIndex, action.params.toIndex);
                    }
                    break;
            }
        }

        // Trigger download of the processed file
        const response = await fetch(currentUrl);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'processed.pdf';
            a.click();
            URL.revokeObjectURL(url);
            resolve();
        });
    };

    const handleProcess = async () => {
        if (!selectedWorkflow || files.length === 0) {
            alert('Please select files and a workflow');
            return;
        }

        const workflow = workflows.find(w => w.id === selectedWorkflow);
        if (!workflow) return;

        setProcessing(true);
        setProgress(0);
        setResults([]);

        const newResults: typeof results = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const fileUrl = URL.createObjectURL(file);
                await applyWorkflow(fileUrl, workflow);
                URL.revokeObjectURL(fileUrl);

                newResults.push({
                    file: file.name,
                    status: 'success',
                    message: 'Processed successfully'
                });
            } catch (err) {
                newResults.push({
                    file: file.name,
                    status: 'error',
                    message: err instanceof Error ? err.message : 'Processing failed'
                });
            }
            setProgress(((i + 1) / files.length) * 100);
            setResults([...newResults]);
        }

        setProcessing(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text mb-2">Batch Processing</h1>
                    <p className="text-muted">Apply workflows to multiple PDFs at once</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors text-sm font-medium"
                >
                    Back to Dashboard
                </button>
            </div>

            {/* File Upload */}
            <div className="bg-surface border border-border rounded-lg p-6">
                <h2 className="text-lg font-bold text-text mb-4">Select Files</h2>
                <FileUpload onUpload={handleFilesSelected} multiple />
                {files.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm text-muted mb-2">{files.length} files selected</p>
                        <div className="space-y-1">
                            {files.slice(0, 5).map((file, i) => (
                                <p key={i} className="text-xs text-text font-mono">{file.name}</p>
                            ))}
                            {files.length > 5 && (
                                <p className="text-xs text-muted italic">...and {files.length - 5} more</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Workflow Selection */}
            <div className="bg-surface border border-border rounded-lg p-6">
                <h2 className="text-lg font-bold text-text mb-4">Select Workflow</h2>
                {workflows.length === 0 ? (
                    <p className="text-sm text-muted italic">No workflows saved. Create one in the Editor first.</p>
                ) : (
                    <select
                        value={selectedWorkflow}
                        onChange={(e) => setSelectedWorkflow(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded text-text"
                    >
                        <option value="">Choose a workflow...</option>
                        {workflows.map(w => (
                            <option key={w.id} value={w.id}>
                                {w.name} ({w.actions.length} actions)
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Process Button */}
            <button
                onClick={handleProcess}
                disabled={processing || !selectedWorkflow || files.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
                <Play size={20} />
                {processing ? 'Processing...' : 'Process Files'}
            </button>

            {/* Progress */}
            {processing && (
                <div className="bg-surface border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-text">Processing...</span>
                        <span className="text-sm text-muted">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="bg-surface border border-border rounded-lg p-6">
                    <h2 className="text-lg font-bold text-text mb-4">Results</h2>
                    <div className="space-y-2">
                        {results.map((result, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-background rounded border border-border">
                                <span className="text-sm text-text font-mono">{result.file}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded ${result.status === 'success'
                                            ? 'bg-green-500/10 text-green-500'
                                            : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {result.status.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-muted">{result.message}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
