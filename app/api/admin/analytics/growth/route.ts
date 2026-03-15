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
            .select('user_id, created_at, action_type, metadata')
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

        // 3. Real Cohort Retention
        // We need user registration dates
        const { data: { users: allAuthUsers } } = await supabaseAdmin.auth.admin.listUsers();
        const userJoinDates: Record<string, Date> = {};
        allAuthUsers.forEach(u => {
            userJoinDates[u.id] = new Date(u.created_at);
        });

        const cohortData: any[] = [];
        const now = new Date();
        
        // Let's look at the last 4 weeks as cohorts
        for (let i = 3; i >= 0; i--) {
            const cohortStart = new Date();
            cohortStart.setDate(now.getDate() - (i + 1) * 7);
            const cohortEnd = new Date();
            cohortEnd.setDate(now.getDate() - i * 7);
            
            const cohortUsers = allAuthUsers.filter(u => {
                const joinDate = new Date(u.created_at);
                return joinDate >= cohortStart && joinDate < cohortEnd;
            });

            if (cohortUsers.length > 0) {
                const cohortLabel = `Week of ${cohortStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
                const row: any = { cohort: cohortLabel, W1: 100, W2: 0, W3: 0, W4: 0 };
                
                const userIds = cohortUsers.map(u => u.id);
                
                // For each subsequent week, check activity
                for (let week = 1; week <= 3; week++) {
                    const weekStart = new Date(cohortStart);
                    weekStart.setDate(weekStart.getDate() + week * 7);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 7);
                    
                    const activeInWeek = new Set(
                        recentLogs?.filter(log => {
                            const logDate = new Date(log.created_at);
                            return userIds.includes(log.user_id) && logDate >= weekStart && logDate < weekEnd;
                        }).map(log => log.user_id)
                    );
                    
                    row[`W${week + 1}`] = Math.round((activeInWeek.size / userIds.length) * 100);
                }
                cohortData.push(row);
            }
        }

        // 4. User Acquisition Pipeline 
        const deviceData = [
          { name: 'Mobile', value: 0 },
          { name: 'Desktop', value: 0 },
          { name: 'Tablet', value: 0 }
        ];

        recentLogs?.forEach(log => {
          const meta = log.metadata || {};
          const ua = (meta.userAgent || meta.device || 'desktop').toLowerCase();
          if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) deviceData[0].value++;
          else if (ua.includes('tablet') || ua.includes('ipad')) deviceData[2].value++;
          else deviceData[1].value++;
        });

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
                deviceData: deviceData.filter(d => d.value > 0)
            }
        })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
