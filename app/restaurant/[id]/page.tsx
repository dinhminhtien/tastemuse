import Link from "next/link"
import { notFound } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Phone, Clock, ArrowLeft, Share2, Heart, Utensils, Map } from "lucide-react"

const restaurants = [
  {
    id: 1,
    name: "Quán Bà 5",
    cuisine: "Cơm Tấm",
    rating: 4.8,
    reviews: 234,
    image: "/vietnamese-broken-rice-com-tam-with-grilled-pork.jpg",
    location: "Quận Ninh Kiều",
    address: "123 Đường ABC, Quận Ninh Kiều, Cần Thơ",
    phone: "0123.456.789",
    hours: "6:00 AM - 10:00 PM",
    price: "50,000 - 100,000đ",
    description:
      "Quán Bà 5 là địa điểm nổi tiếng về cơm tấm tại Cần Thơ với hơn 20 năm kinh nghiệm. Quán phục vụ các món cơm tấm truyền thống với chất lượng cao và giá cả hợp lý. Không gian quán ấm cúng, thân thiện, phù hợp cho cả gia đình và nhóm bạn.",
    specialties: ["Cơm tấm sườn nướng", "Cơm tấm bì chả", "Cơm tấm đặc biệt"],
    amenities: ["WiFi miễn phí", "Chỗ đậu xe", "Phục vụ nhanh"],
    dishes: [
      { id: 1, name: "Cơm Tấm Bà 5", price: "65,000đ" },
      { id: 7, name: "Cơm tấm đặc biệt", price: "85,000đ" },
      { id: 8, name: "Cơm tấm sườn cây", price: "90,000đ" },
    ],
  },
  {
    id: 2,
    name: "Quán Lý",
    cuisine: "Mì Trộn",
    rating: 4.7,
    reviews: 189,
    image: "/vietnamese-mixed-noodles-mi-tron.jpg",
    location: "Quận Cái Răng",
    address: "456 Đường XYZ, Quận Cái Răng, Cần Thơ",
    phone: "0987.654.321",
    hours: "7:00 AM - 9:00 PM",
    price: "40,000 - 80,000đ",
    description:
      "Quán Lý chuyên về các món mì trộn với công thức đặc biệt được truyền qua nhiều thế hệ. Mì được làm thủ công, tươi ngon mỗi ngày. Quán được yêu thích bởi hương vị đậm đà và giá cả phải chăng.",
    specialties: ["Mì trộn thịt bò", "Mì trộn đặc biệt", "Mì trộn chay"],
    amenities: ["Không gian thoáng mát", "Phục vụ tại chỗ"],
    dishes: [
      { id: 2, name: "Mì Trộn Lý", price: "55,000đ" },
      { id: 9, name: "Mì trộn đặc biệt", price: "75,000đ" },
      { id: 10, name: "Mì trộn chay", price: "45,000đ" },
    ],
  },
  {
    id: 3,
    name: "Quán Út Chín",
    cuisine: "Bún Bò Huế",
    rating: 4.9,
    reviews: 312,
    image: "/vietnamese-hue-beef-noodle-soup-bun-bo-hue.jpg",
    location: "Quận Ninh Kiều",
    address: "789 Đường DEF, Quận Ninh Kiều, Cần Thơ",
    phone: "0912.345.678",
    hours: "5:00 AM - 11:00 PM",
    price: "45,000 - 95,000đ",
    description:
      "Quán Út Chín nổi tiếng với món bún bò Huế chuẩn vị. Nước dùng được nấu từ xương bò tươi, thêm sả, riềng và các loại gia vị đặc trưng của Huế. Quán luôn đông khách vào buổi sáng và tối.",
    specialties: ["Bún bò Huế", "Bún bò Huế đặc biệt", "Bún bò Huế chả cua"],
    amenities: ["WiFi miễn phí", "Chỗ đậu xe", "Phục vụ 24/7"],
    dishes: [
      { id: 3, name: "Bún Bò Huế Út Chín", price: "70,000đ" },
      { id: 11, name: "Bún bò Huế đặc biệt", price: "90,000đ" },
      { id: 12, name: "Bún bò Huế chả cua", price: "85,000đ" },
    ],
  },
  {
    id: 4,
    name: "Quán Miền Tây",
    cuisine: "Bánh Xèo",
    rating: 4.6,
    reviews: 156,
    image: "/vietnamese-crispy-pancake-banh-xeo.jpg",
    location: "Quận Ô Môn",
    address: "321 Đường GHI, Quận Ô Môn, Cần Thơ",
    phone: "0945.678.901",
    hours: "8:00 AM - 8:00 PM",
    price: "35,000 - 70,000đ",
    description:
      "Quán Miền Tây chuyên về các món ăn đặc trưng của miền Tây Nam Bộ, đặc biệt là bánh xèo. Bánh được làm thủ công, giòn tan, nhân đầy đặn với tôm thịt tươi ngon. Quán có không gian rộng rãi, phù hợp cho nhóm đông người.",
    specialties: ["Bánh xèo tôm thịt", "Bánh xèo đặc biệt", "Bánh xèo chay"],
    amenities: ["Không gian rộng rãi", "Chỗ đậu xe", "Nhóm đông người"],
    dishes: [
      { id: 4, name: "Bánh Xèo Miền Tây", price: "50,000đ" },
      { id: 13, name: "Bánh xèo đặc biệt", price: "65,000đ" },
      { id: 14, name: "Bánh xèo chay", price: "45,000đ" },
    ],
  },
  {
    id: 5,
    name: "Quán Hương Đồng",
    cuisine: "Mì Trộn",
    rating: 4.5,
    reviews: 128,
    image: "/vietnamese-mixed-noodles-mi-tron-with-vegetables.jpg",
    location: "Quận Cái Răng",
    address: "654 Đường JKL, Quận Cái Răng, Cần Thơ",
    phone: "0933.444.555",
    hours: "6:30 AM - 9:30 PM",
    price: "42,000 - 85,000đ",
    description:
      "Quán Hương Đồng nổi tiếng với món mì trộn nhiều rau củ, healthy và bổ dưỡng. Quán chú trọng đến chất lượng nguyên liệu, sử dụng rau củ tươi ngon và thịt gà nướng thơm lừng.",
    specialties: ["Mì trộn rau củ", "Mì trộn gà nướng", "Mì trộn đặc biệt"],
    amenities: ["Món ăn healthy", "Không gian sạch sẽ"],
    dishes: [
      { id: 5, name: "Mì Trộn Hương Đồng", price: "52,000đ" },
      { id: 15, name: "Mì trộn gà nướng", price: "65,000đ" },
      { id: 16, name: "Mì trộn đặc biệt", price: "75,000đ" },
    ],
  },
  {
    id: 6,
    name: "Quán Bánh Xèo Nam Bộ",
    cuisine: "Bánh Xèo",
    rating: 4.7,
    reviews: 201,
    image: "/vietnamese-crispy-pancake-banh-xeo-with-shrimp.jpg",
    location: "Quận Ninh Kiều",
    address: "987 Đường MNO, Quận Ninh Kiều, Cần Thơ",
    phone: "0966.777.888",
    hours: "7:30 AM - 9:00 PM",
    price: "40,000 - 75,000đ",
    description:
      "Quán Bánh Xèo Nam Bộ chuyên về bánh xèo với tôm tươi lớn và thịt ba chỉ. Bánh được làm theo công thức truyền thống, giòn tan và thơm ngon. Quán có không gian ấm cúng, phù hợp cho gia đình.",
    specialties: ["Bánh xèo tôm lớn", "Bánh xèo đặc biệt", "Bánh xèo set"],
    amenities: ["Không gian ấm cúng", "Phù hợp gia đình"],
    dishes: [
      { id: 6, name: "Bánh Xèo Tôm Thịt", price: "60,000đ" },
      { id: 17, name: "Bánh xèo tôm lớn", price: "70,000đ" },
      { id: 18, name: "Bánh xèo set 2 người", price: "120,000đ" },
    ],
  },
]

export default async function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const restaurant = restaurants.find((r) => r.id === parseInt(id))

  if (!restaurant) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      {/* Header with Back Button */}
      <section className="bg-background border-b border-border py-6">
        <div className="container mx-auto px-4">
          <Link
            href="/restaurants"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách nhà hàng
          </Link>
        </div>
      </section>

      {/* Hero Image */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <img src={restaurant.image || "/placeholder.svg"} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-semibold">
                {restaurant.cuisine}
              </span>
              <Button variant="secondary" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ
              </Button>
              <Button variant="secondary" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Yêu thích
              </Button>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{restaurant.name}</h1>
            <div className="flex items-center gap-4 text-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-primary text-primary" />
                <span className="font-semibold text-lg">{restaurant.rating}</span>
                <span className="text-sm">({restaurant.reviews} đánh giá)</span>
              </div>
              <span className="text-sm text-muted-foreground">{restaurant.price}</span>
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
                <h2 className="text-2xl font-bold mb-4">Giới thiệu</h2>
                <p className="text-muted-foreground leading-relaxed">{restaurant.description}</p>
              </Card>

              {/* Specialties */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Món đặc trưng</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {restaurant.specialties.map((specialty, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                      <Utensils className="w-5 h-5 text-primary" />
                      <span>{specialty}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Menu */}
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Menu nổi bật</h2>
                <div className="space-y-3">
                  {restaurant.dishes.map((dish) => (
                    <div key={dish.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <Link href={`/dish/${dish.id}`} className="flex-1 hover:text-primary transition-colors">
                        <span className="font-medium">{dish.name}</span>
                      </Link>
                      <span className="text-primary font-semibold">{dish.price}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Thông tin liên hệ</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Địa chỉ</p>
                      <p className="font-medium">{restaurant.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Điện thoại</p>
                      <p className="font-medium">{restaurant.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Giờ mở cửa</p>
                      <p className="font-medium">{restaurant.hours}</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Map className="w-4 h-4 mr-2" />
                    Xem trên bản đồ
                  </Button>
                </div>
              </Card>

              {/* Amenities */}
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">Tiện ích</h3>
                <div className="space-y-2">
                  {restaurant.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
