import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, MapPin, Phone, Clock, Search, Filter } from "lucide-react"

const restaurants = [
  {
    id: 1,
    name: "Quán Bà 5",
    cuisine: "Cơm Tấm",
    rating: 4.8,
    reviews: 234,
    image: "/vietnamese-broken-rice-com-tam-with-grilled-pork.jpg",
    location: "Quận Ninh Kiều",
    address: "123 Đường ABC, Quận Ninh Kiều",
    phone: "0123.456.789",
    hours: "6:00 AM - 10:00 PM",
    price: "50,000 - 100,000đ",
  },
  {
    id: 2,
    name: "Quán Lý",
    cuisine: "Mì Trộn",
    rating: 4.7,
    reviews: 189,
    image: "/vietnamese-mixed-noodles-mi-tron.jpg",
    location: "Quận Cái Răng",
    address: "456 Đường XYZ, Quận Cái Răng",
    phone: "0987.654.321",
    hours: "7:00 AM - 9:00 PM",
    price: "40,000 - 80,000đ",
  },
  {
    id: 3,
    name: "Quán Út Chín",
    cuisine: "Bún Bò Huế",
    rating: 4.9,
    reviews: 312,
    image: "/vietnamese-hue-beef-noodle-soup-bun-bo-hue.jpg",
    location: "Quận Ninh Kiều",
    address: "789 Đường DEF, Quận Ninh Kiều",
    phone: "0912.345.678",
    hours: "5:00 AM - 11:00 PM",
    price: "45,000 - 95,000đ",
  },
  {
    id: 4,
    name: "Quán Miền Tây",
    cuisine: "Bánh Xèo",
    rating: 4.6,
    reviews: 156,
    image: "/vietnamese-crispy-pancake-banh-xeo.jpg",
    location: "Quận Ô Môn",
    address: "321 Đường GHI, Quận Ô Môn",
    phone: "0945.678.901",
    hours: "8:00 AM - 8:00 PM",
    price: "35,000 - 70,000đ",
  },
  {
    id: 5,
    name: "Quán Hương Đồng",
    cuisine: "Mì Trộn",
    rating: 4.5,
    reviews: 128,
    image: "/vietnamese-mixed-noodles-mi-tron-with-vegetables.jpg",
    location: "Quận Cái Răng",
    address: "654 Đường JKL, Quận Cái Răng",
    phone: "0933.444.555",
    hours: "6:30 AM - 9:30 PM",
    price: "42,000 - 85,000đ",
  },
  {
    id: 6,
    name: "Quán Bánh Xèo Nam Bộ",
    cuisine: "Bánh Xèo",
    rating: 4.7,
    reviews: 201,
    image: "/vietnamese-crispy-pancake-banh-xeo-with-shrimp.jpg",
    location: "Quận Ninh Kiều",
    address: "987 Đường MNO, Quận Ninh Kiều",
    phone: "0966.777.888",
    hours: "7:30 AM - 9:00 PM",
    price: "40,000 - 75,000đ",
  },
]

export default function RestaurantsPage() {
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
          <div className="flex flex-col md:flex-row gap-4 max-w-5xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Tìm kiếm nhà hàng..." className="pl-10 h-12" />
            </div>
            <Button variant="outline" className="h-12">
              <Filter className="w-4 h-4 mr-2" />
              Lọc
            </Button>
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group h-full flex flex-col">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={restaurant.image || "/placeholder.svg"}
                      alt={restaurant.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      {restaurant.cuisine}
                    </div>
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    <div>
                      <h3 className="text-xl font-bold text-card-foreground mb-1">{restaurant.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {restaurant.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-primary text-primary" />
                        <span className="font-semibold">{restaurant.rating}</span>
                        <span className="text-sm text-muted-foreground">({restaurant.reviews} đánh giá)</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{restaurant.hours}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{restaurant.phone}</span>
                      </div>
                      <div>
                        <span className="font-medium">Giá: </span>
                        <span>{restaurant.price}</span>
                      </div>
                    </div>

                    <Button className="w-full mt-auto" variant="outline">
                      Xem chi tiết
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}








