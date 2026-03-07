import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Star } from "lucide-react"

export function TopRatedInsights({ stats }: { stats: any }) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Rated Restaurants */}
            <Card className="border-2 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Top 5 Nhà Hàng Nổi Bật
                    </CardTitle>
                    <CardDescription>Nhà hàng có điểm đánh giá trung bình cao nhất.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-y-auto custom-scrollbar pr-4">
                    <div className="space-y-4">
                        {(stats?.topRestaurants || []).map((item: any, idx: number) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 border border-orange-100 hover:bg-orange-50 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0 font-black text-orange-600">
                                        #{idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            {item.count} lượt đánh giá
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 font-black text-orange-500 bg-white px-2 py-1 rounded-lg shadow-sm">
                                    <span>{Number(item.avg).toFixed(1)}</span>
                                    <Star className="w-4 h-4 fill-orange-500" />
                                </div>
                            </div>
                        ))}
                        {(!stats?.topRestaurants || stats.topRestaurants.length === 0) && (
                            <div className="text-center text-muted-foreground italic pt-4 font-medium">Chưa có đủ dữ liệu đánh giá.</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Top Rated Dishes */}
            <Card className="border-2 shadow-sm rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-rose-500" />
                        Top 5 Món Ăn Yêu Thích
                    </CardTitle>
                    <CardDescription>Món ăn có điểm đánh giá trung bình cao nhất.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-y-auto custom-scrollbar pr-4">
                    <div className="space-y-4">
                        {(stats?.topDishes || []).map((item: any, idx: number) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-100 hover:bg-rose-50 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0 font-black text-rose-600">
                                        #{idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            {item.count} lượt đánh giá
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 font-black text-rose-500 bg-white px-2 py-1 rounded-lg shadow-sm">
                                    <span>{Number(item.avg).toFixed(1)}</span>
                                    <Star className="w-4 h-4 fill-rose-500" />
                                </div>
                            </div>
                        ))}
                        {(!stats?.topDishes || stats.topDishes.length === 0) && (
                            <div className="text-center text-muted-foreground italic pt-4 font-medium">Chưa có đủ dữ liệu đánh giá.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
