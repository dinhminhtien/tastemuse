import { Card, CardContent } from "@/components/ui/card"
import { Users, ShieldCheck, CreditCard, Activity, Store, Utensils, MessageSquare, ArrowUpRight } from "lucide-react"

export function QuickStats({ stats }: { stats: any }) {
    if (!stats) return null;

    const mainStats = [
        {
            title: "Người dùng",
            value: stats?.totalUsers || 0,
            icon: Users,
            color: "blue",
            bg: "bg-blue-500/10",
            text: "text-blue-600",
            border: "border-blue-100",
            description: "Tổng số người dùng đăng ký"
        },
        {
            title: "Hội viên Premium",
            value: stats?.premiumUsers || 0,
            icon: ShieldCheck,
            color: "amber",
            bg: "bg-amber-500/10",
            text: "text-amber-600",
            border: "border-amber-100",
            description: `${((stats?.premiumUsers / (stats?.totalUsers || 1)) * 100).toFixed(1)}% tỉ lệ chuyển đổi`
        },
        {
            title: "Doanh thu",
            value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.totalRevenue || 0),
            icon: CreditCard,
            color: "emerald",
            bg: "bg-emerald-500/10",
            text: "text-emerald-600",
            border: "border-emerald-100",
            description: "Tổng doanh thu toàn thời gian"
        },
        {
            title: "Hoạt động",
            value: stats?.totalActions || 0,
            icon: Activity,
            color: "purple",
            bg: "bg-purple-500/10",
            text: "text-purple-600",
            border: "border-purple-100",
            description: "Tương tác AI & Đánh giá"
        }
    ];

    const secondaryStats = [
        { title: "Nhà hàng", value: stats?.totalRestaurants || 0, icon: Store, color: "rose" },
        { title: "Món ăn", value: stats?.totalDishes || 0, icon: Utensils, color: "orange" },
        { title: "Đánh giá", value: stats?.totalReviews || 0, icon: MessageSquare, color: "cyan" }
    ];

    return (
        <div className="space-y-8">
            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mainStats.map((stat, i) => (
                    <Card key={i} className={`relative overflow-hidden border-2 ${stat.border} shadow-sm hover:shadow-xl transition-all duration-300 group rounded-4xl bg-white`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500`} />
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between relative z-10">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{stat.title}</p>
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.text}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-1 relative z-10">
                                <span className={`text-[11px] font-bold ${stat.text} bg-white px-2 py-0.5 rounded-full border shadow-sm`}>
                                    {stat.description}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {secondaryStats.map((stat, i) => (
                    <Card key={i} className="border-2 border-slate-100 shadow-sm rounded-3xl hover:border-primary/20 hover:shadow-md transition-all bg-slate-50/50 backdrop-blur-sm group">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl bg-white shadow-sm text-${stat.color}-500`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                                    <div className="text-2xl font-black text-slate-800">{stat.value}</div>
                                </div>
                                <ArrowUpRight className="ml-auto w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
