import { NextRequest, NextResponse } from 'next/server';
import { supabase, Dish } from '@/lib/supabase';
import { syncDishToRAG } from '@/lib/document-sync';
import { canUseFeature } from '@/lib/subscription';

/**
 * GET /api/dishes
 * Fetch all dishes with optional filters
 * Advanced filters (isSignature) require Premium subscription
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Optional filters
        const restaurantId = searchParams.get('restaurantId');
        const isSignature = searchParams.get('isSignature');
        const search = searchParams.get('search');
        const sortBy = searchParams.get('sortBy'); // 'popularity' | 'price_asc' | 'price_desc'
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Check if advanced filters are being used
        const usingAdvancedFilters = isSignature === 'true' || !!sortBy;

        if (usingAdvancedFilters) {
            // Authenticate user and check premium
            const authHeader = req.headers.get('authorization');
            if (!authHeader) {
                return NextResponse.json(
                    {
                        error: 'Bộ lọc nâng cao chỉ dành cho gói Premium. Vui lòng đăng nhập và nâng cấp!',
                        code: 'PREMIUM_REQUIRED',
                        upgrade: true,
                    },
                    { status: 403 }
                );
            }

            const { data: { user } } = await supabase.auth.getUser(
                authHeader.replace('Bearer ', '')
            );

            if (!user) {
                return NextResponse.json(
                    { error: 'Phiên đăng nhập không hợp lệ' },
                    { status: 401 }
                );
            }

            const hasFeature = await canUseFeature(user.id, 'advanced_filters');
            if (!hasFeature) {
                return NextResponse.json(
                    {
                        error: 'Bộ lọc nâng cao chỉ dành cho gói Premium. Nâng cấp để sử dụng!',
                        code: 'PREMIUM_REQUIRED',
                        upgrade: true,
                    },
                    { status: 403 }
                );
            }
        }

        // Build query
        let query = supabase
            .from('dishes')
            .select(`
        *,
        dish_media (id),
        restaurants (
          id,
          name,
          address,
          city,
          ward,
          phone,
          tags,
          min_price,
          max_price
        )
      `);

        // Apply filters
        if (restaurantId) {
            query = query.eq('restaurant_id', restaurantId);
        }
        if (isSignature === 'true') {
            query = query.eq('is_signature', true);
        }
        if (search) {
            query = query.or(`name.ilike.%${search}%,normalized_name.ilike.%${search}%`);
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data: dishes, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch dishes: ${error.message}`);
        }

        return NextResponse.json(
            {
                success: true,
                data: dishes,
                count: dishes?.length || 0,
                pagination: { limit, offset },
            },
            {
                headers: {
                    'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
                },
            }
        );

    } catch (error: any) {
        console.error('Error fetching dishes:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/dishes
 * Create a new dish and automatically sync to RAG pipeline
 * (creates document + document_chunk + embedding)
 *
 * Body: {
 *   name, restaurant_id, is_signature?
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        const { name, restaurant_id } = body;
        if (!name || !restaurant_id) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin bắt buộc: name, restaurant_id' },
                { status: 400 }
            );
        }

        // Verify restaurant exists
        const { data: restaurant, error: restError } = await supabase
            .from('restaurants')
            .select('id, name')
            .eq('id', restaurant_id)
            .single();

        if (restError || !restaurant) {
            return NextResponse.json(
                { success: false, error: `Không tìm thấy nhà hàng với id: ${restaurant_id}` },
                { status: 404 }
            );
        }

        // Build normalized name (for search)
        const normalizedName = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .trim();

        // 1. Insert into dishes table
        const { data: newDish, error: insertError } = await supabase
            .from('dishes')
            .insert({
                name,
                normalized_name: normalizedName,
                restaurant_id,
                is_signature: body.is_signature || false,
            })
            .select('*')
            .single();

        if (insertError) {
            throw new Error(`Failed to insert dish: ${insertError.message}`);
        }

        console.log(`✅ Dish created: ${newDish.name} (${restaurant.name})`);

        // 2. Auto-sync to RAG pipeline (document → chunk → embedding)
        const syncResult = await syncDishToRAG(newDish as Dish);

        return NextResponse.json({
            success: true,
            data: newDish,
            rag_sync: syncResult,
            message: syncResult.success
                ? `Món "${name}" đã được tạo và đồng bộ vào hệ thống RAG thành công!`
                : `Món "${name}" đã được tạo nhưng đồng bộ RAG thất bại: ${syncResult.error}`,
        });

    } catch (error: any) {
        console.error('Error creating dish:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}
