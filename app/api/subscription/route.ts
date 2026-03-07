import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserPlan, getUsageStats, hasUserUsedTrial } from '@/lib/subscription';

/**
 * GET /api/subscription — Get current user's plan and subscription info
 */
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Vui lòng đăng nhập', isGuest: true },
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

        const [planInfo, usageStats, usedTrial] = await Promise.all([
            getUserPlan(user.id),
            getUsageStats(user.id),
            hasUserUsedTrial(user.id),
        ]);

        return NextResponse.json({
            success: true,
            plan: {
                name: planInfo.plan.name,
                display_name: planInfo.plan.display_name,
                price: planInfo.plan.price,
                features: planInfo.plan.features_json,
            },
            subscription: planInfo.subscription
                ? {
                    status: planInfo.subscription.status,
                    start_date: planInfo.subscription.start_date,
                    end_date: planInfo.subscription.end_date,
                    is_trial: planInfo.subscription.is_trial,
                }
                : null,
            isPremium: planInfo.isPremium,
            isTrial: planInfo.isTrial,
            hasUsedTrial: usedTrial,
            daysRemaining: planInfo.daysRemaining,
            usage: usageStats,
        });
    } catch (error: any) {
        console.error('Subscription API error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
