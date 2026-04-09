import { NextRequest, NextResponse } from 'next/server';
import { verifyPayOSWebhook, activateSubscription } from '@/lib/services/payment';

/**
 * POST /api/payment/webhook — Handle PayOS payment webhooks
 *
 * PayOS webhook payload format (from official docs):
 * {
 *   "code": "00",
 *   "desc": "success",
 *   "success": true,
 *   "data": {
 *     "orderCode": 123,
 *     "amount": 3000,
 *     "description": "VQRIO123",
 *     "accountNumber": "12345678",
 *     "reference": "TF230204212323",
 *     "transactionDateTime": "2023-02-04 18:25:00",
 *     "currency": "VND",
 *     "paymentLinkId": "124c33293c43417ab7879e14c8d9eb18",
 *     "code": "00",
 *     "desc": "Thành công",
 *     "counterAccountBankId": "",
 *     "counterAccountBankName": "",
 *     "counterAccountName": "",
 *     "counterAccountNumber": "",
 *     "virtualAccountName": "",
 *     "virtualAccountNumber": ""
 *   },
 *   "signature": "8d8640d802576397a1ce45ebda7f835055768ac7ad2e0bfb77f9b8f12cca4c7f"
 * }
 *
 * IMPORTANT: Must return 2XX to confirm webhook received (per PayOS docs)
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        console.log('📨 Payment webhook received:', JSON.stringify(body));

        // Verify webhook signature using official PayOS algorithm
        const isValid = verifyPayOSWebhook(body);
        if (!isValid) {
            console.error('❌ Invalid webhook signature');
            // Still return 200 to prevent PayOS from retrying
            return NextResponse.json(
                { success: false, error: 'Invalid signature' },
                { status: 200 }
            );
        }

        const webhookCode = body.code as string;
        const data = body.data as Record<string, unknown>;

        if (!data) {
            return NextResponse.json({ success: false, error: 'Missing data' }, { status: 200 });
        }

        const orderCode = data.orderCode as number;
        const dataCode = data.code as string;

        // PayOS success: both top-level code and data.code should be "00"
        if (webhookCode === '00' && dataCode === '00') {
            const activated = await activateSubscription(orderCode);

            if (activated) {
                console.log(`✅ Subscription activated for order: ${orderCode}`);
            } else {
                console.error(`⚠️ Failed to activate subscription for order: ${orderCode}`);
            }

            return NextResponse.json({ success: activated });
        }

        // Payment failed or cancelled — just acknowledge
        console.log(`ℹ️ Payment webhook for order ${orderCode}: code=${webhookCode}, data.code=${dataCode}`);
        return NextResponse.json({ success: true, status: 'acknowledged' });
    } catch (error: any) {
        console.error('Webhook error:', error);
        // Always return 200 to prevent PayOS from retrying indefinitely
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 200 }
        );
    }
}
