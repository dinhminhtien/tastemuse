'use client';

import { useEffect, useState, useCallback } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import {
    Calendar, Loader2, Crown, Plus, Trash2, UtensilsCrossed,
    Coffee, Sun, Moon, Cookie, ChefHat, Pencil, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import type { MealPlan, MealPlanItem, MealType } from '@/types/database';

const MEAL_TYPE_CONFIG: Record<MealType, { label: string; icon: typeof Coffee; color: string }> = {
    breakfast: { label: 'Sáng', icon: Coffee, color: 'text-amber-500 bg-amber-500/10' },
    lunch: { label: 'Trưa', icon: Sun, color: 'text-orange-500 bg-orange-500/10' },
    dinner: { label: 'Tối', icon: Moon, color: 'text-indigo-500 bg-indigo-500/10' },
    snack: { label: 'Ăn vặt', icon: Cookie, color: 'text-pink-500 bg-pink-500/10' },
};

const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DAY_FULL_NAMES = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export default function MealPlansPage() {
    const [user, setUser] = useState<User | null>(null);
    const [plans, setPlans] = useState<MealPlan[]>([]);
    const [activePlan, setActivePlan] = useState<(MealPlan & { items: MealPlanItem[] }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [addingItem, setAddingItem] = useState<{ day: number; mealType: MealType } | null>(null);
    const [itemNotes, setItemNotes] = useState('');

    async function getToken() {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || null;
    }

    const loadPlans = useCallback(async () => {
        const token = await getToken();
        if (!token) return;

        try {
            const res = await fetch('/api/meal-plans', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setPlans(data.data || []);
            }
        } catch (e) {
            console.error('Error loading meal plans:', e);
        }
    }, []);

    const loadPlanDetail = useCallback(async (planId: string) => {
        const token = await getToken();
        if (!token) return;

        try {
            const res = await fetch(`/api/meal-plans?id=${planId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setActivePlan(data.data);
            }
        } catch (e) {
            console.error('Error loading plan detail:', e);
        }
    }, []);

    useEffect(() => {
        async function init() {
            const currentUser = await getCurrentUser();
            setUser(currentUser);

            if (!currentUser) {
                setLoading(false);
                setIsPremium(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const res = await fetch('/api/subscription', {
                        headers: { Authorization: `Bearer ${session.access_token}` },
                    });
                    if (res.ok) {
                        const planData = await res.json();
                        setIsPremium(planData.isPremium || false);
                        if (!planData.isPremium) {
                            setLoading(false);
                            return;
                        }
                    }
                }
            } catch { }

            await loadPlans();
            setLoading(false);
        }
        init();
    }, [loadPlans]);

    async function handleCreatePlan() {
        if (!newTitle.trim()) return;
        setCreating(true);
        try {
            const token = await getToken();
            if (!token) return;

            const res = await fetch('/api/meal-plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title: newTitle.trim() }),
            });

            if (res.ok) {
                setNewTitle('');
                setShowCreateForm(false);
                await loadPlans();
            }
        } catch (e) {
            console.error('Create plan error:', e);
        } finally {
            setCreating(false);
        }
    }

    async function handleDeletePlan(planId: string) {
        setDeletingId(planId);
        try {
            const token = await getToken();
            if (!token) return;

            await fetch(`/api/meal-plans?id=${planId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (activePlan?.id === planId) {
                setActivePlan(null);
            }
            await loadPlans();
        } catch (e) {
            console.error('Delete plan error:', e);
        } finally {
            setDeletingId(null);
        }
    }

    async function handleAddItem(day: number, mealType: MealType) {
        if (!activePlan) return;
        try {
            const token = await getToken();
            if (!token) return;

            const res = await fetch('/api/meal-plans/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    meal_plan_id: activePlan.id,
                    meal_type: mealType,
                    day_of_week: day,
                    notes: itemNotes.trim() || null,
                }),
            });

            if (res.ok) {
                setAddingItem(null);
                setItemNotes('');
                await loadPlanDetail(activePlan.id);
            }
        } catch (e) {
            console.error('Add item error:', e);
        }
    }

    async function handleRemoveItem(itemId: string) {
        if (!activePlan) return;
        try {
            const token = await getToken();
            if (!token) return;

            await fetch(`/api/meal-plans/items?id=${itemId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            await loadPlanDetail(activePlan.id);
        } catch (e) {
            console.error('Remove item error:', e);
        }
    }

    // Not logged in
    if (!user && !loading) {
        return (
            <main className="min-h-screen bg-background pt-28 md:pt-32">
                <section className="relative overflow-hidden py-16 md:py-24">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-10 right-20 w-48 h-48 bg-primary/6 rounded-full glow-blob float-particle" />
                        <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/6 rounded-full glow-blob float-particle-slow" />
                    </div>
                    <div className="container mx-auto px-4">
                        <div className="max-w-md mx-auto text-center space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Calendar className="w-10 h-10 text-primary" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold">
                                Lập kế hoạch <span className="gradient-text">bữa ăn</span>
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Đăng nhập để lập kế hoạch bữa ăn cho cả tuần
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

    // Not Premium
    if (user && !isPremium && !loading) {
        return (
            <main className="min-h-screen bg-background pt-28 md:pt-32">
                <section className="relative overflow-hidden py-16 md:py-24">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-10 right-20 w-48 h-48 bg-amber-500/6 rounded-full glow-blob float-particle" />
                        <div className="absolute bottom-10 left-10 w-64 h-64 bg-orange-500/6 rounded-full glow-blob float-particle-slow" />
                    </div>
                    <div className="container mx-auto px-4">
                        <div className="max-w-md mx-auto text-center space-y-6">
                            <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                <Crown className="w-10 h-10 text-amber-500" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold">
                                Tính năng <span className="gradient-text">Premium</span>
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Nâng cấp gói Premium để lập kế hoạch bữa ăn cho cả tuần
                            </p>
                            <Link href="/pricing">
                                <Button size="lg" className="mt-4 rounded-xl shadow-lg shadow-amber-500/25 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                                    <Crown className="w-4 h-4 mr-2" />
                                    Xem gói Premium
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    // Main content
    return (
        <main className="min-h-screen bg-background pt-28 md:pt-32">
            {/* Hero */}
            <section className="relative overflow-hidden py-12 md:py-16">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-10 right-20 w-48 h-48 bg-primary/6 rounded-full glow-blob float-particle" />
                    <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/6 rounded-full glow-blob float-particle-slow" />
                    <div className="absolute inset-0 opacity-[0.02]" style={{
                        backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }} />
                </div>
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-xs font-semibold text-primary border border-primary/20">
                            <Calendar className="w-3.5 h-3.5" />
                            KẾ HOẠCH BỮA ĂN
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                            Lập kế hoạch <span className="gradient-text">bữa ăn</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            {loading
                                ? 'Đang tải...'
                                : `${plans.length} kế hoạch đã tạo`
                            }
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4 max-w-5xl">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground">Đang tải kế hoạch bữa ăn...</p>
                        </div>
                    ) : activePlan ? (
                        /* ===== Plan Detail View ===== */
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setActivePlan(null)}
                                        className="mb-2 text-muted-foreground hover:text-foreground"
                                    >
                                        ← Quay lại danh sách
                                    </Button>
                                    <h2 className="text-2xl font-bold">{activePlan.title}</h2>
                                    {activePlan.description && (
                                        <p className="text-muted-foreground mt-1">{activePlan.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Weekly Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                                {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                                    <div key={day} className="border border-border rounded-xl overflow-hidden">
                                        {/* Day Header */}
                                        <div className="bg-muted/50 px-3 py-2 text-center border-b border-border">
                                            <span className="text-sm font-bold">{DAY_NAMES[day]}</span>
                                            <p className="text-[10px] text-muted-foreground">{DAY_FULL_NAMES[day]}</p>
                                        </div>

                                        {/* Meals for this day */}
                                        <div className="p-2 space-y-1.5 min-h-[120px]">
                                            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
                                                const config = MEAL_TYPE_CONFIG[mealType];
                                                const items = activePlan.items?.filter(
                                                    (item) => item.day_of_week === day && item.meal_type === mealType
                                                ) || [];

                                                return (
                                                    <div key={mealType}>
                                                        {items.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className={`group relative rounded-lg px-2 py-1.5 text-xs ${config.color} mb-1`}
                                                            >
                                                                <div className="flex items-center gap-1">
                                                                    <config.icon className="w-3 h-3 shrink-0" />
                                                                    <span className="font-medium truncate">
                                                                        {item.dishes?.name || item.restaurants?.name || item.notes || config.label}
                                                                    </span>
                                                                </div>
                                                                {item.notes && !item.dishes?.name && !item.restaurants?.name && null}
                                                                {item.notes && (item.dishes?.name || item.restaurants?.name) && (
                                                                    <p className="text-[10px] opacity-70 truncate mt-0.5">{item.notes}</p>
                                                                )}
                                                                <button
                                                                    onClick={() => handleRemoveItem(item.id)}
                                                                    className="absolute -top-1 -right-1 hidden group-hover:flex w-4 h-4 bg-destructive text-destructive-foreground rounded-full items-center justify-center"
                                                                >
                                                                    <X className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>
                                                        ))}

                                                        {/* Add item button (inline) */}
                                                        {addingItem?.day === day && addingItem?.mealType === mealType ? (
                                                            <div className="space-y-1">
                                                                <Input
                                                                    placeholder="Ghi chú..."
                                                                    value={itemNotes}
                                                                    onChange={(e) => setItemNotes(e.target.value)}
                                                                    className="h-7 text-xs"
                                                                    autoFocus
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') handleAddItem(day, mealType);
                                                                        if (e.key === 'Escape') {
                                                                            setAddingItem(null);
                                                                            setItemNotes('');
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="flex gap-1">
                                                                    <Button
                                                                        size="sm"
                                                                        className="h-6 text-[10px] flex-1"
                                                                        onClick={() => handleAddItem(day, mealType)}
                                                                    >
                                                                        <Check className="w-3 h-3 mr-0.5" />
                                                                        Thêm
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-6 text-[10px]"
                                                                        onClick={() => {
                                                                            setAddingItem(null);
                                                                            setItemNotes('');
                                                                        }}
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            items.length === 0 && (
                                                                <button
                                                                    onClick={() => setAddingItem({ day, mealType })}
                                                                    className={`w-full rounded-lg px-2 py-1 text-[10px] border border-dashed border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors flex items-center gap-1 justify-center`}
                                                                >
                                                                    <Plus className="w-2.5 h-2.5" />
                                                                    {config.label}
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* ===== Plans List View ===== */
                        <div>
                            {/* Create Plan */}
                            <div className="mb-8">
                                {showCreateForm ? (
                                    <Card className="p-4 border-dashed border-2 border-primary/30 bg-primary/5">
                                        <div className="flex items-center gap-3">
                                            <Input
                                                placeholder="Tên kế hoạch bữa ăn (VD: Tuần 1 tháng 3)..."
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                className="flex-1"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleCreatePlan();
                                                    if (e.key === 'Escape') {
                                                        setShowCreateForm(false);
                                                        setNewTitle('');
                                                    }
                                                }}
                                            />
                                            <Button
                                                onClick={handleCreatePlan}
                                                disabled={creating || !newTitle.trim()}
                                                className="gap-2"
                                            >
                                                {creating ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                Tạo
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    setShowCreateForm(false);
                                                    setNewTitle('');
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ) : (
                                    <Button
                                        onClick={() => setShowCreateForm(true)}
                                        className="gap-2 rounded-xl shadow-md shadow-primary/20"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Tạo kế hoạch mới
                                    </Button>
                                )}
                            </div>

                            {/* Plans Grid */}
                            {plans.length === 0 ? (
                                <div className="text-center py-20 max-w-md mx-auto">
                                    <div className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                                        <Calendar className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <p className="text-xl font-bold text-foreground mb-2">
                                        Chưa có kế hoạch bữa ăn
                                    </p>
                                    <p className="text-muted-foreground mb-6">
                                        Tạo kế hoạch bữa ăn để sắp xếp thực đơn cho cả tuần
                                    </p>
                                </div>
                            ) : (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {plans.map((plan) => (
                                        <Card
                                            key={plan.id}
                                            className="overflow-hidden card-interactive card-glow group cursor-pointer border-0 shadow-md"
                                            onClick={() => loadPlanDetail(plan.id)}
                                        >
                                            <div className="p-5 space-y-3">
                                                {/* Header */}
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                            <Calendar className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                                                                {plan.title}
                                                            </h3>
                                                            {plan.description && (
                                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                                    {plan.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeletePlan(plan.id);
                                                        }}
                                                        disabled={deletingId === plan.id}
                                                    >
                                                        {deletingId === plan.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>

                                                {/* Meta */}
                                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                                    <span className="text-xs text-muted-foreground">
                                                        Tạo {new Date(plan.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${plan.is_active
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                        {plan.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                                                    </span>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
