import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, ChefHat } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Dish } from "@/types/database"
import { DishSearch } from "@/components/dish-search"

interface SearchParams {
  search?: string
  signature?: string
}

async function getDishes(searchParams: SearchParams): Promise<Dish[]> {
  try {
    let query = supabase
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
      .order('created_at', { ascending: false })

    // Apply search filter
    if (searchParams.search) {
      query = query.or(`name.ilike.%${searchParams.search}%,normalized_name.ilike.%${searchParams.search}%`)
    }

    // Apply signature filter
    if (searchParams.signature === 'true') {
      query = query.eq('is_signature', true)
    }

    query = query.limit(50)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching dishes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching dishes:', error)
    return []
  }
}

export default async function DishesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const dishes = await getDishes(params)

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
              Khám phá <span className="text-primary">món ăn</span> đặc sắc
            </h1>
            <p className="text-xl text-muted-foreground">
              Tìm kiếm món ăn yêu thích và khám phá hương vị mới tại Cần Thơ
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <DishSearch />
        </div>
      </section>

      {/* Dishes Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Results count */}
          {(params.search || params.signature) && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                Tìm thấy <span className="font-semibold text-foreground">{dishes.length}</span> món ăn
                {params.search && (
                  <span> cho từ khóa "<span className="font-semibold text-foreground">{params.search}</span>"</span>
                )}
                {params.signature === 'true' && (
                  <span> (chỉ món đặc sản)</span>
                )}
              </p>
            </div>
          )}

          {dishes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                {params.search || params.signature
                  ? 'Không tìm thấy món ăn phù hợp với tìm kiếm của bạn'
                  : 'Không tìm thấy món ăn nào'}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dishes.map((dish) => (
                <Link key={dish.id} href={`/dish/${dish.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group h-full flex flex-col">
                    <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="text-5xl font-bold text-primary/30">
                          {dish.name.charAt(0)}
                        </span>
                      </div>
                      {dish.is_signature && (
                        <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                          Đặc sản
                        </div>
                      )}
                      {dish.restaurants?.min_price && dish.restaurants?.max_price && (
                        <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm text-foreground px-3 py-1 rounded-lg text-sm font-semibold shadow-lg">
                          {dish.restaurants.min_price.toLocaleString('vi-VN')}đ - {dish.restaurants.max_price.toLocaleString('vi-VN')}đ
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                      <div>
                        <h3 className="text-xl font-bold text-card-foreground mb-1 group-hover:text-primary transition-colors">
                          {dish.name}
                        </h3>
                        {dish.restaurants && (
                          <>
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                              <ChefHat className="w-4 h-4" />
                              {dish.restaurants.name}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {dish.restaurants.ward}, {dish.restaurants.city}
                            </p>
                          </>
                        )}
                      </div>

                      {dish.restaurants?.tags && dish.restaurants.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {dish.restaurants.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <Button className="w-full mt-auto" variant="outline">
                        Xem chi tiết
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
