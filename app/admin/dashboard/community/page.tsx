"use client"

import { useState, useEffect } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { AdminGuard } from "@/components/admin-guard"
import { DashboardNav } from "@/components/admin/dashboard/dashboard-nav"
import { CulinaryTrends } from "@/components/admin/dashboard/analytics/culinary-trends"
import { CommunityHealth } from "@/components/admin/dashboard/analytics/community-health"

export default function CommunityDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchContentStats = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch("/api/admin/analytics/content", {
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
        fetchContentStats()
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

    return (
        <AdminGuard>
            <div className="container mx-auto pt-28 md:pt-32 pb-12 px-4 space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <span className="text-primary">Cộng đồng & Nội dung</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg italic">Khám phá xu hướng ẩm thực và phân tích sức khỏe cộng đồng đánh giá.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={fetchContentStats}
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

                <CulinaryTrends stats={stats} />
                <CommunityHealth stats={stats} />
            </div>
        </AdminGuard>
    )
}
