import React, { useState } from 'react';
import { X, Mail, Send, Copy, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    category: 'proof' | 'approval' | 'reminder';
}

const emailTemplates: EmailTemplate[] = [
    {
        id: 'proof-ready',
        name: 'Proof Ready',
        subject: 'Your Proof is Ready for Review',
        body: `Hi {{customerName}},

Your proof for Job #{{jobId}} is now ready for review!

**Job Details:**
- File: {{fileName}}
- Uploaded: {{uploadDate}}
- Status: Ready for Review

Please review the proof and provide your approval or feedback at your earliest convenience.

{{proofLink}}

If you have any questions, feel free to reach out to our team.

Best regards,
{{companyName}}`,
        category: 'proof'
    },
    {
        id: 'changes-requested',
        name: 'Changes Requested',
        subject: 'Changes Requested for Job #{{jobId}}',
        body: `Hi {{customerName}},

We've reviewed your file for Job #{{jobId}} and have identified some items that need your attention:

{{changesList}}

Please review these items and upload a revised file, or let us know if you'd like our design team to make these adjustments.

{{proofLink}}

Thank you,
{{companyName}}`,
        category: 'approval'
    },
    {
        id: 'approved',
        name: 'Proof Approved',
        subject: 'Proof Approved - Moving to Production',
        body: `Hi {{customerName}},

Great news! Your proof for Job #{{jobId}} has been approved and is now moving to production.

**Next Steps:**
- Your order will be processed within {{processingTime}}
- Expected completion: {{completionDate}}
- You'll receive a shipping notification once the order is ready

{{orderDetailsLink}}

Thank you for your business!

Best regards,
{{companyName}}`,
        category: 'approval'
    },
    {
        id: 'reminder',
        name: 'Approval Reminder',
        subject: 'Reminder: Proof Awaiting Your Review',
        body: `Hi {{customerName}},

This is a friendly reminder that your proof for Job #{{jobId}} is still awaiting your review.

We want to ensure your order is completed on time. Please review and approve the proof at your earliest convenience.

{{proofLink}}

If you have any questions or need assistance, please don't hesitate to contact us.

Best regards,
{{companyName}}`,
        category: 'reminder'
    }
];

interface EmailTemplatePreviewProps {
    onClose: () => void;
    jobData?: {
        jobId: string;
        customerName: string;
        fileName: string;
        uploadDate: string;
        proofLink: string;
    };
}

export const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({ onClose, jobData }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(emailTemplates[0]);
    const [copied, setCopied] = useState(false);

    const defaultJobData = {
        jobId: 'JOB-2024-001',
        customerName: 'John Doe',
        fileName: 'business-card.pdf',
        uploadDate: new Date().toLocaleDateString(),
        proofLink: 'https://app.example.com/proof/abc123',
        changesList: '• RGB images detected - needs CMYK conversion\n• Missing bleed on 2 pages',
        processingTime: '2-3 business days',
        completionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        orderDetailsLink: 'https://app.example.com/order/abc123',
        companyName: 'PrintPro Solutions'
    };

    const data = { ...defaultJobData, ...jobData };

    const renderTemplate = (template: EmailTemplate) => {
        let rendered = template.body;
        Object.entries(data).forEach(([key, value]) => {
            rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        return rendered;
    };

    const renderSubject = (template: EmailTemplate) => {
        let rendered = template.subject;
        Object.entries(data).forEach(([key, value]) => {
            rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        return rendered;
    };

    const handleCopy = () => {
        const fullEmail = `Subject: ${renderSubject(selectedTemplate)}\n\n${renderTemplate(selectedTemplate)}`;
        navigator.clipboard.writeText(fullEmail);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface border border-border rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-2xl font-bold text-text flex items-center gap-3">
                            <Mail size={28} className="text-primary" />
                            Email Templates
                        </h2>
                        <p className="text-sm text-muted mt-1">
                            Preview and manage automated notification templates
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-text transition-colors p-2 hover:bg-background rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* Template List */}
                    <div className="w-64 border-r border-border bg-background/50 overflow-auto">
                        <div className="p-4 space-y-2">
                            {emailTemplates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template)}
                                    className={clsx(
                                        "w-full text-left p-3 rounded-lg transition-colors border",
                                        selectedTemplate.id === template.id
                                            ? "bg-primary text-white border-primary"
                                            : "bg-surface text-text border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="font-medium">{template.name}</div>
                                    <div className={clsx(
                                        "text-xs mt-1 capitalize",
                                        selectedTemplate.id === template.id ? "text-white/80" : "text-muted"
                                    )}>
                                        {template.category}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="flex-1 overflow-auto p-6">
                        <div className="max-w-2xl mx-auto">
                            {/* Email Preview Card */}
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                                {/* Email Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail size={20} />
                                        <span className="text-sm opacity-90">From: {data.companyName}</span>
                                    </div>
                                    <h3 className="text-xl font-bold">{renderSubject(selectedTemplate)}</h3>
                                </div>

                                {/* Email Body */}
                                <div className="p-6 text-gray-800">
                                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                        {renderTemplate(selectedTemplate)}
                                    </pre>
                                </div>

                                {/* Email Footer */}
                                <div className="bg-gray-50 p-6 border-t border-gray-200 text-center text-xs text-gray-500">
                                    <p>© 2024 {data.companyName}. All rights reserved.</p>
                                    <p className="mt-1">This is an automated notification from our print production system.</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex gap-4">
                                <button
                                    onClick={handleCopy}
                                    className="flex-1 px-4 py-3 bg-surface hover:bg-surface/80 text-text rounded-lg border border-border transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <CheckCircle size={18} className="text-green-500" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            Copy Template
                                        </>
                                    )}
                                </button>
                                <button className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2">
                                    <Send size={18} />
                                    Send Test Email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
