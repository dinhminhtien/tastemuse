import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db/supabase';
import { canUseFeature } from '@/lib/services/subscription';

/**
 * POST /api/meal-plans/items — Add item to a meal plan
 * DELETE /api/meal-plans/items?id=xxx — Remove item from a meal plan
 *
 * Requires Premium subscription.
 */

async function authenticateAndCheckPremium(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
        return { error: 'Vui lòng đăng nhập', status: 401 };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
        return { error: 'Phiên đăng nhập không hợp lệ', status: 401 };
    }

    const hasFeature = await canUseFeature(user.id, 'meal_planning');
    if (!hasFeature) {
        return {
            error: 'Tính năng Lập kế hoạch bữa ăn chỉ dành cho gói Premium.',
            code: 'PREMIUM_REQUIRED',
            status: 403,
        };
    }

    return { user };
}

// ===================== POST — Add item =====================

export async function POST(req: NextRequest) {
    try {
        const auth = await authenticateAndCheckPremium(req);
        if ('error' in auth) {
            return NextResponse.json(
                { error: auth.error, code: (auth as any).code, upgrade: (auth as any).code === 'PREMIUM_REQUIRED' },
                { status: auth.status }
            );
        }

        const body = await req.json();
        const { meal_plan_id, dish_id, restaurant_id, meal_type, day_of_week, notes, sort_order } = body;

        if (!meal_plan_id || !meal_type || day_of_week === undefined) {
            return NextResponse.json(
                { error: 'Thiếu thông tin: meal_plan_id, meal_type, day_of_week' },
                { status: 400 }
            );
        }

        // Verify meal plan belongs to user
        const { data: plan } = await supabaseAdmin
            .from('meal_plans')
            .select('id')
            .eq('id', meal_plan_id)
            .eq('user_id', auth.user.id)
            .single();

        if (!plan) {
            return NextResponse.json(
                { error: 'Không tìm thấy kế hoạch bữa ăn' },
                { status: 404 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('meal_plan_items')
            .insert({
                meal_plan_id,
                dish_id: dish_id || null,
                restaurant_id: restaurant_id || null,
                meal_type,
                day_of_week,
                notes: notes || null,
                sort_order: sort_order ?? 0,
            })
            .select(`
                *,
                dishes(name, restaurants(name, slug)),
                restaurants(name, slug)
            `)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Meal plan items POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ===================== DELETE — Remove item =====================

export async function DELETE(req: NextRequest) {
    try {
        const auth = await authenticateAndCheckPremium(req);
        if ('error' in auth) {
            return NextResponse.json(
                { error: auth.error, code: (auth as any).code, upgrade: (auth as any).code === 'PREMIUM_REQUIRED' },
                { status: auth.status }
            );
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Thiếu id mục bữa ăn' },
                { status: 400 }
            );
        }

        // Verify item belongs to user's plan
        const { data: item } = await supabaseAdmin
            .from('meal_plan_items')
            .select('id, meal_plan_id, meal_plans(user_id)')
            .eq('id', id)
            .single();

        if (!item || (item as any).meal_plans?.user_id !== auth.user.id) {
            return NextResponse.json(
                { error: 'Không tìm thấy mục bữa ăn' },
                { status: 404 }
            );
        }

        const { error } = await supabaseAdmin
            .from('meal_plan_items')
            .delete()
            .eq('id', id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Đã xóa mục bữa ăn' });
    } catch (error: any) {
        console.error('Meal plan items DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
