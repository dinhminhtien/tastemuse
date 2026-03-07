import { NextResponse, NextRequest } from "next/server"
import { supabaseAdmin, supabase } from "@/lib/supabase"
import { isAdmin } from "@/lib/admin-config"

export async function GET(req: NextRequest) {
    try {
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

        // 1. Get total users (unique user_ids across logs and subscriptions)
        const { data: usageUsers, error: usageError } = await supabaseAdmin
            .from('usage_logs')
            .select('user_id')

        const { data: subUsers, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')

        if (usageError || subError) {
            console.error("Error fetching user counts:", usageError || subError)
        }

        const uniqueUsers = new Set([
            ...(usageUsers?.map(u => u.user_id) || []),
            ...(subUsers?.map(u => u.user_id) || [])
        ])

        // 2. Premium stats
        const { data: premiumSubs, error: premiumError } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('status', 'active')
            .not('plan_id', 'is', null) // This is a bit vague without plan names, 
        // but usually 'free' has a specific plan_id.
        // Let's get plans first to be sure.

        const { data: plans } = await supabaseAdmin.from('plans').select('*')
        const premiumPlan = plans?.find(p => p.name === 'premium')

        const { count: premiumCount } = await supabaseAdmin
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .eq('plan_id', premiumPlan?.id)

        // 3. Revenue
        const { data: payments, error: paymentsError } = await supabaseAdmin
            .from('payments')
            .select('amount, created_at')
            .eq('status', 'completed')

        const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0

        // 4. Activity Logs (Last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: recentLogs, error: logsError } = await supabaseAdmin
            .from('usage_logs')
            .select('action_type, created_at')
            .gte('created_at', thirtyDaysAgo.toISOString())

        // Process logs for chart
        const activityByDay: Record<string, number> = {}
        const actionCounts: Record<string, number> = {}

        recentLogs?.forEach(log => {
            const date = new Date(log.created_at).toLocaleDateString('en-CA') // YYYY-MM-DD
            activityByDay[date] = (activityByDay[date] || 0) + 1
            actionCounts[log.action_type] = (actionCounts[log.action_type] || 0) + 1
        })

        const activityChartData = Object.entries(activityByDay)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))

        // Process revenue by day
        const revenueByDay: Record<string, number> = {}
        payments?.filter(p => new Date(p.created_at) >= thirtyDaysAgo).forEach(p => {
            const date = new Date(p.created_at).toLocaleDateString('en-CA')
            revenueByDay[date] = (revenueByDay[date] || 0) + p.amount
        })

        const revenueChartData = Object.entries(revenueByDay)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date))

        // 5. Basic Counts
        const { count: totalRestaurants } = await supabaseAdmin.from('restaurants').select('*', { count: 'exact', head: true })
        const { count: totalDishes } = await supabaseAdmin.from('dishes').select('*', { count: 'exact', head: true })
        const { count: totalReviews } = await supabaseAdmin.from('reviews').select('*', { count: 'exact', head: true })

        // 6. Recent Activity List
        const { data: recentActivity } = await supabaseAdmin
            .from('usage_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        // 7. Sentiment distribution
        const { data: sentimentLogs } = await supabaseAdmin
            .from('reviews')
            .select('sentiment')

        const sentimentCounts: Record<string, number> = {}
        sentimentLogs?.forEach(log => {
            const s = log.sentiment || 'neutral'
            sentimentCounts[s] = (sentimentCounts[s] || 0) + 1
        })
        const sentimentChart = Object.entries(sentimentCounts).map(([name, value]) => ({ name, value }))

        // 8. Top Rated Items
        const { data: allRatings } = await supabaseAdmin.from('ratings').select('target_type, target_id, score');

        const ratingAgg: Record<string, { totalScore: number, count: number, type: string }> = {};
        allRatings?.forEach(r => {
            if (!ratingAgg[r.target_id]) {
                ratingAgg[r.target_id] = { totalScore: 0, count: 0, type: r.target_type };
            }
            ratingAgg[r.target_id].totalScore += r.score;
            ratingAgg[r.target_id].count += 1;
        });

        const topTargets = Object.entries(ratingAgg)
            .map(([id, data]) => ({
                id,
                type: data.type,
                avg: data.totalScore / data.count,
                count: data.count
            }))
            .sort((a, b) => b.avg - a.avg || b.count - a.count); // sort by avg first, then count

        const topRestaurants = topTargets.filter(t => t.type === 'restaurant').slice(0, 5);
        const topDishes = topTargets.filter(t => t.type === 'dish').slice(0, 5);

        let topRestaurantsData: any[] = [];
        if (topRestaurants.length > 0) {
            const { data: resData } = await supabaseAdmin.from('restaurants').select('id, name, slug').in('id', topRestaurants.map(t => t.id));
            topRestaurantsData = topRestaurants.map(t => {
                const r = resData?.find(x => x.id === t.id);
                return { ...t, name: r?.name, slug: r?.slug };
            });
        }

        let topDishesData: any[] = [];
        if (topDishes.length > 0) {
            const { data: dData } = await supabaseAdmin.from('dishes').select('id, name').in('id', topDishes.map(t => t.id));
            topDishesData = topDishes.map(t => {
                const d = dData?.find(x => x.id === t.id);
                return { ...t, name: d?.name };
            });
        }

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers: uniqueUsers.size,
                premiumUsers: premiumCount || 0,
                totalRevenue,
                totalActions: recentLogs?.length || 0,
                totalRestaurants: totalRestaurants || 0,
                totalDishes: totalDishes || 0,
                totalReviews: totalReviews || 0,
                recentActivity: recentActivity || [],
                sentimentChart,
                topRestaurants: topRestaurantsData,
                topDishes: topDishesData,
                activityChart: activityChartData,
                revenueChart: revenueChartData,
                popularActions: Object.entries(actionCounts).map(([name, value]) => ({ name, value }))
            }
        })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
