"use client"

import { useState, useEffect } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { AdminGuard } from "@/components/admin-guard"
import { DashboardNav } from "@/components/admin/dashboard/dashboard-nav"
import { UserGrowthMatrix } from "@/components/admin/dashboard/analytics/user-growth-matrix"
import { UserRetentionCohorts } from "@/components/admin/dashboard/analytics/user-retention-cohorts"
import { EngagementFunnel } from "@/components/admin/dashboard/analytics/engagement-funnel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts"

export default function GrowthDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchGrowthStats = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch("/api/admin/analytics/growth", {
                headers: {
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                }
            })

            if (res.status === 404) {
                window.location.href = "/not-found";
                return;
            }

            const data = await res.json()
            if (data.success) {
                setStats(data.stats)
            } else {
                toast.error("Không thể tải thống kê: " + data.error)
            }
        } catch (error) {
            toast.error("Lỗi kết nối server")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGrowthStats()
    }, [])

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <AdminGuard>
            <div className="container mx-auto pt-28 md:pt-32 pb-12 px-4 space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <span className="text-primary">Tăng trưởng & Giữ chân</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg italic">Phân tích hành vi, chuyển đổi và tỷ lệ rời rụng của người dùng.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={fetchGrowthStats}
                            disabled={loading}
                            className="rounded-xl border-2 font-bold"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Cập nhật
                        </Button>
                    </div>
                </div>

                <div className="border-b-2 pb-4">
                    <DashboardNav />
                </div>

                <UserGrowthMatrix stats={stats} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <UserRetentionCohorts stats={stats} />

                    <div className="space-y-6">
                        <EngagementFunnel stats={stats} />

                        <Card className="border-2 shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="bg-slate-50/50 pb-4 border-b">
                                <CardTitle className="text-xl font-bold">Nguồn Thiết Bị</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 h-[250px] w-full relative">
                                {stats?.deviceData && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.deviceData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {stats.deviceData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminGuard>
    )
}
