import { NextResponse, NextRequest } from "next/server"
import { supabaseAdmin, supabase } from "@/lib/supabase"
import { isAdmin } from "@/lib/admin-config"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || 'month'; // today, yesterday, week, month, lastMonth, year, lastYear

        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 })
        }

        const { data: { user } } = await supabase.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (!user || !isAdmin(user.email)) {
            return NextResponse.json({ success: false, error: "Not Found" }, { status: 404 })
        }

        // 1. Base query for payments
        let query = supabaseAdmin
            .from('payments')
            .select('*')
            .order('created_at', { ascending: true });

        // Calculate Date Range
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        let startDate: Date | null = null;
        let endDate: Date | null = null;
        let chartPoints = 30; // default to 30 days

        switch (period) {
            case 'today':
                startDate = startOfToday;
                chartPoints = 24; // Hours
                break;
            case 'yesterday':
                startDate = new Date(startOfToday);
                startDate.setDate(startDate.getDate() - 1);
                endDate = startOfToday;
                chartPoints = 24;
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
                chartPoints = 7;
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                chartPoints = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                break;
            case 'lastMonth':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                chartPoints = endDate.getDate();
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                chartPoints = 12; // Months
                break;
            case 'lastYear':
                startDate = new Date(now.getFullYear() - 1, 0, 1);
                endDate = new Date(now.getFullYear(), 0, 0);
                chartPoints = 12;
                break;
        }

        if (startDate) {
            query = query.gte('created_at', startDate.toISOString());
        }
        if (endDate) {
            query = query.lte('created_at', endDate.toISOString());
        }

        const { data: allPayments } = await query;
        const completedPayments = allPayments?.filter(p => p.status === 'completed') || [];
        const totalRevenueVND = completedPayments.reduce((acc, p) => acc + p.amount, 0);
        const totalOrders = completedPayments.length;

        // 2. SaaS Metrics (Always based on ALL active subs regardless of filter for MRR)
        const { data: plans } = await supabaseAdmin.from('plans').select('*');
        const planMap = new Map(plans?.map(p => [p.id, p]));

        const { data: subscriptions } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id, status, plan_id, created_at')

        const activeSubs = subscriptions?.filter(sub => sub.status === 'active') || [];

        let currentMRRVND = 0;
        activeSubs.forEach(sub => {
            const plan = planMap.get(sub.plan_id);
            if (plan && plan.price > 0 && plan.duration_days > 0) {
                currentMRRVND += (plan.price / plan.duration_days) * 30;
            }
        });

        // 3. Chart Data Generation
        const dailyRevenue: Record<string, number> = {};
        completedPayments.forEach(p => {
            const d = new Date(p.created_at);
            let key = "";
            if (period === 'today' || period === 'yesterday') {
                key = `${d.getHours()}h`;
            } else if (period === 'year' || period === 'lastYear') {
                key = `T${d.getMonth() + 1}`;
            } else {
                key = `Th${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            }
            dailyRevenue[key] = (dailyRevenue[key] || 0) + p.amount;
        });

        const chartData = [];
        if (period === 'today' || period === 'yesterday') {
            for (let i = 0; i < 24; i++) {
                chartData.push({ date: `${i}h`, amount: dailyRevenue[`${i}h`] || 0 });
            }
        } else if (period === 'year' || period === 'lastYear') {
            for (let i = 1; i <= 12; i++) {
                chartData.push({ date: `T${i}`, amount: dailyRevenue[`T${i}`] || 0 });
            }
        } else {
            // Daily points for the week/month
            const current = new Date(startDate || now);
            const stop = endDate || now;
            while (current <= stop || chartData.length < chartPoints) {
                const key = `Th${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;
                chartData.push({ date: key, amount: dailyRevenue[key] || 0 });
                current.setDate(current.getDate() + 1);
                if (chartData.length >= 60) break; // Safety
            }
        }

        const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers();
        const totalUsers = allUsers?.length || 0;

        const { data: paywallLogs } = await supabaseAdmin
            .from('usage_logs')
            .select('user_id, metadata, created_at')
            .eq('action_type', 'paywall_hit');

        const uniquePaywallHits = new Set(paywallLogs?.map(l => l.user_id)).size;

        const conversionData = [
            { stage: 'Total Users', count: totalUsers },
            { stage: 'Hit Paywall', count: uniquePaywallHits },
            { stage: 'Converted to Premium', count: activeSubs.length }
        ]

        const hitCounts: Record<string, number> = {};
        paywallLogs?.forEach(log => {
            const feature = log.metadata?.feature || 'Unknown';
            hitCounts[feature] = (hitCounts[feature] || 0) + 1;
        });

        const totalHitsTotal = paywallLogs?.length || 1;
        const paywallHitsData = Object.entries(hitCounts).map(([feature, count]) => ({
            feature,
            percentage: Math.round((count / totalHitsTotal) * 100)
        }));

        const arpuVND = activeSubs.length > 0 ? Math.round(currentMRRVND / activeSubs.length) : 0;

        return NextResponse.json({
            success: true,
            stats: {
                activeSubsCount: activeSubs.length,
                mrrVND: currentMRRVND,
                arpuVND,
                conversionData,
                paywallHits: paywallHitsData,
                mrrData: chartData, 
                paymentStats: {
                    totalRevenueVND,
                    totalOrders,
                    statusBreakdown: [
                        { name: 'Đã thanh toán', value: allPayments?.filter(p => p.status === 'completed').length || 0, color: '#00a86b' },
                        { name: 'Chờ thanh toán', value: allPayments?.filter(p => p.status === 'pending').length || 0, color: '#e7f5ef' },
                        { name: 'Hủy', value: allPayments?.filter(p => p.status === 'failed' || p.status === 'cancelled').length || 0, color: '#76c893' }
                    ],
                    providerRevenue: [
                        { name: 'TasteMuse', value: totalRevenueVND }
                    ],
                    dailyRevenue: chartData,
                    rawPayments: allPayments?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || []
                }
            }
        })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}


