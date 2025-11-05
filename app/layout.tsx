import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/navigation"
import { Chatbot } from "@/components/chatbot"
import { PageTransition } from "@/components/page-transition"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TasteMuse",
  description:
    "Discover delicious dishes and trusted restaurants in Can Tho with AI-powered recommendations, Google Maps, ratings, and TikTok reviews.",
  generator: "v0.app",
    icons: {
    icon: "/logo.png",
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
        <PageTransition>
          {children}
        </PageTransition>
        <Chatbot />
        <Analytics />
      </body>
    </html>
  )
}
