import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { SmilePlus, History, Activity } from "lucide-react"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function SentimentAndLogs({ stats }: { stats: any }) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sentiment Analysis Chart */}
            <Card className="border-2 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SmilePlus className="w-5 h-5 text-pink-500" />
                        Phân tích cảm xúc
                    </CardTitle>
                    <CardDescription>Cảm xúc từ các nhận xét của người dùng.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats?.sentimentChart || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {(stats?.sentimentChart || []).map((entry: any, index: number) => {
                                    const colorMap: any = { 'positive': '#10b981', 'neutral': '#fbbf24', 'negative': '#ef4444' }
                                    return <Cell key={`cell-${index}`} fill={colorMap[entry.name] || COLORS[index % COLORS.length]} />
                                })}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Recent Activity Log */}
            <Card className="border-2 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-500" />
                        Hoạt động gần đây
                    </CardTitle>
                    <CardDescription>10 hành động tương tác mới nhất của User.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] overflow-y-auto custom-scrollbar pr-4">
                    <div className="space-y-4">
                        {(stats?.recentActivity || []).map((log: any) => (
                            <div key={log.id} className="flex items-start gap-4 p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Activity className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800">
                                        {log.action_type === 'ai_chat' ? 'Trò chuyện với AI' : log.action_type === 'hybrid_search' ? 'Tìm kiếm món ăn' : log.action_type}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate font-medium">Data: {log.query}</p>
                                </div>
                                <div className="text-xs font-semibold text-slate-400 whitespace-nowrap">
                                    {new Date(log.created_at).toLocaleString('vi-VN')}
                                </div>
                            </div>
                        ))}
                        {(!stats?.recentActivity || stats.recentActivity.length === 0) && (
                            <div className="text-center text-muted-foreground italic pt-8 font-medium">Chưa có hoạt động nào gần đây.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
