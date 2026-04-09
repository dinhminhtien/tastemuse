import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { TrendingUp } from "lucide-react"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ActivityCharts({ stats }: { stats: any }) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Activity Chart */}
            <Card className="border-2 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Biểu đồ hoạt động hệ thống
                    </CardTitle>
                    <CardDescription>Số lượng tương tác mỗi ngày của người dùng.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.activityChart || []}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                stroke="#64748B"
                                fontSize={12}
                            />
                            <YAxis stroke="#64748B" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: '2px solid #E2E8F0',
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Popular Actions Chart */}
            <Card className="border-2 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Phân bổ hành vi người dùng</CardTitle>
                    <CardDescription>Các loại hành động phổ biến nhất trên hệ thống.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats?.popularActions || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {(stats?.popularActions || []).map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
