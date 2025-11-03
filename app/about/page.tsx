import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Target, Users, Heart, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
              Về <span className="text-primary">TasteMuse</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Chúng tôi kết nối người yêu ẩm thực với những món ăn và nhà hàng tuyệt vời nhất tại Cần Thơ
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Sứ mệnh của chúng tôi</h2>
              <p className="text-lg text-muted-foreground">
                Giúp mọi người dễ dàng tìm thấy món ăn yêu thích và trải nghiệm ẩm thực tuyệt vời
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="p-6">
                <Target className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-semibold mb-3">Tầm nhìn</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Trở thành nền tảng hàng đầu tại Việt Nam trong việc kết nối người dùng với ẩm thực địa phương thông qua
                  công nghệ AI và dữ liệu thông minh.
                </p>
              </Card>

              <Card className="p-6">
                <Heart className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-semibold mb-3">Giá trị cốt lõi</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Chúng tôi tin vào việc hỗ trợ các nhà hàng địa phương, tạo trải nghiệm minh bạch và xây dựng cộng đồng
                  yêu ẩm thực.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Giá trị của chúng tôi</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cộng đồng</h3>
              <p className="text-muted-foreground">
                Xây dựng cộng đồng yêu ẩm thực chia sẻ và khám phá món ngon cùng nhau
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chất lượng</h3>
              <p className="text-muted-foreground">
                Đảm bảo mọi gợi ý đều được kiểm chứng và đánh giá kỹ lưỡng từ cộng đồng
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Đam mê</h3>
              <p className="text-muted-foreground">
                Đam mê với ẩm thực và mong muốn mang đến trải nghiệm tuyệt vời nhất cho người dùng
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Câu chuyện của chúng tôi</h2>
            </div>

            <Card className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  TasteMuse được sinh ra từ một câu hỏi đơn giản: "Hôm nay ăn gì?" - câu hỏi mà mỗi người trong chúng ta
                  đều đối mặt hàng ngày.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Là một nhóm yêu ẩm thực tại Cần Thơ, chúng tôi nhận ra rằng việc tìm kiếm món ăn ngon và nhà hàng uy tín
                  không phải lúc nào cũng dễ dàng. Thông tin phân tán, đánh giá không đáng tin cậy, và thiếu công cụ hỗ
                  trợ thông minh.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Vì vậy, chúng tôi quyết định tạo ra TasteMuse - một nền tảng thông minh kết hợp AI, Google Maps, đánh
                  giá cộng đồng và video TikTok để giúp bạn tìm thấy món ăn hoàn hảo chỉ trong vài giây.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Tham gia cùng chúng tôi</h2>
            <p className="text-lg text-primary-foreground/90">
              Khám phá món ngon và trải nghiệm ẩm thực tuyệt vời tại Cần Thơ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/dishes">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-primary-foreground text-primary">
                  Khám phá món ăn
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Liên hệ chúng tôi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}



