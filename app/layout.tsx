import type React from "react"
import type { Metadata } from "next"
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { ChatbotLazy } from "@/components/features/chatbot/chatbot-lazy"
import { PageTransition } from "@/components/layout/page-transition"
import { BackToTop } from "@/components/layout/back-to-top"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["vietnamese", "latin"],
  display: "swap",
  variable: "--font-mono",
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
    <html lang="vi" className={`${beVietnamPro.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Navigation />
        <PageTransition>
          {children}
        </PageTransition>
        <Footer />
        <BackToTop />
        <ChatbotLazy />
        <Analytics />
        <SpeedInsights />
        <Toaster />
      </body>
    </html>
  )
}
