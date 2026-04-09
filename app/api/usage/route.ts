import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { getUsageStats } from '@/lib/services/subscription';

/**
 * GET /api/usage — Get current user's daily usage stats
 */
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập' },
                { status: 401 }
            );
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Phiên đăng nhập không hợp lệ' },
                { status: 401 }
            );
        }

        const stats = await getUsageStats(user.id);

        return NextResponse.json({
            success: true,
            ...stats,
        });
    } catch (error: any) {
        console.error('Usage API error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
