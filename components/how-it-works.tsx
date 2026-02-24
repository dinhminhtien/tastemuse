"use client"

import { Card } from "@/components/ui/card"
import { Reveal } from "@/components/reveal"
import { MessageCircle, Search, Utensils } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Cho chúng tôi biết bạn muốn gì",
    description: "Chia sẻ sở thích ẩm thực, chế độ ăn, ngân sách và vị trí của bạn với chatbot AI.",
    icon: MessageCircle,
    gradient: "from-primary to-primary/80",
    bgAccent: "bg-primary/10",
  },
  {
    number: "02",
    title: "Nhận gợi ý thông minh",
    description: "AI phân tích sở thích của bạn và gợi ý món ăn và nhà hàng hoàn hảo gần bạn.",
    icon: Search,
    gradient: "from-secondary to-secondary/80",
    bgAccent: "bg-secondary/10",
  },
  {
    number: "03",
    title: "Khám phá và quyết định",
    description: "Xem video TikTok, kiểm tra đánh giá và xem vị trí trên bản đồ trước khi chọn.",
    icon: Utensils,
    gradient: "from-accent to-accent/80",
    bgAccent: "bg-accent/10",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 section-alt relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-10 w-48 h-48 bg-primary/5 rounded-full glow-blob float-particle-slow" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-secondary/5 rounded-full glow-blob float-particle" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-xs font-semibold text-primary mb-6 border border-primary/20">
              CÁCH HOẠT ĐỘNG
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-balance leading-tight">
              Chỉ với <span className="gradient-text">3 bước đơn giản</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Tìm món ăn yêu thích tiếp theo chỉ trong vài giây
            </p>
          </Reveal>
        </div>

        {/* Steps with connecting line */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 -translate-y-1/2 z-0" />

          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <Reveal key={index} delay={index * 150}>
                <Card className="overflow-hidden card-interactive bg-card border-0 shadow-lg h-full group">
                  {/* Top gradient bar */}
                  <div className={`h-1 bg-gradient-to-r ${step.gradient}`} />

                  <div className="p-8">
                    {/* Step number + Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-16 h-16 rounded-2xl ${step.bgAccent} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                        <step.icon className="w-8 h-8 text-primary" />
                      </div>
                      <div className="step-badge text-lg">
                        {step.number}
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold mb-3 text-card-foreground group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
