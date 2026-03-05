'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, signOut, onAuthStateChange } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, Heart, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function UserProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        // Get initial user
        getCurrentUser().then((user) => {
            setUser(user);
            setIsLoading(false);
        });

        // Listen to auth changes
        const subscription = onAuthStateChange((user) => {
            setUser(user);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut();
            toast({
                title: 'Đã đăng xuất',
                description: 'Bạn đã đăng xuất thành công.',
            });
            window.location.href = '/';
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể đăng xuất',
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        );
    }

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <Link href="/login">
                    <Button
                        variant="ghost"
                        className="text-gray-700 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400"
                    >
                        Đăng Nhập
                    </Button>
                </Link>
                <Link href="/login">
                    <Button className="bg-[#c85a28] hover:bg-[#b34d20] text-white">
                        Bắt Đầu
                    </Button>
                </Link>
            </div>
        );
    }

    const userInitials = user.user_metadata?.full_name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() || user.email?.[0].toUpperCase() || 'U';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full ring-2 ring-orange-500/20 hover:ring-orange-500/40 transition-all"
                >
                    <Avatar className="h-10 w-10">
                        <AvatarImage
                            src={user.user_metadata?.avatar_url}
                            alt={user.user_metadata?.full_name || user.email || 'User'}
                        />
                        <AvatarFallback className="bg-linear-to-br from-orange-500 to-amber-500 text-white font-semibold">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {user.user_metadata?.full_name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Hồ Sơ</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/favorites" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Yêu Thích</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/meal-plans" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Kế Hoạch Bữa Ăn</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/subscription/history" className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Lịch Sử Đăng Ký</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng Xuất</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
