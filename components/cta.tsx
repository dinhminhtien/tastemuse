"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle } from "lucide-react"
import { Reveal } from "@/components/reveal"

export function CTA() {
  return (
    <section className="py-20 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 right-20 w-64 h-64 bg-primary-foreground/15 rounded-full glow-blob" />
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-primary-foreground/15 rounded-full glow-blob" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Reveal>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance leading-tight">
              Sẵn sàng khám phá món ăn yêu thích tiếp theo?
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-xl md:text-2xl text-primary-foreground/90 leading-relaxed max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn người yêu ẩm thực tại Cần Thơ tin tưởng TasteMuse cho quyết định ăn uống hàng
              ngày.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/dishes">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Bắt đầu miễn phí
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/restaurants">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                >
                  Khám phá ngay
                </Button>
              </Link>
              <Button
                size="lg"
                variant="default"
                onClick={() => {
                  window.dispatchEvent(new Event("open-chatbot"))
                }}
                className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90"
              >
                Trò chuyện với chatbot
                <MessageCircle className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
