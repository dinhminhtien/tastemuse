'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/db/supabase';
import { getCurrentUser } from '@/lib/utils/auth';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Crown, Loader2, Clock, CreditCard, CheckCircle2,
    XCircle, AlertCircle, Zap, ArrowLeft, CalendarDays, Receipt
} from 'lucide-react';

interface SubscriptionRecord {
    id: string;
    plan_id: string;
    status: 'active' | 'expired' | 'cancelled' | 'trial';
    start_date: string;
    end_date: string | null;
    is_trial: boolean;
    created_at: string;
    plans: {
        name: string;
        display_name: string;
        price: number;
        ai_limit_per_day: number;
    };
}

interface PaymentRecord {
    id: string;
    plan_id: string;
    provider: string;
    amount: number;
    transaction_id: string | null;
    order_code: number | null;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'active':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" /> Đang hoạt động
                </span>
            );
        case 'trial':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    <Zap className="w-3 h-3" /> Dùng thử
                </span>
            );
        case 'expired':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <Clock className="w-3 h-3" /> Hết hạn
                </span>
            );
        case 'cancelled':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    <XCircle className="w-3 h-3" /> Đã hủy
                </span>
            );
        case 'completed':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" /> Thành công
                </span>
            );
        case 'pending':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                    <AlertCircle className="w-3 h-3" /> Đang chờ
                </span>
            );
        case 'failed':
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    <XCircle className="w-3 h-3" /> Thất bại
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {status}
                </span>
            );
    }
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatCurrency(amount: number) {
    return amount.toLocaleString('vi-VN') + 'đ';
}

export default function SubscriptionHistoryPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [activeTab, setActiveTab] = useState<'subscriptions' | 'payments'>('subscriptions');

    useEffect(() => {
        loadHistory();
    }, []);

    async function loadHistory() {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setLoading(false);
                return;
            }

            const res = await fetch('/api/subscription/history', {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setSubscriptions(data.subscriptions || []);
                setPayments(data.payments || []);
            }
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    }

    // Not logged in
    if (!user && !loading) {
        return (
            <main className="min-h-screen bg-background pt-28 md:pt-32">
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4">
                        <div className="max-w-md mx-auto text-center space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Crown className="w-10 h-10 text-primary" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold">
                                Lịch sử <span className="gradient-text">đăng ký</span>
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Đăng nhập để xem lịch sử đăng ký và thanh toán
                            </p>
                            <Link href="/login">
                                <Button size="lg" className="mt-4 rounded-xl shadow-lg shadow-primary/25">
                                    Đăng nhập ngay
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background pt-28 md:pt-32">
            {/* Hero */}
            <section className="relative overflow-hidden py-10 md:py-14">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-10 right-20 w-48 h-48 bg-amber-500/6 rounded-full glow-blob float-particle" />
                    <div className="absolute bottom-10 left-10 w-64 h-64 bg-orange-500/6 rounded-full glow-blob float-particle-slow" />
                </div>
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại bảng giá
                        </Link>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <Crown className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold">
                                    Lịch sử đăng ký
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Quản lý gói đăng ký và lịch sử thanh toán
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <section className="py-4 md:py-6 bg-background/80 backdrop-blur-sm border-y border-border/40 sticky top-18 z-30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto flex gap-2">
                        <Button
                            variant={activeTab === 'subscriptions' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('subscriptions')}
                            className="gap-2 rounded-xl"
                        >
                            <CalendarDays className="w-4 h-4" />
                            Gói đăng ký
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === 'subscriptions'
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                                }`}>
                                {subscriptions.length}
                            </span>
                        </Button>
                        <Button
                            variant={activeTab === 'payments' ? 'default' : 'outline'}
                            onClick={() => setActiveTab('payments')}
                            className="gap-2 rounded-xl"
                        >
                            <Receipt className="w-4 h-4" />
                            Thanh toán
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === 'payments'
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                                }`}>
                                {payments.length}
                            </span>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-10 section-alt">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Loading */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                                <p className="text-muted-foreground">Đang tải lịch sử...</p>
                            </div>
                        )}

                        {/* Subscriptions Tab */}
                        {!loading && activeTab === 'subscriptions' && (
                            <>
                                {subscriptions.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                                            <CalendarDays className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-lg font-semibold mb-2">Chưa có gói đăng ký nào</p>
                                        <p className="text-muted-foreground mb-6">Nâng cấp Premium để trải nghiệm AI không giới hạn</p>
                                        <Link href="/pricing">
                                            <Button className="rounded-xl gap-2">
                                                <Crown className="w-4 h-4" />
                                                Xem gói Premium
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {subscriptions.map((sub) => (
                                            <Card key={sub.id} className="p-5 border shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sub.plans?.name !== 'free'
                                                            ? 'bg-amber-500/10'
                                                            : 'bg-muted'
                                                            }`}>
                                                            {sub.plans?.name !== 'free' ? (
                                                                <Crown className="w-5 h-5 text-amber-500" />
                                                            ) : (
                                                                <Zap className="w-5 h-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold text-foreground">
                                                                    {sub.plans?.display_name || 'Gói Premium'}
                                                                </h3>
                                                                {sub.is_trial && (
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                                                        Dùng thử
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground space-y-0.5">
                                                                <p className="flex items-center gap-1.5">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    {formatDate(sub.start_date)}
                                                                    {sub.end_date && ` → ${formatDate(sub.end_date)}`}
                                                                </p>
                                                                {sub.plans?.price > 0 && (
                                                                    <p className="flex items-center gap-1.5">
                                                                        <CreditCard className="w-3.5 h-3.5" />
                                                                        {formatCurrency(sub.plans.price)}/tháng
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="sm:text-right">
                                                        {getStatusBadge(sub.status)}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Payments Tab */}
                        {!loading && activeTab === 'payments' && (
                            <>
                                {payments.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                                            <Receipt className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-lg font-semibold mb-2">Chưa có thanh toán nào</p>
                                        <p className="text-muted-foreground">Lịch sử thanh toán sẽ hiển thị tại đây</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {payments.map((payment) => (
                                            <Card key={payment.id} className="p-5 border shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${payment.status === 'completed'
                                                            ? 'bg-emerald-500/10'
                                                            : payment.status === 'pending'
                                                                ? 'bg-amber-500/10'
                                                                : 'bg-red-500/10'
                                                            }`}>
                                                            <CreditCard className={`w-5 h-5 ${payment.status === 'completed'
                                                                ? 'text-emerald-500'
                                                                : payment.status === 'pending'
                                                                    ? 'text-amber-500'
                                                                    : 'text-red-500'
                                                                }`} />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold text-foreground">
                                                                    {formatCurrency(payment.amount)}
                                                                </h3>
                                                                <span className="text-xs text-muted-foreground uppercase">
                                                                    {payment.provider}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-muted-foreground space-y-0.5">
                                                                <p className="flex items-center gap-1.5">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    {formatDate(payment.created_at)}
                                                                </p>
                                                                {payment.order_code && (
                                                                    <p className="flex items-center gap-1.5">
                                                                        <Receipt className="w-3.5 h-3.5" />
                                                                        Mã đơn: #{payment.order_code}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="sm:text-right">
                                                        {getStatusBadge(payment.status)}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}
