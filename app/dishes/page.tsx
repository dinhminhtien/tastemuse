import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, ChefHat } from "lucide-react"
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
      <section className="py-12 section-alt">
        <div className="container mx-auto px-4">
          {/* Results count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {(params.search || params.signature) ? (
                <>
                  Tìm thấy <span className="font-semibold text-foreground">{totalCount}</span> món ăn
                  {params.search && (
                    <span> cho từ khóa "<span className="font-semibold text-foreground">{params.search}</span>"</span>
                  )}
                  {params.signature === 'true' && (
                    <span> (chỉ món đặc sản)</span>
                  )}
                </>
              ) : (
                <>
                  Hiển thị <span className="font-semibold text-foreground">{dishes.length}</span> / <span className="font-semibold text-foreground">{totalCount}</span> món ăn
                </>
              )}
              {totalPages > 1 && (
                <span className="ml-2 text-sm">
                  — Trang {currentPage}/{totalPages}
                </span>
              )}
            </p>
          </div>

          {dishes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                {params.search || params.signature
                  ? 'Không tìm thấy món ăn phù hợp với tìm kiếm của bạn'
                  : 'Không tìm thấy món ăn nào'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dishes.map((dish) => (
                  <Link key={dish.id} href={`/dish/${dish.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group h-full flex flex-col">
                      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                        {dish.dish_media && dish.dish_media.length > 0 ? (
                          <Image
                            src={dish.dish_media.sort((a, b) => a.sort_order - b.sort_order)[0].media_url}
                            alt={dish.dish_media[0].alt_text || dish.name}
                            width={400}
                            height={300}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <span className="text-5xl font-bold text-primary/30">
                              {dish.name.charAt(0)}
                            </span>
                          </div>
                        )}
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

                        <Button className="w-full mt-auto">
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
