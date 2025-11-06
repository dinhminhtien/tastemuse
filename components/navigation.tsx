"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, Menu, User, MapPin, Phone, Clock, MailIcon } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "Trang chủ" },
    { href: "/restaurants", label: "Nhà hàng" },
    { href: "/dishes", label: "Món ăn" },
    { href: "/about", label: "Về chúng tôi" },
    { href: "/contact", label: "Liên hệ" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar - Desktop only */}
      <div className="hidden lg:block border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>0123.456.789</span>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon className="w-4 h-4" />
                <span>tastemuse@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-green-600 font-medium">Đang mở cửa</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                Cần Thơ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity mr-4 md:mr-6 lg:mr-8">
            <div className="w-15 h-15 rounded-lg flex items-center justify-center">
              <img className="text-2xl" src="/logo.png" alt="TasteMuse Logo" />
            </div>
            <img
              src="/tastemuse.png"
              alt="TasteMuse"
              className="h-6 md:h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Bạn muốn ăn gì hôm nay?"
                className="w-full pl-10 pr-4 h-12 bg-muted/50 border-border"
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost">
              <User className="w-5 h-5 mr-2" />
              Đăng nhập
            </Button>
            <Button>Đăng ký</Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input placeholder="Tìm kiếm món ăn..." className="pl-10" />
                </div>
                <div className="flex flex-col gap-2 pt-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname === link.href
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" className="justify-start">
                      <User className="w-5 h-5 mr-2" />
                      Đăng nhập
                    </Button>
                    <Button className="justify-start">Đăng ký</Button>
                    <Button variant="ghost" className="justify-start">
                      <MapPin className="w-5 h-5 mr-2" />
                      Cần Thơ
                    </Button>
                  </div>
                </div>
                <div className="border-t border-border pt-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" />
                    <span>0123.456.789</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>8:00 AM - 10:00 PM</span>
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden border-t border-border/40 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Bạn muốn ăn gì hôm nay?" className="pl-10 bg-muted/50" />
        </div>
      </div>
    </header>
  )
}
