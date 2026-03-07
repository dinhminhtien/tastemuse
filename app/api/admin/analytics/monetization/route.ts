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

        // 1. Premium Metrics (Based on real subscriptions table)
        const { data: plans } = await supabaseAdmin.from('plans').select('*');
        const planMap = new Map(plans?.map(p => [p.id, p]));

        const { data: subscriptions } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id, status, plan_id, created_at')

        const activeSubs = subscriptions?.filter(sub => sub.status === 'active') || [];

        let mrrVND = 0;
        activeSubs.forEach(sub => {
            const plan = planMap.get(sub.plan_id);
            if (plan && plan.price > 0 && plan.duration_days > 0) {
                // Calculate monthly equivalent (Assuming duration_days is approx)
                const monthlyPrice = (plan.price / plan.duration_days) * 30;
                mrrVND += monthlyPrice;
            }
        });

        // Convert to USD roughly if UI is expecting USD, but UI says $ so let's stick to real number but maybe scale it or change UI to VND?
        // Wait, UI uses $ prefix. The DB stores VND (e.g. 19000). I'll return the raw VND and we can adjust UI later or divide by 25000.
        const mrrUSD = Math.round(mrrVND / 25000) || 0;

        // 2. Conversion Pipeline 
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

        // 3. Paywall Hit Distribution
        const hitCounts: Record<string, number> = {};
        paywallLogs?.forEach(log => {
            const feature = log.metadata?.feature || 'Unknown';
            hitCounts[feature] = (hitCounts[feature] || 0) + 1;
        });

        const totalHits = paywallLogs?.length || 1;
        const paywallHits = Object.entries(hitCounts).map(([feature, count]) => ({
            feature,
            percentage: Math.round((count / totalHits) * 100)
        }));

        // 4. MRR Chart (Historical)
        // Group active subscriptions by month to see cumulative growth
        const mrrByMonth: Record<string, number> = {};
        activeSubs.forEach(sub => {
            const d = new Date(sub.created_at);
            const month = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            if (!mrrByMonth[month]) mrrByMonth[month] = 0;

            const plan = planMap.get(sub.plan_id);
            if (plan && plan.price > 0 && plan.duration_days > 0) {
                mrrByMonth[month] += (plan.price / plan.duration_days) * 30 / 25000;
            }
        });

        const mrrData = Object.entries(mrrByMonth)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, mrr]) => ({
                month,
                mrr: Math.round(mrr)
            }));

        const arpu = activeSubs.length > 0 ? (mrrUSD / activeSubs.length).toFixed(2) : 0;

        return NextResponse.json({
            success: true,
            stats: {
                activeSubsCount: activeSubs.length,
                mrr: mrrUSD,
                arpu,
                conversionData,
                paywallHits,
                mrrData
            }
        })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
