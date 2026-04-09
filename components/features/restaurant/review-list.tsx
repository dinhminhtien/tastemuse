"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smile, Meh, Frown, ChevronDown, User } from "lucide-react"
import type { Review } from "@/types/database"

interface ReviewListProps {
    targetType: "dish" | "restaurant"
    targetId: string
    refreshTrigger?: number  // Increment to trigger refresh
}

export function ReviewList({ targetType, targetId, refreshTrigger }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [offset, setOffset] = useState(0)
    const limit = 10

    useEffect(() => {
        fetchReviews(0)
    }, [targetType, targetId, refreshTrigger])

    async function fetchReviews(newOffset: number) {
        setLoading(true)
        try {
            const res = await fetch(
                `/api/reviews?target_type=${targetType}&target_id=${targetId}&limit=${limit}&offset=${newOffset}`
            )
            const data = await res.json()

            if (data.success) {
                if (newOffset === 0) {
                    setReviews(data.data || [])
                } else {
                    setReviews(prev => [...prev, ...(data.data || [])])
                }
                setTotal(data.count || 0)
                setOffset(newOffset)
            }
        } catch (err) {
            console.error("Error fetching reviews:", err)
        } finally {
            setLoading(false)
        }
    }

    function getSentimentIcon(sentiment?: string) {
        switch (sentiment) {
            case "positive": return <Smile className="w-4 h-4 text-green-500" />
            case "negative": return <Frown className="w-4 h-4 text-red-500" />
            default: return <Meh className="w-4 h-4 text-yellow-500" />
        }
    }

    function getSentimentBadge(sentiment?: string) {
        const cls = {
            positive: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            negative: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            neutral: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        }
        const label = {
            positive: "Tích cực",
            negative: "Tiêu cực",
            neutral: "Trung tính",
        }
        const key = (sentiment || "neutral") as keyof typeof cls

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls[key]}`}>
                {getSentimentIcon(sentiment)}
                {label[key]}
            </span>
        )
    }

    function formatDate(dateStr: string) {
        const date = new Date(dateStr)
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    if (loading && reviews.length === 0) {
        return (
            <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Đánh giá</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-muted rounded-full" />
                                <div className="w-32 h-4 bg-muted rounded" />
                            </div>
                            <div className="w-full h-4 bg-muted rounded mb-1" />
                            <div className="w-3/4 h-4 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">
                    Đánh giá {total > 0 && `(${total})`}
                </h3>
            </div>

            {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                    Chưa có đánh giá nào. Hãy là người đầu tiên! 🌟
                </p>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="p-4 bg-muted/30 rounded-lg border border-border/50 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {formatDate(review.created_at)}
                                    </span>
                                </div>
                                {review.sentiment && getSentimentBadge(review.sentiment)}
                            </div>
                            <p className="text-foreground leading-relaxed">{review.content}</p>
                        </div>
                    ))}

                    {reviews.length < total && (
                        <div className="text-center pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => fetchReviews(offset + limit)}
                                disabled={loading}
                            >
                                <ChevronDown className="w-4 h-4 mr-2" />
                                Xem thêm đánh giá
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
}
