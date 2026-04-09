"use client"

import { useState, useEffect } from "react"
import {
    LayoutDashboard,
    Database,
    Loader2,
    RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"
import { AdminGuard } from "@/components/features/admin/admin-guard"
import { supabase } from "@/lib/db/supabase"

import { QuickStats } from "@/components/features/admin/dashboard/quick-stats"
import { ActivityCharts } from "@/components/features/admin/dashboard/activity-charts"
import { SentimentAndLogs } from "@/components/features/admin/dashboard/sentiment-and-logs"
import { RevenueChart } from "@/components/features/admin/dashboard/revenue-chart"
import { TopRatedInsights } from "@/components/features/admin/dashboard/top-rated-insights"
import { DashboardNav } from "@/components/features/admin/dashboard/dashboard-nav"

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch("/api/admin/stats", {
                headers: {
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                }
            })

            if (res.status === 404) {
                window.location.href = "/404";
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
        fetchStats()
    }, [])

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-xl font-bold text-slate-600 animate-pulse">Đang nạp dữ liệu thống kê...</p>
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
                            <LayoutDashboard className="w-10 h-10 text-primary" />
                            Dashboard Tổng Quan
                        </h1>
                        <p className="text-slate-500 font-medium text-lg italic">Theo dõi hiệu suất và hành vi người dùng toàn thời gian.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={fetchStats}
                            disabled={loading}
                            className="rounded-xl border-2 hover:bg-primary/10 transition-all font-bold"
                        >
                            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Làm mới
                        </Button>
                        <Link href="/admin/manage">
                            <Button className="rounded-xl font-black shadow-lg hover:-translate-y-1 transition-all bg-indigo-600 hover:bg-indigo-700">
                                <Database className="w-5 h-5 mr-2" />
                                Quản lý Database
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Dashboard Navigation */}
                <div className="border-b-2 pb-4">
                    <DashboardNav />
                </div>

                <QuickStats stats={stats} />
                <ActivityCharts stats={stats} />
                <SentimentAndLogs stats={stats} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <RevenueChart stats={stats} />
                </div>

                <TopRatedInsights stats={stats} />
            </div>
        </AdminGuard>
    )
}
