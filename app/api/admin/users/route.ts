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

        // Get all users from Supabase Auth
        // Note: listUsers() returns up to 1000 users by default
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

        if (authError) throw authError;

        // Get subscriptions for all users to check premium status
        const { data: subscriptions } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id, status, plans(name, display_name), end_date')
            .in('status', ['active', 'trial']);

        // Get usage count for all users (total actions)
        const { data: usageLogs } = await supabaseAdmin
            .from('usage_logs')
            .select('user_id');

        const usageMap: Record<string, number> = {};
        usageLogs?.forEach(log => {
            usageMap[log.user_id] = (usageMap[log.user_id] || 0) + 1;
        });

        const usersList = users.map(u => {
            const sub = subscriptions?.find(s => s.user_id === u.id);
            return {
                id: u.id,
                email: u.email,
                full_name: u.user_metadata?.full_name || 'Người dùng ẩn danh',
                avatar_url: u.user_metadata?.avatar_url,
                created_at: u.created_at,
                last_sign_in_at: u.last_sign_in_at,
                is_premium: !!sub,
                plan_name: sub ? (sub.plans as any)?.display_name : 'Free',
                total_actions: usageMap[u.id] || 0,
                status: sub ? 'active' : 'inactive'
            };
        });

        // Sort by most recent sign in
        usersList.sort((a, b) => {
            const dateA = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
            const dateB = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
            return dateB - dateA;
        });

        return NextResponse.json({
            success: true,
            users: usersList
        })

    } catch (error: any) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
