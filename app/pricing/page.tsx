"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Crown, Check, X, Zap, ArrowRight, MessageSquare, Heart, Filter, Calendar, Star, Shield, ChevronDown, CheckCircle2, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const PLANS = [
    {
        name: "free",
        displayName: "Miễn phí",
        price: 0,
        period: "",
        description: "Khám phá ẩm thực với các tính năng cơ bản",
        cta: "Đang sử dụng",
        popular: false,
        features: [
            { label: "Tìm kiếm món ăn & nhà hàng", included: true, icon: Zap },
            { label: "Xem đánh giá & nhận xét", included: true, icon: Star },
            { label: "AI Chatbot (10 câu/ngày)", included: true, icon: MessageSquare },
            { label: "Gợi ý cơ bản", included: true, icon: Zap },
            { label: "Lưu yêu thích", included: false, icon: Heart },
            { label: "Gợi ý AI cá nhân hóa", included: false, icon: Crown },
            { label: "Tóm tắt đánh giá bằng AI", included: false, icon: Star },
            { label: "Bộ lọc nâng cao", included: false, icon: Filter },
            { label: "Lập kế hoạch bữa ăn", included: false, icon: Calendar },
            { label: "AI không giới hạn", included: false, icon: Shield },
        ],
    },
    {
        name: "premium",
        displayName: "Premium",
        price: 29000,
        period: "/ tháng",
        description: "Tận hưởng toàn bộ sức mạnh AI của TasteMuse",
        cta: "Nâng cấp ngay",
        popular: true,
        features: [
            { label: "Tìm kiếm món ăn & nhà hàng", included: true, icon: Zap },
            { label: "Xem đánh giá & nhận xét", included: true, icon: Star },
            { label: "AI Chatbot không giới hạn", included: true, icon: MessageSquare },
            { label: "Gợi ý AI cá nhân hóa", included: true, icon: Crown },
            { label: "Lưu yêu thích", included: true, icon: Heart },
            { label: "Tóm tắt đánh giá bằng AI", included: true, icon: Star },
            { label: "Bộ lọc nâng cao (giá, calo, phổ biến)", included: true, icon: Filter },
            { label: "Lập kế hoạch bữa ăn", included: true, icon: Calendar },
            { label: "AI không giới hạn mọi tính năng", included: true, icon: Shield },
            { label: "Hỗ trợ ưu tiên", included: true, icon: Shield },
        ],
    },
]

const FAQ = [
    {
        q: "Tôi có thể hủy gói Premium bất cứ lúc nào không?",
        a: "Có, bạn có thể hủy bất cứ lúc nào. Gói Premium sẽ vẫn hoạt động cho đến hết thời hạn đã thanh toán.",
    },
    {
        q: "Dùng thử miễn phí hoạt động như thế nào?",
        a: "Bạn được dùng thử Premium miễn phí 3 ngày. Sau 3 ngày, tài khoản sẽ tự động quay về gói Miễn phí nếu bạn không nâng cấp.",
    },
    {
        q: "Thanh toán bằng phương thức nào?",
        a: "Chúng tôi hỗ trợ thanh toán qua PayOS (chuyển khoản ngân hàng, ví điện tử) — hoàn toàn an toàn và bảo mật.",
    },
    {
        q: "Gói miễn phí có những hạn chế gì?",
        a: "Gói miễn phí giới hạn 10 câu hỏi AI/ngày, không có tính năng lưu yêu thích, bộ lọc nâng cao, và gợi ý cá nhân hóa.",
    },
]

function PricingContent() {
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [currentPlan, setCurrentPlan] = useState<string>("free")
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
                setCurrentPlan("premium")
                setNotification({ type: "success", message: "🎉 Nâng cấp Premium thành công! Tận hưởng AI không giới hạn nhé!" })
                // Clean up URL params
                window.history.replaceState({}, "", "/pricing")
            } else {
                setNotification({ type: "error", message: data.message || "Có lỗi xảy ra khi xác nhận thanh toán." })
            }
        } catch (e) {
            setNotification({ type: "error", message: "Có lỗi xảy ra. Vui lòng liên hệ hỗ trợ." })
        }
    }

    useEffect(() => {
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
                }
            } catch { }
        }
        checkPlan()
    }, [])

    async function handleUpgrade() {
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
                body: JSON.stringify({}),
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

    async function handleTrial() {
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
                body: JSON.stringify({ trial: true }),
            })

            const data = await res.json()
            if (data.success) {
                setCurrentPlan("premium")
            }
        } catch (e) {
            console.error("Trial error:", e)
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
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-orange-500/5 to-transparent pointer-events-none" />
                <div className="relative container mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                        <Crown className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            Bảng giá
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Chọn gói phù hợp với bạn
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
                        Bắt đầu miễn phí, nâng cấp khi bạn cần. Khám phá toàn bộ sức mạnh AI của TasteMuse.
                    </p>
                    <Link
                        href="/subscription/history"
                        className="inline-flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 hover:underline transition-colors"
                    >
                        <Clock className="w-3.5 h-3.5" />
                        Xem lịch sử đăng ký
                    </Link>
                </div>
            </section>

            {/* Plans Grid */}
            <section className="container mx-auto px-4 pb-20">
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-2xl border-2 p-8 transition-all duration-300 ${plan.popular
                                ? "border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]"
                                : "border-border hover:border-muted-foreground/30"
                                }`}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow-lg">
                                        <Crown className="h-3 w-3" />
                                        Phổ biến nhất
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-foreground mb-1">{plan.displayName}</h3>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                            </div>

                            {/* Price */}
                            <div className="mb-8">
                                {plan.price === 0 ? (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-foreground">Miễn phí</span>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-foreground">
                                            {plan.price.toLocaleString("vi-VN")}đ
                                        </span>
                                        <span className="text-muted-foreground">{plan.period}</span>
                                    </div>
                                )}
                            </div>

                            {/* CTA */}
                            {plan.name === "premium" ? (
                                <div className="space-y-2.5 mb-8">
                                    {currentPlan === "premium" ? (
                                        <Button disabled className="w-full h-12">
                                            <Crown className="h-4 w-4 mr-2" />
                                            Đang sử dụng Premium
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={handleUpgrade}
                                                disabled={isLoading}
                                                className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-orange-500/25"
                                            >
                                                <Crown className="h-4 w-4 mr-2" />
                                                {isLoading ? "Đang xử lý..." : "Nâng cấp ngay"}
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                            <Button
                                                onClick={handleTrial}
                                                disabled={isLoading}
                                                variant="outline"
                                                className="w-full h-10 text-sm"
                                            >
                                                <Zap className="h-4 w-4 mr-2" />
                                                Dùng thử miễn phí 3 ngày
                                            </Button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="mb-8">
                                    <Button variant="outline" disabled className="w-full h-12">
                                        {currentPlan === "free" ? "Đang sử dụng" : "Gói cơ bản"}
                                    </Button>
                                </div>
                            )}

                            {/* Feature List */}
                            <div className="space-y-3">
                                {plan.features.map((feature) => (
                                    <div key={feature.label} className="flex items-center gap-3">
                                        <div
                                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${feature.included
                                                ? "bg-emerald-100 dark:bg-emerald-900/30"
                                                : "bg-muted"
                                                }`}
                                        >
                                            {feature.included ? (
                                                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                                <X className="h-3.5 w-3.5 text-muted-foreground" />
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm ${feature.included
                                                ? "text-foreground"
                                                : "text-muted-foreground line-through"
                                                }`}
                                        >
                                            {feature.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
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
                                        className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${openFaq === idx ? "rotate-180" : ""
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
