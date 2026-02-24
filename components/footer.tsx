import Link from "next/link"
import { MapPin, Mail, Phone, ArrowUpRight, Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative">
      {/* Top gradient border */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="bg-foreground/[0.03]">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand column */}
            <div className="lg:col-span-4 space-y-5">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl overflow-hidden transition-transform group-hover:scale-105">
                  <img src="/logo.png" alt="TasteMuse Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-2xl font-extrabold gradient-text">TasteMuse</span>
              </Link>
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                Người bạn đồng hành thông minh giúp bạn khám phá món ngon và nhà hàng uy tín tại Cần Thơ.
              </p>
              {/* Social buttons (GreenShield-inspired) */}
              <div className="flex gap-3 pt-2">
                <a href="#" className="social-btn" aria-label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </a>
                <a href="#" className="social-btn" aria-label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </a>
                <a href="#" className="social-btn" aria-label="TikTok">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div className="lg:col-span-2 space-y-5">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-primary" />
                Liên kết nhanh
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    Cách hoạt động
                  </Link>
                </li>
                <li>
                  <Link href="/restaurants" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    Nhà hàng
                  </Link>
                </li>
                <li>
                  <Link href="/dishes" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    Món ăn
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="lg:col-span-2 space-y-5">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Hỗ trợ
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    Trung tâm trợ giúp
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    Chính sách bảo mật
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    Điều khoản dịch vụ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact info (GreenShield-inspired with accent border) */}
            <div className="lg:col-span-4 space-y-5">
              <h4 className="font-bold text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                Liên hệ
              </h4>
              <div className="bg-card rounded-2xl p-5 border border-border/50 space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">Địa chỉ</div>
                    <div className="text-muted-foreground">Thành phố Cần Thơ, Việt Nam</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">Email</div>
                    <div className="text-muted-foreground">tastemusehihi@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">Điện thoại</div>
                    <div className="text-muted-foreground">0896.723.226</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm">
                &copy; {new Date().getFullYear()} TasteMuse. Bản quyền thuộc về chúng tôi.
              </p>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <span>Được xây dựng với</span>
                <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
                <span>tại Cần Thơ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
