import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts"
import { Sparkles } from "lucide-react"

export function RecommendationPerformance({ stats }: { stats: any }) {
    if (!stats || !stats.recommendationData) return null;

    const { recommendationData, tasteProfileCoverage } = stats;

    return (
        <Card className="col-span-1 md:col-span-3 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="bg-slate-50/50 pb-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            Hiệu suất AI Recommendation
                        </CardTitle>
                        <CardDescription className="text-sm font-medium">
                            So sánh tỷ lệ Click-Through-Rate (CTR) giữa Gợi ý Cá nhân hóa (AI) và Trending.
                        </CardDescription>
                    </div>
                </div>

                {/* Mini Coverage Badge */}
                <div className="bg-white border rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
                    <div className="text-sm font-bold text-slate-500">Độ phủ Hồ sơ Khẩu vị:</div>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${tasteProfileCoverage}%` }}
                            />
                        </div>
                        <span className="font-black text-emerald-600">{tasteProfileCoverage}%</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={recommendationData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748B', fontSize: 12 }}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <RechartsTooltip
                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`${value}%`, undefined]}
                            />
                            <Legend
                                verticalAlign="top"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ paddingBottom: '20px', fontWeight: 600, fontSize: '13px' }}
                            />
                            <Line
                                name="AI Personalized (Dành cho bạn)"
                                type="monotone"
                                dataKey="personalized"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Line
                                name="Trending (Khám phá chung)"
                                type="monotone"
                                dataKey="trending"
                                stroke="#94a3b8"
                                strokeWidth={3}
                                strokeDasharray="5 5"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
