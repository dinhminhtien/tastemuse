"use client"

interface MarqueeSectionProps {
    items: string[]
    variant?: "primary" | "dark" | "accent"
    speed?: number
    className?: string
}

export function MarqueeSection({
    items,
    variant = "primary",
    speed = 20,
    className = "",
}: MarqueeSectionProps) {
    const bgClass =
        variant === "primary"
            ? "bg-primary text-primary-foreground"
            : variant === "dark"
                ? "bg-foreground text-background"
                : "bg-accent text-accent-foreground"

    // Duplicate items for seamless loop
    const allItems = [...items, ...items]

    return (
        <div className={`overflow-hidden py-4 md:py-5 select-none ${bgClass} ${className}`}>
            <div className="marquee">
                <div
                    className="marquee-track flex items-center gap-8 w-max"
                    style={{ animationDuration: `${speed}s` }}
                >
                    {allItems.map((item, i) => (
                        <span key={i} className="flex items-center gap-8 whitespace-nowrap">
                            <span className="text-sm md:text-base font-bold tracking-wide uppercase">{item}</span>
                            <span className="opacity-50 text-lg">✦</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
