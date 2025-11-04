import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, MapPin, Search, Filter, ChefHat } from "lucide-react"

const dishes = [
  {
    id: 1,
    name: "Cơm Tấm Bà 5",
    restaurant: "Quán Bà 5",
    rating: 4.8,
    reviews: 234,
    image: "/vietnamese-broken-rice-com-tam-with-grilled-pork.jpg",
    location: "Quận Ninh Kiều",
    price: "65,000đ",
    description: "Cơm tấm với sườn nướng thơm lừng, bì chả trứng và đồ chua đặc trưng",
    tags: ["Món mặn", "Cơm", "Nướng"],
  },
  {
    id: 2,
    name: "Mì Trộn Lý",
    restaurant: "Quán Lý",
    rating: 4.7,
    reviews: 189,
    image: "/vietnamese-mixed-noodles-mi-tron.jpg",
    location: "Quận Cái Răng",
    price: "55,000đ",
    description: "Mì trộn với thịt bò, rau sống, đậu phộng và nước sốt đậm đà",
    tags: ["Món mặn", "Mì", "Khô"],
  },
  {
    id: 3,
    name: "Bún Bò Huế Út Chín",
    restaurant: "Quán Út Chín",
    rating: 4.9,
    reviews: 312,
    image: "/vietnamese-hue-beef-noodle-soup-bun-bo-hue.jpg",
    location: "Quận Ninh Kiều",
    price: "70,000đ",
    description: "Bún bò Huế chuẩn vị với nước dùng đậm đà, thịt bò mềm và chả cua thơm ngon",
    tags: ["Món mặn", "Nước", "Cay"],
  },
  {
    id: 4,
    name: "Bánh Xèo Miền Tây",
    restaurant: "Quán Miền Tây",
    rating: 4.6,
    reviews: 156,
    image: "/vietnamese-crispy-pancake-banh-xeo.jpg",
    location: "Quận Ô Môn",
    price: "50,000đ",
    description: "Bánh xèo giòn tan với tôm thịt tươi ngon, ăn kèm rau sống và nước mắm chua ngọt",
    tags: ["Món mặn", "Bánh", "Chiên"],
  },
  {
    id: 5,
    name: "Mì Trộn Hương Đồng",
    restaurant: "Quán Hương Đồng",
    rating: 4.5,
    reviews: 128,
    image: "/vietnamese-mixed-noodles-mi-tron-with-vegetables.jpg",
    location: "Quận Cái Răng",
    price: "52,000đ",
    description: "Mì trộn với nhiều rau củ tươi ngon, thịt gà và sốt đặc biệt",
    tags: ["Món mặn", "Mì", "Rau củ"],
  },
  {
    id: 6,
    name: "Bánh Xèo Tôm Thịt",
    restaurant: "Quán Bánh Xèo Nam Bộ",
    rating: 4.7,
    reviews: 201,
    image: "/vietnamese-crispy-pancake-banh-xeo-with-shrimp.jpg",
    location: "Quận Ninh Kiều",
    price: "60,000đ",
    description: "Bánh xèo đặc biệt với tôm tươi và thịt ba chỉ, giòn rụm và thơm ngon",
    tags: ["Món mặn", "Bánh", "Tôm"],
  },
]

export default function DishesPage() {
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
          <div className="flex flex-col md:flex-row gap-4 max-w-5xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input placeholder="Tìm kiếm món ăn..." className="pl-10 h-12" />
            </div>
            <Button variant="outline" className="h-12">
              <Filter className="w-4 h-4 mr-2" />
              Lọc
            </Button>
          </div>
        </div>
      </section>

      {/* Dishes Grid */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes.map((dish) => (
              <Link key={dish.id} href={`/dish/${dish.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group h-full flex flex-col">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <img
                      src={dish.image || "/placeholder.svg"}
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      {dish.price}
                    </div>
                  </div>
                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    <div>
                      <h3 className="text-xl font-bold text-card-foreground mb-1">{dish.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                        <ChefHat className="w-4 h-4" />
                        {dish.restaurant}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {dish.location}
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{dish.description}</p>

                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-primary text-primary" />
                        <span className="font-semibold">{dish.rating}</span>
                        <span className="text-sm text-muted-foreground">({dish.reviews})</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {dish.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
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








