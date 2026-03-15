import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, ArrowRight, Banknote, Wallet } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts"
import { formatCurrency } from "@/lib/utils"

export function MonetizationMetrics({ stats }: { stats: any }) {
    if (!stats || !stats.conversionData || !stats.mrrData) return null;

    const { activeSubsCount, mrrVND, arpuVND, conversionData, paywallHits, mrrData } = stats;

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-linear-to-r from-emerald-500/10 to-transparent">
                        <CardTitle className="text-sm font-black uppercase text-slate-500">MRR (Doanh thu tháng)</CardTitle>
                        <Banknote className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-black text-slate-800">{formatCurrency(mrrVND)}</div>
                        <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">
                            Monthly Recurring Revenue
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-linear-to-r from-indigo-500/10 to-transparent">
                        <CardTitle className="text-sm font-black uppercase text-slate-500">Active Subscriptions</CardTitle>
                        <CreditCard className="h-5 w-5 text-indigo-500" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-black text-slate-800">{activeSubsCount || 0}</div>
                        <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">
                            Người dùng đang trả phí
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-linear-to-r from-amber-500/10 to-transparent">
                        <CardTitle className="text-sm font-black uppercase text-slate-500">ARPU</CardTitle>
                        <Wallet className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-black text-slate-800">{formatCurrency(arpuVND)}</div>
                        <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">
                            Average Revenue Per User
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* MRR Chart */}
                <Card className="col-span-1 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white">
                    <CardHeader className="bg-slate-50/50 pb-4 border-b">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            Tăng trưởng MRR (VND)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mrrData} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748B', fontSize: 10 }}
                                        tickFormatter={(value) => `${value >= 1000000 ? (value/1000000).toFixed(1) + 'M' : value.toLocaleString()}`}
                                    />
                                    <RechartsTooltip
                                        cursor={{ fill: '#F1F5F9' }}
                                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                                    />
                                    <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Conversion Pipeline & Paywall */}
                <Card className="col-span-1 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                    <CardHeader className="bg-slate-50/50 pb-4 border-b">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            Paywall Hits & Conversion
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">

                        {/* Fake Pipeline */}
                        <div className="flex border rounded-xl overflow-hidden shadow-sm h-12">
                            {conversionData.map((stage: any, idx: number) => (
                                <div
                                    key={idx}
                                    className={`flex items-center justify-center text-xs font-bold px-2 relative transition-all`}
                                    style={{
                                        width: `${Math.max(20, (stage.count / conversionData[0].count) * 100)}%`,
                                        backgroundColor: COLORS[idx % COLORS.length],
                                        color: 'white',
                                        zIndex: conversionData.length - idx
                                    }}
                                    title={`${stage.stage}: ${stage.count}`}
                                >
                                    {idx > 0 && <ArrowRight className="absolute -left-3 w-6 h-6 text-white/50" />}
                                    <span className="hidden sm:inline">{stage.stage}</span>
                                    <span className="sm:hidden">{stage.count}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-500 px-2 mt-2">
                            <span>{conversionData[0]?.count || 0} Users</span>
                            {conversionData[0]?.count > 0 && (
                                <span className="text-emerald-500">{((conversionData[conversionData.length - 1]?.count || 0) / conversionData[0].count * 100).toFixed(1)}% Conversion</span>
                            )}
                        </div>

                        {/* Paywall breakdown */}
                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-bold text-slate-500 uppercase mb-4">Lý do chạm Paywall (Feature Gating)</h4>
                            <div className="space-y-4">
                                {paywallHits.map((hit: any, idx: number) => (
                                    <div key={idx} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between text-sm font-bold text-slate-700">
                                            <span>{hit.feature}</span>
                                            <span>{hit.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${hit.percentage}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
