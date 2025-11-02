import Link from "next/link"
import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, ChefHat, Clock, DollarSign, ArrowLeft, Share2, Heart } from "lucide-react"

const dishes = [
  {
    id: 1,
    name: "Cơm Tấm Bà 5",
    restaurant: "Quán Bà 5",
    rating: 4.8,
    reviews: 234,
    image: "/vietnamese-broken-rice-com-tam-with-grilled-pork.jpg",
    location: "Quận Ninh Kiều",
    address: "123 Đường ABC, Quận Ninh Kiều",
    price: "65,000đ",
    description:
      "Cơm tấm Bà 5 là món ăn đặc trưng của miền Nam với cơm tấm thơm dẻo, sườn nướng đậm đà, bì chả trứng và đồ chua giòn ngon. Món ăn được phục vụ nóng hổi với hương vị đậm đà khó quên.",
    tags: ["Món mặn", "Cơm", "Nướng"],
    ingredients: ["Cơm tấm", "Sườn heo nướng", "Bì", "Chả trứng", "Đồ chua", "Nước mắm pha"],
    time: "15-20 phút",
    serving: "1 người",
  },
  {
    id: 2,
    name: "Mì Trộn Lý",
    restaurant: "Quán Lý",
    rating: 4.7,
    reviews: 189,
    image: "/vietnamese-mixed-noodles-mi-tron.jpg",
    location: "Quận Cái Răng",
    address: "456 Đường XYZ, Quận Cái Răng",
    price: "55,000đ",
    description:
      "Mì trộn với thịt bò thái mỏng, rau sống tươi ngon, đậu phộng rang thơm và nước sốt đậm đà. Món ăn có vị chua ngọt cân bằng, thơm mùi rau thơm và rất bổ dưỡng.",
    tags: ["Món mặn", "Mì", "Khô"],
    ingredients: ["Mì vàng", "Thịt bò", "Rau sống", "Đậu phộng", "Rau thơm", "Nước sốt đặc biệt"],
    time: "10-15 phút",
    serving: "1 người",
  },
  {
    id: 3,
    name: "Bún Bò Huế Út Chín",
    restaurant: "Quán Út Chín",
    rating: 4.9,
    reviews: 312,
    image: "/vietnamese-hue-beef-noodle-soup-bun-bo-hue.jpg",
    location: "Quận Ninh Kiều",
    address: "789 Đường DEF, Quận Ninh Kiều",
    price: "70,000đ",
    description:
      "Bún bò Huế chuẩn vị với nước dùng đậm đà từ xương bò, sả, riềng và các loại gia vị đặc trưng. Thịt bò mềm, chả cua thơm ngon, chả Huế đậm đà. Món ăn có vị cay nồng đặc trưng của xứ Huế.",
    tags: ["Món mặn", "Nước", "Cay"],
    ingredients: ["Bún tươi", "Thịt bò", "Chả cua", "Chả Huế", "Rau sống", "Gia vị Huế"],
    time: "20-25 phút",
    serving: "1 người",
  },
  {
    id: 4,
    name: "Bánh Xèo Miền Tây",
    restaurant: "Quán Miền Tây",
    rating: 4.6,
    reviews: 156,
    image: "/vietnamese-crispy-pancake-banh-xeo.jpg",
    location: "Quận Ô Môn",
    address: "321 Đường GHI, Quận Ô Môn",
    price: "50,000đ",
    description:
      "Bánh xèo giòn tan với lớp vỏ vàng ruộm, nhân tôm thịt tươi ngon, giá đỗ giòn. Ăn kèm với rau sống đa dạng và nước mắm chua ngọt đậm đà. Món ăn đặc trưng của ẩm thực miền Tây.",
    tags: ["Món mặn", "Bánh", "Chiên"],
    ingredients: ["Bột gạo", "Tôm", "Thịt", "Giá đỗ", "Rau sống", "Nước mắm pha"],
    time: "12-15 phút",
    serving: "2 người",
  },
  {
    id: 5,
    name: "Mì Trộn Hương Đồng",
    restaurant: "Quán Hương Đồng",
    rating: 4.5,
    reviews: 128,
    image: "/vietnamese-mixed-noodles-mi-tron-with-vegetables.jpg",
    location: "Quận Cái Răng",
    address: "654 Đường JKL, Quận Cái Răng",
    price: "52,000đ",
    description:
      "Mì trộn với nhiều loại rau củ tươi ngon như cà rốt, dưa leo, giá đỗ, thịt gà nướng thơm và sốt đặc biệt. Món ăn cân bằng dinh dưỡng, tươi ngon và rất healthy.",
    tags: ["Món mặn", "Mì", "Rau củ"],
    ingredients: ["Mì vàng", "Thịt gà", "Rau củ tươi", "Rau thơm", "Sốt đặc biệt"],
    time: "10-15 phút",
    serving: "1 người",
  },
  {
    id: 6,
    name: "Bánh Xèo Tôm Thịt",
    restaurant: "Quán Bánh Xèo Nam Bộ",
    rating: 4.7,
    reviews: 201,
    image: "/vietnamese-crispy-pancake-banh-xeo-with-shrimp.jpg",
    location: "Quận Ninh Kiều",
    address: "987 Đường MNO, Quận Ninh Kiều",
    price: "60,000đ",
    description:
      "Bánh xèo đặc biệt với tôm tươi lớn và thịt ba chỉ thơm ngon. Lớp vỏ giòn rụm, nhân đầy đặn. Đặc biệt có thêm nấm và hành tây thêm phần hấp dẫn. Ăn kèm với rau sống và nước mắm pha.",
    tags: ["Món mặn", "Bánh", "Tôm"],
    ingredients: ["Bột gạo", "Tôm lớn", "Thịt ba chỉ", "Nấm", "Hành tây", "Rau sống"],
    time: "15-18 phút",
    serving: "2 người",
  },
]

export default async function DishDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dish = dishes.find((d) => d.id === parseInt(id))

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
        <img src={dish.image || "/placeholder.svg"} alt={dish.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
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
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-primary text-primary" />
                <span className="font-semibold text-lg">{dish.rating}</span>
                <span className="text-sm">({dish.reviews} đánh giá)</span>
              </div>
              <span className="text-2xl font-bold text-primary">{dish.price}</span>
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
                <p className="text-muted-foreground leading-relaxed">{dish.description}</p>
              </Card>

              {/* Ingredients */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Thành phần</h2>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {dish.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Tags */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Thẻ phân loại</h2>
                <div className="flex flex-wrap gap-2">
                  {dish.tags.map((tag, idx) => (
                    <span key={idx} className="px-4 py-2 bg-primary/10 text-primary rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Restaurant Info */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Nhà hàng</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ChefHat className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold">{dish.restaurant}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {dish.location}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{dish.address}</p>
                  </div>
                  <Link href={`/restaurant/${dish.id}`}>
                    <Button className="w-full">Xem nhà hàng</Button>
                  </Link>
                </div>
              </Card>

              {/* Info Cards */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Thông tin</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Thời gian phục vụ</p>
                      <p className="font-semibold">{dish.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Khẩu phần</p>
                      <p className="font-semibold">{dish.serving}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
