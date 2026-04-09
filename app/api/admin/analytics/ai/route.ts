import { NextResponse, NextRequest } from "next/server"
import { supabaseAdmin, supabase } from "@/lib/db/supabase"
import { isAdmin } from "@/lib/utils/admin-config"

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

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isoThirtyDaysAgo = thirtyDaysAgo.toISOString();

        // 1. Chatbot Success vs Fallback Rate
        const { data: aiLogs } = await supabaseAdmin
            .from('usage_logs')
            .select('metadata')
            .eq('action_type', 'ai_chat')
            .gte('created_at', isoThirtyDaysAgo)

        let successCount = 0;
        let fallbackCount = 0;
        const intentCounts: Record<string, number> = {};

        if (aiLogs) {
            aiLogs.forEach((log: any) => {
                const meta = log.metadata || {};

                if (meta.fallback || meta.status === 'fallback') {
                    fallbackCount++;
                } else {
                    successCount++;
                }

                if (meta.intent) {
                    intentCounts[meta.intent] = (intentCounts[meta.intent] || 0) + 1;
                }
            });
        }

        const totalConversations = aiLogs?.length || 0;
        const botSuccessRate = {
            success: totalConversations > 0 ? Math.round((successCount / totalConversations) * 100) : 0,
            fallback: totalConversations > 0 ? Math.round((fallbackCount / totalConversations) * 100) : 0,
            totalConversations
        }

        // 2. Chatbot Intents Distribution
        const intentsData = Object.entries(intentCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        // 3. Recommendation CTR (Personalized vs Trending)
        // Hard to calculate without event stream, returning empty for real data.
        const recommendationData: any[] = [];

        // 4. Taste Profile Coverage
        const { data: { users: allUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        const totalUsers = allUsers?.length || 0;

        const { count: profiledUsers } = await supabaseAdmin
            .from('user_taste_profiles')
            .select('*', { count: 'exact', head: true });

        const tasteProfileCoverage = totalUsers > 0
            ? Math.round(((profiledUsers || 0) / totalUsers) * 100)
            : 0;

        return NextResponse.json({
            success: true,
            stats: {
                botSuccessRate,
                intentsData,
                recommendationData,
                tasteProfileCoverage
            }
        })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
