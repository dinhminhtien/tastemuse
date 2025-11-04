import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-10 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-5 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-primary/10 rounded-full text-xs md:text-sm font-medium text-primary">
              <MapPin className="w-3 h-3 md:w-4 md:h-4" />
              <span>Phục vụ tại Cần Thơ</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight">
              Không biết ăn gì? <span className="text-primary">Để TasteMuse gợi ý</span> món ngon gần bạn!
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
              TasteMuse là nền tảng thông minh giúp bạn trả lời câu hỏi "Hôm nay ăn gì?" chỉ trong vài giây. Khám phá
              món ngon và nhà hàng uy tín với gợi ý từ AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/dishes">
                <Button size="lg" className="text-base px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto">
                  Trò chuyện với AI
                </Button>
              </Link>
              <Link href="/restaurants">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto border-2"
                >
                  Khám phá nhà hàng
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Intro Video */}
          <div className="relative order-first lg:order-last">
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5 p-6 md:p-8 flex items-center justify-center min-h-[280px] md:min-h-[320px] lg:min-h-[380px]">
              <iframe
                className="relative z-10 w-full max-w-[560px] md:max-w-[640px] lg:max-w-[720px] aspect-video rounded-lg"
                src="https://www.youtube.com/embed/yKNxeF4KMsY?autoplay=1&mute=1&loop=1&playlist=yKNxeF4KMsY&playsinline=1&modestbranding=1&rel=0"
                title="Coldplay - Yellow (Official Video)"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
