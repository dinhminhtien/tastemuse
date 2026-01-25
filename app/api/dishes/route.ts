import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/dishes
 * Fetch all dishes with optional filters
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Optional filters
        const restaurantId = searchParams.get('restaurantId');
        const isSignature = searchParams.get('isSignature');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query
        let query = supabase
            .from('dishes')
            .select(`
        *,
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

        return NextResponse.json({
            success: true,
            data: dishes,
            count: dishes?.length || 0,
            pagination: {
                limit,
                offset,
            },
        });

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
