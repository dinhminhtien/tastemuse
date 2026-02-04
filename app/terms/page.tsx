import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText, CheckCircle, XCircle, AlertTriangle, Scale, Mail } from "lucide-react"

export const metadata = {
    title: "Điều khoản sử dụng | TasteMuse",
    description: "Điều khoản và điều kiện sử dụng dịch vụ TasteMuse - Nền tảng tìm kiếm món ăn và nhà hàng tại Cần Thơ",
}

export default function TermsPage() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
                            Điều khoản <span className="text-primary">Sử dụng</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                            Quy định và điều kiện khi sử dụng dịch vụ TasteMuse
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
                            <h2 className="text-2xl md:text-3xl font-bold mb-6">Chào mừng đến với TasteMuse</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Cảm ơn bạn đã sử dụng TasteMuse! Các điều khoản sử dụng này ("Điều khoản") là thỏa thuận pháp lý giữa
                                bạn và TasteMuse ("chúng tôi", "của chúng tôi") điều chỉnh việc bạn truy cập và sử dụng nền tảng
                                TasteMuse, bao gồm website, ứng dụng di động và các dịch vụ liên quan.
                            </p>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Bằng cách truy cập hoặc sử dụng TasteMuse, bạn đồng ý tuân thủ các Điều khoản này. Nếu bạn không đồng
                                ý, vui lòng không sử dụng dịch vụ của chúng tôi.
                            </p>
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-6">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-900 dark:text-amber-200">
                                        <strong>Lưu ý quan trọng:</strong> Vui lòng đọc kỹ các điều khoản này trước khi sử dụng dịch vụ.
                                        Việc tiếp tục sử dụng đồng nghĩa với việc bạn chấp nhận tất cả các điều khoản.
                                    </p>
                                </div>
                            </div>
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
                                    <CheckCircle className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-4">1. Chấp nhận điều khoản</h3>
                                </div>
                            </div>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Khi sử dụng TasteMuse, bạn xác nhận rằng:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Bạn đủ 13 tuổi trở lên (hoặc độ tuổi tối thiểu theo quy định pháp luật tại quốc gia của bạn)</li>
                                    <li>Bạn có đầy đủ năng lực pháp lý để ký kết thỏa thuận ràng buộc này</li>
                                    <li>Bạn sẽ tuân thủ tất cả các điều khoản và điều kiện được nêu trong tài liệu này</li>
                                    <li>Thông tin bạn cung cấp là chính xác, đầy đủ và cập nhật</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 2 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">2. Mô tả dịch vụ</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <p>TasteMuse cung cấp nền tảng trực tuyến giúp người dùng:</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Tìm kiếm và khám phá món ăn, nhà hàng tại Cần Thơ</li>
                                    <li>Xem thông tin chi tiết về món ăn, nhà hàng (giá cả, địa chỉ, đánh giá)</li>
                                    <li>Đọc và viết đánh giá, bình luận về món ăn và nhà hàng</li>
                                    <li>Nhận gợi ý cá nhân hóa dựa trên sở thích và lịch sử tìm kiếm</li>
                                    <li>Tương tác với chatbot AI để được tư vấn món ăn</li>
                                    <li>Xem video TikTok và hình ảnh liên quan đến món ăn</li>
                                    <li>Truy cập Google Maps để tìm đường đến nhà hàng</li>
                                </ul>
                                <p className="mt-4">
                                    Chúng tôi có quyền thay đổi, tạm ngưng hoặc ngừng cung cấp bất kỳ phần nào của dịch vụ mà không cần
                                    thông báo trước.
                                </p>
                            </div>
                        </Card>

                        {/* Section 3 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">3. Tài khoản người dùng</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">3.1. Đăng ký tài khoản</h4>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Bạn có thể cần tạo tài khoản để sử dụng một số tính năng</li>
                                        <li>Bạn phải cung cấp thông tin chính xác và cập nhật thông tin khi có thay đổi</li>
                                        <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình</li>
                                        <li>Bạn phải thông báo ngay cho chúng tôi nếu phát hiện việc sử dụng trái phép tài khoản</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">3.2. Trách nhiệm tài khoản</h4>
                                    <p>
                                        Bạn chịu trách nhiệm về tất cả hoạt động diễn ra dưới tài khoản của mình. Chúng tôi không chịu
                                        trách nhiệm về bất kỳ tổn thất hoặc thiệt hại nào phát sinh từ việc bạn không bảo mật tài khoản.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">3.3. Chấm dứt tài khoản</h4>
                                    <p>
                                        Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn nếu bạn vi phạm các Điều khoản này hoặc
                                        có hành vi gây hại cho nền tảng hoặc người dùng khác.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Section 4 */}
                        <Card className="p-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-4">4. Quy tắc sử dụng</h3>
                                </div>
                            </div>
                            <div className="space-y-4 text-muted-foreground">
                                <p>Khi sử dụng TasteMuse, bạn đồng ý:</p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                        <p>Sử dụng dịch vụ cho mục đích hợp pháp và phù hợp với các Điều khoản này</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                        <p>Tôn trọng quyền sở hữu trí tuệ của chúng tôi và bên thứ ba</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                        <p>Cung cấp nội dung chính xác, trung thực trong đánh giá và bình luận</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                        <p>Tôn trọng người dùng khác và không có hành vi quấy rối, lạm dụng</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Section 5 */}
                        <Card className="p-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 rounded-xl flex items-center justify-center shrink-0">
                                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-4">5. Hành vi bị cấm</h3>
                                </div>
                            </div>
                            <div className="space-y-4 text-muted-foreground">
                                <p>Bạn KHÔNG được:</p>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <p>Vi phạm pháp luật hoặc quyền của người khác</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <p>Đăng nội dung vi phạm bản quyền, thương hiệu hoặc quyền sở hữu trí tuệ</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <p>Đăng nội dung khiêu dâm, bạo lực, phân biệt đối xử, thù hận hoặc gây khó chịu</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <p>Spam, gửi quảng cáo không mong muốn hoặc nội dung lừa đảo</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <p>Tấn công, hack, hoặc cố gắng truy cập trái phép vào hệ thống</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <p>Sử dụng bot, script hoặc công cụ tự động để truy cập dịch vụ</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <p>Đăng đánh giá giả mạo hoặc có động cơ thương mại không trung thực</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <p>Thu thập thông tin cá nhân của người dùng khác mà không có sự đồng ý</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Section 6 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">6. Nội dung người dùng</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">6.1. Quyền sở hữu</h4>
                                    <p>
                                        Bạn giữ quyền sở hữu đối với nội dung bạn đăng tải (đánh giá, bình luận, hình ảnh). Tuy nhiên, bằng
                                        cách đăng tải, bạn cấp cho TasteMuse quyền sử dụng, sao chép, phân phối, hiển thị và sửa đổi nội
                                        dung đó trên nền tảng của chúng tôi.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">6.2. Trách nhiệm nội dung</h4>
                                    <p>
                                        Bạn chịu trách nhiệm hoàn toàn về nội dung bạn đăng tải. Chúng tôi không chịu trách nhiệm về nội
                                        dung do người dùng tạo ra và có quyền xóa bất kỳ nội dung nào vi phạm Điều khoản này.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-2">6.3. Kiểm duyệt</h4>
                                    <p>
                                        Chúng tôi có quyền (nhưng không có nghĩa vụ) kiểm duyệt, chỉnh sửa hoặc xóa nội dung vi phạm Điều
                                        khoản hoặc gây hại cho cộng đồng.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Section 7 */}
                        <Card className="p-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Scale className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-4">7. Quyền sở hữu trí tuệ</h3>
                                </div>
                            </div>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Tất cả nội dung trên TasteMuse (logo, thiết kế, văn bản, hình ảnh, phần mềm) thuộc quyền sở hữu của
                                    TasteMuse hoặc các bên cấp phép của chúng tôi và được bảo vệ bởi luật sở hữu trí tuệ.
                                </p>
                                <p>
                                    Bạn không được sao chép, sửa đổi, phân phối, bán hoặc khai thác nội dung của chúng tôi mà không có sự
                                    cho phép bằng văn bản.
                                </p>
                            </div>
                        </Card>

                        {/* Section 8 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">8. Dịch vụ bên thứ ba</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    TasteMuse tích hợp với các dịch vụ bên thứ ba như Google Maps, TikTok, và các nhà cung cấp thanh toán.
                                    Việc sử dụng các dịch vụ này tuân theo điều khoản và chính sách của họ.
                                </p>
                                <p>
                                    Chúng tôi không chịu trách nhiệm về nội dung, chính sách hoặc hoạt động của các dịch vụ bên thứ ba.
                                </p>
                            </div>
                        </Card>

                        {/* Section 9 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">9. Thanh toán và hoàn tiền</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Nếu TasteMuse cung cấp các dịch vụ trả phí (ví dụ: đặt bàn, đặt món), các điều khoản thanh toán và
                                    hoàn tiền sẽ được nêu rõ tại thời điểm giao dịch.
                                </p>
                                <p>
                                    Tất cả các khoản thanh toán là cuối cùng và không hoàn lại, trừ khi có quy định khác hoặc theo yêu cầu
                                    của pháp luật.
                                </p>
                            </div>
                        </Card>

                        {/* Section 10 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">10. Tuyên bố miễn trừ trách nhiệm</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                    <p className="text-sm text-amber-900 dark:text-amber-200">
                                        <strong>DỊCH VỤ ĐƯỢC CUNG CẤP "NGUYÊN TRẠNG" VÀ "NHƯ CÓ SẴN".</strong>
                                    </p>
                                </div>
                                <p>
                                    Chúng tôi không đảm bảo rằng dịch vụ sẽ không bị gián đoạn, không có lỗi, an toàn hoặc không có virus.
                                    Chúng tôi không chịu trách nhiệm về:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Độ chính xác, đầy đủ hoặc độ tin cậy của thông tin trên nền tảng</li>
                                    <li>Chất lượng món ăn, dịch vụ nhà hàng hoặc trải nghiệm thực tế của bạn</li>
                                    <li>Hành vi của người dùng khác hoặc nhà hàng</li>
                                    <li>Mất mát hoặc thiệt hại phát sinh từ việc sử dụng dịch vụ</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 11 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">11. Giới hạn trách nhiệm</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Trong phạm vi tối đa được pháp luật cho phép, TasteMuse và các đối tác của chúng tôi sẽ không chịu
                                    trách nhiệm về bất kỳ thiệt hại trực tiếp, gián tiếp, ngẫu nhiên, đặc biệt hoặc hậu quả nào phát sinh
                                    từ:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Việc sử dụng hoặc không thể sử dụng dịch vụ</li>
                                    <li>Truy cập trái phép vào dữ liệu của bạn</li>
                                    <li>Lỗi, virus hoặc sự cố kỹ thuật</li>
                                    <li>Nội dung hoặc hành vi của bên thứ ba</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 12 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">12. Bồi thường</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Bạn đồng ý bồi thường, bảo vệ và giữ cho TasteMuse, các giám đốc, nhân viên và đối tác của chúng tôi
                                    không bị tổn hại khỏi bất kỳ khiếu nại, thiệt hại, chi phí hoặc trách nhiệm nào phát sinh từ:
                                </p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Vi phạm Điều khoản này của bạn</li>
                                    <li>Vi phạm quyền của bên thứ ba</li>
                                    <li>Nội dung bạn đăng tải</li>
                                    <li>Hành vi sử dụng dịch vụ của bạn</li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 13 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">13. Giải quyết tranh chấp</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Mọi tranh chấp phát sinh từ hoặc liên quan đến Điều khoản này sẽ được giải quyết thông qua thương
                                    lượng thiện chí. Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết theo pháp luật Việt Nam.
                                </p>
                                <p>
                                    Tòa án có thẩm quyền tại Cần Thơ, Việt Nam sẽ có quyền tài phán độc quyền đối với bất kỳ tranh chấp
                                    nào.
                                </p>
                            </div>
                        </Card>

                        {/* Section 14 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">14. Thay đổi điều khoản</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Chúng tôi có quyền sửa đổi các Điều khoản này bất kỳ lúc nào. Chúng tôi sẽ thông báo cho bạn về các
                                    thay đổi quan trọng qua email hoặc thông báo trên nền tảng.
                                </p>
                                <p>
                                    Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận Điều khoản mới.
                                    Nếu bạn không đồng ý, vui lòng ngừng sử dụng dịch vụ.
                                </p>
                            </div>
                        </Card>

                        {/* Section 15 */}
                        <Card className="p-8">
                            <h3 className="text-xl md:text-2xl font-bold mb-4">15. Điều khoản chung</h3>
                            <div className="space-y-4 text-muted-foreground">
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>
                                        <strong>Toàn bộ thỏa thuận:</strong> Điều khoản này cấu thành toàn bộ thỏa thuận giữa bạn và
                                        TasteMuse
                                    </li>
                                    <li>
                                        <strong>Tính độc lập:</strong> Nếu bất kỳ điều khoản nào bị vô hiệu, các điều khoản còn lại vẫn có
                                        hiệu lực
                                    </li>
                                    <li>
                                        <strong>Không từ bỏ quyền:</strong> Việc chúng tôi không thực thi quyền không đồng nghĩa với việc từ
                                        bỏ quyền đó
                                    </li>
                                    <li>
                                        <strong>Chuyển nhượng:</strong> Bạn không được chuyển nhượng quyền của mình mà không có sự đồng ý
                                        của chúng tôi
                                    </li>
                                </ul>
                            </div>
                        </Card>

                        {/* Section 16 */}
                        <Card className="p-8">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-4">16. Liên hệ</h3>
                                </div>
                            </div>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng này, vui lòng liên hệ:
                                </p>
                                <div className="bg-muted/50 p-6 rounded-lg space-y-2">
                                    <p><strong>TasteMuse</strong></p>
                                    <p>Email: <a href="mailto:legal@tastemuse.com" className="text-primary hover:underline">legal@tastemuse.com</a></p>
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
                        <h2 className="text-3xl md:text-4xl font-bold">Bạn đã sẵn sàng khám phá?</h2>
                        <p className="text-lg text-primary-foreground/90">
                            Bắt đầu tìm kiếm món ăn ngon và nhà hàng tuyệt vời tại Cần Thơ
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link href="/dishes">
                                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-primary-foreground text-primary">
                                    Khám phá ngay
                                    <CheckCircle className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link href="/privacy">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                                >
                                    Xem chính sách bảo mật
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
