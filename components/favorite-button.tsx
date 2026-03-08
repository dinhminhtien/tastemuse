"use client"

import { useState, useEffect } from "react"
import { Heart, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface FavoriteButtonProps {
    targetType: "dish" | "restaurant"
    targetId: string
    variant?: "icon" | "button"
    size?: "sm" | "md" | "lg"
    className?: string
}

export function FavoriteButton({
    targetType,
    targetId,
    variant = "button",
    size = "md",
    className = "",
}: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(false)
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [animate, setAnimate] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    useEffect(() => {
        if (userId) {
            checkFavoriteStatus()
        }
    }, [userId, targetType, targetId])

    async function checkAuth() {
        const { data: { user } } = await supabase.auth.getUser()
        setUserId(user?.id || null)
    }

    async function checkFavoriteStatus() {
        if (!userId) return
        try {
            const res = await fetch(
                `/api/favorites?check_user_id=${userId}&target_type=${targetType}&target_id=${targetId}`
            )
            const data = await res.json()
            setIsFavorited(data.is_favorited || false)
        } catch (err) {
            console.error("Error checking favorite:", err)
        }
    }

    async function toggleFavorite() {
        if (loading) return

        if (!userId) {
            toast({
                title: "Đăng nhập để yêu thích",
                description: "Bạn cần đăng nhập để sử dụng tính năng này.",
            })
            router.push("/login")
            return
        }

        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()

            const res = await fetch("/api/favorites", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ target_type: targetType, target_id: targetId }),
            })

            const data = await res.json()

            if (res.status === 403 && data.code === "PREMIUM_REQUIRED") {
                toast({
                    title: "✨ Tính năng Premium",
                    description: "Nâng cấp Premium để lưu yêu thích. Chỉ từ 19.000đ/tháng!",
                    action: (
                        <Button
                            size="sm"
                            className="bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs"
                            onClick={() => router.push("/pricing")}
                        >
                            <Crown className="w-3 h-3 mr-1" />
                            Nâng cấp
                        </Button>
                    ),
                })
                return
            }

            if (res.ok) {
                setIsFavorited(data.is_favorited)

                // Trigger animation
                if (data.is_favorited) {
                    setAnimate(true)
                    setTimeout(() => setAnimate(false), 600)
                }
            }
        } catch (err) {
            console.error("Error toggling favorite:", err)
        } finally {
            setLoading(false)
        }
    }

    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    }

    if (variant === "icon") {
        return (
            <button
                onClick={toggleFavorite}
                disabled={loading}
                className={`
                    relative transition-all duration-200
                    cursor-pointer hover:scale-110
                    ${animate ? "scale-125" : ""}
                    ${className}
                `}
                title={isFavorited ? "Bỏ yêu thích" : "Thêm yêu thích"}
            >
                <Heart
                    className={`
                        ${sizeClasses[size]}
                        transition-all duration-200
                        ${isFavorited
                            ? "fill-red-500 text-red-500"
                            : "text-gray-400 hover:text-red-400"
                        }
                        ${animate ? "animate-ping" : ""}
                    `}
                />
                {/* Static heart underneath the animating one */}
                {animate && (
                    <Heart
                        className={`
                            ${sizeClasses[size]}
                            absolute inset-0
                            fill-red-500 text-red-500
                        `}
                    />
                )}
            </button>
        )
    }

    return (
        <Button
            variant="secondary"
            size="sm"
            onClick={toggleFavorite}
            disabled={loading}
            className={`
                transition-all duration-200
                ${isFavorited ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200" : ""}
                ${animate ? "scale-105" : ""}
                ${className}
            `}
        >
            <Heart
                className={`
                    w-4 h-4 mr-2
                    ${isFavorited ? "fill-red-500 text-red-500" : ""}
                `}
            />
            {isFavorited ? "Đã yêu thích" : "Yêu thích"}
        </Button>
    )
}

