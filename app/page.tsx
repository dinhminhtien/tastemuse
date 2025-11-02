import { Hero } from "@/components/hero"
import { FoodPreferences } from "@/components/food-preferences"
import { FeaturedDishes } from "@/components/featured-dishes"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FoodPreferences />
      <FeaturedDishes />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  )
}
