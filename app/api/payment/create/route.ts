import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { createPayOSPayment } from '@/lib/payment';
import { getUserPlan, startFreeTrial } from '@/lib/subscription';

/**
 * POST /api/payment/create — Create a payment order for plan upgrade
 * Body: { planName?: string }
 */
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập để nâng cấp' },
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

        const body = await req.json();
        const planName = body.planName || 'premium';

        // Check if user is already premium on this exact plan
        const currentPlan = await getUserPlan(user.id);
        if (currentPlan.isPremium && planName === 'premium') {
            return NextResponse.json(
                { error: 'Bạn đã là thành viên Premium!', isPremium: true },
                { status: 400 }
            );
        }

        // Get requested plan
        const { data: requestedPlan, error: planError } = await supabaseAdmin
            .from('plans')
            .select('*')
            .eq('name', planName)
            .single();

        if (planError || !requestedPlan) {
            return NextResponse.json(
                { error: 'Không tìm thấy gói Premium' },
                { status: 500 }
            );
        }

        // Create payment with PayOS
        const origin = req.headers.get('origin') || 'http://localhost:3000';
        const result = await createPayOSPayment(
            user.id,
            requestedPlan.id,
            requestedPlan.price,
            `${origin}/pricing?payment=success`,
            `${origin}/pricing?payment=cancelled`,
            user.user_metadata?.full_name,
            user.user_metadata?.email,
            requestedPlan.name
        );

        return NextResponse.json({
            success: true,
            checkoutUrl: result.checkoutUrl,
            orderCode: result.orderCode,
            paymentId: result.paymentId,
        });
    } catch (error: any) {
        console.error('Payment create error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
