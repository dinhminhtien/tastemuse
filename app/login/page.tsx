'use client';

import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { signInWithOAuth, signInWithEmail, signUpWithEmail } from '@/lib/auth';
import type { AuthProvider } from '@/lib/auth';
import { Chrome, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-950">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
                </div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    // Hiển thị lỗi từ OAuth callback nếu có
    if (error && !isLoading) {
        toast({
            title: 'Lỗi Xác Thực',
            description: error,
            variant: 'destructive',
        });
    }

    const handleOAuthSignIn = async (provider: AuthProvider) => {
        setIsLoading(true);
        try {
            await signInWithOAuth(provider);
            // Redirect tự động
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể đăng nhập bằng OAuth',
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                await signUpWithEmail(email, password, { full_name: fullName });
                toast({
                    title: 'Thành công!',
                    description: 'Vui lòng kiểm tra email để xác thực tài khoản.',
                });
                router.push('/');
            } else {
                await signInWithEmail(email, password);
                toast({
                    title: 'Chào mừng trở lại!',
                    description: 'Bạn đã đăng nhập thành công.',
                });
                router.push('/');
            }
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Xác thực thất bại',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-950 pt-28 md:pt-32 p-4">
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
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl mb-4 shadow-lg">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                            {isSignUp ? 'Tham Gia TasteMuse' : 'Chào Mừng Trở Lại'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {isSignUp
                                ? 'Tạo tài khoản để khám phá những món ăn tuyệt vời'
                                : 'Đăng nhập để tiếp tục hành trình ẩm thực của bạn'}
                        </p>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={() => handleOAuthSignIn('google')}
                            disabled={isLoading}
                            className="w-full h-12 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
                            variant="outline"
                        >
                            <Chrome className="w-5 h-5 mr-2" />
                            Tiếp tục với Google
                        </Button>
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <Separator className="bg-gray-200 dark:bg-gray-700" />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-gray-400">
                            hoặc
                        </span>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        {isSignUp && (
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">
                                    Họ và Tên
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="Nguyễn Văn A"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="pl-10 h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-500"
                                        required={isSignUp}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                                Email
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

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                                Mật khẩu
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-500"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {!isSignUp && (
                            <div className="flex justify-end">
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-lab(49.9297 45.4562 35.4968) hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
                        >
                            {isLoading ? (
                                'Đang xử lý...'
                            ) : (
                                <>
                                    {isSignUp ? 'Tạo Tài Khoản' : 'Đăng Nhập'}
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Toggle Sign Up/Sign In */}
                    <div className="text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        >
                            {isSignUp ? (
                                <>
                                    Đã có tài khoản?{' '}
                                    <span className="font-semibold">Đăng Nhập</span>
                                </>
                            ) : (
                                <>
                                    Chưa có tài khoản?{' '}
                                    <span className="font-semibold">Đăng Ký</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                    Bằng cách tiếp tục, bạn đồng ý với{' '}
                    <Link href="/terms" className="text-orange-600 dark:text-orange-400 hover:underline">
                        Điều Khoản Dịch Vụ
                    </Link>{' '}
                    và{' '}
                    <Link href="/privacy" className="text-orange-600 dark:text-orange-400 hover:underline">
                        Chính Sách Bảo Mật
                    </Link>
                </p>
            </div>
        </div>
    );
}
