"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import { ChevronDown, CreditCard, ShoppingBag, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils/utils"

interface RevenueDashboardProps {
    stats: any
    period: string
    onPeriodChange: (period: string) => void
    loading?: boolean
}

export function RevenueDashboard({ stats, period, onPeriodChange, loading }: RevenueDashboardProps) {
    if (!stats || !stats.paymentStats) return null;

    const { totalRevenueVND, totalOrders, statusBreakdown, providerRevenue, dailyRevenue } = stats.paymentStats;

    const filterOptions = [
        { label: "Hôm qua", value: "yesterday" },
        { label: "Hôm nay", value: "today" },
        { label: "Tuần này", value: "week" },
        { label: "Tháng này", value: "month" },
        { label: "Tháng trước", value: "lastMonth" },
        { label: "Năm nay", value: "year" },
        { label: "Năm trước", value: "lastYear" }];

    return (
        <div className="space-y-6 relative">
            {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-50 flex items-center justify-center rounded-3xl">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {filterOptions.map((opt) => (
                    <Button
                        key={opt.value}
                        variant={period === opt.value ? "default" : "outline"}
                        onClick={() => onPeriodChange(opt.value)}
                        className={`rounded-full px-6 h-10 font-bold transition-all ${period === opt.value
                            ? "bg-[#00a86b] hover:bg-[#008f5d] text-white border-transparent shadow-md"
                            : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                            }`}
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-[#00a86b] border-none text-white rounded-2xl overflow-hidden relative group shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500" />
                    <CardHeader className="pb-2 relative">
                        <CardTitle className="text-xl font-bold opacity-90">Tổng doanh thu {filterOptions.find(o => o.value === period)?.label.toLowerCase()}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                        <div className="text-4xl font-black">{formatCurrency(totalRevenueVND)}</div>
                    </CardContent>
                </Card>

                <Card className="bg-[#e7f5ef] border-transparent text-[#00a86b] rounded-2xl md:max-w-md shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-bold opacity-90">Tổng đơn hoàn thành</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">
                            {totalOrders} <span className="text-2xl font-bold">đơn hàng</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Provider Revenue List */}
                <Card className="bg-white border-slate-200 border-2 rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-500">Thu theo kênh thanh toán</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {providerRevenue.length > 0 ? (
                            providerRevenue.map((p: any, i: number) => (
                                <div key={p.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border-l-4 border-[#00a86b]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                                            <ShoppingBag className="w-5 h-5 text-[#00a86b]" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kênh: TasteMuse</p>
                                            <p className="font-bold text-slate-700">TasteMuse Payments</p>
                                        </div>
                                    </div>
                                    <div className="text-xl font-black text-slate-800 whitespace-nowrap">
                                        {formatCurrency(p.value)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 italic">
                                Chưa có dữ liệu thu nhập
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right: Order Status Donut */}
                <Card className="bg-white border-slate-200 border-2 rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-500">Thống kê trạng thái đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="relative min-h-[300px] flex flex-col items-center justify-center pt-0">
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={statusBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusBreakdown.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-10px]">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Tổng đơn hàng</p>
                            <p className="text-4xl font-black text-slate-800 leading-none">
                                {statusBreakdown.reduce((a: number, b: any) => a + b.value, 0)}
                            </p>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap justify-center gap-4 mt-2">
                            {statusBreakdown.filter((s: any) => s.value > 0).map((entry: any) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-xs font-bold text-slate-500">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom: Bar Chart */}
            <Card className="bg-white border-slate-200 border-2 rounded-2xl overflow-hidden shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-500">Biểu đồ doanh thu chi tiết</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyRevenue} margin={{ top: 10, right: 10, left: 40, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }}
                                    angle={-45}
                                    textAnchor="end"
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 700 }}
                                    tickFormatter={(value) => `${value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : value.toLocaleString()}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}
                                    formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                                />
                                <Bar
                                    dataKey="amount"
                                    fill="#00a86b"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

