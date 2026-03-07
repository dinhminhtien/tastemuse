import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, ShieldCheck, CreditCard, Activity, Store, Utensils, MessageSquare } from "lucide-react"

export function QuickStats({ stats }: { stats: any }) {
    if (!stats) return null;

    return (
        <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 shadow-sm rounded-2xl hover:shadow-xl transition-all border-l-4 border-l-blue-500 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-black uppercase text-slate-500">Người dùng</CardTitle>
                        <Users className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-800">{stats?.totalUsers || 0}</div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-green-500" />
                            +12% so với tháng trước
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm rounded-2xl hover:shadow-xl transition-all border-l-4 border-l-amber-500 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-black uppercase text-slate-500">Hội viên Premium</CardTitle>
                        <ShieldCheck className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-800">{stats?.premiumUsers || 0}</div>
                        <p className="text-xs text-slate-400 mt-1 italic">
                            {((stats?.premiumUsers / (stats?.totalUsers || 1)) * 100).toFixed(1)}% tỉ lệ chuyển đổi
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm rounded-2xl hover:shadow-xl transition-all border-l-4 border-l-green-500 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-black uppercase text-slate-500">Doanh thu</CardTitle>
                        <CreditCard className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-800">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats?.totalRevenue || 0)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Tổng từ khi đi vào hoạt động</p>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm rounded-2xl hover:shadow-xl transition-all border-l-4 border-l-purple-500 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-black uppercase text-slate-500">Hoạt động (30 ngày)</CardTitle>
                        <Activity className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-800">{stats?.totalActions || 0}</div>
                        <p className="text-xs text-slate-400 mt-1 italic">Tương tác AI & Đánh giá</p>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 shadow-sm rounded-2xl hover:shadow-xl transition-all border-l-4 border-l-rose-500 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-black uppercase text-slate-500">Tổng quan nhà hàng</CardTitle>
                        <Store className="h-5 w-5 text-rose-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-800">{stats?.totalRestaurants || 0}</div>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm rounded-2xl hover:shadow-xl transition-all border-l-4 border-l-orange-500 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-black uppercase text-slate-500">Món ăn hệ thống</CardTitle>
                        <Utensils className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-800">{stats?.totalDishes || 0}</div>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm rounded-2xl hover:shadow-xl transition-all border-l-4 border-l-cyan-500 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-black uppercase text-slate-500">Lượt đánh giá</CardTitle>
                        <MessageSquare className="h-5 w-5 text-cyan-500 group-hover:scale-110 transition-transform" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-800">{stats?.totalReviews || 0}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
