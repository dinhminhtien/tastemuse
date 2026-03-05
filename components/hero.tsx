"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Play, Sparkles } from "lucide-react"
import { Reveal } from "@/components/reveal"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background min-h-[calc(100vh-4rem)] flex items-center pt-28 md:pt-32 lg:pt-24">
      {/* Animated background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/8 rounded-full glow-blob float-particle" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/8 rounded-full glow-blob float-particle-slow" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-accent/10 rounded-full glow-blob float-particle-fast" />
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[1400px] h-[1400px] opacity-[0.04] gradient-orbit rounded-full" />
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6 md:space-y-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-xs md:text-sm font-semibold text-primary border border-primary/20">
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>AI-powered • Phục vụ tại Cần Thơ</span>
                <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </div>
            </Reveal>

            <Reveal delay={120}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-balance leading-[1.1]">
                Không biết ăn gì?{" "}
                <span className="gradient-text">Để TasteMuse </span>
                gợi ý!
              </h1>
            </Reveal>

            <Reveal delay={220}>
              <p className="text-base md:text-lg lg:text-lg text-muted-foreground leading-relaxed max-w-xl">
                Nền tảng thông minh giúp bạn trả lời câu hỏi "Hôm nay ăn gì?" chỉ trong vài giây.
                Khám phá món ngon và nhà hàng uy tín với gợi ý từ AI.
              </p>
            </Reveal>

            <Reveal delay={320}>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => {
                    window.dispatchEvent(new Event("open-chatbot"))
                  }}
                  className="text-base px-8 py-6 w-full sm:w-auto rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Trò chuyện với AI
                </Button>
                <Link href="/restaurants">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-8 py-6 w-full sm:w-auto border-2 rounded-xl hover:bg-muted/50 transition-all hover:-translate-y-0.5"
                  >
                    Khám phá nhà hàng
                  </Button>
                </Link>
              </div>
            </Reveal>

            {/* Stats row - inspired by GreenShield impact section */}
            <Reveal delay={420}>
              <div className="flex gap-8 md:gap-12 pt-4 border-t border-border/50">
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold text-foreground stat-value">30+</div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">Nhà hàng</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold text-foreground stat-value" style={{ animationDelay: '0.1s' }}>50+</div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">Món ăn</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold text-foreground stat-value" style={{ animationDelay: '0.2s' }}>24/7</div>
                  <div className="text-xs md:text-sm text-muted-foreground font-medium">AI hỗ trợ</div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right Column - Intro Video */}
          <div className="relative order-first lg:order-last">
            <Reveal>
              <div className="relative group">
                {/* Decorative frame */}
                <div className="absolute -inset-3 bg-linear-to-br from-primary/20 via-secondary/10 to-accent/20 rounded-3xl opacity-60 group-hover:opacity-80 transition-opacity blur-sm" />
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-foreground/5">
                  <video
                    className="w-full aspect-video rounded-2xl"
                    src="https://res.cloudinary.com/dkqaygsqc/video/upload/v1768995815/intro_smeudq.mp4"
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                  {/* Play overlay hint */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center shadow-xl">
                      <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
