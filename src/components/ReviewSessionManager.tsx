import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Link, Video, FileCheck, Plus, MoreVertical, Share2, PlayCircle } from 'lucide-react';
import clsx from 'clsx';

interface Session {
    id: string;
    title: string;
    type: 'scheduled' | 'instant' | 'guided';
    date: Date;
    duration: number; // minutes
    attendees: string[];
    status: 'upcoming' | 'active' | 'completed';
    proofName: string;
}

const MOCK_SESSIONS: Session[] = [
    {
        id: '1',
        title: 'Final Brand Review',
        type: 'scheduled',
        date: new Date(Date.now() + 86400000), // Tomorrow
        duration: 45,
        attendees: ['client@brand.com', 'manager@print.co'],
        status: 'upcoming',
        proofName: 'Brand_Guidelines_v2.pdf'
    },
    {
        id: '2',
        title: 'Quick Color Check',
        type: 'instant',
        date: new Date(),
        duration: 15,
        attendees: ['designer@agency.com'],
        status: 'active',
        proofName: 'Poster_Draft_1.pdf'
    },
    {
        id: '3',
        title: 'Onboarding Walkthrough',
        type: 'guided',
        date: new Date(Date.now() - 86400000), // Yesterday
        duration: 60,
        attendees: ['new.user@client.com'],
        status: 'completed',
        proofName: 'Welcome_Kit.pdf'
    }
];

export const ReviewSessionManager = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [newSession, setNewSession] = useState<Partial<Session>>({
        type: 'scheduled',
        duration: 30,
        attendees: []
    });

    const handleSchedule = () => {
        const session: Session = {
            id: Date.now().toString(),
            title: newSession.title || 'New Review Session',
            type: newSession.type || 'scheduled',
            date: newSession.date || new Date(),
            duration: newSession.duration || 30,
            attendees: newSession.attendees || [],
            status: 'upcoming',
            proofName: 'Selected Proof' // Mock
        };
        setSessions([...sessions, session]);
        setShowScheduleModal(false);
    };

    const handleInstantShare = () => {
        const link = `https://preflight.pro/review/${Date.now()}`;
        navigator.clipboard.writeText(link);
        alert(`Instant Review Link Copied: ${link}`);

        const session: Session = {
            id: Date.now().toString(),
            title: 'Instant Review Session',
            type: 'instant',
            date: new Date(),
            duration: 30,
            attendees: ['Guest'],
            status: 'active',
            proofName: 'Current Proof'
        };
        setSessions([session, ...sessions]);
    };

    const handleStartGuidedSession = () => {
        const sessionId = `guided-${Date.now()}`;
        navigate(`/review/${sessionId}`);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text mb-2">Review Sessions</h1>
                    <p className="text-muted">Manage scheduled reviews and instant collaborations</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleInstantShare}
                        className="px-4 py-2 bg-surface border border-border text-text rounded-lg hover:bg-background transition-colors flex items-center gap-2"
                    >
                        <Share2 size={18} />
                        Instant Review
                    </button>
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Schedule Session
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Sessions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                        <Calendar size={20} />
                        Upcoming & Active
                    </h2>

                    <div className="space-y-4">
                        {sessions.filter(s => s.status !== 'completed').map(session => (
                            <div key={session.id} className="bg-surface border border-border rounded-xl p-6 flex items-center justify-between hover:border-primary/50 transition-colors group">
                                <div className="flex items-start gap-4">
                                    <div className={clsx(
                                        "p-3 rounded-lg",
                                        session.type === 'scheduled' ? "bg-blue-500/10 text-blue-500" :
                                            session.type === 'instant' ? "bg-orange-500/10 text-orange-500" :
                                                "bg-purple-500/10 text-purple-500"
                                    )}>
                                        {session.type === 'scheduled' ? <Calendar size={24} /> :
                                            session.type === 'instant' ? <Share2 size={24} /> :
                                                <FileCheck size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-text text-lg">{session.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-muted mt-1">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {session.date.toLocaleDateString()} • {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users size={14} />
                                                {session.attendees.length} attendees
                                            </span>
                                        </div>
                                        <p className="text-sm text-primary mt-2 font-medium">
                                            Proof: {session.proofName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {session.status === 'active' ? (
                                        <button
                                            onClick={() => navigate(`/review/${session.id}`)}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 animate-pulse"
                                        >
                                            <Video size={18} />
                                            Join Now
                                        </button>
                                    ) : (
                                        <button className="px-4 py-2 bg-surface border border-border text-text rounded-lg hover:bg-background transition-colors flex items-center gap-2">
                                            <Link size={18} />
                                            Copy Link
                                        </button>
                                    )}
                                    <button className="p-2 text-muted hover:text-text hover:bg-background rounded-lg">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Past Sessions / Templates */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                        <Clock size={20} />
                        Recent History
                    </h2>

                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                        {sessions.filter(s => s.status === 'completed').map(session => (
                            <div key={session.id} className="p-4 border-b border-border last:border-0 hover:bg-background/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-medium text-text">{session.title}</h4>
                                    <span className="text-xs text-muted">{session.date.toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted mb-3">
                                    <span className="px-2 py-0.5 bg-background rounded-full border border-border capitalize">
                                        {session.type}
                                    </span>
                                    <span>{session.duration} min</span>
                                </div>
                                <button className="w-full py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <PlayCircle size={16} />
                                    View Recording
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
                        <h3 className="font-semibold text-text mb-2">Guided Approval Mode</h3>
                        <p className="text-sm text-muted mb-4">
                            Start a structured walkthrough with automated checkpoints and issue resolution tracking.
                        </p>
                        <button
                            onClick={handleStartGuidedSession}
                            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <FileCheck size={18} />
                            Start Guided Session
                        </button>
                    </div>
                </div>
            </div>

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-surface border border-border rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-text mb-4">Schedule Review Session</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Session Title</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                                    placeholder="e.g., Final Approval Review"
                                    value={newSession.title || ''}
                                    onChange={e => setNewSession({ ...newSession, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                                        onChange={e => {
                                            const date = new Date(e.target.value);
                                            if (!isNaN(date.getTime())) {
                                                setNewSession({ ...newSession, date });
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted mb-1">Time</label>
                                    <input
                                        type="time"
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1">Session Type</label>
                                <select
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                                    value={newSession.type}
                                    onChange={e => setNewSession({ ...newSession, type: e.target.value as any })}
                                >
                                    <option value="scheduled">Standard Review</option>
                                    <option value="guided">Guided Approval</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                className="px-4 py-2 text-muted hover:text-text transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSchedule}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
