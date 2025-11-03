import { Card } from "@/components/ui/card"
import { Bot, MapPin, Star, Video } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "Trợ lý AI Chatbot",
    description:
      "Chatbot thông minh học sở thích, vị trí và ngân sách của bạn để gợi ý món ăn và nhà hàng phù hợp nhất gần bạn.",
  },
  {
    icon: MapPin,
    title: "Tích hợp Google Maps",
    description:
      "Nhận chỉ đường ngay lập tức đến nhà hàng bạn chọn với tích hợp Google Maps. Không bao giờ bị lạc đường khi đi ăn.",
  },
  {
    icon: Star,
    title: "Đánh giá minh bạch",
    description:
      "Đọc đánh giá và xếp hạng trung thực từ khách hàng thực. Đưa ra quyết định sáng suốt với hệ thống đánh giá cộng đồng.",
  },
  {
    icon: Video,
    title: "Video review TikTok",
    description:
      "Xem video đánh giá chân thực từ những người yêu ẩm thực trên TikTok. Xem món ăn trước khi gọi và trải nghiệm thực tế.",
  },
]

export function Features() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Mọi thứ bạn cần để tìm <span className="text-primary">bữa ăn hoàn hảo</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Kết hợp ẩm thực, công nghệ và khám phá trong một nền tảng tương tác được thiết kế cho giới trẻ yêu ẩm thực
            tại Cần Thơ.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow bg-card">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
