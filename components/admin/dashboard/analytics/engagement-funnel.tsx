import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Filter, Users } from "lucide-react"

export function EngagementFunnel({ stats }: { stats: any }) {
    if (!stats || !stats.funnelData) return null;

    const { funnelData } = stats;
    const maxVal = funnelData.length > 0 ? funnelData[0].value : 1;

    // We can use a simple CSS trick to draw a basic funnel (or horizontally stacked bars to simulate one)
    return (
        <Card className="col-span-1 md:col-span-2 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
            <CardHeader className="bg-slate-50/50 pb-4 border-b">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Filter className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            Engagement Funnel (Phễu Chuyển Đổi)
                        </CardTitle>
                        <CardDescription className="text-sm font-medium">
                            Đo lường sự rơi rụng của người dùng từ bước vào trang chủ đến khi thực hiện hành động.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-8 pb-8">
                <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto items-center">
                    {funnelData.map((step: any, index: number) => {
                        const prevVal = index > 0 ? funnelData[index - 1].value : step.value;
                        const dropOff = prevVal > 0 ? ((prevVal - step.value) / prevVal * 100).toFixed(1) : 0;
                        const widthPct = (step.value / maxVal) * 100;

                        return (
                            <div key={index} className="w-full flex items-center justify-center relative group">
                                {/* The 'funnel' step visual */}
                                <div
                                    className={`relative flex items-center justify-center rounded-xl p-3 shadow-sm transition-all
                                        ${index === 0 ? "bg-blue-500 text-white" :
                                            index === 1 ? "bg-teal-500 text-white" :
                                                index === 2 ? "bg-orange-500 text-white" :
                                                    "bg-emerald-500 text-white"}
                                    `}
                                    style={{ width: `${Math.max(widthPct, 20)}%`, minHeight: '60px' }}
                                >
                                    <div className="flex justify-between w-full px-4 items-center gap-4">
                                        <span className="font-bold whitespace-nowrap">{step.name}</span>
                                        <div className="flex items-center gap-2 font-black text-xl">
                                            {step.value} <Users className="w-4 h-4 opacity-70" />
                                        </div>
                                    </div>

                                    {/* Tooltip showing dropoff */}
                                    {index > 0 && (
                                        <div className="absolute -left-32 text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
                                            -{dropOff}% drop-off
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
