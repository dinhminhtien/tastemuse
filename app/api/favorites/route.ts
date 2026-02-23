import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { updateUserTaste } from '@/lib/user-taste';

/**
 * POST /api/favorites – Toggle favorite (add/remove)
 */
export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization');
        const { data: { user }, error: authError } = await supabase.auth.getUser(
            authHeader?.replace('Bearer ', '')
        );

        if (authError || !user) {
            return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
        }

        const { target_type, target_id } = await req.json();

        if (!target_type || !target_id) {
            return NextResponse.json(
                { error: 'Thiếu thông tin: target_type, target_id' },
                { status: 400 }
            );
        }

        // Check if already favorited
        const { data: existing } = await supabaseAdmin
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('target_type', target_type)
            .eq('target_id', target_id)
            .maybeSingle();

        if (existing) {
            // Remove favorite
            const { error } = await supabaseAdmin
                .from('favorites')
                .delete()
                .eq('id', existing.id);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                action: 'removed',
                is_favorited: false,
            });
        } else {
            // Add favorite
            const { data, error } = await supabaseAdmin
                .from('favorites')
                .insert({
                    user_id: user.id,
                    target_type,
                    target_id,
                })
                .select()
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            // Update user taste embedding (non-blocking)
            updateUserTaste(user.id, 'favorite', {
                targetId: target_id,
                targetType: target_type,
            }).catch(err => console.error('Taste update error:', err));

            return NextResponse.json({
                success: true,
                action: 'added',
                is_favorited: true,
                data,
            });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/favorites?user_id=xxx or /api/favorites?target_type=dish&target_id=xxx
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const targetType = searchParams.get('target_type');
    const targetId = searchParams.get('target_id');
    const checkUserId = searchParams.get('check_user_id'); // Check if specific user favorited

    try {
        if (checkUserId && targetType && targetId) {
            // Check if user has favorited this specific item
            const { data } = await supabaseAdmin
                .from('favorites')
                .select('id')
                .eq('user_id', checkUserId)
                .eq('target_type', targetType)
                .eq('target_id', targetId)
                .maybeSingle();

            return NextResponse.json({
                success: true,
                is_favorited: !!data,
            });
        }

        let query = supabaseAdmin.from('favorites').select('*');

        if (userId) {
            query = query.eq('user_id', userId);
        }

        if (targetType) {
            query = query.eq('target_type', targetType);
        }

        if (targetId) {
            query = query.eq('target_id', targetId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
