"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface RatingStarsProps {
    targetType: "dish" | "restaurant"
    targetId: string
    size?: "sm" | "md" | "lg"
    showCount?: boolean
    interactive?: boolean
    onRate?: (score: number) => void
}

export function RatingStars({
    targetType,
    targetId,
    size = "md",
    showCount = true,
    interactive = true,
    onRate,
}: RatingStarsProps) {
    const [avgRating, setAvgRating] = useState(0)
    const [ratingCount, setRatingCount] = useState(0)
    const [userRating, setUserRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-7 h-7",
    }

    useEffect(() => {
        fetchRatings()
        fetchUser()
    }, [targetType, targetId])

    async function fetchUser() {
        const { data: { user } } = await supabase.auth.getUser()
        setUserId(user?.id || null)
        if (user) {
            fetchUserRating(user.id)
        }
    }

    async function fetchRatings() {
        try {
            const res = await fetch(`/api/ratings?target_type=${targetType}&target_id=${targetId}`)
            const data = await res.json()
            if (data.stats) {
                setAvgRating(parseFloat(data.stats.avg_rating) || 0)
                setRatingCount(parseInt(data.stats.rating_count) || 0)
            }
        } catch (err) {
            console.error("Error fetching ratings:", err)
        }
    }

    async function fetchUserRating(uid: string) {
        try {
            const res = await fetch(`/api/ratings?target_type=${targetType}&target_id=${targetId}&user_id=${uid}`)
            const data = await res.json()
            if (data.data && data.data.length > 0) {
                setUserRating(data.data[0].score)
            }
        } catch (err) {
            console.error("Error fetching user rating:", err)
        }
    }

    async function handleRate(score: number) {
        if (!userId || loading) return

        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()

            const res = await fetch("/api/ratings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    target_type: targetType,
                    target_id: targetId,
                    score,
                }),
            })

            if (res.ok) {
                setUserRating(score)
                fetchRatings() // Refresh aggregate
                onRate?.(score)
            }
        } catch (err) {
            console.error("Error submitting rating:", err)
        } finally {
            setLoading(false)
        }
    }

    const displayRating = hoverRating || userRating || avgRating
    const starCount = 5

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {Array.from({ length: starCount }).map((_, i) => {
                    const starValue = i + 1
                    const filled = starValue <= Math.round(displayRating)
                    const halfFilled = !filled && starValue - 0.5 <= displayRating

                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={!interactive || !userId || loading}
                            className={`
                                transition-all duration-150
                                ${interactive && userId ? "cursor-pointer hover:scale-110" : "cursor-default"}
                                ${loading ? "opacity-50" : ""}
                            `}
                            onMouseEnter={() => interactive && userId && setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => handleRate(starValue)}
                            title={interactive && userId ? `Đánh giá ${starValue} sao` : undefined}
                        >
                            <Star
                                className={`
                                    ${sizeClasses[size]}
                                    transition-colors duration-150
                                    ${filled || (hoverRating && starValue <= hoverRating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : halfFilled
                                            ? "fill-yellow-400/50 text-yellow-400"
                                            : "text-gray-300"
                                    }
                                `}
                            />
                        </button>
                    )
                })}
            </div>

            {showCount && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                        {avgRating > 0 ? avgRating.toFixed(1) : "–"}
                    </span>
                    {ratingCount > 0 && (
                        <span>({ratingCount} đánh giá)</span>
                    )}
                </div>
            )}

            {userRating > 0 && (
                <span className="text-xs text-primary font-medium ml-1">
                    Bạn: {userRating}★
                </span>
            )}
        </div>
    )
}
