import React, { useState } from 'react';
import { Headphones, Clock, Users, Calendar, X } from 'lucide-react';
import clsx from 'clsx';

interface Agent {
    id: string;
    name: string;
    avatar: string;
    expertise: string[];
    status: 'available' | 'busy' | 'offline';
    rating: number;
}

const MOCK_AGENTS: Agent[] = [
    {
        id: '1',
        name: 'Sarah Chen',
        avatar: '👩‍💼',
        expertise: ['Color Management', 'Preflight', 'PDF Standards'],
        status: 'available',
        rating: 4.9
    },
    {
        id: '2',
        name: 'Mike Rodriguez',
        avatar: '👨‍💻',
        expertise: ['Bleed Settings', 'Print Production', 'File Prep'],
        status: 'available',
        rating: 4.8
    },
    {
        id: '3',
        name: 'Emma Watson',
        avatar: '👩‍🎨',
        expertise: ['Design Review', 'Brand Guidelines', 'Typography'],
        status: 'busy',
        rating: 5.0
    }
];

interface RequestLiveHelpButtonProps {
    onStartSession: (agentId: string) => void;
    currentIssue?: string;
    compact?: boolean;
}

export const RequestLiveHelpButton: React.FC<RequestLiveHelpButtonProps> = ({
    onStartSession,
    currentIssue,
    compact = false
}) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
    const [requestType, setRequestType] = useState<'instant' | 'scheduled'>('instant');
    const [queuePosition, setQueuePosition] = useState<number | null>(null);
    const [estimatedWait, setEstimatedWait] = useState<number | null>(null);

    const availableAgents = MOCK_AGENTS.filter(a => a.status === 'available');
    const busyAgents = MOCK_AGENTS.filter(a => a.status === 'busy');

    const handleRequestHelp = () => {
        setShowModal(true);
        // Simulate queue calculation
        if (availableAgents.length === 0) {
            setQueuePosition(Math.floor(Math.random() * 5) + 1);
            setEstimatedWait(Math.floor(Math.random() * 10) + 3);
        }
    };

    const handleStartInstantSession = (agentId: string) => {
        setSelectedAgent(agentId);
        // Simulate connection delay
        setTimeout(() => {
            onStartSession(agentId);
            setShowModal(false);
        }, 1000);
    };

    const handleScheduleCallback = () => {
        alert('Callback scheduled! You will receive an email confirmation.');
        setShowModal(false);
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={handleRequestHelp}
                className={clsx(
                    "bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium",
                    compact ? "px-3 py-2 text-sm" : "px-6 py-3"
                )}
            >
                <Headphones size={compact ? 18 : 20} />
                {!compact && "Request Live Help"}
            </button>

            {/* Help Request Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-surface border border-border rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-secondary/20 to-primary/20 p-6 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-text flex items-center gap-3">
                                        <Headphones size={28} className="text-secondary" />
                                        Request Live Support
                                    </h2>
                                    <p className="text-muted mt-1">
                                        Connect with an expert to resolve your issue
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-background rounded-lg transition-colors"
                                >
                                    <X size={24} className="text-muted" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Request Type Toggle */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setRequestType('instant')}
                                    className={clsx(
                                        "flex-1 py-3 px-4 rounded-lg border-2 transition-all",
                                        requestType === 'instant'
                                            ? "border-secondary bg-secondary/10 text-text"
                                            : "border-border bg-background text-muted hover:border-secondary/50"
                                    )}
                                >
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Headphones size={20} />
                                        <span className="font-semibold">Instant Help</span>
                                    </div>
                                    <p className="text-xs">Connect now</p>
                                </button>
                                <button
                                    onClick={() => setRequestType('scheduled')}
                                    className={clsx(
                                        "flex-1 py-3 px-4 rounded-lg border-2 transition-all",
                                        requestType === 'scheduled'
                                            ? "border-secondary bg-secondary/10 text-text"
                                            : "border-border bg-background text-muted hover:border-secondary/50"
                                    )}
                                >
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Calendar size={20} />
                                        <span className="font-semibold">Schedule Callback</span>
                                    </div>
                                    <p className="text-xs">Choose a time</p>
                                </button>
                            </div>

                            {requestType === 'instant' ? (
                                <>
                                    {/* Queue Status */}
                                    {queuePosition && (
                                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <Clock size={24} className="text-orange-500" />
                                                <div>
                                                    <p className="font-semibold text-text">
                                                        Position in queue: #{queuePosition}
                                                    </p>
                                                    <p className="text-sm text-muted">
                                                        Estimated wait: ~{estimatedWait} minutes
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Current Issue */}
                                    {currentIssue && (
                                        <div className="bg-background border border-border rounded-lg p-4">
                                            <p className="text-sm font-medium text-muted mb-1">Current Issue:</p>
                                            <p className="text-text">{currentIssue}</p>
                                        </div>
                                    )}

                                    {/* Available Agents */}
                                    <div>
                                        <h3 className="font-semibold text-text mb-3 flex items-center gap-2">
                                            <Users size={18} />
                                            Available Agents
                                        </h3>
                                        <div className="space-y-3">
                                            {availableAgents.map(agent => (
                                                <div
                                                    key={agent.id}
                                                    className={clsx(
                                                        "border-2 rounded-lg p-4 transition-all cursor-pointer",
                                                        selectedAgent === agent.id
                                                            ? "border-secondary bg-secondary/5"
                                                            : "border-border hover:border-secondary/50 bg-background"
                                                    )}
                                                    onClick={() => setSelectedAgent(agent.id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-3xl">{agent.avatar}</div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-semibold text-text">{agent.name}</h4>
                                                                    <span className="flex items-center gap-1 text-xs text-yellow-500">
                                                                        ⭐ {agent.rating}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {agent.expertise.slice(0, 2).map((skill, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                                                                        >
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                            <span className="text-xs text-green-500 font-medium">Available</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Busy Agents */}
                                            {busyAgents.length > 0 && (
                                                <details className="mt-4">
                                                    <summary className="text-sm text-muted cursor-pointer hover:text-text">
                                                        Show busy agents ({busyAgents.length})
                                                    </summary>
                                                    <div className="space-y-2 mt-2">
                                                        {busyAgents.map(agent => (
                                                            <div
                                                                key={agent.id}
                                                                className="border border-border rounded-lg p-3 opacity-60 bg-background"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="text-2xl">{agent.avatar}</div>
                                                                    <div>
                                                                        <h4 className="font-medium text-text text-sm">{agent.name}</h4>
                                                                        <span className="text-xs text-orange-500">Currently busy</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </details>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-border">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-4 py-3 border border-border rounded-lg text-muted hover:text-text hover:bg-background transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => selectedAgent && handleStartInstantSession(selectedAgent)}
                                            disabled={!selectedAgent}
                                            className={clsx(
                                                "flex-1 px-4 py-3 rounded-lg font-semibold transition-all",
                                                selectedAgent
                                                    ? "bg-secondary hover:bg-secondary/90 text-white"
                                                    : "bg-surface text-muted cursor-not-allowed"
                                            )}
                                        >
                                            {selectedAgent ? "Start Session" : "Select an Agent"}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Schedule Callback Form */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-muted mb-2">
                                                Preferred Date & Time
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    type="date"
                                                    className="px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-secondary"
                                                />
                                                <input
                                                    type="time"
                                                    className="px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-secondary"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-muted mb-2">
                                                Describe Your Issue
                                            </label>
                                            <textarea
                                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-secondary resize-none"
                                                rows={4}
                                                placeholder="Tell us what you need help with..."
                                                defaultValue={currentIssue}
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-border">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-4 py-3 border border-border rounded-lg text-muted hover:text-text hover:bg-background transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleScheduleCallback}
                                            className="flex-1 px-4 py-3 bg-secondary hover:bg-secondary/90 text-white rounded-lg font-semibold transition-all"
                                        >
                                            Schedule Callback
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
