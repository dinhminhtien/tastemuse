import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, MapPin } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function CulinaryTrends({ stats }: { stats: any }) {
    if (!stats || !stats.trendingDishes || !stats.geoData) return null;

    const { trendingDishes, unfulfilledFoods, geoData } = stats;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Trending Dishes */}
            <Card className="col-span-1 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="bg-slate-50/50 pb-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Flame className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                Culinary Trend Radar
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">
                                Món ăn & Khẩu vị đang lên ngôi
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Top Món Ăn Trending</h4>
                        <div className="space-y-4">
                            {trendingDishes.map((dish: any, idx: number) => (
                                <div key={dish.id} className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-slate-400 w-4">{idx + 1}.</span>
                                            <span className="font-bold text-slate-700">{dish.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-xs">{dish.growth}</span>
                                            <span className="text-slate-500 font-medium">{dish.searches} Lượt tìm</span>
                                        </div>
                                    </div>
                                    <Progress value={(dish.searches / trendingDishes[0].searches) * 100} className="h-1.5" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 text-rose-500 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                            Nhu cầu chưa được đáp ứng
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {unfulfilledFoods.map((food: any, idx: number) => (
                                <div key={idx} className="bg-slate-100 border text-slate-600 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                                    {food.name}
                                    <span className="text-xs text-rose-500 font-bold bg-white px-1.5 rounded-md">{food.searches}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Geographic Heat */}
            <Card className="col-span-1 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="bg-slate-50/50 pb-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                Phân bổ địa lý (Geographic Heat)
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">
                                Nhu cầu tìm kiếm theo khu vực
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {geoData.map((geo: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-slate-700">{geo.district}</span>
                                    <span className="text-slate-500 font-medium">{geo.value}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-indigo-500 h-2.5 rounded-full"
                                        style={{ width: `${geo.value}%`, opacity: Math.max(0.4, geo.value / 100) }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
