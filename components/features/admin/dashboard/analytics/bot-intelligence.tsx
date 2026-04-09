import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts"
import { Bot, MessageSquare } from "lucide-react"

export function BotIntelligence({ stats }: { stats: any }) {
    if (!stats || !stats.botSuccessRate || !stats.intentsData) return null;

    const { botSuccessRate, intentsData } = stats;

    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* KPI Card */}
            <Card className="col-span-1 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="bg-slate-50/50 pb-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Bot className="w-5 h-5 text-indigo-600" />
                        </div>
                        <CardTitle className="text-xl font-bold">Hiệu suất Chatbot</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-40 h-40 flex items-center justify-center bg-slate-50 rounded-full border-[12px] border-slate-100">
                        {/* Fake Donut Chart via SVG for KPI */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                                cx="50%"
                                cy="50%"
                                r="48%"
                                className="fill-transparent stroke-emerald-500"
                                strokeWidth="8%"
                                strokeDasharray={`${botSuccessRate.success} 100`}
                                pathLength="100"
                            />
                        </svg>
                        <div className="text-center">
                            <div className="text-4xl font-black text-slate-800">{botSuccessRate.success}%</div>
                            <div className="text-xs font-bold text-slate-500 uppercase mt-1">Success</div>
                        </div>
                    </div>

                    <div className="w-full flex justify-between px-4 text-sm font-medium pt-4 border-t">
                        <div className="text-slate-500">
                            Loại bỏ (Fallback): <span className="text-rose-500 font-bold">{botSuccessRate.fallback}%</span>
                        </div>
                        <div className="text-slate-500">
                            Tổng Log: <span className="text-indigo-600 font-bold">{botSuccessRate.totalConversations}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Intents Distribution */}
            <Card className="col-span-1 lg:col-span-2 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="bg-slate-50/50 pb-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                Phân bổ Ý định (Intent Distribution)
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">
                                Chủ đề phổ biến nhất mà User hỏi chatbot hệ thống.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={intentsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                />
                                <RechartsTooltip
                                    cursor={{ fill: '#F1F5F9' }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {intentsData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
