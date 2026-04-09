import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchX, ServerCrash, Zap } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts"

export function SearchSystemOps({ stats }: { stats: any }) {
    if (!stats || !stats.zeroResultQueries || !stats.latencyData) return null;

    const { zeroResultQueries, latencyData } = stats;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* System Latency Trend */}
            <Card className="col-span-1 lg:col-span-2 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="bg-slate-50/50 pb-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Zap className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                API & Search Latency
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">
                                Độ trễ truy vấn trung bình (ms) của hệ thống trong 24 giờ.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={latencyData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorVector" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorFTS" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                    tickFormatter={(val) => `${val}ms`}
                                />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`${value} ms`, undefined]}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                    wrapperStyle={{ paddingBottom: '20px', fontWeight: 600, fontSize: '13px' }}
                                />
                                <Area
                                    name="Vector Search (AI)"
                                    type="monotone"
                                    dataKey="vector"
                                    stroke="#f43f5e"
                                    fillOpacity={1}
                                    fill="url(#colorVector)"
                                    strokeWidth={3}
                                />
                                <Area
                                    name="Full-Text Search"
                                    type="monotone"
                                    dataKey="fts"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorFTS)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Zero Results Queries */}
            <Card className="col-span-1 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="bg-slate-50/50 pb-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-rose-100 rounded-lg">
                            <SearchX className="w-5 h-5 text-rose-600" />
                        </div>
                        <CardTitle className="text-xl font-bold">Lỗi truy vấn (0 Result)</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {zeroResultQueries.map((query: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-2 border-b last:border-0 pb-4 last:pb-0">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                            "{query.query}"
                                        </span>
                                        <p className="text-xs text-slate-500 font-medium flex-items-center gap-1">
                                            {query.last_searched}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-lg font-black text-rose-500">{query.count}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Hits</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {zeroResultQueries.length === 0 && (
                            <div className="text-center py-8 text-slate-500 font-medium italic">
                                Không có truy vấn lỗi mới.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
