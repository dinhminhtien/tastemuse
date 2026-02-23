import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { updateUserTaste } from '@/lib/user-taste';

/**
 * POST /api/track – Track user interaction
 * Body: { interaction_type, target_type?, target_id?, metadata? }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { interaction_type, target_type, target_id, metadata = {} } = body;

        if (!interaction_type) {
            return NextResponse.json(
                { error: 'Thiếu interaction_type' },
                { status: 400 }
            );
        }

        // Try to get user ID (optional — anonymous tracking allowed)
        let userId: string | null = null;
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
            const { data: { user } } = await supabase.auth.getUser(
                authHeader.replace('Bearer ', '')
            );
            userId = user?.id || null;
        }

        // Generate session ID for anonymous users
        const sessionId = req.headers.get('x-session-id') || null;

        // Insert interaction
        const { data, error } = await supabaseAdmin
            .from('user_interactions')
            .insert({
                user_id: userId,
                session_id: sessionId,
                interaction_type,
                target_type: target_type || null,
                target_id: target_id || null,
                metadata,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Track insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update user taste for clicks (non-blocking)
        if (userId && target_id && (interaction_type === 'click' || interaction_type === 'view')) {
            updateUserTaste(userId, 'click', {
                targetId: target_id,
                targetType: target_type,
            }).catch(err => console.error('Taste update error:', err));
        }

        return NextResponse.json({ success: true, id: data.id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
