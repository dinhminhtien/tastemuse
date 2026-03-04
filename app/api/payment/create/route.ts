import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { createPayOSPayment } from '@/lib/payment';
import { getUserPlan, startFreeTrial } from '@/lib/subscription';

/**
 * POST /api/payment/create — Create a payment order for plan upgrade
 * Body: { plan_name?: string, trial?: boolean }
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
        const { trial } = body;

        // Check if user is already premium
        const currentPlan = await getUserPlan(user.id);
        if (currentPlan.isPremium) {
            return NextResponse.json(
                { error: 'Bạn đã là thành viên Premium!', isPremium: true },
                { status: 400 }
            );
        }

        // Handle free trial request
        if (trial) {
            const subscription = await startFreeTrial(user.id);
            if (!subscription) {
                return NextResponse.json(
                    { error: 'Bạn đã sử dụng dùng thử miễn phí trước đó rồi.' },
                    { status: 400 }
                );
            }
            return NextResponse.json({
                success: true,
                trial: true,
                message: 'Đã kích hoạt dùng thử Premium 3 ngày!',
                subscription,
            });
        }

        // Get premium plan
        const { data: premiumPlan, error: planError } = await supabaseAdmin
            .from('plans')
            .select('*')
            .eq('name', 'premium')
            .single();

        if (planError || !premiumPlan) {
            return NextResponse.json(
                { error: 'Không tìm thấy gói Premium' },
                { status: 500 }
            );
        }

        // Create payment with PayOS
        const origin = req.headers.get('origin') || 'http://localhost:3000';
        const result = await createPayOSPayment(
            user.id,
            premiumPlan.id,
            premiumPlan.price,
            `${origin}/pricing?payment=success`,
            `${origin}/pricing?payment=cancelled`,
            user.user_metadata?.full_name,
            user.email,
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
