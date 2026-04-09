import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db/supabase';
import { canUseFeature } from '@/lib/services/subscription';

/**
 * GET /api/meal-plans — List user's meal plans
 * POST /api/meal-plans — Create a new meal plan
 * PATCH /api/meal-plans — Update a meal plan
 * DELETE /api/meal-plans?id=xxx — Delete a meal plan
 *
 * All operations require Premium subscription (meal_planning feature).
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

// ===================== GET — List meal plans =====================

export async function GET(req: NextRequest) {
    try {
        const auth = await authenticateAndCheckPremium(req);
        if ('error' in auth) {
            return NextResponse.json(
                { error: auth.error, code: (auth as any).code, upgrade: (auth as any).code === 'PREMIUM_REQUIRED' },
                { status: auth.status }
            );
        }

        const { searchParams } = new URL(req.url);
        const planId = searchParams.get('id');

        // Single plan with items
        if (planId) {
            const { data: plan, error } = await supabaseAdmin
                .from('meal_plans')
                .select('*')
                .eq('id', planId)
                .eq('user_id', auth.user.id)
                .single();

            if (error || !plan) {
                return NextResponse.json(
                    { error: 'Không tìm thấy kế hoạch bữa ăn' },
                    { status: 404 }
                );
            }

            // Fetch items with dish/restaurant info
            const { data: items } = await supabaseAdmin
                .from('meal_plan_items')
                .select(`
                    *,
                    dishes(name, restaurants(name, slug)),
                    restaurants(name, slug)
                `)
                .eq('meal_plan_id', planId)
                .order('day_of_week', { ascending: true })
                .order('sort_order', { ascending: true });

            return NextResponse.json({
                success: true,
                data: { ...plan, items: items || [] },
            });
        }

        // List all plans
        const { data: plans, error } = await supabaseAdmin
            .from('meal_plans')
            .select('*')
            .eq('user_id', auth.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: plans || [],
            count: plans?.length || 0,
        });
    } catch (error: any) {
        console.error('Meal plans GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ===================== POST — Create meal plan =====================

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
        const { title, description, start_date, end_date, items } = body;

        // Create the meal plan
        const { data: plan, error: planError } = await supabaseAdmin
            .from('meal_plans')
            .insert({
                user_id: auth.user.id,
                title: title || 'Kế hoạch bữa ăn',
                description: description || null,
                start_date: start_date || new Date().toISOString().split('T')[0],
                end_date: end_date || null,
            })
            .select()
            .single();

        if (planError) {
            return NextResponse.json({ error: planError.message }, { status: 500 });
        }

        // Add items if provided
        if (items && Array.isArray(items) && items.length > 0) {
            const insertItems = items.map((item: any, idx: number) => ({
                meal_plan_id: plan.id,
                dish_id: item.dish_id || null,
                restaurant_id: item.restaurant_id || null,
                meal_type: item.meal_type || 'lunch',
                day_of_week: item.day_of_week ?? 0,
                notes: item.notes || null,
                sort_order: item.sort_order ?? idx,
            }));

            const { error: itemsError } = await supabaseAdmin
                .from('meal_plan_items')
                .insert(insertItems);

            if (itemsError) {
                console.error('Meal plan items insert error:', itemsError);
            }
        }

        return NextResponse.json({
            success: true,
            data: plan,
            message: `Kế hoạch "${plan.title}" đã được tạo!`,
        });
    } catch (error: any) {
        console.error('Meal plans POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ===================== PATCH — Update meal plan =====================

export async function PATCH(req: NextRequest) {
    try {
        const auth = await authenticateAndCheckPremium(req);
        if ('error' in auth) {
            return NextResponse.json(
                { error: auth.error, code: (auth as any).code, upgrade: (auth as any).code === 'PREMIUM_REQUIRED' },
                { status: auth.status }
            );
        }

        const body = await req.json();
        const { id, title, description, start_date, end_date, is_active } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Thiếu id kế hoạch bữa ăn' },
                { status: 400 }
            );
        }

        const updates: Record<string, any> = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (start_date !== undefined) updates.start_date = start_date;
        if (end_date !== undefined) updates.end_date = end_date;
        if (is_active !== undefined) updates.is_active = is_active;

        const { data, error } = await supabaseAdmin
            .from('meal_plans')
            .update(updates)
            .eq('id', id)
            .eq('user_id', auth.user.id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Meal plans PATCH error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ===================== DELETE — Delete meal plan =====================

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
                { error: 'Thiếu id kế hoạch bữa ăn' },
                { status: 400 }
            );
        }

        // Items will be cascade-deleted
        const { error } = await supabaseAdmin
            .from('meal_plans')
            .delete()
            .eq('id', id)
            .eq('user_id', auth.user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Đã xóa kế hoạch bữa ăn' });
    } catch (error: any) {
        console.error('Meal plans DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
