import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, HeartPulse, Medal } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function CommunityHealth({ stats }: { stats: any }) {
    if (!stats || !stats.reviewVolumeData || !stats.topContributors) return null;

    const { reviewVolumeData, topContributors } = stats;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Review Sentiment Trend */}
            <Card className="col-span-1 lg:col-span-2 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="bg-slate-50/50 pb-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-rose-100 rounded-lg">
                            <HeartPulse className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                Review Volume & Sentiment
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">
                                Tốc độ tạo UGC (User Generated Content) và Cảm xúc cộng đồng.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={reviewVolumeData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    yAxisId="left"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                    domain={[0, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                    wrapperStyle={{ paddingBottom: '20px', fontWeight: 600, fontSize: '13px' }}
                                />
                                <Area
                                    yAxisId="left"
                                    name="Lượng Review"
                                    type="monotone"
                                    dataKey="volume"
                                    stroke="#3b82f6"
                                    fillOpacity={1}
                                    fill="url(#colorVolume)"
                                    strokeWidth={3}
                                />
                                <Area
                                    yAxisId="right"
                                    name="Chỉ số Tích cực (%)"
                                    type="monotone"
                                    dataKey="sentiment"
                                    stroke="#f43f5e"
                                    fillOpacity={1}
                                    fill="url(#colorSentiment)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card className="col-span-1 border-2 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="bg-slate-50/50 pb-4 border-b">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Medal className="w-5 h-5 text-yellow-600" />
                        </div>
                        <CardTitle className="text-xl font-bold">Top Contributors</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {topContributors.map((user: any, idx: number) => (
                            <div key={user.id || idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="w-10 h-10 border-2 border-slate-100">
                                            <AvatarImage src={user.avatar_url || ''} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {user.display_name?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        {idx < 3 && (
                                            <div className="absolute -top-2 -right-2 bg-white rounded-full">
                                                <Medal className={`w-5 h-5 
                                                    ${idx === 0 ? "text-yellow-500" :
                                                        idx === 1 ? "text-slate-400" :
                                                            "text-amber-600"}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800 line-clamp-1">
                                            {user.display_name || user.email?.split('@')[0]}
                                        </span>
                                        <span className="text-xs text-slate-500 font-medium">
                                            {user.review_count} Reviews
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-black text-indigo-600">
                                        {user.reward_points || 0}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Điểm</div>
                                </div>
                            </div>
                        ))}

                        {topContributors.length === 0 && (
                            <div className="text-center py-8 text-slate-500 font-medium italic">
                                Chưa có dữ liệu bảng xếp hạng.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    )
}
