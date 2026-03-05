import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, ChefHat, Flame } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Dish } from "@/types/database"
import type { Metadata } from "next"
import { DishSearch } from "@/components/dish-search"
import { Pagination } from "@/components/pagination"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Món ăn tại Cần Thơ",
  description: "Khám phá các món ăn ngon nhất tại Cần Thơ. Tìm kiếm, đánh giá và khám phá ẩm thực địa phương.",
}

const PAGE_SIZE = 12

interface SearchParams {
  search?: string
  signature?: string
  page?: string
}

async function getDishes(searchParams: SearchParams) {
  try {
    const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1)
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

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
        ),
        dish_media (
          id,
          media_url,
          media_type,
          is_primary,
          sort_order,
          alt_text
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply search filter
    if (searchParams.search) {
      query = query.or(`name.ilike.%${searchParams.search}%,normalized_name.ilike.%${searchParams.search}%`)
    }

    // Apply signature filter
    if (searchParams.signature === 'true') {
      query = query.eq('is_signature', true)
    }

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching dishes:', error)
      return { dishes: [], totalCount: 0, currentPage: page }
    }

    return {
      dishes: (data || []) as Dish[],
      totalCount: count || 0,
      currentPage: page,
    }
  } catch (error) {
    console.error('Error fetching dishes:', error)
    return { dishes: [], totalCount: 0, currentPage: 1 }
  }
}

export default async function DishesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { dishes, totalCount, currentPage } = await getDishes(params)
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <main className="min-h-screen pt-28 md:pt-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-20 w-48 h-48 bg-secondary/6 rounded-full glow-blob float-particle" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary/6 rounded-full glow-blob float-particle-slow" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-xs font-semibold text-primary border border-primary/20">
              <Flame className="w-3.5 h-3.5" />
              MÓN ĂN ĐẶC SẮC
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-balance leading-tight">
              Khám phá <span className="gradient-text">món ăn</span> đặc sắc
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tìm kiếm món ăn yêu thích và khám phá hương vị mới tại Cần Thơ
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-6 bg-background/80 backdrop-blur-sm border-y border-border/40 sticky top-18 z-30">
        <div className="container mx-auto px-4">
          <DishSearch />
        </div>
      </section>

      {/* Dishes Grid */}
      <section className="py-12 section-alt">
        <div className="container mx-auto px-4">
          {/* Results count */}
          <div className="mb-8">
            <p className="text-muted-foreground">
              {(params.search || params.signature) ? (
                <>
                  Tìm thấy <span className="font-bold text-foreground">{totalCount}</span> món ăn
                  {params.search && (
                    <span> cho từ khóa &ldquo;<span className="font-bold text-foreground">{params.search}</span>&rdquo;</span>
                  )}
                  {params.signature === 'true' && (
                    <span> (chỉ món đặc sản)</span>
                  )}
                </>
              ) : (
                <>
                  Hiển thị <span className="font-bold text-foreground">{dishes.length}</span> / <span className="font-bold text-foreground">{totalCount}</span> món ăn
                </>
              )}
              {totalPages > 1 && (
                <span className="ml-2 text-sm opacity-70">
                  — Trang {currentPage}/{totalPages}
                </span>
              )}
            </p>
          </div>

          {dishes.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-xl text-muted-foreground">
                {params.search || params.signature
                  ? 'Không tìm thấy món ăn phù hợp với tìm kiếm của bạn'
                  : 'Không tìm thấy món ăn nào'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {dishes.map((dish) => (
                  <Link key={dish.id} href={`/dish/${dish.id}`}>
                    <Card className="overflow-hidden card-interactive card-glow cursor-pointer group h-full flex flex-col border-0 shadow-md">
                      <div className="aspect-4/3 bg-muted relative overflow-hidden">
                        {dish.dish_media && dish.dish_media.length > 0 ? (
                          <Image
                            src={dish.dish_media.sort((a, b) => a.sort_order - b.sort_order)[0].media_url}
                            alt={dish.dish_media[0].alt_text || dish.name}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <span className="text-5xl font-bold text-primary/30">
                              {dish.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        {dish.is_signature && (
                          <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            Đặc sản
                          </div>
                        )}
                        {dish.restaurants?.min_price && dish.restaurants?.max_price && (
                          <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm text-foreground px-3 py-1 rounded-xl text-xs font-bold shadow-lg">
                            {dish.restaurants.min_price.toLocaleString('vi-VN')}đ - {dish.restaurants.max_price.toLocaleString('vi-VN')}đ
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-5 space-y-3 flex-1 flex flex-col">
                        <div>
                          <h3 className="text-lg font-bold text-card-foreground mb-1 group-hover:text-primary transition-colors">
                            {dish.name}
                          </h3>
                          {dish.restaurants && (
                            <>
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                                <ChefHat className="w-3.5 h-3.5 text-primary/60" />
                                {dish.restaurants.name}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-primary/60" />
                                {dish.restaurants.ward}, {dish.restaurants.city}
                              </p>
                            </>
                          )}
                        </div>

                        {dish.restaurants?.tags && dish.restaurants.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {dish.restaurants.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-primary/8 text-primary text-xs font-medium rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <Button className="w-full mt-auto rounded-xl shadow-sm">
                          Xem chi tiết
                        </Button>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/dishes"
                searchParams={{
                  search: params.search,
                  signature: params.signature,
                }}
              />
            </>
          )}
        </div>
      </section>
    </main>
  )
}
