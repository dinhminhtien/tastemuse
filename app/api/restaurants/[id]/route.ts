import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/restaurants/[id]
 * Fetch a single restaurant by ID with dishes
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Fetch restaurant with dishes
        const { data: restaurant, error } = await supabase
            .from('restaurants')
            .select(`
        *,
        dishes (
          id,
          name,
          normalized_name,
          is_signature
        )
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Restaurant not found',
                    },
                    { status: 404 }
                );
            }
            throw new Error(`Failed to fetch restaurant: ${error.message}`);
        }

        return NextResponse.json({
            success: true,
            data: restaurant,
        });

    } catch (error: any) {
        console.error('Error fetching restaurant:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}
