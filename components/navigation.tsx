"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Search, Menu, MapPin, Phone, Clock, MailIcon, ShieldCheck } from "lucide-react"
import { UserProfile } from "@/components/user-profile"
import { getCurrentUser, onAuthStateChange } from "@/lib/auth"
import { isAdmin } from "@/lib/admin-config"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)

    // Initial fetch
    getCurrentUser().then(user => setUserEmail(user?.email || null))

    // Listen to auth changes
    const subscription = onAuthStateChange((user) => {
      setUserEmail(user?.email || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navLinks = [
    { href: "/", label: "Trang chủ" },
    { href: "/restaurants", label: "Nhà hàng" },
    { href: "/dishes", label: "Món ăn" },
    { href: "/pricing", label: "Bảng giá" },
    { href: "/about", label: "Về chúng tôi" },
    { href: "/contact", label: "Liên hệ" }
  ]

  // Add Admin link if user is admin
  const adminLink = isAdmin(userEmail) ? [{ href: "/admin/dashboard", label: "Admin", isSpecial: true }] : []
  const allNavLinks = [...adminLink, ...navLinks]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top bar - Desktop only - slides away on scroll */}
      <div className={`hidden lg:block bg-foreground/95 text-background transition-all duration-300 overflow-hidden ${scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 opacity-80">
                <Phone className="w-3.5 h-3.5" />
                <span>0896.723.226</span>
              </div>
              <div className="flex items-center gap-2 opacity-80">
                <MailIcon className="w-3.5 h-3.5" />
                <span>tastemusehihi@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 font-medium text-xs">Đang mở cửa</span>
              </div>
            </div>
            <div className="flex items-center gap-4 opacity-80">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Cần Thơ, Việt Nam</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main floating navigation */}
      <div className={`transition-all duration-300 ${scrolled ? "px-4 pt-3" : "px-4 pt-0"}`}>
        <div className={`mx-auto transition-all duration-300 ${scrolled
          ? "max-w-6xl floating-nav rounded-2xl"
          : "max-w-full bg-background/95 backdrop-blur-md border-b border-border/40"
          }`}>
          <div className="flex items-center justify-between h-16 md:h-18 px-4 md:px-6 flex-nowrap overflow-hidden">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity mr-4 md:mr-6 lg:mr-8 group shrink-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 relative">
                <Image className="object-contain py-1" src="/logo.png" alt="TasteMuse Logo" fill sizes="40px" priority />
              </div>
              <div className="relative h-5 md:h-6 w-28 hidden sm:block">
                <Image src="/tastemuse.png" alt="TasteMuse" className="object-contain" fill sizes="112px" priority />
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {allNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 xl:px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${pathname === link.href
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : (link as any).isSpecial
                      ? "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                    }`}
                >
                  {(link as any).isSpecial && <ShieldCheck className="w-4 h-4" />}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Search Bar
            <div className="hidden lg:flex flex-1 max-w-md mx-6 min-w-[100px]">
              <div className="relative w-full group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Bạn muốn ăn gì?"
                  className="w-full pl-10 pr-4 h-11 bg-muted/40 border-border/50 rounded-xl transition-all focus:bg-background focus:shadow-md focus:border-primary/30"
                />
              </div>
            </div> */}

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <UserProfile />
            </div>

            {/* Mobile Menu — only render Sheet after hydration to avoid Radix ID mismatch */}
            {mounted ? (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="rounded-xl">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[380px]">
                  <SheetTitle className="sr-only">Menu điều hướng</SheetTitle>
                  <nav className="flex flex-col gap-4 mt-8">
                    {/* <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input placeholder="Tìm kiếm món ăn..." className="pl-10 rounded-xl" />
                  </div> */}
                    <div className="flex flex-col gap-1 pt-4">
                      {allNavLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${pathname === link.href
                            ? "bg-primary text-primary-foreground shadow-md"
                            : (link as any).isSpecial
                              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                        >
                          {(link as any).isSpecial && <ShieldCheck className="w-5 h-5 text-blue-500" />}
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-border pt-4 mt-4">
                      <div className="flex flex-col gap-2">
                        <div className="px-4 py-2">
                          <UserProfile />
                        </div>
                        <Button variant="ghost" className="justify-start rounded-xl">
                          <MapPin className="w-5 h-5 mr-2" />
                          Cần Thơ
                        </Button>
                      </div>
                    </div>
                    <div className="border-t border-border pt-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4" />
                        <span>0896723226</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>8:00 AM - 10:00 PM</span>
                      </div>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            ) : (
              <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
                <Menu className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar
      <div className={`md:hidden bg-background/95 backdrop-blur-md border-b border-border/40 px-4 py-2.5 transition-all duration-300 ${scrolled ? "shadow-sm" : ""}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Bạn muốn ăn gì hôm nay?" className="pl-10 bg-muted/40 rounded-xl h-10" />
        </div>
      </div> */}
    </header>
  )
}
