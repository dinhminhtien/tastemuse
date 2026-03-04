import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/subscription/history — Get user's subscription & payment history
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

        // Fetch subscriptions with plan info
        const { data: subscriptions, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('*, plans(name, display_name, price, ai_limit_per_day)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (subError) {
            console.error('Subscription history error:', subError);
            return NextResponse.json(
                { error: 'Không thể tải lịch sử đăng ký' },
                { status: 500 }
            );
        }

        // Fetch payments
        const { data: payments, error: payError } = await supabaseAdmin
            .from('payments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (payError) {
            console.error('Payment history error:', payError);
            return NextResponse.json(
                { error: 'Không thể tải lịch sử thanh toán' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            subscriptions: subscriptions || [],
            payments: payments || [],
        });
    } catch (error: any) {
        console.error('Subscription history API error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
