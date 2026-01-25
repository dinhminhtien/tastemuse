import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/restaurants
 * Fetch all restaurants with optional filters
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
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query
        let query = supabase
            .from('restaurants')
            .select('*')
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

        return NextResponse.json({
            success: true,
            data: restaurants,
            count: restaurants?.length || 0,
            pagination: {
                limit,
                offset,
            },
        });

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
