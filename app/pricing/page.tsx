"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Crown, Check, X, Zap, ArrowRight, MessageSquare, Heart, Filter, Calendar, Star, Shield, ChevronDown, CheckCircle2, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/db/supabase"

const PLANS = [
    {
        name: "free",
        displayName: "Khám phá (Free)",
        price: 0,
        annualPrice: 0,
        originalPrice: undefined as number | undefined,
        discountBadge: undefined as string | undefined,
        period: "",
        promotion: undefined as string | undefined,
        description: "Khám phá ẩm thực với các tính năng cơ bản.",
        cta: "Đang sử dụng",
        popular: false,
        features: [
            { label: "Tìm kiếm & Xem đánh giá", included: true },
            { label: "AI Chatbot (5 câu/ngày)", included: true },
            { label: "Gợi ý ẩm thực cơ bản", included: true },
            { label: "Bộ lọc nâng cao", included: false },
            { label: "Lưu danh sách yêu thích", included: false },
            { label: "Tóm tắt đánh giá bằng AI", included: false },
            { label: "Lập kế hoạch bữa ăn", included: false },
            { label: "Hỗ trợ ưu tiên 1-1", included: false },
        ],
    },
    {
        name: "premium",
        displayName: "Tiêu chuẩn (Standard)",
        price: 19000,
        annualPrice: 190000,
        originalPrice: undefined as number | undefined,
        discountBadge: undefined as string | undefined,
        period: "/ tháng",
        promotion: "Tặng 3 ngày cho lần đầu đăng ký",
        description: "Dành cho tín đồ ẩm thực muốn có trợ lý AI thông minh.",
        cta: "Nâng cấp ngay",
        popular: true,
        features: [
            { label: "Tìm kiếm & Xem đánh giá", included: true },
            { label: "AI Chatbot KHÔNG GIỚI HẠN", included: true },
            { label: "Gợi ý AI CÁ NHÂN HÓA", included: true },
            { label: "Bộ lọc nâng cao", included: true },
            { label: "Lưu danh sách yêu thích", included: true },
            { label: "Tóm tắt đánh giá bằng AI", included: false },
            { label: "Lập kế hoạch bữa ăn", included: false },
            { label: "Hỗ trợ ưu tiên 1-1", included: false },
        ],
    },
    {
        name: "promax",
        displayName: "Toàn diện (Premium)",
        price: 39000,
        annualPrice: 390000,
        originalPrice: undefined as number | undefined,
        discountBadge: undefined as string | undefined,
        period: "/ tháng",
        promotion: "Tặng 3 ngày cho lần đầu đăng ký",
        description: "Dành cho người dùng cần kế hoạch ăn uống chi tiết cùng AI.",
        cta: "Nâng cấp ngay",
        popular: false,
        features: [
            { label: "Tìm kiếm & Xem đánh giá", included: true },
            { label: "AI Chatbot KHÔNG GIỚI HẠN", included: true },
            { label: "Gợi ý AI CÁ NHÂN HÓA", included: true },
            { label: "Bộ lọc nâng cao", included: true },
            { label: "Lưu danh sách yêu thích", included: true },
            { label: "Tóm tắt đánh giá bằng AI", included: true },
            { label: "Lập kế hoạch bữa ăn", included: true },
            { label: "Hỗ trợ ưu tiên 1-1", included: true },
        ],
    },
]

const FAQ = [
    {
        q: "Tôi có thể hủy gói Premium bất cứ lúc nào không?",
        a: "Có, bạn có thể hủy bất cứ lúc nào. Gói Premium sẽ vẫn hoạt động cho đến hết thời hạn đã thanh toán.",
    },
    {
        q: "Có ưu đãi gì khi đăng ký gói tháng?",
        a: "Hiện tại chúng tôi đang có chương trình khuyến mãi: Khi đăng ký gói Premium 1 tháng LẦN ĐẦU TIÊN, bạn sẽ được tặng kèm 3 ngày sử dụng miễn phí (tổng cộng 33 ngày).",
    },
    {
        q: "Thanh toán bằng phương thức nào?",
        a: "Chúng tôi hỗ trợ thanh toán qua PayOS (chuyển khoản ngân hàng, ví điện tử) — hoàn toàn an toàn và bảo mật.",
    },
    {
        q: "Gói miễn phí có những hạn chế gì?",
        a: "Gói miễn phí giới hạn 5 câu hỏi AI/ngày, không có tính năng lưu yêu thích, bộ lọc nâng cao, và gợi ý cá nhân hóa.",
    },
]

function PricingContent() {
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [currentPlan, setCurrentPlan] = useState<string>("free")
    const [isEligibleForPromo, setIsEligibleForPromo] = useState(true)
    const [isAnnual, setIsAnnual] = useState(false)
    const [openFaq, setOpenFaq] = useState<number | null>(null)
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

    // Handle payment return from PayOS
    useEffect(() => {
        const paymentStatus = searchParams.get("payment")
        const orderCode = searchParams.get("orderCode")

        if (paymentStatus === "success" && orderCode) {
            handlePaymentReturn(orderCode)
        } else if (paymentStatus === "cancelled") {
            setNotification({ type: "error", message: "Thanh toán đã bị hủy." })
            window.history.replaceState({}, "", "/pricing")
        }
    }, [searchParams])

    async function handlePaymentReturn(orderCode: string) {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            setNotification({ type: "success", message: "Đang xác nhận thanh toán..." })

            const res = await fetch("/api/payment/callback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ orderCode: Number(orderCode) }),
            })

            const data = await res.json()

            if (data.success) {
                // Refresh plan info from server
                await checkPlan()
                setNotification({ type: "success", message: "🎉 Nâng cấp Premium thành công! Tận hưởng AI không giới hạn nhé!" })
                // Clean up URL params
                window.history.replaceState({}, "", "/pricing")
            } else {
                setNotification({ type: "error", message: data.message || "Có lỗi xảy ra khi xác nhận thanh toán." })
                window.history.replaceState({}, "", "/pricing")
            }
        } catch (e) {
            setNotification({ type: "error", message: "Có lỗi xảy ra. Vui lòng liên hệ hỗ trợ." })
            window.history.replaceState({}, "", "/pricing")
        }
    }

    useEffect(() => {
        checkPlan()
    }, [])

    async function checkPlan() {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        try {
            const res = await fetch("/api/subscription", {
                headers: { Authorization: `Bearer ${session.access_token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setCurrentPlan(data.plan?.name || "free")
                // If they have any active or past subscription, they are no longer eligible for the promo
                setIsEligibleForPromo(!data.hasUsedTrial)
            }
        } catch { }
    }

    async function handleUpgrade(planName: string) {
        setIsLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                window.location.href = "/login"
                return
            }

            const res = await fetch("/api/payment/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ planName }),
            })

            const data = await res.json()
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl
            }
        } catch (e) {
            console.error("Upgrade error:", e)
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="min-h-screen bg-background">
            {/* Payment Notification Banner */}
            {notification && (
                <div className={`border-b px-4 py-3 text-center text-sm font-medium flex items-center justify-center gap-2 ${notification.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                    }`}>
                    {notification.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4" />
                    ) : (
                        <XCircle className="h-4 w-4" />
                    )}
                    {notification.message}
                    <button
                        onClick={() => setNotification(null)}
                        className="ml-2 hover:opacity-70"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-16">
                <div className="absolute inset-0 bg-linear-to-b from-amber-500/5 via-orange-500/5 to-transparent pointer-events-none" />
                <div className="relative container mx-auto pt-24 md:pt-24 pb-16 px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                        <Crown className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            Bảng giá
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Chọn gói phù hợp với bạn
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                        Bắt đầu miễn phí, nâng cấp khi bạn cần. Khám phá toàn bộ sức mạnh AI của TasteMuse.
                    </p>

                    <div className="flex flex-col items-center justify-center space-y-4 mb-4">
                        <Link
                            href="/subscription/history"
                            className="inline-flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 hover:underline transition-colors mt-2"
                        >
                            <Clock className="w-3.5 h-3.5" />
                            Xem lịch sử đăng ký
                        </Link>
                        <div className="flex items-center justify-center p-1 bg-muted rounded-full">
                            <button
                                onClick={() => setIsAnnual(false)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isAnnual ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Hàng tháng
                            </button>
                            <button
                                onClick={() => setIsAnnual(true)}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isAnnual ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                Hàng năm
                                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                                    Tiết kiệm ~17%
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plans Grid */}
            <section className="container mx-auto px-4 pb-20">
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
                    {PLANS.map((plan) => {
                        const isCurrentPlan = currentPlan === plan.name || currentPlan === `${plan.name}_annual`;
                        const promotionText = (plan.name === "premium" || plan.name === "promax") && isEligibleForPromo
                            ? plan.promotion
                            : undefined;

                        return (
                            <div
                                key={plan.name}
                                className={`flex flex-col relative rounded-2xl border p-8 transition-all duration-300 ${isCurrentPlan
                                    ? "border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.03] bg-emerald-50/10 dark:bg-emerald-500/5 ring-2 ring-emerald-500/50"
                                    : plan.popular
                                        ? "border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]"
                                        : "border-border/50 hover:border-muted-foreground/30"
                                    }`}
                            >
                                {/* Current Plan Badge */}
                                {isCurrentPlan && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                                        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg uppercase tracking-wider">
                                            <CheckCircle2 className="w-3 h-3" /> Gói của bạn
                                        </div>
                                    </div>
                                )}

                                {/* Popular badge */}
                                {plan.popular && !isCurrentPlan && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow-lg">
                                            Phổ biến nhất
                                        </div>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{plan.displayName}</h3>
                                        {isCurrentPlan && (
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full uppercase">Active</span>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="mb-4 min-h-[48px] flex flex-col justify-end">
                                        {plan.price === 0 ? (
                                            <div className="flex items-baseline gap-1 mb-1">
                                                <span className="text-4xl md:text-5xl font-bold text-foreground">Miễn phí</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-1">
                                                {plan.originalPrice && plan.discountBadge && !isAnnual && (
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-semibold text-white bg-linear-to-r from-red-500 to-rose-600 px-2.5 py-0.5 rounded-full shadow-sm">
                                                            {plan.discountBadge}
                                                        </span>
                                                        <span className="text-sm font-medium text-muted-foreground line-through decoration-red-500/50">
                                                            {plan.originalPrice.toLocaleString("vi-VN")}đ
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex flex-col items-start gap-0.5">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-4xl md:text-5xl font-bold text-foreground">
                                                            {((isAnnual ? plan.annualPrice : plan.price) / 1000)}K
                                                        </span>
                                                        <span className="text-muted-foreground text-lg">
                                                            {isAnnual ? "/ năm" : plan.period}
                                                        </span>
                                                    </div>
                                                    {promotionText && !isAnnual && (
                                                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md mt-1">
                                                            {promotionText}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                                </div>

                                {/* Feature List */}
                                <div className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div
                                                className={`shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center ${feature.included
                                                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                                                    : "bg-muted text-muted-foreground/60"
                                                    }`}
                                            >
                                                {feature.included ? (
                                                    <Check className="h-3.5 w-3.5 stroke-3" />
                                                ) : (
                                                    <X className="h-3.5 w-3.5 stroke-3" />
                                                )}
                                            </div>
                                            <span
                                                className={`text-[15px] leading-tight ${feature.included
                                                    ? "text-foreground font-medium"
                                                    : "text-muted-foreground/70 line-through"
                                                    }`}
                                            >
                                                {feature.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA */}
                                <div className="mt-auto">
                                    {plan.name === "premium" || plan.name === "promax" ? (
                                        <div className="w-full">
                                            {(() => {
                                                const isCurrent = currentPlan === plan.name || currentPlan === `${plan.name}_annual`;
                                                const hasOtherPaid = currentPlan !== 'free' && !isCurrent;

                                                if (isCurrent) {
                                                    return (
                                                        <Button disabled className="w-full h-12 border-2 border-amber-500 text-amber-600 bg-amber-500/5 dark:bg-amber-500/10">
                                                            Đang sử dụng
                                                        </Button>
                                                    );
                                                }

                                                if (hasOtherPaid) {
                                                    return (
                                                        <Button disabled className="w-full h-12 border-2 border-border bg-muted text-muted-foreground">
                                                            Đã có gói hoạt động
                                                        </Button>
                                                    );
                                                }

                                                return (
                                                    <Button
                                                        onClick={() => handleUpgrade(isAnnual ? `${plan.name}_annual` : plan.name)}
                                                        disabled={isLoading}
                                                        className={plan.popular
                                                            ? "w-full h-12 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold flex items-center justify-center text-center shadow-lg shadow-orange-500/25 transition-all duration-300"
                                                            : "w-full h-12 bg-transparent text-foreground border-2 border-amber-500/50 hover:bg-amber-500/10 font-semibold flex items-center justify-center text-center transition-all duration-300"
                                                        }
                                                    >
                                                        {isLoading ? "Đang xử lý..." : (
                                                            isAnnual ? `${plan.cta} (-17% theo năm)` : plan.cta
                                                        )}
                                                    </Button>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <Button variant="outline" disabled className="w-full h-12 bg-transparent border-2 border-border/50">
                                            {currentPlan === "free" ? "Đang sử dụng" : "Bắt đầu miễn phí"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="container mx-auto px-4 pb-20">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                        Câu hỏi thường gặp
                    </h2>
                    <div className="space-y-4">
                        {FAQ.map((item, idx) => (
                            <div
                                key={idx}
                                className="border border-border rounded-lg overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition"
                                >
                                    <span className="text-sm font-medium text-foreground pr-4">
                                        {item.q}
                                    </span>
                                    <ChevronDown
                                        className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${openFaq === idx ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                {openFaq === idx && (
                                    <div className="px-4 pb-4">
                                        <p className="text-sm text-muted-foreground">{item.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default function PricingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <PricingContent />
        </Suspense>
    )
}
