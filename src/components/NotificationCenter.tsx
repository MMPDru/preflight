import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Check, X, Settings, Filter } from 'lucide-react';

interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    read: boolean;
    readAt?: Date;
    actionUrl?: string;
    actionLabel?: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    channels: string[];
    createdAt: Date;
}

export const NotificationCenter: React.FC = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            fetchNotifications();

            // Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [currentUser, filter]);

    const fetchNotifications = async () => {
        try {
            const url = `/api/v1/notifications/user/${currentUser?.uid}?${filter === 'unread' ? 'unreadOnly=true&' : ''}limit=50`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
                method: 'POST',
            });

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/v1/notifications/user/${currentUser?.uid}/read-all`, {
                method: 'POST',
            });

            if (response.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'border-l-4 border-red-500 bg-red-50';
            case 'high':
                return 'border-l-4 border-orange-500 bg-orange-50';
            case 'normal':
                return 'border-l-4 border-blue-500 bg-blue-50';
            default:
                return 'border-l-4 border-gray-300 bg-gray-50';
        }
    };

    const getTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            'proof-ready': '📄',
            'approval-request': '✅',
            'approval-approved': '🎉',
            'approval-rejected': '❌',
            'reminder': '⏰',
            'issue-detected': '⚠️',
            'revision-uploaded': '🔄',
            'print-confirmation': '🖨️',
            'deadline-approaching': '⏳',
            'deadline-passed': '🚨',
            'escalation': '🔔',
            'system': 'ℹ️',
        };
        return icons[type] || '📬';
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filter === 'unread'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Unread ({unreadCount})
                                </button>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        disabled={loading}
                                        className="ml-auto text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-600">No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50' : ''
                                                }`}
                                            onClick={() => {
                                                if (!notification.read) {
                                                    markAsRead(notification.id);
                                                }
                                                if (notification.actionUrl) {
                                                    window.location.href = notification.actionUrl;
                                                }
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                        <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                            {notification.title}
                                                        </h4>
                                                        {!notification.read && (
                                                            <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(notification.createdAt).toLocaleString()}
                                                        </span>
                                                        {notification.actionLabel && (
                                                            <span className="text-xs text-purple-600 font-medium">
                                                                {notification.actionLabel} →
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <button className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-2">
                                <Settings className="w-4 h-4" />
                                Notification Preferences
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
