"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Crown, Zap, Heart, Filter, Calendar, MessageSquare, Star, Check, X } from "lucide-react"

interface UpgradeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    usageInfo?: { used: number; limit: number }
    onUpgrade: () => void
    onStartTrial: () => void
    isLoading?: boolean
}

const FREE_FEATURES = [
    { icon: MessageSquare, label: "AI Chatbot (10 câu/ngày)", included: true },
    { icon: Zap, label: "Tìm kiếm cơ bản", included: true },
    { icon: Star, label: "Xem đánh giá", included: true },
    { icon: Zap, label: "Gợi ý cơ bản", included: true },
    { icon: Heart, label: "Lưu yêu thích", included: false },
    { icon: Filter, label: "Bộ lọc nâng cao", included: false },
    { icon: Calendar, label: "Lập kế hoạch bữa ăn", included: false },
    { icon: Crown, label: "AI không giới hạn", included: false },
]

const PREMIUM_FEATURES = [
    { icon: MessageSquare, label: "AI Chatbot không giới hạn", included: true },
    { icon: Zap, label: "Gợi ý AI cá nhân hóa", included: true },
    { icon: Star, label: "Tóm tắt đánh giá bằng AI", included: true },
    { icon: Heart, label: "Lưu yêu thích", included: true },
    { icon: Filter, label: "Bộ lọc nâng cao (giá, calo, phổ biến)", included: true },
    { icon: Calendar, label: "Lập kế hoạch bữa ăn", included: true },
    { icon: Crown, label: "Không giới hạn sử dụng", included: true },
]

export function UpgradeModal({
    open,
    onOpenChange,
    usageInfo,
    onUpgrade,
    onStartTrial,
    isLoading,
}: UpgradeModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border-0">
                {/* Premium Gradient Header */}
                <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-6 pt-6 pb-8 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
                    <DialogHeader className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Crown className="h-6 w-6" />
                            <DialogTitle className="text-xl font-bold text-white">
                                Nâng cấp Premium
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-white/90 text-sm">
                            {usageInfo
                                ? `Bạn đã dùng ${usageInfo.used}/${usageInfo.limit} lượt hỏi AI hôm nay. Nâng cấp để không giới hạn!`
                                : "Mở khóa toàn bộ tính năng AI mạnh mẽ của TasteMuse"
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {/* Price badge */}
                    <div className="mt-4 inline-flex items-baseline gap-1 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <span className="text-2xl font-bold">2.000đ</span>
                        <span className="text-sm text-white/80">/ tháng</span>
                    </div>
                </div>

                {/* Features */}
                <div className="px-6 py-5 space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Premium bao gồm
                    </h4>
                    <div className="space-y-2.5">
                        {PREMIUM_FEATURES.map((feature) => (
                            <div key={feature.label} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="text-sm text-foreground">{feature.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-2.5 pt-2">
                        <Button
                            onClick={onUpgrade}
                            disabled={isLoading}
                            className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all"
                        >
                            <Crown className="h-4 w-4 mr-2" />
                            {isLoading ? "Đang xử lý..." : "Nâng cấp ngay — 2.000đ/tháng"}
                        </Button>
                        <Button
                            onClick={onStartTrial}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full h-10 text-sm"
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            Dùng thử miễn phí 3 ngày
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
