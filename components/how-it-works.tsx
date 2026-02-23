import { Card } from "@/components/ui/card"

const steps = [
  {
    number: "01",
    title: "Cho chúng tôi biết bạn muốn gì",
    description: "Chia sẻ sở thích ẩm thực, chế độ ăn, ngân sách và vị trí của bạn với chatbot AI.",
    image: "/person-using-phone-chatbot.jpg",
  },
  {
    number: "02",
    title: "Nhận gợi ý thông minh",
    description: "AI phân tích sở thích của bạn và gợi ý món ăn và nhà hàng hoàn hảo gần bạn.",
    image: "/food-recommendations-on-phone-screen.jpg",
  },
  {
    number: "03",
    title: "Khám phá và quyết định",
    description: "Xem video TikTok, kiểm tra đánh giá và xem vị trí trên bản đồ trước khi chọn.",
    image: "/restaurant-reviews-and-ratings.jpg",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 section-alt">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Cách thức <span className="text-primary">hoạt động</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Tìm món ăn yêu thích tiếp theo chỉ với ba bước đơn giản
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-xl transition-shadow bg-card">
              <div className="aspect-video bg-muted relative overflow-hidden">
                <img src={step.image || "/placeholder.svg"} alt={step.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                  {step.number}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-3 text-card-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
