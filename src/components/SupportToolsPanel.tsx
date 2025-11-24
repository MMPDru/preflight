import React, { useState } from 'react';
import {
    Monitor, Play, Zap, MessageSquare, FileText, Ticket,
    Video, Settings, Download, Copy, Check, Sparkles,
    ArrowRight, Code, Wrench, BookOpen
} from 'lucide-react';
import clsx from 'clsx';
import { SessionRecorder } from './SessionRecorder';

interface SupportToolsProps {
    customerId: string;
    sessionId: string;
    onToolActivate: (tool: string, params?: any) => void;
}

interface QuickFixMacro {
    id: string;
    name: string;
    description: string;
    category: 'preflight' | 'color' | 'file' | 'workflow';
    icon: string;
    steps: string[];
}

interface TemplateResponse {
    id: string;
    title: string;
    content: string;
    category: 'greeting' | 'troubleshooting' | 'closing' | 'escalation';
    variables: string[];
}

const QUICK_FIX_MACROS: QuickFixMacro[] = [
    {
        id: 'fix-bleed',
        name: 'Fix Bleed Settings',
        description: 'Automatically adjust bleed to 3mm on all sides',
        category: 'preflight',
        icon: '📐',
        steps: [
            'Open PDF in editor',
            'Set bleed to 3mm',
            'Validate changes',
            'Export corrected file'
        ]
    },
    {
        id: 'convert-cmyk',
        name: 'Convert to CMYK',
        description: 'Convert all RGB colors to CMYK for print',
        category: 'color',
        icon: '🎨',
        steps: [
            'Analyze color spaces',
            'Convert RGB to CMYK',
            'Apply color profile',
            'Verify conversion'
        ]
    },
    {
        id: 'optimize-pdf',
        name: 'Optimize PDF',
        description: 'Compress and optimize PDF for faster processing',
        category: 'file',
        icon: '⚡',
        steps: [
            'Analyze file size',
            'Compress images',
            'Remove unused objects',
            'Optimize structure'
        ]
    },
    {
        id: 'reset-workflow',
        name: 'Reset Workflow',
        description: 'Reset automation workflow to default settings',
        category: 'workflow',
        icon: '🔄',
        steps: [
            'Backup current settings',
            'Reset to defaults',
            'Clear cache',
            'Restart workflow'
        ]
    }
];

const TEMPLATE_RESPONSES: TemplateResponse[] = [
    {
        id: 'greeting-1',
        title: 'Initial Greeting',
        content: 'Hi {{customerName}}, thank you for reaching out! I\'m {{agentName}} and I\'ll be helping you today with {{issue}}. Let me take a look at this for you.',
        category: 'greeting',
        variables: ['customerName', 'agentName', 'issue']
    },
    {
        id: 'troubleshoot-1',
        title: 'Bleed Issue Resolution',
        content: 'I see the bleed settings issue. I\'m going to adjust the bleed to 3mm on all sides and re-export the file. This should resolve the error. Give me just a moment.',
        category: 'troubleshooting',
        variables: []
    },
    {
        id: 'troubleshoot-2',
        title: 'Color Profile Fix',
        content: 'The color profile needs to be updated to CMYK for print production. I\'ll convert this for you now and ensure all colors are print-ready.',
        category: 'troubleshooting',
        variables: []
    },
    {
        id: 'closing-1',
        title: 'Issue Resolved',
        content: 'Great! I\'ve resolved the {{issue}}. The file is now ready for production. Is there anything else I can help you with today?',
        category: 'closing',
        variables: ['issue']
    },
    {
        id: 'escalation-1',
        title: 'Escalate to Supervisor',
        content: 'I understand this is a complex issue. Let me connect you with my supervisor who specializes in {{specialty}}. They\'ll be able to provide more advanced assistance.',
        category: 'escalation',
        variables: ['specialty']
    }
];

export const SupportToolsPanel: React.FC<SupportToolsProps> = ({
    customerId,
    sessionId,
    onToolActivate
}) => {
    const [activeTab, setActiveTab] = useState<'tools' | 'macros' | 'templates' | 'recording'>('tools');
    const [remoteControlRequested, setRemoteControlRequested] = useState(false);
    const [remoteControlGranted, setRemoteControlGranted] = useState(false);
    const [guidedWorkflowActive, setGuidedWorkflowActive] = useState(false);
    const [selectedMacro, setSelectedMacro] = useState<QuickFixMacro | null>(null);
    const [macroRunning, setMacroRunning] = useState(false);
    const [macroProgress, setMacroProgress] = useState(0);
    const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

    const handleRemoteControlRequest = () => {
        setRemoteControlRequested(true);
        onToolActivate('remote-control-request');

        // Simulate customer approval
        setTimeout(() => {
            setRemoteControlGranted(true);
            setRemoteControlRequested(false);
        }, 2000);
    };

    const handleGuidedWorkflow = () => {
        setGuidedWorkflowActive(!guidedWorkflowActive);
        onToolActivate('guided-workflow', { active: !guidedWorkflowActive });
    };

    const handleRunMacro = (macro: QuickFixMacro) => {
        setSelectedMacro(macro);
        setMacroRunning(true);
        setMacroProgress(0);
        onToolActivate('quick-fix-macro', { macroId: macro.id });

        // Simulate macro execution
        const interval = setInterval(() => {
            setMacroProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setMacroRunning(false);
                    setTimeout(() => {
                        setSelectedMacro(null);
                        setMacroProgress(0);
                    }, 1000);
                    return 100;
                }
                return prev + 25;
            });
        }, 500);
    };

    const handleCopyTemplate = (template: TemplateResponse) => {
        let content = template.content;

        // Replace variables with placeholders
        template.variables.forEach(variable => {
            content = content.replace(`{{${variable}}}`, `[${variable}]`);
        });

        navigator.clipboard.writeText(content);
        setCopiedTemplate(template.id);

        setTimeout(() => {
            setCopiedTemplate(null);
        }, 2000);
    };

    const handleCreateTicket = () => {
        onToolActivate('create-ticket', { customerId, sessionId });
    };

    return (
        <div className="w-80 h-full border-l border-border bg-surface flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border bg-background">
                <h2 className="text-lg font-bold text-text flex items-center gap-2">
                    <Wrench size={20} />
                    Support Tools
                </h2>
                <p className="text-xs text-muted mt-1">Agent assistance & automation</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border bg-background">
                {(['tools', 'macros', 'templates', 'recording'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={clsx(
                            "flex-1 px-2 py-2 text-xs font-medium capitalize transition-colors",
                            activeTab === tab
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted hover:text-text"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
                {activeTab === 'tools' && (
                    <div className="space-y-3">
                        {/* Remote Control */}
                        <div className="p-4 bg-background border border-border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Monitor size={18} className="text-primary" />
                                <h3 className="font-bold text-text">Remote Control</h3>
                            </div>
                            <p className="text-xs text-muted mb-3">
                                Request permission to control customer's screen
                            </p>
                            {!remoteControlGranted ? (
                                <button
                                    onClick={handleRemoteControlRequest}
                                    disabled={remoteControlRequested}
                                    className={clsx(
                                        "w-full px-4 py-2 rounded-lg font-medium transition-all",
                                        remoteControlRequested
                                            ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                            : "bg-primary hover:bg-primary/90 text-white"
                                    )}
                                >
                                    {remoteControlRequested ? 'Waiting for approval...' : 'Request Control'}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
                                    <Check size={16} />
                                    Control Granted
                                </div>
                            )}
                        </div>

                        {/* Guided Workflow */}
                        <div className="p-4 bg-background border border-border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Play size={18} className="text-secondary" />
                                <h3 className="font-bold text-text">Guided Workflow</h3>
                            </div>
                            <p className="text-xs text-muted mb-3">
                                Activate step-by-step guidance for customer
                            </p>
                            <button
                                onClick={handleGuidedWorkflow}
                                className={clsx(
                                    "w-full px-4 py-2 rounded-lg font-medium transition-all",
                                    guidedWorkflowActive
                                        ? "bg-secondary text-white"
                                        : "bg-surface border border-border text-text hover:bg-background"
                                )}
                            >
                                {guidedWorkflowActive ? 'Deactivate Workflow' : 'Activate Workflow'}
                            </button>
                        </div>

                        {/* Screen Recording */}
                        <div className="p-4 bg-background border border-border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Video size={18} className="text-red-500" />
                                <h3 className="font-bold text-text">Session Recording</h3>
                            </div>
                            <p className="text-xs text-muted mb-3">
                                Record session for training or documentation
                            </p>
                            <button
                                onClick={() => setActiveTab('recording')}
                                className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
                            >
                                Open Recorder
                            </button>
                        </div>

                        {/* Create Ticket */}
                        <div className="p-4 bg-background border border-border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Ticket size={18} className="text-orange-500" />
                                <h3 className="font-bold text-text">Create Ticket</h3>
                            </div>
                            <p className="text-xs text-muted mb-3">
                                Create support ticket for follow-up
                            </p>
                            <button
                                onClick={handleCreateTicket}
                                className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all"
                            >
                                New Ticket
                            </button>
                        </div>

                        {/* Knowledge Base */}
                        <div className="p-4 bg-background border border-border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen size={18} className="text-blue-500" />
                                <h3 className="font-bold text-text">Knowledge Base</h3>
                            </div>
                            <p className="text-xs text-muted mb-3">
                                Search help articles and documentation
                            </p>
                            <input
                                type="text"
                                placeholder="Search articles..."
                                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'macros' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-text">Quick Fix Macros</h3>
                            <Zap size={16} className="text-yellow-500" />
                        </div>

                        {selectedMacro && macroRunning && (
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={16} className="text-primary animate-pulse" />
                                    <span className="text-sm font-medium text-primary">
                                        Running: {selectedMacro.name}
                                    </span>
                                </div>
                                <div className="w-full bg-surface h-2 rounded-full overflow-hidden mb-2">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${macroProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted">
                                    Step {Math.floor(macroProgress / 25) + 1} of {selectedMacro.steps.length}
                                </p>
                            </div>
                        )}

                        {QUICK_FIX_MACROS.map(macro => (
                            <div
                                key={macro.id}
                                className="p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-all"
                            >
                                <div className="flex items-start gap-3 mb-2">
                                    <span className="text-2xl">{macro.icon}</span>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-text text-sm">{macro.name}</h4>
                                        <p className="text-xs text-muted">{macro.description}</p>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <p className="text-xs font-medium text-muted mb-1">Steps:</p>
                                    <ul className="space-y-1">
                                        {macro.steps.map((step, idx) => (
                                            <li key={idx} className="text-xs text-text flex items-center gap-2">
                                                <ArrowRight size={10} className="text-muted" />
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    onClick={() => handleRunMacro(macro)}
                                    disabled={macroRunning}
                                    className={clsx(
                                        "w-full px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                        macroRunning
                                            ? "bg-surface text-muted cursor-not-allowed"
                                            : "bg-primary hover:bg-primary/90 text-white"
                                    )}
                                >
                                    Run Macro
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'templates' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-text">Response Templates</h3>
                            <MessageSquare size={16} className="text-primary" />
                        </div>

                        {(['greeting', 'troubleshooting', 'closing', 'escalation'] as const).map(category => {
                            const templates = TEMPLATE_RESPONSES.filter(t => t.category === category);
                            if (templates.length === 0) return null;

                            return (
                                <div key={category}>
                                    <h4 className="text-xs font-bold text-muted uppercase mb-2 capitalize">
                                        {category}
                                    </h4>
                                    <div className="space-y-2 mb-4">
                                        {templates.map(template => (
                                            <div
                                                key={template.id}
                                                className="p-3 bg-background border border-border rounded-lg"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h5 className="font-medium text-text text-sm">{template.title}</h5>
                                                    <button
                                                        onClick={() => handleCopyTemplate(template)}
                                                        className={clsx(
                                                            "p-1 rounded transition-colors",
                                                            copiedTemplate === template.id
                                                                ? "text-green-500"
                                                                : "text-muted hover:text-text"
                                                        )}
                                                    >
                                                        {copiedTemplate === template.id ? (
                                                            <Check size={14} />
                                                        ) : (
                                                            <Copy size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-muted bg-surface p-2 rounded">
                                                    {template.content}
                                                </p>
                                                {template.variables.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {template.variables.map(variable => (
                                                            <span
                                                                key={variable}
                                                                className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full"
                                                            >
                                                                {variable}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'recording' && (
                    <div>
                        <SessionRecorder
                            sessionId={sessionId}
                            onRecordingComplete={(blob, duration, chapters) => {
                                console.log('Recording complete:', { blob, duration, chapters });
                                onToolActivate('recording-complete', { blob, duration, chapters });
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
