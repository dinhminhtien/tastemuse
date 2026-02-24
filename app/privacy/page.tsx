import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react"

export const metadata = {
    title: "Chính sách bảo mật | TasteMuse",
    description: "Chính sách bảo mật và quyền riêng tư của TasteMuse - Nền tảng tìm kiếm món ăn và nhà hàng tại Cần Thơ",
}

export default function PrivacyPage() {
    return (
        <main className="min-h-screen pt-28 md:pt-32">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
                            Chính sách <span className="text-primary">Bảo mật</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                            Cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Cập nhật lần cuối: 04 tháng 02, 2026
                        </p>
                    </div>
                </div>
            </section>

            {/* Overview Section */}
            <section className="py-12 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <Card className="p-8 md:p-12 mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6">Tổng quan</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                TasteMuse ("chúng tôi", "của chúng tôi") cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo mật này
                                giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn khi bạn sử
                                dụng nền tảng TasteMuse.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Bằng cách sử dụng dịch vụ của chúng tôi, bạn đồng ý với các điều khoản được mô tả trong chính sách này.
                                Nếu bạn không đồng ý, vui lòng không sử dụng dịch vụ của chúng tôi.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Section 1 */}
                        <Card className="p-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Database className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-4">1. Thông tin chúng tôi thu thập</h3>
                                </div>
                            </div>
                            <div className="space-y-4 text-muted-foreground">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">1.1. Thông tin bạn cung cấp</h4>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Thông tin tài khoản: tên, email, số điện thoại (khi đăng ký)</li>
                                        <li>Thông tin hồ sơ: ảnh đại diện, sở thích ẩm thực</li>
                                        <li>Nội dung do người dùng tạo: đánh giá, bình luận, hình ảnh món ăn</li>
                                        <li>Thông tin liên hệ: khi bạn gửi yêu cầu hỗ trợ hoặc phản hồi</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">1.2. Thông tin tự động thu thập</h4>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Dữ liệu sử dụng: trang bạn truy cập, thời gian sử dụng, tương tác với nội dung</li>
                                        <li>Thông tin thiết bị: loại thiết bị, hệ điều hành, trình duyệt</li>
                                        <li>Dữ liệu vị trí: vị trí địa lý (nếu bạn cho phép) để gợi ý nhà hàng gần bạn</li>
                                        <li>Cookies và công nghệ tương tự: để cải thiện trải nghiệm người dùng</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">1.3. Thông tin từ bên thứ ba</h4>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Đăng nhập qua mạng xã hội (Google, Facebook): tên, email, ảnh đại diện</li>
                                        <li>Google Maps API: dữ liệu vị trí nhà hàng, đánh giá</li>
                                    </ul>
                                </div>
                            </div>
                        </Card>

                        {/* Section 2 */}
                        <Card className="p-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Eye className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-4">2. Cách chúng tôi sử dụng thông tin</h3>
                                </div>
                            </div>
                            <div className="space-y-4 text-muted-foreground">
                                <p>Chúng tôi sử dụng thông tin của bạn cho các mục đích sau:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Cung cấp và cải thiện dịch vụ TasteMuse</li>
                                    <li>Cá nhân hóa trải nghiệm: gợi ý món ăn và nhà hàng phù hợp với sở thích của bạn</li>
                                    <li>Xử lý giao dịch và thanh toán (nếu có)</li>
                                    <li>Gửi thông báo về dịch vụ, cập nhật, khuyến mãi (nếu bạn đồng ý)</li>
                                    <li>Phân tích và nghiên cứu: hiểu cách người dùng tương tác với nền tảng</li>
                                    <li>Bảo mật và phòng chống gian lận</li>
                                    <li>Tuân thủ pháp luật và giải quyết tranh chấp</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 3 */}
                        <Card className="p-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <UserCheck className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-4">3. Chia sẻ thông tin</h3>
                                </div>
                            </div>
                            <div className="space-y-4 text-muted-foreground">
                                <p>Chúng tôi không bán thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp sau:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Với sự đồng ý của bạn:</strong> Khi bạn cho phép chúng tôi chia sẻ thông tin</li>
                                    <li><strong>Nhà cung cấp dịch vụ:</strong> Các đối tác hỗ trợ vận hành nền tảng (hosting, phân tích, thanh toán)</li>
                                    <li><strong>Yêu cầu pháp lý:</strong> Khi pháp luật yêu cầu hoặc để bảo vệ quyền lợi hợp pháp</li>
                                    <li><strong>Chuyển giao doanh nghiệp:</strong> Trong trường hợp sáp nhập, mua bán hoặc chuyển nhượng tài sản</li>
                                    <li><strong>Thông tin công khai:</strong> Đánh giá, bình luận của bạn có thể hiển thị công khai trên nền tảng</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 4 */}
                        <Card className="p-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Lock className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-4">4. Bảo mật thông tin</h3>
                                </div>
                            </div>
                            <div className="space-y-4 text-muted-foreground">
                                <p>Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức để bảo vệ thông tin của bạn:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Mã hóa dữ liệu truyền tải (SSL/TLS)</li>
                                    <li>Mã hóa dữ liệu lưu trữ nhạy cảm</li>
                                    <li>Kiểm soát truy cập nghiêm ngặt</li>
                                    <li>Giám sát và kiểm tra bảo mật định kỳ</li>
                                    <li>Đào tạo nhân viên về bảo mật thông tin</li>
                                </ul>
                                <p className="mt-4">
                                    Tuy nhiên, không có phương thức truyền tải hoặc lưu trữ nào là 100% an toàn. Chúng tôi khuyến khích
                                    bạn bảo vệ thông tin đăng nhập của mình.
                                </p>
                            </div>
                        </Card>

                        {/* Section 5 */}
                        <Card className="p-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Shield className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-4">5. Quyền của bạn</h3>
                                </div>
                            </div>
                            <div className="space-y-4 text-muted-foreground">
                                <p>Bạn có các quyền sau đối với thông tin cá nhân của mình:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li><strong>Truy cập:</strong> Yêu cầu xem thông tin cá nhân chúng tôi lưu trữ về bạn</li>
                                    <li><strong>Sửa đổi:</strong> Cập nhật hoặc chỉnh sửa thông tin không chính xác</li>
                                    <li><strong>Xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu cá nhân</li>
                                    <li><strong>Hạn chế xử lý:</strong> Yêu cầu hạn chế cách chúng tôi sử dụng thông tin của bạn</li>
                                    <li><strong>Từ chối:</strong> Từ chối nhận email marketing hoặc thông báo không bắt buộc</li>
                                    <li><strong>Di chuyển dữ liệu:</strong> Yêu cầu xuất dữ liệu của bạn sang định dạng có thể đọc được</li>
                                </ul>
                                <p className="mt-4">
                                    Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua email:{" "}
                                    <a href="mailto:privacy@tastemuse.com" className="text-primary hover:underline">
                                        privacy@tastemuse.com
                                    </a>
                                </p>
                            </div>
                        </Card>

                        {/* Section 6 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">6. Cookies và công nghệ theo dõi</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <p>Chúng tôi sử dụng cookies và công nghệ tương tự để:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Ghi nhớ tùy chọn và cài đặt của bạn</li>
                                    <li>Phân tích lưu lượng truy cập và hành vi người dùng</li>
                                    <li>Cá nhân hóa nội dung và quảng cáo</li>
                                    <li>Cải thiện hiệu suất và bảo mật</li>
                                </ul>
                                <p className="mt-4">
                                    Bạn có thể quản lý cookies thông qua cài đặt trình duyệt của mình. Tuy nhiên, việc vô hiệu hóa
                                    cookies có thể ảnh hưởng đến một số chức năng của nền tảng.
                                </p>
                            </div>
                        </Card>

                        {/* Section 7 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">7. Lưu trữ dữ liệu</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Chúng tôi lưu trữ thông tin cá nhân của bạn chỉ trong thời gian cần thiết để thực hiện các mục đích
                                    được nêu trong chính sách này, hoặc theo yêu cầu của pháp luật.
                                </p>
                                <p>
                                    Khi bạn xóa tài khoản, chúng tôi sẽ xóa hoặc ẩn danh hóa thông tin cá nhân của bạn trong vòng 30 ngày,
                                    trừ khi pháp luật yêu cầu lưu trữ lâu hơn.
                                </p>
                            </div>
                        </Card>

                        {/* Section 8 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">8. Trẻ em</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Dịch vụ của chúng tôi không dành cho trẻ em dưới 13 tuổi. Chúng tôi không cố ý thu thập thông tin cá
                                    nhân từ trẻ em dưới 13 tuổi. Nếu bạn là phụ huynh và phát hiện con bạn đã cung cấp thông tin cho chúng
                                    tôi, vui lòng liên hệ để chúng tôi xóa thông tin đó.
                                </p>
                            </div>
                        </Card>

                        {/* Section 9 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">9. Thay đổi chính sách</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về
                                    các thay đổi quan trọng qua email hoặc thông báo trên nền tảng.
                                </p>
                                <p>
                                    Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận chính sách
                                    mới.
                                </p>
                            </div>
                        </Card>

                        {/* Section 10 */}
                        <Card className="p-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-4">10. Liên hệ</h3>
                                </div>
                            </div>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này hoặc cách chúng tôi xử lý thông tin cá nhân
                                    của bạn, vui lòng liên hệ:
                                </p>
                                <div className="bg-muted/50 p-6 rounded-lg space-y-2">
                                    <p><strong>TasteMuse</strong></p>
                                    <p>Email: <a href="mailto:privacy@tastemuse.com" className="text-primary hover:underline">privacy@tastemuse.com</a></p>
                                    <p>Email hỗ trợ: <a href="mailto:support@tastemuse.com" className="text-primary hover:underline">support@tastemuse.com</a></p>
                                    <p>Địa chỉ: Cần Thơ, Việt Nam</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold">Có câu hỏi về quyền riêng tư?</h2>
                        <p className="text-lg text-primary-foreground/90">
                            Chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link href="/contact">
                                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-primary-foreground text-primary">
                                    Liên hệ chúng tôi
                                    <Mail className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link href="/terms">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                                >
                                    Xem điều khoản sử dụng
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
