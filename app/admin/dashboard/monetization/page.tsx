"use client"

import { useState, useEffect } from "react"
import { Loader2, RefreshCw, BarChart3, CreditCard, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { supabase } from "@/lib/db/supabase"
import { AdminGuard } from "@/components/features/admin/admin-guard"
import { DashboardNav } from "@/components/features/admin/dashboard/dashboard-nav"
import { MonetizationMetrics } from "@/components/features/admin/dashboard/analytics/monetization-metrics"
import { RevenueDashboard } from "@/components/features/admin/dashboard/analytics/revenue-dashboard"
import { TransactionList } from "@/components/features/admin/dashboard/analytics/transaction-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MonetizationDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState("month")

    const fetchMonetizationStats = async (currentPeriod = period) => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const res = await fetch(`/api/admin/analytics/monetization?period=${currentPeriod}`, {
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
        fetchMonetizationStats()
    }, [period])

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
                            <span className="text-primary">Doanh thu & Monetization</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg italic">Theo dõi chỉ số doanh thu, tỷ lệ chuyển đổi và hiệu quả của hệ thống Premium.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => fetchMonetizationStats()}
                            disabled={loading}
                            className="rounded-xl border-2 font-bold bg-white"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Cập nhật
                        </Button>
                    </div>
                </div>

                <div className="border-b-2 pb-4">
                    <DashboardNav />
                </div>

                <Tabs defaultValue="revenue" className="w-full space-y-6">
                    <TabsList className="bg-slate-100 p-1 rounded-xl h-12">
                        <TabsTrigger value="revenue" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Dashboard Doanh thu
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Receipt className="w-4 h-4 mr-2" />
                            Danh sách Giao dịch
                        </TabsTrigger>
                        <TabsTrigger value="saas" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Chỉ số SaaS & Freemium
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="revenue" className="mt-0 outline-none">
                        <RevenueDashboard 
                            stats={stats} 
                            period={period} 
                            onPeriodChange={setPeriod} 
                            loading={loading}
                        />
                    </TabsContent>

                    <TabsContent value="transactions" className="mt-0 outline-none">
                        <TransactionList 
                            payments={stats?.paymentStats?.rawPayments || []} 
                            loading={loading}
                        />
                    </TabsContent>

                    <TabsContent value="saas" className="mt-0 outline-none">
                        <MonetizationMetrics stats={stats} />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminGuard>
    )
}


