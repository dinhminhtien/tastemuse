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

        // 1. DAU / WAU / MAU (Daily, Weekly, Monthly Active Users)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isoThirtyDaysAgo = thirtyDaysAgo.toISOString();

        const { data: recentLogs, error: logsError } = await supabaseAdmin
            .from('usage_logs')
            .select('user_id, created_at, action_type')
            .gte('created_at', isoThirtyDaysAgo)

        if (logsError) throw logsError;

        // Calculate DAU (Active today)
        const today = new Date().toISOString().split('T')[0];
        const dauSet = new Set(recentLogs?.filter(log => log.created_at.startsWith(today)).map(log => log.user_id));

        // Calculate WAU (Active in last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const isoSevenDaysAgo = sevenDaysAgo.toISOString();
        const wauSet = new Set(recentLogs?.filter(log => log.created_at >= isoSevenDaysAgo).map(log => log.user_id));

        // Calculate MAU (Active in last 30 days)
        const mauSet = new Set(recentLogs?.map(log => log.user_id));

        // 2. Engagement Funnel (Homepage -> Search -> Click -> Action)
        const funnelStats = {
            homepage_visits: 0,
            searches_started: 0,
            results_clicked: 0,
            high_value_actions: 0 // favorites, reviews
        }

        recentLogs?.forEach(log => {
            if (log.action_type === 'view_home' || log.action_type === 'visit') funnelStats.homepage_visits++;
            if (log.action_type.includes('search')) funnelStats.searches_started++;
            if (log.action_type === 'click_restaurant' || log.action_type === 'click_dish') funnelStats.results_clicked++;
            if (log.action_type === 'add_favorite' || log.action_type === 'write_review' || log.action_type === 'subscribe') funnelStats.high_value_actions++;
        });

        // Real data funnel (Only showing actual tracked stats)
        const funnelData = [
            { name: 'Visits', value: funnelStats.homepage_visits },
            { name: 'Searches', value: funnelStats.searches_started },
            { name: 'Clicks', value: funnelStats.results_clicked },
            { name: 'Actions', value: funnelStats.high_value_actions }
        ];

        // 3. Real Cohort Retention (Empty arrays if no complex tracking)
        // Since we don't have historical weekly user creation joined with usage easily here without raw SQL,
        // we'll return an empty array format that the UI can handle or just zeroed.
        const cohortData: any[] = [];

        // 4. User Acquisition Pipeline 
        // No device data is tracked currently in usage_logs schema without metadata parsing.
        const deviceData: any[] = [];

        return NextResponse.json({
            success: true,
            stats: {
                activeUsers: {
                    dau: dauSet.size,
                    wau: wauSet.size,
                    mau: mauSet.size,
                    stickiness: mauSet.size > 0 ? ((dauSet.size / mauSet.size) * 100).toFixed(1) : 0
                },
                funnelData,
                cohortData,
                deviceData
            }
        })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
