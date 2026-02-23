"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Send, Smile, Meh, Frown, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Review } from "@/types/database"

interface ReviewFormProps {
    targetType: "dish" | "restaurant"
    targetId: string
    onReviewSubmitted?: (review: Review) => void
}

export function ReviewForm({ targetType, targetId, onReviewSubmitted }: ReviewFormProps) {
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [sentiment, setSentiment] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        if (content.length < 10) {
            setError("Đánh giá phải có ít nhất 10 ký tự")
            return
        }

        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                setError("Vui lòng đăng nhập để gửi đánh giá")
                return
            }

            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    target_type: targetType,
                    target_id: targetId,
                    content,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Có lỗi xảy ra")
                return
            }

            setSuccess(true)
            setSentiment(data.data?.sentiment_analysis?.sentiment || null)
            setContent("")
            onReviewSubmitted?.(data.data)

            // Reset success after 3 seconds
            setTimeout(() => {
                setSuccess(false)
                setSentiment(null)
            }, 3000)
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra")
        } finally {
            setLoading(false)
        }
    }

    const SentimentIcon = sentiment === "positive" ? Smile
        : sentiment === "negative" ? Frown
            : Meh

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Viết đánh giá</h3>

            {success ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <SentimentIcon className={`w-6 h-6 ${sentiment === "positive" ? "text-green-500" :
                                sentiment === "negative" ? "text-red-500" :
                                    "text-yellow-500"
                            }`} />
                        <div>
                            <p className="font-semibold text-green-700 dark:text-green-300">
                                Đánh giá đã được gửi! 🎉
                            </p>
                            {sentiment && (
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    AI nhận diện: {
                                        sentiment === "positive" ? "Tích cực 😊" :
                                            sentiment === "negative" ? "Tiêu cực 😞" :
                                                "Trung tính 🤔"
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn về món ăn này..."
                            className="w-full min-h-[120px] p-4 bg-muted/50 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            disabled={loading}
                        />
                        <span className={`absolute bottom-2 right-3 text-xs ${content.length < 10 ? "text-muted-foreground" : "text-green-500"
                            }`}>
                            {content.length}/10+
                        </span>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            💡 AI sẽ tự động phân tích cảm xúc đánh giá của bạn
                        </p>
                        <Button type="submit" disabled={loading || content.length < 10}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Gửi đánh giá
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            )}
        </Card>
    )
}
