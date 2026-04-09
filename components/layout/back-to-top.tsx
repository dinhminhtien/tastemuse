"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

export function BackToTop() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400)
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <button
            onClick={scrollToTop}
            aria-label="Về đầu trang"
            className={`
        fixed left-4 bottom-6 z-50
        w-11 h-11 md:w-12 md:h-12 rounded-full
        bg-primary text-primary-foreground shadow-lg
        flex items-center justify-center
        transition-all duration-300
        ${visible
                    ? "opacity-100 translate-y-0 pointer-events-auto back-to-top-btn"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }
      `}
        >
            <ArrowUp className="w-5 h-5" />
        </button>
    )
}
