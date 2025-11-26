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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in, fetch user data from Firestore
                const userData = await userService.getById(firebaseUser.uid);

                if (userData) {
                    // Update last login
                    await userService.update(firebaseUser.uid, {
                        lastLogin: Timestamp.now(),
                    });
                    setCurrentUser(userData);
                } else {
                    // User exists in Auth but not in Firestore (shouldn't happen)
                    console.error('User not found in Firestore');
                    setCurrentUser(null);
                }
            } else {
                // User is signed out
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signup = async (
        email: string,
        password: string,
        displayName: string,
        role: UserRole = 'customer'
    ): Promise<void> => {
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Update Firebase Auth profile
            await updateProfile(firebaseUser, { displayName });

            // Create user document in Firestore
            const userData: Omit<User, 'id'> = {
                uid: firebaseUser.uid,
                email,
                displayName,
                role,
                photoURL: firebaseUser.photoURL || null,
                createdAt: Timestamp.now(),
                lastLogin: Timestamp.now(),
                preferences: {
                    theme: 'dark',
                    notifications: true,
                },
            };

            await userService.create(firebaseUser.uid, userData);
        } catch (error: any) {
            console.error('Signup error:', error);
            throw new Error(error.message || 'Failed to create account');
        }
    };

    const login = async (email: string, password: string): Promise<void> => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // The onAuthStateChanged listener will handle updating the user state
        } catch (error: any) {
            console.error('Login error:', error);
            let errorMessage = 'Failed to login';

            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Try again later';
            }

            throw new Error(errorMessage);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await signOut(auth);
        } catch (error: any) {
            console.error('Logout error:', error);
            throw new Error('Failed to logout');
        }
    };

    // Password reset
    const resetPassword = async (email: string): Promise<void> => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            console.error('Password reset error:', error);
            throw new Error('Failed to send password reset email');
        }
    };

    const updateUserProfile = async (data: Partial<User>): Promise<void> => {
        if (!currentUser) throw new Error('No user logged in');

        try {
            // Update Firebase Auth profile if displayName or photoURL changed
            if (data.displayName || data.photoURL) {
                await updateProfile(auth.currentUser!, {
                    displayName: data.displayName,
                    photoURL: data.photoURL,
                });
            }

            // Update Firestore user document
            await userService.update(currentUser.uid, data);

            // Update local state
            setCurrentUser({ ...currentUser, ...data });
        } catch (error: any) {
            console.error('Update profile error:', error);
            throw new Error('Failed to update profile');
        }
    };

    const hasRole = (roles: UserRole | UserRole[]): boolean => {
        if (!currentUser) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(currentUser.role);
    };

    const value: AuthContextType = {
        currentUser,
        loading,
        signup,
        login,
        logout,
        resetPassword,
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
