import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Star, MapPin, Clock, TrendingUp } from "lucide-react"

const dishes = [
  {
    name: "Cơm Tấm Bà 5",
    restaurant: "Quán Bà 5",
    rating: 4.8,
    reviews: 234,
    image: "/vietnamese-broken-rice-com-tam-with-grilled-pork.jpg",
    location: "Quận Ninh Kiều",
    price: "65,000đ",
    badge: "Nổi bật",
    time: "15-20 phút",
  },
  {
    name: "Mì Trộn Lý",
    restaurant: "Quán Lý",
    rating: 4.7,
    reviews: 189,
    image: "/vietnamese-mixed-noodles-mi-tron.jpg",
    location: "Quận Cái Răng",
    price: "55,000đ",
    badge: "Yêu thích",
    time: "10-15 phút",
  },
  {
    name: "Bún Bò Huế Út Chín",
    restaurant: "Quán Út Chín",
    rating: 4.9,
    reviews: 312,
    image: "/vietnamese-hue-beef-noodle-soup-bun-bo-hue.jpg",
    location: "Quận Ninh Kiều",
    price: "70,000đ",
    badge: "Bán chạy",
    time: "20-25 phút",
  },
  {
    name: "Bánh Xèo Miền Tây",
    restaurant: "Quán Miền Tây",
    rating: 4.6,
    reviews: 156,
    image: "/vietnamese-crispy-pancake-banh-xeo.jpg",
    location: "Quận Ô Môn",
    price: "50,000đ",
    badge: null,
    time: "12-15 phút",
  },
]

export function FeaturedDishes() {
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
          {dishes.map((dish, index) => (
            <Link key={index} href={`/dish/${index + 1}`}>
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group border-2 hover:border-primary/50">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <img
                    src={dish.image || "/placeholder.svg"}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-115"
                  />
                  {/* Badge */}
                  {dish.badge && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg">
                      {dish.badge}
                    </div>
                  )}
                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-background/95 backdrop-blur-sm text-foreground text-sm font-bold rounded-lg shadow-lg">
                    {dish.price}
                  </div>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4 md:p-5 space-y-2 bg-card">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-card-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{dish.restaurant}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-bold text-sm">{dish.rating}</span>
                      <span className="text-xs text-muted-foreground">({dish.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{dish.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{dish.time}</span>
                    </div>
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
