import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getPersonalizedRecommendations } from '@/lib/user-taste';
import { canUseFeature } from '@/lib/subscription';

/**
 * GET /api/recommendations — Get personalized recommendations for Premium users
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

        // Check if user has premium feature
        const hasFeature = await canUseFeature(user.id, 'personalized_recommendations');
        if (!hasFeature) {
            return NextResponse.json(
                {
                    error: 'Tính năng Gợi ý cá nhân hóa chỉ dành cho gói Premium.',
                    code: 'PREMIUM_REQUIRED',
                    upgrade: true,
                },
                { status: 403 }
            );
        }

        const recommendations = await getPersonalizedRecommendations(user.id, 8);

        return NextResponse.json({
            success: true,
            data: recommendations,
            count: recommendations.length,
        });
    } catch (error: any) {
        console.error('Recommendations API error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
