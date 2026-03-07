import Link from "next/link"
import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Phone, Clock, ArrowLeft, Share2, Utensils, Map } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Restaurant, Dish } from "@/types/database"
import { RatingStars } from "@/components/rating-stars"
import { FavoriteButton } from "@/components/favorite-button"
import { ReviewForm } from "@/components/review-form"
import { ReviewList } from "@/components/review-list"

interface RestaurantWithDishes extends Restaurant {
    dishes?: Dish[]
}

async function getRestaurantBySlug(slug: string): Promise<RestaurantWithDishes | null> {
    try {
        const { data, error } = await supabase
            .from('restaurants')
            .select(`
        *,
        restaurant_media (
          id,
          media_type,
          media_url,
          thumbnail_url,
          is_cover,
          display_order
        ),
        dishes (
          id,
          name,
          normalized_name,
          is_signature
        )
      `)
            .eq('slug', slug)
            .eq('is_active', true)
            .single()

        if (error) {
            console.error('Error fetching restaurant:', error)
            return null
        }

        return data
    } catch (error) {
        console.error('Error fetching restaurant:', error)
        return null
    }
}

export default async function RestaurantDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const restaurant = await getRestaurantBySlug(slug)

    if (!restaurant) {
        notFound()
    }

    return (
        <main className="min-h-screen pt-28 md:pt-32">
            {/* Header with Back Button */}
            <section className="bg-background border-b border-border py-6">
                <div className="container mx-auto px-4">
                    <Link href="/restaurants" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại danh sách nhà hàng
                    </Link>
                </div>
            </section>

            {/* Hero Image */}
            <section className="relative h-[400px] md:h-[500px] overflow-hidden">
                {restaurant.restaurant_media && restaurant.restaurant_media.length > 0 ? (
                    <>
                        <img
                            src={
                                restaurant.restaurant_media.find(m => m.is_cover)?.media_url ||
                                restaurant.restaurant_media.sort((a, b) => a.display_order - b.display_order)[0]?.media_url
                            }
                            alt={restaurant.name}
                            className="w-full h-full object-cover"
                        />
                    </>
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                        <span className="text-9xl font-bold text-primary/40">
                            {restaurant.name.charAt(0)}
                        </span>
                    </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-4 mb-4">
                            <Button variant="secondary" size="sm">
                                <Share2 className="w-4 h-4 mr-2" />
                                Chia sẻ
                            </Button>
                            <FavoriteButton targetType="restaurant" targetId={restaurant.id} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{restaurant.name}</h1>
                        <div className="flex items-center gap-4 text-foreground flex-wrap">
                            {restaurant.tags && restaurant.tags.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Utensils className="w-5 h-5" />
                                    <span className="text-lg">{restaurant.tags.join(', ')}</span>
                                </div>
                            )}
                            <RatingStars targetType="restaurant" targetId={restaurant.id} size="lg" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Description */}
                            <Card className="p-6">
                                <h2 className="text-2xl font-bold mb-4">Về nhà hàng</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {restaurant.description || `${restaurant.name} là một nhà hàng chất lượng tại ${restaurant.ward}, ${restaurant.city}. Chúng tôi phục vụ các món ăn ngon với nguyên liệu tươi sạch và chất lượng tốt nhất.`}
                                </p>
                            </Card>

                            {/* Menu/Dishes */}
                            {restaurant.dishes && restaurant.dishes.length > 0 && (
                                <Card className="p-6">
                                    <h2 className="text-2xl font-bold mb-4">Thực đơn</h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {restaurant.dishes.map((dish) => (
                                            <Link key={dish.id} href={`/dish/${dish.id}`}>
                                                <div className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                                                                {dish.name}
                                                            </h3>
                                                            {dish.is_signature && (
                                                                <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                                                    Đặc sản
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {restaurant.min_price && restaurant.max_price && (
                                                        <p className="text-sm text-primary font-semibold mt-2">
                                                            {restaurant.min_price.toLocaleString('vi-VN')}đ - {restaurant.max_price.toLocaleString('vi-VN')}đ
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Tags */}
                            {restaurant.tags && restaurant.tags.length > 0 && (
                                <Card className="p-6">
                                    <h2 className="text-2xl font-bold mb-4">Đặc điểm</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {restaurant.tags.map((tag, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Reviews Section */}
                            <ReviewForm targetType="restaurant" targetId={restaurant.id} />
                            <ReviewList targetType="restaurant" targetId={restaurant.id} />
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Contact Info */}
                            <Card className="p-6">
                                <h3 className="text-xl font-bold mb-4">Thông tin liên hệ</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Địa chỉ</p>
                                            <p className="font-semibold">{restaurant.address}</p>
                                            <p className="text-sm text-muted-foreground">{restaurant.ward}, {restaurant.city}</p>
                                        </div>
                                    </div>
                                    {restaurant.phone && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <Phone className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Điện thoại</p>
                                                <p className="font-semibold">{restaurant.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    {restaurant.open_time && restaurant.close_time && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Giờ mở cửa</p>
                                                <p className="font-semibold">{restaurant.open_time} - {restaurant.close_time}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Price Range */}
                            {restaurant.min_price && restaurant.max_price && (
                                <Card className="p-6">
                                    <h3 className="text-xl font-bold mb-4">Mức giá</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Giá thấp nhất</span>
                                            <span className="font-semibold">{restaurant.min_price.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Giá cao nhất</span>
                                            <span className="font-semibold">{restaurant.max_price.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Map Button */}
                            {restaurant.lat && restaurant.lng ? (
                                <a
                                    href={`https://www.google.com/maps?q=${restaurant.lat},${restaurant.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="w-full" variant="outline">
                                        <Map className="w-4 h-4 mr-2" />
                                        Xem bản đồ
                                    </Button>
                                </a>
                            ) : (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.address + ' ' + restaurant.city)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="w-full" variant="outline">
                                        <Map className="w-4 h-4 mr-2" />
                                        Xem bản đồ
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            {/* SEO JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Restaurant",
                        "name": restaurant.name,
                        "image": restaurant.restaurant_media?.[0]?.media_url || "",
                        "description": restaurant.description,
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": restaurant.address,
                            "addressLocality": restaurant.ward,
                            "addressRegion": restaurant.city,
                            "addressCountry": "VN"
                        },
                        "telephone": restaurant.phone || "",
                        "priceRange": restaurant.min_price && restaurant.max_price ? `${restaurant.min_price}VND - ${restaurant.max_price}VND` : "$$",
                        "servesCuisine": restaurant.tags?.join(", ") || "Vietnamese",
                        "openingHoursSpecification": restaurant.open_time && restaurant.close_time ? {
                            "@type": "OpeningHoursSpecification",
                            "opens": restaurant.open_time,
                            "closes": restaurant.close_time,
                            "dayOfWeek": [
                                "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                            ]
                        } : undefined
                    })
                }}
            />
        </main>
    )
}
