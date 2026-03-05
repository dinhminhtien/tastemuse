"use client"

import { Card } from "@/components/ui/card"
import { Bot, MapPin, Star, Video } from "lucide-react"
import { Reveal } from "@/components/reveal"

const features = [
  {
    icon: Bot,
    title: "Trợ lý AI Chatbot",
    description:
      "Chatbot thông minh học sở thích, vị trí và ngân sách của bạn để gợi ý món ăn và nhà hàng phù hợp nhất.",
    color: "from-primary/15 to-primary/5",
    iconBg: "bg-primary/15 text-primary",
  },
  {
    icon: MapPin,
    title: "Tích hợp Google Maps",
    description:
      "Nhận chỉ đường ngay lập tức đến nhà hàng bạn chọn. Không bao giờ bị lạc đường khi đi ăn.",
    color: "from-secondary/15 to-secondary/5",
    iconBg: "bg-secondary/15 text-secondary-foreground",
  },
  {
    icon: Star,
    title: "Đánh giá minh bạch",
    description:
      "Đọc đánh giá và xếp hạng trung thực từ khách hàng thực. Hệ thống đánh giá hoàn toàn cộng đồng.",
    color: "from-accent/20 to-accent/5",
    iconBg: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: Video,
    title: "Video review TikTok",
    description:
      "Xem video đánh giá chân thực từ những người yêu ẩm thực. Xem món ăn trước khi gọi.",
    color: "from-destructive/10 to-destructive/3",
    iconBg: "bg-destructive/10 text-destructive",
  },
]

export function Features() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-xs font-semibold text-primary mb-6 border border-primary/20">
              TÍNH NĂNG NỔI BẬT
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-balance leading-tight">
              Mọi thứ bạn cần để tìm{" "}
              <span className="gradient-text">bữa ăn hoàn hảo</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Kết hợp ẩm thực, công nghệ và khám phá trong một nền tảng tương tác được thiết kế cho giới trẻ yêu ẩm thực
              tại Cần Thơ.
            </p>
          </Reveal>
        </div>

        {/* Bento-style feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => (
            <Reveal key={index} delay={index * 100}>
              <Card className={`p-6 md:p-8 card-interactive card-glow bg-linear-to-br ${feature.color} border-0 h-full group`}>
                <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-card-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
