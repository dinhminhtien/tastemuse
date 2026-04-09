"use client"

import { useState } from "react"
import { Reveal } from "@/components/marketing/reveal"

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
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-14">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-xs font-semibold text-primary mb-6 border border-primary/20">
              SỞ THÍCH ẨM THỰC
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
              Bạn muốn ăn <span className="gradient-text">gì hôm nay</span>?
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Chọn sở thích của bạn để nhận gợi ý món ăn phù hợp nhất
            </p>
          </Reveal>
        </div>

        <Reveal delay={300}>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
            {preferences.map((pref) => {
              const isSelected = selected.includes(pref.value)
              return (
                <button
                  key={pref.value}
                  onClick={() => toggleSelection(pref.value)}
                  className={`
                    group relative flex items-center gap-2.5 px-5 md:px-6 py-3 md:py-3.5 
                    rounded-2xl text-sm md:text-base font-medium transition-all duration-300
                    ${isSelected
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                      : "bg-card border border-border/60 text-foreground hover:border-primary/40 hover:text-primary hover:shadow-md hover:bg-primary/5"
                    }
                    hover:scale-105 active:scale-95
                  `}
                >
                  <span className="text-lg md:text-xl transition-transform group-hover:scale-110">{pref.icon}</span>
                  <span>{pref.label}</span>
                  {isSelected && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-foreground text-primary rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </Reveal>

        {/* Selected count */}
        {selected.length > 0 && (
          <Reveal>
            <div className="text-center mt-8">
              <p className="text-sm text-muted-foreground">
                Đã chọn <span className="font-bold text-primary">{selected.length}</span> sở thích
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}
