'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Suspense } from "react"
import { resetPassword } from '@/lib/utils/auth';
import { Mail, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { toast } = useToast();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await resetPassword(email);
            setIsSuccess(true);
            toast({
                title: 'Đã Gửi Email!',
                description: 'Kiểm tra hòm thư để xem hướng dẫn đặt lại mật khẩu.',
            });
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể gửi email đặt lại',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-950 p-4">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-md relative">
                {/* Main card */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 dark:border-orange-900/50 p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-orange-500 to-amber-500 rounded-2xl mb-4 shadow-lg">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-linear-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                            Đặt Lại Mật Khẩu
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại
                        </p>
                    </div>

                    {!isSuccess ? (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                                    Địa Chỉ Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-500"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                {isLoading ? 'Đang gửi...' : 'Gửi Liên Kết Đặt Lại'}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4 py-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Kiểm Tra Email Của Bạn
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong>{email}</strong>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Back to login */}
                    <div className="text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay Lại Đăng Nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
