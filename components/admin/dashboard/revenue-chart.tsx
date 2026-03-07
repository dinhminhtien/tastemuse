import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { CreditCard } from "lucide-react"

export function RevenueChart({ stats }: { stats: any }) {
    if (!stats) return null;

    return (
        <Card className="border-2 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    Biểu đồ tăng trưởng doanh thu
                </CardTitle>
                <CardDescription>Doanh thu từ việc bán gói Premium (VND).</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.revenueChart || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(val) => val.split('-').slice(1).join('/')}
                            stroke="#64748B"
                            fontSize={12}
                        />
                        <YAxis
                            stroke="#64748B"
                            fontSize={12}
                            tickFormatter={(val) => `${val / 1000}k`}
                        />
                        <Tooltip
                            formatter={(val: any) => new Intl.NumberFormat('vi-VN').format(val) + " đ"}
                            contentStyle={{ borderRadius: '12px', border: '2px solid #E2E8F0' }}
                        />
                        <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
