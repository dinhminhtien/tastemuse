'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/utils/auth';
import { isAdmin } from '@/lib/utils/admin-config';
import { User } from '@supabase/supabase-js';

interface AdminGuardProps {
    children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser);

                if (currentUser && isAdmin(currentUser.email)) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdmin();
    }, []);

    if (isLoading) {
        return null; // Return empty to prevent flickering before deciding
    }

    if (!isAuthorized) {
        return notFound();
    }

    return <>{children}</>;
}
