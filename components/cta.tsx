"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react"
import { Reveal } from "@/components/reveal"

export function CTA() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Newsletter-style CTA panel (GreenShield-inspired) */}
        <Reveal>
          <div className="newsletter-panel p-8 md:p-12 lg:p-16 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-10 right-20 w-64 h-64 bg-primary/20 rounded-full glow-blob" />
              <div className="absolute bottom-10 left-20 w-80 h-80 bg-secondary/15 rounded-full glow-blob" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 gradient-orbit rounded-full" />
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
              {/* Left side */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-xs font-semibold text-primary-foreground/90 border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  MIỄN PHÍ 100%
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white text-balance leading-tight">
                  Sẵn sàng khám phá món ăn yêu thích?
                </h2>
                <p className="text-lg text-white/70 leading-relaxed max-w-lg">
                  Tham gia cùng hàng nghìn người yêu ẩm thực tại Cần Thơ tin tưởng TasteMuse cho quyết định ăn uống hàng ngày.
                </p>
              </div>

              {/* Right side - CTA buttons */}
              <div className="flex flex-col gap-4">
                <Link href="/dishes" className="block">
                  <Button
                    size="lg"
                    className="w-full text-lg px-8 py-7 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-xl transition-all hover:-translate-y-0.5"
                  >
                    Bắt đầu khám phá
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/restaurants">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full px-4 py-6 border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl transition-all"
                    >
                      Nhà hàng
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="default"
                    onClick={() => {
                      window.dispatchEvent(new Event("open-chatbot"))
                    }}
                    className="w-full px-4 py-6 bg-white text-foreground hover:bg-white/90 rounded-xl transition-all"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chatbot
                  </Button>
                </div>
                <p className="text-center text-white/40 text-sm mt-2">
                  Không cần đăng ký • Sử dụng ngay
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
