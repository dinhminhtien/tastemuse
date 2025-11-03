"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const preferences = [
  { label: "Món mặn", value: "non-vegan", icon: "🍖" },
  { label: "Món chay", value: "vegan", icon: "🥗" },
  { label: "Món khô", value: "dry", icon: "🍝" },
  { label: "Món nước", value: "soup", icon: "🍜" },
  { label: "Cay", value: "spicy", icon: "🌶️" },
  { label: "Không cay", value: "not-spicy", icon: "😌" },
  { label: "Ngọt", value: "sweet", icon: "🍰" },
  { label: "Chua", value: "sour", icon: "🍋" },
  { label: "Đặc biệt", value: "special", icon: "⭐" },
  { label: "Gần đây", value: "nearby", icon: "📍" },
]

export function FoodPreferences() {
  const [selected, setSelected] = useState<string[]>([])

  const toggleSelection = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Bạn muốn ăn <span className="text-primary">gì hôm nay</span>?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Chọn sở thích của bạn để nhận gợi ý món ăn phù hợp nhất
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
          {preferences.map((pref) => {
            const isSelected = selected.includes(pref.value)
            return (
              <button
                key={pref.value}
                onClick={() => toggleSelection(pref.value)}
                className={`
                  group relative flex items-center gap-2 px-5 md:px-6 py-3 md:py-4 
                  rounded-full text-sm md:text-base font-medium transition-all duration-300
                  ${isSelected
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                    : "bg-card border-2 border-border text-foreground hover:border-primary hover:text-primary hover:shadow-md"
                  }
                  hover:scale-105 active:scale-95
                `}
              >
                <span className="text-lg md:text-xl">{pref.icon}</span>
                <span>{pref.label}</span>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-foreground text-primary rounded-full flex items-center justify-center text-xs">
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
