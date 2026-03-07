"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen pt-28 md:pt-32 flex items-center justify-center bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-8xl md:text-9xl font-bold text-primary/20">404</h1>
            <h2 className="text-3xl md:text-4xl font-bold">Trang không tìm thấy</h2>
            <p className="text-lg text-muted-foreground">
              Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
            </Link>
            <Link href="/restaurants">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Khám phá nhà hàng
              </Button>
            </Link>
            <Button
              size="lg"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
