import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
    type User as FirebaseUser,
} from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { auth } from '../lib/firebase-config';
import { userService } from '../lib/firestore-service';
import type { User, UserRole, AuthContextType } from '../lib/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
    loadingFallback?: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
    children,
    loadingFallback = (
        <div className="flex items-center justify-center min-h-screen">
            <span className="text-gray-500">Loading...</span>
        </div>
    ),
}) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Generate or retrieve a unique user ID for this session/browser
        let storedUid = localStorage.getItem('preflight_user_uid');
        if (!storedUid) {
            storedUid = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('preflight_user_uid', storedUid);
        }

        const user: User = {
            uid: storedUid,
            email: 'user@preflight.com',
            displayName: 'Guest User',
            role: 'admin',
            photoURL: null,
            createdAt: Timestamp.now(),
            lastLogin: Timestamp.now(),
            preferences: {
                theme: 'dark',
                notifications: true,
            },
        };

        setCurrentUser(user);
        setLoading(false);
    }, []);

    const updateUserProfile = async (data: Partial<User>): Promise<void> => {
        if (!currentUser) throw new Error('No user logged in');
        // Update local state only
        setCurrentUser({ ...currentUser, ...data });
    };

    const hasRole = (roles: UserRole | UserRole[]): boolean => {
        if (!currentUser) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(currentUser.role);
    };

    const value: AuthContextType = {
        currentUser,
        loading,
        signup: async () => { }, // No-op
        login: async () => { }, // No-op
        logout: async () => { }, // No-op
        resetPassword: async () => { }, // No-op
        updateUserProfile,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <span className="text-gray-500">Loading...</span>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
