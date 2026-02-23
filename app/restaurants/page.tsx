import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Phone, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { Restaurant } from "@/types/database"
import type { Metadata } from "next"
import { RestaurantSearch } from "@/components/restaurant-search"
import { Pagination } from "@/components/pagination"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Nhà hàng tại Cần Thơ",
  description: "Khám phá nhà hàng uy tín và chất lượng tại Cần Thơ. Tìm kiếm theo khu vực, loại ẩm thực và giá cả.",
}

const PAGE_SIZE = 12

interface SearchParams {
  search?: string
  districts?: string
  page?: string
}

async function getRestaurants(searchParams: SearchParams) {
  try {
    const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1)
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
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
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Apply search filter
    if (searchParams.search) {
      query = query.or(`name.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%,normalized_name.ilike.%${searchParams.search}%`)
    }

    // Apply district filter
    if (searchParams.districts) {
      const districts = searchParams.districts.split(',')
      query = query.in('ward', districts)
    }

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching restaurants:', error)
      return { restaurants: [], totalCount: 0, currentPage: page }
    }

    return {
      restaurants: (data || []) as Restaurant[],
      totalCount: count || 0,
      currentPage: page,
    }
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return { restaurants: [], totalCount: 0, currentPage: 1 }
  }
}

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { restaurants, totalCount, currentPage } = await getRestaurants(params)
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
              Khám phá <span className="text-primary">nhà hàng</span> tại Cần Thơ
            </h1>
            <p className="text-xl text-muted-foreground">
              Tìm kiếm nhà hàng yêu thích và trải nghiệm ẩm thực tuyệt vời
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <RestaurantSearch />
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-12 section-alt">
        <div className="container mx-auto px-4">
          {/* Results count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {(params.search || params.districts) ? (
                <>
                  Tìm thấy <span className="font-semibold text-foreground">{totalCount}</span> nhà hàng
                  {params.search && (
                    <span> cho từ khóa "<span className="font-semibold text-foreground">{params.search}</span>"</span>
                  )}
                </>
              ) : (
                <>
                  Hiển thị <span className="font-semibold text-foreground">{restaurants.length}</span> / <span className="font-semibold text-foreground">{totalCount}</span> nhà hàng
                </>
              )}
              {totalPages > 1 && (
                <span className="ml-2 text-sm">
                  — Trang {currentPage}/{totalPages}
                </span>
              )}
            </p>
          </div>

          {restaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                {params.search || params.districts
                  ? 'Không tìm thấy nhà hàng phù hợp với tìm kiếm của bạn'
                  : 'Không tìm thấy nhà hàng nào'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <Link key={restaurant.id} href={`/restaurant/${restaurant.slug}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group h-full flex flex-col">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {restaurant.restaurant_media && restaurant.restaurant_media.length > 0 ? (
                          <Image
                            src={
                              restaurant.restaurant_media.find(m => m.is_cover)?.media_url ||
                              restaurant.restaurant_media.sort((a, b) => a.display_order - b.display_order)[0]?.media_url
                            }
                            alt={restaurant.name}
                            width={400}
                            height={225}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <span className="text-4xl font-bold text-primary/30">
                              {restaurant.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        {restaurant.tags && restaurant.tags.length > 0 && (
                          <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                            {restaurant.tags[0]}
                          </div>
                        )}
                      </div>
                      <div className="p-5 space-y-3 flex-1 flex flex-col">
                        <div>
                          <h3 className="text-xl font-bold text-card-foreground mb-1">{restaurant.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {restaurant.ward}, {restaurant.city}
                          </p>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {restaurant.description || 'Nhà hàng chất lượng tại Cần Thơ'}
                        </p>

                        <div className="space-y-2 text-sm text-muted-foreground pt-2 border-t border-border">
                          {restaurant.open_time && restaurant.close_time && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{restaurant.open_time} - {restaurant.close_time}</span>
                            </div>
                          )}
                          {restaurant.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{restaurant.phone}</span>
                            </div>
                          )}
                          {restaurant.min_price && restaurant.max_price && (
                            <div>
                              <span className="font-medium">Giá: </span>
                              <span>{restaurant.min_price.toLocaleString('vi-VN')}đ - {restaurant.max_price.toLocaleString('vi-VN')}đ</span>
                            </div>
                          )}
                        </div>

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
                basePath="/restaurants"
                searchParams={{
                  search: params.search,
                  districts: params.districts,
                }}
              />
            </>
          )}
        </div>
      </section>
    </main>
  )
}
