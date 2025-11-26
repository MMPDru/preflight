import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../lib/permissions';
import { Shield, User, Edit2, Check, X, Search } from 'lucide-react';
import { HelpButton } from '../components/HelpButton';

// Mock user data for now (since we can't easily list all users from client SDK without Cloud Functions)
// In a real app, this would fetch from an API endpoint backed by Firebase Admin SDK.
interface UserData {
    uid: string;
    email: string;
    displayName: string;
    role: 'admin' | 'designer' | 'customer';
    status: 'active' | 'pending' | 'disabled';
    lastLogin: Date;
}

export const UserManagement = () => {
    const { currentUser } = useAuth();
    const { hasPermission } = usePermissions(currentUser);
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<'admin' | 'designer' | 'customer'>('customer');

    useEffect(() => {
        // Simulate fetching users
        // In production, this would be: const response = await fetch('/api/users');
        setTimeout(() => {
            setUsers([
                {
                    uid: '1',
                    email: 'dru@mmpboca.com',
                    displayName: 'Dru Pio',
                    role: 'admin',
                    status: 'active',
                    lastLogin: new Date()
                },
                {
                    uid: '2',
                    email: 'designer@print.co',
                    displayName: 'Graphic Designer',
                    role: 'designer',
                    status: 'active',
                    lastLogin: new Date(Date.now() - 86400000)
                },
                {
                    uid: '3',
                    email: 'customer@client.com',
                    displayName: 'John Doe',
                    role: 'customer',
                    status: 'active',
                    lastLogin: new Date(Date.now() - 172800000)
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleRoleUpdate = async (uid: string, newRole: 'admin' | 'designer' | 'customer') => {
        // In production: await fetch(`/api/users/${uid}/role`, { method: 'PUT', body: JSON.stringify({ role: newRole }) });
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        setEditingUser(null);
        alert(`User role updated to ${newRole}`);
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!hasPermission('users:manage-roles')) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-slate-400">You do not have permission to manage users.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-bold text-white">User Management</h1>
                        <HelpButton videoId="admin-role-overview" variant="icon" size="sm" className="text-slate-400 hover:text-white" />
                    </div>
                    <p className="text-slate-400">Manage user access and permissions</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 w-64"
                    />
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-700">
                            <th className="p-4 text-slate-400 font-medium">User</th>
                            <th className="p-4 text-slate-400 font-medium">Role</th>
                            <th className="p-4 text-slate-400 font-medium">Status</th>
                            <th className="p-4 text-slate-400 font-medium">Last Login</th>
                            <th className="p-4 text-slate-400 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">Loading users...</td>
                            </tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.uid} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                            {user.displayName.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{user.displayName}</div>
                                            <div className="text-sm text-slate-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {editingUser === user.uid ? (
                                        <select
                                            value={selectedRole}
                                            onChange={(e) => setSelectedRole(e.target.value as any)}
                                            className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                                        >
                                            <option value="customer">Customer</option>
                                            <option value="designer">Designer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    ) : (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' :
                                                user.role === 'designer' ? 'bg-blue-500/10 text-blue-400' :
                                                    'bg-slate-500/10 text-slate-400'}`}>
                                            {user.role}
                                        </span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        <span className="text-slate-300 capitalize">{user.status}</span>
                                    </span>
                                </td>
                                <td className="p-4 text-slate-400 text-sm">
                                    {user.lastLogin.toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    {editingUser === user.uid ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleRoleUpdate(user.uid, selectedRole)}
                                                className="p-1 hover:bg-green-500/20 text-green-400 rounded transition-colors"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => setEditingUser(null)}
                                                className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingUser(user.uid);
                                                setSelectedRole(user.role);
                                            }}
                                            className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
