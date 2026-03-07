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

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isoThirtyDaysAgo = thirtyDaysAgo.toISOString();

        // 1. Search System Ops (Query from usage_logs)
        const { data: searchLogs } = await supabaseAdmin
            .from('usage_logs')
            .select('metadata, created_at')
            .eq('action_type', 'search')
            .gte('created_at', isoThirtyDaysAgo);

        const zeroResults: Record<string, { count: number, last_searched: string }> = {};

        // Let's assume metadata tracks search method too
        let vectorCount = 0;
        let ftsCount = 0;

        searchLogs?.forEach(log => {
            const meta = log.metadata || {};

            if (meta.query && meta.result_count === 0) {
                if (!zeroResults[meta.query]) {
                    zeroResults[meta.query] = { count: 0, last_searched: log.created_at };
                }
                zeroResults[meta.query].count += 1;
                // Keep the most recent timestamp if logs are ordered, or just compare:
                if (new Date(log.created_at) > new Date(zeroResults[meta.query].last_searched)) {
                    zeroResults[meta.query].last_searched = log.created_at;
                }
            }

            if (meta.method === 'vector') vectorCount++;
            else if (meta.method === 'fts') ftsCount++;
            // Defaulting counts if untracked to 0
        });

        const zeroResultQueries = Object.entries(zeroResults)
            .map(([query, data]) => {
                // Formatting time relative
                const date = new Date(data.last_searched);
                return {
                    query,
                    count: data.count,
                    last_searched: date.toLocaleDateString('vi-VN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // top 5

        const totalTrackedSearches = vectorCount + ftsCount;
        const searchTypeMix = totalTrackedSearches > 0 ? [
            { name: "Full-text Search", value: Math.round((ftsCount / totalTrackedSearches) * 100), color: "#3b82f6" },
            { name: "Vector Search", value: Math.round((vectorCount / totalTrackedSearches) * 100), color: "#10b981" },
        ] : [];

        // Latency data is rarely tracked in DB direct logs easily, returning empty for real data mode
        const latencyData: any[] = [];

        // 2. Predictive Insights 
        // Real ML insights would require an external cron job or python service pushing to a table.
        // Returning empty for purely "real data" dashboard
        const predictiveAlerts: any[] = [];

        return NextResponse.json({
            success: true,
            stats: {
                zeroResultQueries,
                searchTypeMix,
                latencyData,
                predictiveAlerts
            }
        })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
