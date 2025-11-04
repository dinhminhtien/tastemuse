import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/navigation"
import { Chatbot } from "@/components/chatbot"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TasteMuse",
  description:
    "Discover delicious dishes and trusted restaurants in Can Tho with AI-powered recommendations, Google Maps, ratings, and TikTok reviews.",
  generator: "v0.app",
    icons: {
    icon: "/mascot.png",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`font-sans antialiased`}>
        <Navigation />
        {children}
        <Chatbot />
        <Analytics />
      </body>
    </html>
  )
}
