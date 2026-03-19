// ============================================================================
// 🔐 AUTH CONTEXT — Global Authentication State
// ============================================================================

import type { Models } from 'appwrite';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ENV } from '../config/env';
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
    loginWithGoogle: () => Promise<void>;
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

    const loginWithGoogle = async () => {
        await auth.loginWithGoogle();
        const success = await refreshUser();
        if (!success) {
            throw new Error('Failed to load user profile after Google login. Please try again.');
        }

        // Try to fetch and save Google profile photo
        try {
            // The token-based OAuth session doesn't carry providerAccessToken,
            // so we call the identities REST API to get the Google access token
            const identitiesRes = await fetch(`${ENV.appwrite.endpoint}/account/identities`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Appwrite-Project': ENV.appwrite.projectId,
                },
                credentials: 'include',
            });

            if (identitiesRes.ok) {
                const identitiesData = await identitiesRes.json();
                const googleIdentity = identitiesData?.identities?.find(
                    (i: any) => i.provider === 'google'
                );

                if (googleIdentity?.providerAccessToken) {
                    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${googleIdentity.providerAccessToken}` },
                    });
                    const googleUser = await userInfoRes.json();
                    if (googleUser?.picture) {
                        await auth.updatePrefs({ avatarUrl: googleUser.picture });
                        await refreshUser();
                    }
                }
            }
        } catch (e) {
            // Non-critical: avatar save failed, ignore
            console.warn('Could not fetch Google profile photo:', e);
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
        <AuthContext.Provider value={{ ...state, login, loginWithGoogle, signup, logout, refreshUser, updatePrefs }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
