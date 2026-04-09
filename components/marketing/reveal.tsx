"use client"
import { useEffect, useRef, useState } from "react"

type RevealProps = {
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
  delay?: number
  className?: string
}

export function Reveal({ children, as = "div", delay = 0, className }: RevealProps) {
  const Comp: any = as
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <Comp
      ref={ref}
      className={
        `${className ?? ""} ${visible ? "animate-fade-slide-up" : "opacity-0 translate-y-4"}`.trim()
      }
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Comp>
  )
}


