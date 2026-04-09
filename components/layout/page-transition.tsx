"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [displayedPath, setDisplayedPath] = useState(pathname)
  const [stage, setStage] = useState<"enter" | "idle">("enter")

  useEffect(() => {
    setStage("enter")
    const id = setTimeout(() => {
      setDisplayedPath(pathname)
      setStage("idle")
    }, 140)
    return () => clearTimeout(id)
  }, [pathname])

  return (
    <div
      key={displayedPath}
      className={
        stage === "enter"
          ? "opacity-0 translate-y-2 transition-all duration-200 ease-out"
          : "opacity-100 translate-y-0 transition-all duration-300 ease-out"
      }
    >
      {children}
    </div>
  )
}


