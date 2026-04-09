import { Hero } from "@/components/marketing/hero"
import { FoodPreferences } from "@/components/features/dish/food-preferences"
import { FeaturedDishes } from "@/components/features/dish/featured-dishes"
import { PersonalizedRecommendations } from "@/components/features/dish/personalized-recommendations"
import { Features } from "@/components/marketing/features"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { CTA } from "@/components/marketing/cta"
import { MarqueeSection } from "@/components/marketing/marquee-section"

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
