import Link from "next/link"
import { MapPin, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="section-alt border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary">TasteMuse</h3>
            <p className="text-muted-foreground leading-relaxed">
              Người bạn đồng hành thông minh giúp bạn khám phá món ngon và nhà hàng uy tín tại Cần Thơ.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  Cách hoạt động
                </Link>
              </li>
              <li>
                <Link href="/restaurants" className="text-muted-foreground hover:text-primary transition-colors">
                  Nhà hàng
                </Link>
              </li>
              <li>
                <Link href="/dishes" className="text-muted-foreground hover:text-primary transition-colors">
                  Món ăn
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Hỗ trợ</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Điều khoản dịch vụ
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Thành phố Cần Thơ, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span>tastemusehihi@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span>0896723226</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TasteMuse. Bản quyền thuộc về chúng tôi.</p>
        </div>
      </div>
    </footer>
  )
}
