'use client';

import { useState, Suspense, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { signInWithOAuth, signInWithEmail, signUpWithEmail } from '@/lib/utils/auth';
import type { AuthProvider } from '@/lib/utils/auth';
import { Chrome, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2, Eye, EyeOff, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-950">
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
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        lower: false,
        upper: false,
        number: false,
        special: false,
    });
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    // Hiển thị lỗi từ search params nếu có
    useEffect(() => {
        if (error && !isLoading) {
            toast({
                title: 'Lỗi Xác Thực',
                description: error,
                variant: 'destructive',
            });
        }
    }, [error, isLoading, toast]);

    const next = searchParams.get('next') || '/';

    // Check email uniqueness dynamically
    useEffect(() => {
        if (!isSignUp || !email || !email.includes('@')) {
            setEmailExists(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsCheckingEmail(true);
            try {
                const res = await fetch('/api/auth/check-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim() }),
                });
                const data = await res.json();
                setEmailExists(data.exists);
            } catch (err) {
                console.error('Email check failed:', err);
            } finally {
                setIsCheckingEmail(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [email, isSignUp]);

    const handleOAuthSignIn = async (provider: AuthProvider) => {
        setIsLoading(true);
        try {
            await signInWithOAuth(provider);
        } catch (error: any) {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể đăng nhập bằng OAuth',
                variant: 'destructive',
            });
            setIsLoading(false);
        }
    };

    const validateEmail = (emailStr: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailStr) return "Vui lòng nhập email.";
        if (!emailRegex.test(emailStr)) return "Định dạng email không hợp lệ (ví dụ: banna@example.com).";
        return null;
    };

    const validatePassword = (pass: string) => {
        const reqs = {
            length: pass.length >= 8,
            lower: /[a-z]/.test(pass),
            upper: /[A-Z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pass),
        };
        setPasswordRequirements(reqs);

        if (!pass) return "Vui lòng nhập mật khẩu.";

        const errors = [];
        if (!reqs.length) errors.push("tối thiểu 8 ký tự");
        if (!reqs.lower) errors.push("chữ cái thường");
        if (!reqs.upper) errors.push("chữ cái in hoa");
        if (!reqs.number) errors.push("chữ số");
        if (!reqs.special) errors.push("ký tự đặc biệt");
        
        if (errors.length > 0) {
            return `Mật khẩu cần thêm: ${errors.join(", ")}.`;
        }
        return null;
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const trimmedEmail = email.trim();
            const trimmedPassword = password.trim();

            if (isSignUp && emailExists) {
                throw new Error("Email này đã được đăng ký. Vui lòng sử dụng email khác.");
            }

            // Client-side validation
            const emailError = validateEmail(trimmedEmail);
            if (emailError) throw new Error(emailError);

            if (isSignUp) {
                if (!fullName.trim()) throw new Error("Vui lòng nhập họ và tên.");
                
                const passwordError = validatePassword(trimmedPassword);
                if (passwordError) throw new Error(passwordError);

                await signUpWithEmail(trimmedEmail, trimmedPassword, { full_name: fullName.trim() });
                setIsSuccess(true);
                toast({
                    title: 'Đăng ký thành công!',
                    description: 'Vui lòng kiểm tra hộp thư đến để xác thực tài khoản.',
                });
            } else {
                if (!trimmedPassword) throw new Error("Vui lòng nhập mật khẩu.");
                await signInWithEmail(trimmedEmail, trimmedPassword);
                toast({
                    title: 'Chào mừng trở lại!',
                    description: 'Bạn đã đăng nhập thành công.',
                });
                router.push(next);
            }
        } catch (error: any) {
            let errorMessage = error.message || 'Xác thực thất bại';
            const errorCode = error.code;
            const errorStatus = error.status;
            
            // Theo dõi lỗi để mapping chính xác hơn
            console.log('Auth Error Details:', { errorCode, errorStatus, message: errorMessage });

            // Comprehensive Mapping dựa trên cả code và status
            if (errorCode === 'user_already_exists' || (errorStatus === 422 && errorMessage.includes('already registered'))) {
                errorMessage = 'Email này đã được thành viên TasteMuse sử dụng. Bạn hãy đăng nhập nhé!';
            } else if (errorCode === 'weak_password' || errorMessage.includes('Password should contain')) {
                errorMessage = 'Mật khẩu quá đơn giản. Hãy làm theo hướng dẫn màu xanh ở trên nhé!';
            } else if (errorCode === 'over_email_send_limit' || errorStatus === 429) {
                errorMessage = 'Bạn thao tác quá nhanh! Vui lòng đợi 1-2 phút trước khi đăng ký tiếp nhé.';
            } else if (errorCode === 'invalid_credentials') {
                errorMessage = 'Email hoặc mật khẩu chưa đúng. Bạn kiểm tra lại giúp TasteMuse nhé.';
            } else if (errorCode === 'email_not_confirmed' || (errorStatus === 400 && errorMessage.includes('not confirmed'))) {
                errorMessage = 'Tài khoản chưa được kích hoạt. Bạn vui lòng kiểm tra email (bản tin/spam) để xác nhận nhé!';
            } else if (errorCode === 'validation_failed' || errorStatus === 422) {
                if (errorMessage.includes('confirmation email')) {
                    if (errorMessage.includes('domain with your API key is not verified') || errorMessage.includes('550')) {
                        errorMessage = 'Lỗi gửi mail: Email người gửi hoặc tên miền chưa được xác thực trong cấu hình SMTP. Vui lòng kiểm tra lại thiết lập Supabase.';
                    } else if (errorMessage.includes('non-text context') || errorMessage.includes('template')) {
                        errorMessage = 'Lỗi cấu hình hệ thống: Mẫu Email (Template) trong Supabase bị lỗi cú pháp HTML. Vui lòng liên hệ quản trị viên.';
                    } else {
                        errorMessage = 'Gặp lỗi khi gửi email xác thực. Bạn vui lòng thử lại sau ít phút hoặc liên hệ hỗ trợ nhé!';
                    }
                } else {
                    errorMessage = 'Thông tin đăng ký không hợp lệ. Bạn vui lòng kiểm tra lại các ô nhập liệu.';
                }
            }

            toast({
                title: 'Hệ thống TasteMuse',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-950 pt-28 md:pt-32 p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-md relative">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-orange-100 dark:border-orange-900/50 p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-orange-500 to-amber-500 rounded-2xl mb-4 shadow-lg">
                            {isSuccess ? <CheckCircle2 className="w-8 h-8 text-white" /> : <Sparkles className="w-8 h-8 text-white" />}
                        </div>
                        <h1 className="text-3xl font-bold bg-linear-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                            {isSuccess ? 'Kiểm Tra Email' : isSignUp ? 'Tham Gia TasteMuse' : 'Chào Mừng Trở Lại'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {isSuccess
                                ? `Chúng tôi đã gửi link xác thực đến ${email}`
                                : isSignUp
                                    ? 'Tạo tài khoản để khám phá những món ăn tuyệt vời'
                                    : 'Đăng nhập để tiếp tục hành trình ẩm thực của bạn'}
                        </p>
                    </div>

                    {isSuccess ? (
                        <div className="space-y-6 pt-4">
                            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/50 rounded-2xl p-6 text-center space-y-4">
                                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <Mail className="w-6 h-6 text-orange-500" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Vui lòng nhấn vào liên kết trong email để kích hoạt tài khoản của bạn.
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                        (Đừng quên kiểm tra cả thư mục Spam nhé!)
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push('/')}
                                    className="w-full h-12 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-md transition-all"
                                >
                                    Quay lại trang chủ
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsSuccess(false)}
                                    className="w-full h-11 text-gray-600 dark:text-gray-400 hover:text-orange-600 transition-colors"
                                >
                                    Sử dụng email khác
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
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

                            <div className="relative">
                                <Separator className="bg-gray-200 dark:bg-gray-700" />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 px-4 text-sm text-gray-500 dark:text-gray-400">
                                    hoặc
                                </span>
                            </div>

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
                                        {isSignUp && isCheckingEmail && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        {isSignUp && emailExists && !isCheckingEmail && (
                                            <p className="text-[11px] text-red-500 mt-1 animate-in fade-in slide-in-from-top-1">
                                                Email này đã được sử dụng. Bạn có muốn <button type="button" onClick={() => setIsSignUp(false)} className="underline font-semibold text-orange-600">đăng nhập</button>?
                                            </p>
                                        )}
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
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setPassword(val);
                                                if (isSignUp) validatePassword(val);
                                            }}
                                            className="pl-10 pr-10 h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    
                                    {isSignUp && password && (
                                        <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                                            {[
                                                { key: 'length', label: 'Tối thiểu 8 ký tự' },
                                                { key: 'upper', label: 'Chữ in hoa (A-Z)' },
                                                { key: 'lower', label: 'Chữ thường (a-z)' },
                                                { key: 'number', label: 'Số (0-9)' },
                                                { key: 'special', label: 'Ký tự (!@#$)' },
                                            ].map((req) => (
                                                <div 
                                                    key={req.key} 
                                                    className={`flex items-center gap-1.5 text-[11px] transition-colors duration-200 ${
                                                        passwordRequirements[req.key as keyof typeof passwordRequirements] 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-gray-400 dark:text-gray-500'
                                                    }`}
                                                >
                                                    {passwordRequirements[req.key as keyof typeof passwordRequirements] ? (
                                                        <Check className="w-3 h-3 shrink-0" />
                                                    ) : (
                                                        <div className="w-3 h-3 flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />
                                                        </div>
                                                    )}
                                                    <span className="truncate">{req.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                    className="w-full h-12 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
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
                        </>
                    )}
                </div>

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
