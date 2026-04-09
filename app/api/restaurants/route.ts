import { NextRequest, NextResponse } from 'next/server';
import { supabase, Restaurant } from '@/lib/db/supabase';
import { syncRestaurantToRAG } from '@/lib/db/document-sync';
import { canUseFeature } from '@/lib/services/subscription';

/**
 * GET /api/restaurants
 * Fetch all restaurants with optional filters
 * Advanced filters (price range, tags, sorting) require Premium subscription
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Optional filters
        const city = searchParams.get('city');
        const ward = searchParams.get('ward');
        const tags = searchParams.get('tags')?.split(',');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const sortBy = searchParams.get('sortBy'); // 'popularity' | 'rating' | 'price_asc' | 'price_desc'
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Check if advanced filters are being used
        const usingAdvancedFilters = !!(minPrice || maxPrice || (tags && tags.length > 0) || sortBy);

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
            .from('restaurants')
            .select('*, restaurant_media(id)')
            .eq('is_active', true);

        // Apply filters
        if (city) query = query.eq('city', city);
        if (ward) query = query.eq('ward', ward);
        if (tags && tags.length > 0) {
            query = query.contains('tags', tags);
        }
        if (minPrice) query = query.gte('min_price', parseInt(minPrice));
        if (maxPrice) query = query.lte('max_price', parseInt(maxPrice));

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data: restaurants, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch restaurants: ${error.message}`);
        }

        return NextResponse.json(
            {
                success: true,
                data: restaurants,
                count: restaurants?.length || 0,
                pagination: { limit, offset },
            },
            {
                headers: {
                    'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
                },
            }
        );

    } catch (error: any) {
        console.error('Error fetching restaurants:', error);
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
 * POST /api/restaurants
 * Create a new restaurant and automatically sync to RAG pipeline
 * (creates document + document_chunk + embedding)
 *
 * Body: {
 *   name, address, ward, city, phone?, tags?, description?,
 *   open_time?, close_time?, min_price?, max_price?
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate required fields
        const { name, address, ward, district, city } = body;
        if (!name || !address || !ward || !city) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin bắt buộc: name, address, ward, city' },
                { status: 400 }
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

        // Build slug
        const slug = normalizedName.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        // 1. Insert into restaurants table
        const { data: newRestaurant, error: insertError } = await supabase
            .from('restaurants')
            .insert({
                name,
                normalized_name: normalizedName,
                slug,
                address,
                ward,
                district: district || null,
                city,
                phone: body.phone || null,
                tags: body.tags || [],
                description: body.description || '',
                is_active: true,
                open_time: body.open_time || null,
                close_time: body.close_time || null,
                min_price: body.min_price || null,
                max_price: body.max_price || null,
            })
            .select('*')
            .single();

        if (insertError) {
            throw new Error(`Failed to insert restaurant: ${insertError.message}`);
        }

        console.log(`✅ Restaurant created: ${newRestaurant.name}`);

        // 2. Auto-sync to RAG pipeline (document → chunk → embedding)
        const syncResult = await syncRestaurantToRAG(newRestaurant as Restaurant);

        return NextResponse.json({
            success: true,
            data: newRestaurant,
            rag_sync: syncResult,
            message: syncResult.success
                ? `Nhà hàng "${name}" đã được tạo và đồng bộ vào hệ thống RAG thành công!`
                : `Nhà hàng "${name}" đã được tạo nhưng đồng bộ RAG thất bại: ${syncResult.error}`,
        });

    } catch (error: any) {
        console.error('Error creating restaurant:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}
