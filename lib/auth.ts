import { supabase } from './supabase';
import { User, Session } from '@supabase/supabase-js';

export type AuthProvider = 'google' | 'github' | 'facebook';

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(provider: AuthProvider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string, metadata?: {
    full_name?: string;
    avatar_url?: string;
}) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata,
            emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
    });

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Sign out
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw error;
    }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) {
        throw error;
    }

    return data;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            callback(session?.user ?? null);
        }
    );

    return subscription;
}
