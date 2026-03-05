'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Calendar, Shield, Edit2 } from 'lucide-react';

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
}

function ProfileContent() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCurrentUser().then((user) => {
            setUser(user);
            setIsLoading(false);
        });
    }, []);

    if (isLoading || !user) {
        return null;
    }

    const userInitials = user.user_metadata?.full_name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() || user.email?.[0].toUpperCase() || 'U';

    const createdAt = new Date(user.created_at).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-950 pt-28 md:pt-32 pb-12 px-4">
            <div className="container max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold bg-linear-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                        Hồ Sơ Của Tôi
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Quản lý thông tin tài khoản và tùy chọn của bạn
                    </p>
                </div>

                {/* Profile Card */}
                <Card className="border-orange-100 dark:border-orange-900/50 shadow-xl">
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-24 w-24 ring-4 ring-orange-500/20">
                                <AvatarImage
                                    src={user.user_metadata?.avatar_url}
                                    alt={user.user_metadata?.full_name || user.email || 'User'}
                                />
                                <AvatarFallback className="bg-linear-to-br from-orange-500 to-amber-500 text-white text-2xl font-bold">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle className="text-2xl">
                            {user.user_metadata?.full_name || 'User'}
                        </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Separator />

                        {/* Account Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Shield className="w-5 h-5 text-orange-500" />
                                Thông Tin Tài Khoản
                            </h3>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                                        Địa Chỉ Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={user.email || ''}
                                            disabled
                                            className="pl-10 bg-gray-50 dark:bg-gray-800"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="created" className="text-gray-700 dark:text-gray-300">
                                        Thành Viên Từ
                                    </Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="created"
                                            type="text"
                                            value={createdAt}
                                            disabled
                                            className="pl-10 bg-gray-50 dark:bg-gray-800"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="provider" className="text-gray-700 dark:text-gray-300">
                                        Phương Thức Đăng Nhập
                                    </Label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="provider"
                                            type="text"
                                            value={user.app_metadata?.provider || 'email'}
                                            disabled
                                            className="pl-10 bg-gray-50 dark:bg-gray-800 capitalize"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                            >
                                <Edit2 className="w-4 h-4 mr-2" />
                                Chỉnh Sửa Hồ Sơ
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                            >
                                Đổi Mật Khẩu
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-orange-100 dark:border-orange-900/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Tùy Chọn</CardTitle>
                            <CardDescription>Tùy chỉnh trải nghiệm của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Quản lý cài đặt thông báo, tùy chọn ngôn ngữ và nhiều hơn nữa.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-orange-100 dark:border-orange-900/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Hoạt Động</CardTitle>
                            <CardDescription>Hoạt động gần đây của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Xem lịch sử đơn hàng, nhà hàng đã lưu và món ăn yêu thích.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
