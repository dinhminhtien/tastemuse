"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, MapPin, ChefHat, Crown, ArrowRight, Loader2 } from "lucide-react"
import { supabase } from "@/lib/db/supabase"

interface RecommendedItem {
    document_id: string
    source_type: "restaurant" | "dish"
    source_id: string
    title: string
    similarity: number
    content?: string
}

interface EnrichedItem extends RecommendedItem {
    slug?: string
    image_url?: string
    ward?: string
    city?: string
    restaurant_name?: string
    tags?: string[]
    min_price?: number
    max_price?: number
}

export function PersonalizedRecommendations() {
    const [items, setItems] = useState<EnrichedItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isPremium, setIsPremium] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        loadRecommendations()
    }, [])

    async function loadRecommendations() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setLoading(false)
                return
            }

            setIsLoggedIn(true)

            // Check subscription
            const subRes = await fetch("/api/subscription", {
                headers: { Authorization: `Bearer ${session.access_token}` },
            })

            if (!subRes.ok) {
                setLoading(false)
                return
            }

            const subData = await subRes.json()
            setIsPremium(subData.isPremium || false)

            if (!subData.isPremium) {
                setLoading(false)
                return
            }

            // Fetch personalized recommendations
            const res = await fetch("/api/recommendations", {
                headers: { Authorization: `Bearer ${session.access_token}` },
            })

            if (!res.ok) {
                setLoading(false)
                return
            }

            const data = await res.json()

            if (data.success && data.data?.length > 0) {
                // Enrich with images and details
                const enriched = await enrichItems(data.data.slice(0, 4))
                setItems(enriched)
            }
        } catch (error) {
            console.error("Error loading recommendations:", error)
        } finally {
            setLoading(false)
        }
    }

    async function enrichItems(rawItems: RecommendedItem[]): Promise<EnrichedItem[]> {
        return Promise.all(
            rawItems.map(async (item) => {
                try {
                    if (item.source_type === "dish") {
                        const { data } = await supabase
                            .from("dishes")
                            .select(`
                                name,
                                restaurants(name, slug, ward, city, min_price, max_price),
                                dish_media(media_url, is_primary, sort_order)
                            `)
                            .eq("id", item.source_id)
                            .single()

                        const media = data?.dish_media?.sort((a: any, b: any) => a.sort_order - b.sort_order)

                        return {
                            ...item,
                            slug: (data?.restaurants as any)?.slug,
                            restaurant_name: (data?.restaurants as any)?.name,
                            ward: (data?.restaurants as any)?.ward,
                            city: (data?.restaurants as any)?.city,
                            min_price: (data?.restaurants as any)?.min_price,
                            max_price: (data?.restaurants as any)?.max_price,
                            image_url:
                                media?.find((m: any) => m.is_primary)?.media_url ||
                                media?.[0]?.media_url ||
                                null,
                        }
                    } else {
                        const { data } = await supabase
                            .from("restaurants")
                            .select(`
                                name, slug, ward, city, tags, min_price, max_price,
                                restaurant_media(media_url, is_cover, display_order)
                            `)
                            .eq("id", item.source_id)
                            .single()

                        const media = data?.restaurant_media?.sort((a: any, b: any) => a.display_order - b.display_order)

                        return {
                            ...item,
                            slug: data?.slug,
                            ward: data?.ward,
                            city: data?.city,
                            tags: data?.tags || [],
                            min_price: data?.min_price,
                            max_price: data?.max_price,
                            image_url:
                                media?.find((m: any) => m.is_cover)?.media_url ||
                                media?.[0]?.media_url ||
                                null,
                        }
                    }
                } catch {
                    return item
                }
            })
        )
    }

    // Don't render section if not logged in
    if (!isLoggedIn) return null

    // Show upgrade CTA for free users
    if (isLoggedIn && !isPremium && !loading) {
        return (
            <section className="py-16 md:py-20 relative overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-10 left-20 w-48 h-48 bg-amber-500/5 rounded-full glow-blob float-particle" />
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-orange-500/5 rounded-full glow-blob float-particle-slow" />
                </div>
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Sparkles className="w-3.5 h-3.5" />
                            GỢI Ý CÁ NHÂN HÓA
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold">
                            Khám phá món ăn{" "}
                            <span className="bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                dành riêng cho bạn
                            </span>
                        </h2>
                        <p className="text-muted-foreground">
                            Nâng cấp Premium để nhận gợi ý cá nhân hóa dựa trên sở thích ẩm thực của bạn
                        </p>
                        <Link href="/pricing">
                            <Button className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25">
                                <Crown className="w-4 h-4 mr-2" />
                                Xem gói Premium
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        )
    }

    // Loading state
    if (loading) {
        return (
            <section className="py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                </div>
            </section>
        )
    }

    // No recommendations yet (premium user but no taste profile built)
    if (items.length === 0) return null

    return (
        <section className="py-16 md:py-20 relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-10 left-20 w-48 h-48 bg-amber-500/5 rounded-full glow-blob float-particle" />
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-orange-500/5 rounded-full glow-blob float-particle-slow" />
            </div>

            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                            </div>
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                                Dành riêng cho bạn
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-full">
                                PREMIUM
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3">
                            Gợi ý{" "}
                            <span className="bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                cá nhân hóa
                            </span>
                        </h2>
                        <p className="text-base md:text-lg text-muted-foreground max-w-lg">
                            Món ăn & nhà hàng phù hợp với khẩu vị của bạn, AI học từ lịch sử tương tác của bạn
                        </p>
                    </div>
                    <Link href="/dishes">
                        <button className="inline-flex items-center gap-2 px-6 py-3 text-amber-600 dark:text-amber-400 hover:text-amber-700 font-bold border-2 border-amber-500 rounded-full hover:bg-amber-500/5 transition-all hover:-translate-y-0.5 active:scale-95">
                            Khám phá thêm
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                    {items.map((item) => (
                        <Link
                            key={item.document_id}
                            href={
                                item.source_type === "dish"
                                    ? `/dish/${item.source_id}`
                                    : `/restaurant/${item.slug || item.source_id}`
                            }
                        >
                            <Card className="overflow-hidden card-interactive card-glow cursor-pointer group border-0 shadow-md h-full">
                                <div className="aspect-4/3 bg-muted relative overflow-hidden">
                                    {item.image_url ? (
                                        <Image
                                            src={item.image_url}
                                            alt={item.title}
                                            width={400}
                                            height={300}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                                            <span className="text-6xl font-bold text-amber-500/30">
                                                {item.title.charAt(0)}
                                            </span>
                                        </div>
                                    )}

                                    {/* AI match badge */}
                                    <div className="absolute top-3 left-3 px-3 py-1 bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        {Math.round(item.similarity * 100)}% phù hợp
                                    </div>

                                    {/* Price badge */}
                                    {item.min_price && item.max_price && (
                                        <div className="absolute top-3 right-3 px-3 py-1 bg-background/95 backdrop-blur-sm text-foreground text-xs font-bold rounded-xl shadow-lg">
                                            {item.min_price.toLocaleString("vi-VN")}đ
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                <div className="p-4 md:p-5 space-y-2 bg-card">
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold text-card-foreground mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        {item.restaurant_name && (
                                            <p className="text-sm text-muted-foreground line-clamp-1 flex items-center gap-1.5">
                                                <ChefHat className="w-3.5 h-3.5 text-amber-500/60" />
                                                {item.restaurant_name}
                                            </p>
                                        )}
                                    </div>

                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {item.tags.slice(0, 2).map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {item.ward && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                                            <MapPin className="w-3 h-3 text-amber-500/60" />
                                            <span className="line-clamp-1">
                                                {item.ward}
                                                {item.city ? `, ${item.city}` : ""}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
