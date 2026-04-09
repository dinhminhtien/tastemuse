import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Radar, AlertTriangle, Lightbulb, ServerCrash } from "lucide-react"

export function PredictiveRadar({ stats }: { stats: any }) {
    if (!stats || !stats.predictiveAlerts) return null;

    const { predictiveAlerts } = stats;

    const getIcon = (type: string) => {
        switch (type) {
            case 'risk': return <AlertTriangle className="w-5 h-5 text-rose-600" />;
            case 'opportunity': return <Lightbulb className="w-5 h-5 text-amber-500" />;
            case 'system': return <ServerCrash className="w-5 h-5 text-indigo-500" />;
            default: return <Radar className="w-5 h-5 text-slate-500" />;
        }
    }

    const getColors = (type: string) => {
        switch (type) {
            case 'risk': return "bg-rose-50 border-rose-200 text-rose-800";
            case 'opportunity': return "bg-amber-50 border-amber-200 text-amber-800";
            case 'system': return "bg-indigo-50 border-indigo-200 text-indigo-800";
            default: return "bg-slate-50 border-slate-200 text-slate-800";
        }
    }

    return (
        <Card className="col-span-1 md:col-span-3 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all mt-6">
            <CardHeader className="bg-slate-900 text-white pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-800 rounded-lg">
                        <Radar className="w-5 h-5 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            Predictive AI Radar
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/30">Beta</span>
                        </CardTitle>
                        <CardDescription className="text-sm font-medium text-slate-400">
                            Cảnh báo rủi ro & Cơ hội kinh doanh do AI dự báo từ dữ liệu tuần qua.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {predictiveAlerts.map((alert: any, idx: number) => (
                        <div
                            key={idx}
                            className={`p-5 rounded-2xl border-2 shadow-sm flex flex-col gap-3 transition-transform hover:-translate-y-1 ${getColors(alert.type)}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                    {getIcon(alert.type)}
                                </div>
                                <h4 className="font-black text-lg leading-tight">{alert.title}</h4>
                            </div>
                            <p className="text-sm font-medium opacity-90 leading-relaxed mt-2">
                                {alert.description}
                            </p>
                            <div className="mt-auto pt-4 border-t border-black/10">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">Đề xuất hành động:</p>
                                <p className="text-sm font-bold">{alert.action}</p>
                            </div>
                        </div>
                    ))}

                    {predictiveAlerts.length === 0 && (
                        <div className="col-span-3 text-center py-12 text-slate-500 font-medium italic">
                            Hệ thống AI đang thu thập dữ liệu, chưa có cảnh báo mới.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
