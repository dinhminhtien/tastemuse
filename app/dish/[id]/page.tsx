import Link from "next/link"
import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, ChefHat, Clock, DollarSign, ArrowLeft, Share2, Heart } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Dish } from "@/types/database"

async function getDish(id: string): Promise<Dish | null> {
    try {
        const { data, error } = await supabase
            .from('dishes')
            .select(`
        *,
        restaurants (
          id,
          name,
          slug,
          address,
          city,
          ward,
          phone,
          tags,
          description,
          min_price,
          max_price,
          open_time,
          close_time
        ),
        dish_media (
          id,
          media_url,
          media_type,
          is_primary,
          sort_order,
          alt_text
        )
      `)
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching dish:', error)
            return null
        }

        return data
    } catch (error) {
        console.error('Error fetching dish:', error)
        return null
    }
}

export default async function DishDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const dish = await getDish(id)

    if (!dish) {
        notFound()
    }

    return (
        <main className="min-h-screen">
            {/* Header with Back Button */}
            <section className="bg-background border-b border-border py-6">
                <div className="container mx-auto px-4">
                    <Link href="/dishes" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại danh sách món ăn
                    </Link>
                </div>
            </section>

            {/* Hero Image */}
            <section className="relative h-[400px] md:h-[500px] overflow-hidden">
                {dish.dish_media && dish.dish_media.length > 0 ? (
                    <>
                        <img
                            src={dish.dish_media.sort((a, b) => a.sort_order - b.sort_order)[0].media_url}
                            alt={dish.dish_media[0].alt_text || dish.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    </>
                ) : (
                    <>
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                            <span className="text-9xl font-bold text-primary/40">
                                {dish.name.charAt(0)}
                            </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    </>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center gap-4 mb-4">
                            <Button variant="secondary" size="sm">
                                <Share2 className="w-4 h-4 mr-2" />
                                Chia sẻ
                            </Button>
                            <Button variant="secondary" size="sm">
                                <Heart className="w-4 h-4 mr-2" />
                                Yêu thích
                            </Button>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{dish.name}</h1>
                        <div className="flex items-center gap-4 text-foreground">
                            {dish.is_signature && (
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 fill-primary text-primary" />
                                    <span className="font-semibold text-lg">Món đặc sản</span>
                                </div>
                            )}
                            {dish.restaurants?.min_price && dish.restaurants?.max_price && (
                                <span className="text-2xl font-bold text-primary">
                                    {dish.restaurants.min_price.toLocaleString('vi-VN')}đ - {dish.restaurants.max_price.toLocaleString('vi-VN')}đ
                                </span>
                            )}
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
                                <h2 className="text-2xl font-bold mb-4">Mô tả món ăn</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {dish.restaurants?.description || `${dish.name} là một món ăn đặc sắc tại ${dish.restaurants?.name || 'nhà hàng'}. Món ăn được chế biến công phu với nguyên liệu tươi ngon, đảm bảo hương vị đậm đà và chất lượng tốt nhất.`}
                                </p>
                            </Card>

                            {/* Tags */}
                            {dish.restaurants?.tags && dish.restaurants.tags.length > 0 && (
                                <Card className="p-6">
                                    <h2 className="text-2xl font-bold mb-4">Thẻ phân loại</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {dish.restaurants.tags.map((tag, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Image Gallery */}
                            {dish.dish_media && dish.dish_media.length > 1 && (
                                <Card className="p-6">
                                    <h2 className="text-2xl font-bold mb-4">Hình ảnh món ăn</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {dish.dish_media
                                            .sort((a, b) => a.sort_order - b.sort_order)
                                            .map((media) => (
                                                <div key={media.id} className="relative aspect-square overflow-hidden rounded-lg group">
                                                    <img
                                                        src={media.media_url}
                                                        alt={media.alt_text || dish.name}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    />
                                                </div>
                                            ))}
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Restaurant Info */}
                            {dish.restaurants && (
                                <Card className="p-6">
                                    <h3 className="text-xl font-bold mb-4">Nhà hàng</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <ChefHat className="w-5 h-5 text-primary" />
                                                <h4 className="font-semibold">{dish.restaurants.name}</h4>
                                            </div>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {dish.restaurants.ward}, {dish.restaurants.city}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">{dish.restaurants.address}</p>
                                        </div>
                                        <Link href={`/restaurant/${dish.restaurants.slug}`}>
                                            <Button className="w-full">Xem nhà hàng</Button>
                                        </Link>
                                    </div>
                                </Card>
                            )}

                            {/* Info Cards */}
                            <Card className="p-6">
                                <h3 className="text-xl font-bold mb-4">Thông tin</h3>
                                <div className="space-y-4">
                                    {dish.restaurants?.open_time && dish.restaurants?.close_time && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Giờ mở cửa</p>
                                                <p className="font-semibold">{dish.restaurants.open_time} - {dish.restaurants.close_time}</p>
                                            </div>
                                        </div>
                                    )}
                                    {dish.restaurants?.min_price && dish.restaurants?.max_price && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <DollarSign className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Giá</p>
                                                <p className="font-semibold">
                                                    {dish.restaurants.min_price.toLocaleString('vi-VN')}đ - {dish.restaurants.max_price.toLocaleString('vi-VN')}đ
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {dish.is_signature && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <Star className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Loại món</p>
                                                <p className="font-semibold">Món đặc sản</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
