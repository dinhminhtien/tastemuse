import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Star, MapPin, Clock, TrendingUp, ChefHat } from "lucide-react"
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
    <section className="py-20 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wide">Đề xuất hôm nay</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              Món ăn <span className="text-primary">nổi bật</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Những món ăn được yêu thích nhất tại Cần Thơ
            </p>
          </div>
          <Link href="/dishes">
            <button className="mt-4 md:mt-0 px-6 py-3 text-primary hover:text-primary/80 font-semibold border-2 border-primary rounded-full hover:bg-primary/5 transition-colors">
              Xem tất cả →
            </button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {dishes.map((dish) => (
            <Link key={dish.id} href={`/dish/${dish.id}`}>
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-2 hover:border-primary/50">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-115">
                    <span className="text-6xl font-bold text-primary/30">
                      {dish.name.charAt(0)}
                    </span>
                  </div>
                  {/* Badge */}
                  {dish.is_signature && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg">
                      Nổi bật
                    </div>
                  )}
                  {/* Price Badge */}
                  {dish.restaurants?.min_price && dish.restaurants?.max_price && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-background/95 backdrop-blur-sm text-foreground text-sm font-bold rounded-lg shadow-lg">
                      {dish.restaurants.min_price.toLocaleString('vi-VN')}đ
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4 md:p-5 space-y-2 bg-card">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-card-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                      {dish.name}
                    </h3>
                    {dish.restaurants && (
                      <p className="text-sm text-muted-foreground line-clamp-1 flex items-center gap-1">
                        <ChefHat className="w-3 h-3" />
                        {dish.restaurants.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-border">
                    {dish.restaurants?.tags && dish.restaurants.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{dish.restaurants.tags[0]}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    {dish.restaurants && (
                      <>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">{dish.restaurants.ward}</span>
                        </div>
                        {dish.restaurants.open_time && dish.restaurants.close_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
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
