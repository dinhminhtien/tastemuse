import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { checkRateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { updateUserTaste } from '@/lib/user-taste';

/**
 * POST /api/ratings – Create or update a rating
 */
export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const limitKey = getRateLimitKey(req);
        const limit = checkRateLimit(limitKey, 'api');
        if (!limit.allowed) {
            return NextResponse.json(
                { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
                { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
            );
        }

        // Auth check
        const authHeader = req.headers.get('authorization');
        const { data: { user }, error: authError } = await supabase.auth.getUser(
            authHeader?.replace('Bearer ', '')
        );

        if (authError || !user) {
            return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
        }

        const { target_type, target_id, score } = await req.json();

        if (!target_type || !target_id || !score) {
            return NextResponse.json(
                { error: 'Thiếu thông tin: target_type, target_id, score' },
                { status: 400 }
            );
        }

        if (score < 1 || score > 5) {
            return NextResponse.json(
                { error: 'Điểm đánh giá phải từ 1-5' },
                { status: 400 }
            );
        }

        // Upsert rating (create or update)
        const { data, error } = await supabaseAdmin
            .from('ratings')
            .upsert(
                {
                    user_id: user.id,
                    target_type,
                    target_id,
                    score,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id,target_type,target_id' }
            )
            .select()
            .single();

        if (error) {
            console.error('Rating upsert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update user taste embedding (async, non-blocking)
        updateUserTaste(user.id, 'rating', {
            targetId: target_id,
            targetType: target_type,
            ratingScore: score,
        }).catch(err => console.error('Taste update error:', err));

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/ratings?target_type=dish&target_id=xxx
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get('target_type');
    const targetId = searchParams.get('target_id');
    const userId = searchParams.get('user_id');

    try {
        let query = supabaseAdmin.from('ratings').select('*');

        if (targetType && targetId) {
            query = query.eq('target_type', targetType).eq('target_id', targetId);
        }

        if (userId) {
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Also get aggregate stats
        let stats = null;
        if (targetType && targetId) {
            const { data: ratingStats } = await supabaseAdmin.rpc('get_avg_rating', {
                p_target_type: targetType,
                p_target_id: targetId,
            });
            stats = ratingStats?.[0] || null;
        }

        return NextResponse.json({ success: true, data, stats });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
