import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ChatbotLazy } from "@/components/chatbot-lazy"
import { PageTransition } from "@/components/page-transition"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: {
    default: "TasteMuse — Khám phá ẩm thực Cần Thơ",
    template: "%s | TasteMuse",
  },
  description:
    "Khám phá món ngon và nhà hàng uy tín tại Cần Thơ với gợi ý thông minh từ AI, Google Maps, đánh giá cộng đồng và video review.",
  keywords: ["ẩm thực Cần Thơ", "món ngon", "nhà hàng", "AI gợi ý", "TasteMuse"],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "TasteMuse",
    title: "TasteMuse — Khám phá ẩm thực Cần Thơ",
    description: "Khám phá món ngon và nhà hàng uy tín tại Cần Thơ với gợi ý thông minh từ AI.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <Navigation />
        <PageTransition>
          {children}
        </PageTransition>
        <Footer />
        <ChatbotLazy />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
