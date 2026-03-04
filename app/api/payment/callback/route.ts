import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { activateSubscription } from '@/lib/payment';

/**
 * POST /api/payment/callback — Verify and activate subscription after PayOS redirect
 *
 * When user returns from PayOS checkout, the frontend calls this endpoint
 * to verify the payment and activate the subscription.
 *
 * This is necessary because:
 * 1. Webhooks can't reach localhost during development
 * 2. Even in production, the returnUrl redirect happens before the webhook
 * 3. This provides a reliable fallback for subscription activation
 *
 * Body: { orderCode: number }
 */
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser(
            authHeader.replace('Bearer ', '')
        );

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { orderCode } = await req.json();

        if (!orderCode) {
            return NextResponse.json(
                { error: 'Missing orderCode' },
                { status: 400 }
            );
        }

        console.log(`🔍 Verifying payment for order: ${orderCode}`);

        // Check if PayOS credentials are configured — if so, verify via API
        const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID || '';
        const PAYOS_API_KEY = process.env.PAYOS_API_KEY || '';

        if (PAYOS_CLIENT_ID && PAYOS_API_KEY) {
            // Verify payment status via PayOS Get Payment Link Info API
            const verifyResponse = await fetch(
                `https://api-merchant.payos.vn/v2/payment-requests/${orderCode}`,
                {
                    method: 'GET',
                    headers: {
                        'x-client-id': PAYOS_CLIENT_ID,
                        'x-api-key': PAYOS_API_KEY,
                    },
                }
            );

            const verifyResult = await verifyResponse.json();

            if (verifyResult.code !== '00' || verifyResult.data?.status !== 'PAID') {
                console.log(`⏳ Payment not yet confirmed for order: ${orderCode}, status: ${verifyResult.data?.status}`);
                return NextResponse.json({
                    success: false,
                    status: verifyResult.data?.status || 'UNKNOWN',
                    message: 'Thanh toán chưa được xác nhận. Vui lòng chờ...',
                });
            }
        }

        // Activate the subscription (handles both stub and real payments)
        // First verify the payment belongs to this user
        const { supabaseAdmin } = await import('@/lib/supabase');
        const { data: paymentRecord } = await supabaseAdmin
            .from('payments')
            .select('user_id')
            .eq('order_code', Number(orderCode))
            .single();

        if (paymentRecord && paymentRecord.user_id !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized: payment does not belong to this user' },
                { status: 403 }
            );
        }

        const activated = await activateSubscription(Number(orderCode));

        if (activated) {
            console.log(`✅ Subscription activated via callback for order: ${orderCode}`);
            return NextResponse.json({
                success: true,
                message: 'Nâng cấp Premium thành công! 🎉',
            });
        } else {
            // Already activated (by webhook) or payment not found
            return NextResponse.json({
                success: true,
                message: 'Gói Premium đã được kích hoạt.',
                alreadyActive: true,
            });
        }
    } catch (error: any) {
        console.error('Payment callback error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
