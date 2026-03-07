import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Zap } from "lucide-react"

export function UserGrowthMatrix({ stats }: { stats: any }) {
    if (!stats || !stats.activeUsers) return null;

    const { activeUsers } = stats;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 shadow-sm rounded-2xl hover:shadow-xl transition-all overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-500/10 to-transparent">
                    <CardTitle className="text-sm font-black uppercase text-slate-500">MAU (30 Ngày)</CardTitle>
                    <Users className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="text-3xl font-black text-slate-800">{activeUsers.mau || 0}</div>
                    <p className="text-xs text-slate-400 mt-1">
                        Người dùng kích hoạt
                    </p>
                </CardContent>
            </Card>

            <Card className="border-2 shadow-sm rounded-2xl hover:shadow-xl transition-all overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-teal-500/10 to-transparent">
                    <CardTitle className="text-sm font-black uppercase text-slate-500">WAU (7 Ngày)</CardTitle>
                    <UserPlus className="h-5 w-5 text-teal-500 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="text-3xl font-black text-slate-800">{activeUsers.wau || 0}</div>
                    <p className="text-xs text-slate-400 mt-1">
                        Người dùng kích hoạt
                    </p>
                </CardContent>
            </Card>

            <Card className="border-2 shadow-sm rounded-2xl hover:shadow-xl transition-all overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-rose-500/10 to-transparent">
                    <CardTitle className="text-sm font-black uppercase text-slate-500">DAU (Hôm nay)</CardTitle>
                    <Zap className="h-5 w-5 text-rose-500 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="text-3xl font-black text-slate-800">{activeUsers.dau || 0}</div>
                    <p className="text-xs text-slate-400 mt-1">
                        Người dùng kích hoạt
                    </p>
                </CardContent>
            </Card>

            <Card className="border-2 shadow-sm rounded-2xl hover:shadow-xl transition-all overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-purple-500/10 to-transparent">
                    <CardTitle className="text-sm font-black uppercase text-slate-500">Stickiness Rate</CardTitle>
                    <Activity className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="text-3xl font-black text-slate-800">{activeUsers.stickiness}%</div>
                    <p className="text-xs text-slate-400 mt-1 italic">
                        DAU / MAU Ratio
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
import { Activity } from "lucide-react";
