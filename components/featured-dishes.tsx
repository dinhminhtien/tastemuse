import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { MapPin, Clock, TrendingUp, ChefHat, Flame, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Dish } from "@/types/database"

async function getFeaturedDishes(): Promise<Dish[]> {
  try {
    // Fetch signature dishes (featured dishes)
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
          min_price,
          max_price
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
      .eq('is_signature', true)
      .order('created_at', { ascending: false })
      .limit(4)

    if (error) {
      console.error('Error fetching featured dishes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching featured dishes:', error)
    return []
  }
}

export async function FeaturedDishes() {
  const dishes = await getFeaturedDishes()

  // If no featured dishes, return empty section
  if (dishes.length === 0) {
    return null
  }

  return (
    <section className="py-20 md:py-28 section-alt relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-10 w-48 h-48 bg-primary/5 rounded-full glow-blob float-particle-slow" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-secondary/5 rounded-full glow-blob float-particle" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Đề xuất hôm nay</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3">
              Món ăn <span className="gradient-text">nổi bật</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-lg">
              Những món ăn được yêu thích nhất tại Cần Thơ
            </p>
          </div>
          <Link href="/dishes">
            <button className="inline-flex items-center gap-2 px-6 py-3 text-primary hover:text-primary/80 font-bold border-2 border-primary rounded-full hover:bg-primary/5 transition-all hover:-translate-y-0.5 active:scale-95">
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {dishes.map((dish) => (
            <Link key={dish.id} href={`/dish/${dish.id}`}>
              <Card className="overflow-hidden card-interactive card-glow cursor-pointer group border-0 shadow-md h-full">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {dish.dish_media && dish.dish_media.length > 0 ? (
                    <Image
                      src={dish.dish_media.sort((a, b) => a.sort_order - b.sort_order)[0].media_url}
                      alt={dish.dish_media[0].alt_text || dish.name}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                      <span className="text-6xl font-bold text-primary/30">
                        {dish.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Badge */}
                  {dish.is_signature && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Nổi bật
                    </div>
                  )}
                  {/* Price Badge */}
                  {dish.restaurants?.min_price && dish.restaurants?.max_price && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-background/95 backdrop-blur-sm text-foreground text-xs font-bold rounded-xl shadow-lg">
                      {dish.restaurants.min_price.toLocaleString('vi-VN')}đ
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4 md:p-5 space-y-2 bg-card">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-card-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                      {dish.name}
                    </h3>
                    {dish.restaurants && (
                      <p className="text-sm text-muted-foreground line-clamp-1 flex items-center gap-1.5">
                        <ChefHat className="w-3.5 h-3.5 text-primary/60" />
                        {dish.restaurants.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                    {dish.restaurants?.tags && dish.restaurants.tags.length > 0 && (
                      <span className="text-xs text-primary bg-primary/8 px-2 py-0.5 rounded-full font-medium">
                        {dish.restaurants.tags[0]}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    {dish.restaurants && (
                      <>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary/60" />
                          <span className="line-clamp-1">{dish.restaurants.ward}</span>
                        </div>
                        {dish.restaurants.open_time && dish.restaurants.close_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary/60" />
                            <span>{dish.restaurants.open_time.slice(0, 5)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
