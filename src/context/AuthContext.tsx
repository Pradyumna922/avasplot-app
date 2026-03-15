// ============================================================================
// 🔐 AUTH CONTEXT — Global Authentication State
// ============================================================================

import type { Models } from 'appwrite';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth } from '../services/appwrite';
import { UserPrefs } from '../types';

interface AuthState {
    user: Models.User<Models.Preferences> | null;
    prefs: UserPrefs;
    loading: boolean;
    isLoggedIn: boolean;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<boolean>;
    updatePrefs: (prefs: Partial<UserPrefs>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        prefs: {},
        loading: true,
        isLoggedIn: false,
    });

    const refreshUser = useCallback(async (): Promise<boolean> => {
        try {
            const user = await auth.getUser();
            if (user) {
                setState({
                    user,
                    prefs: (user.prefs || {}) as UserPrefs,
                    loading: false,
                    isLoggedIn: true,
                });
                return true;
            } else {
                setState({ user: null, prefs: {}, loading: false, isLoggedIn: false });
                return false;
            }
        } catch (error) {
            console.error('refreshUser error:', error);
            setState({ user: null, prefs: {}, loading: false, isLoggedIn: false });
            return false;
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = async (email: string, password: string) => {
        await auth.login(email, password);
        const success = await refreshUser();
        if (!success) {
            throw new Error('Failed to load user profile after login. Please try again.');
        }
    };

    const signup = async (email: string, password: string, name: string) => {
        await auth.signup(email, password, name);
        const success = await refreshUser();
        if (!success) {
            throw new Error('Failed to load user profile after signup. Please try again.');
        }
    };

    const logout = async () => {
        await auth.logout();
        setState({ user: null, prefs: {}, loading: false, isLoggedIn: false });
    };

    const updatePrefs = async (prefs: Partial<UserPrefs>) => {
        await auth.updatePrefs(prefs);
        await refreshUser();
    };

    return (
        <AuthContext.Provider value={{ ...state, login, signup, logout, refreshUser, updatePrefs }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
