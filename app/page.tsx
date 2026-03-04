import { Hero } from "@/components/hero"
import { FoodPreferences } from "@/components/food-preferences"
import { FeaturedDishes } from "@/components/featured-dishes"
import { PersonalizedRecommendations } from "@/components/personalized-recommendations"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { CTA } from "@/components/cta"
import { MarqueeSection } from "@/components/marquee-section"

const marqueeItems = [
  "Cần Thơ",
  "Bún Riêu",
  "Phở",
  "Bánh Xèo",
  "Cơm Tấm",
  "Hủ Tiếu",
  "AI Gợi Ý",
  "Nhà Hàng",
  "Món Ngon",
  "Video Review",
  "Google Maps",
  "Đánh Giá",
]

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <MarqueeSection items={marqueeItems} variant="primary" speed={25} />
      <FoodPreferences />
      <FeaturedDishes />
      <PersonalizedRecommendations />
      <MarqueeSection
        items={["TasteMuse", "Ẩm Thực Cần Thơ", "AI Chatbot", "Khám Phá", "Gợi Ý Thông Minh", "Đánh Giá Cộng Đồng"]}
        variant="dark"
        speed={30}
      />
      <Features />
      <HowItWorks />
      <CTA />
    </main>
  )
}
