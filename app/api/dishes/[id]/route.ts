import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/dishes/[id]
 * Fetch a single dish by ID with restaurant details
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Fetch dish with restaurant
        const { data: dish, error } = await supabase
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
          description,
          min_price,
          max_price,
          open_time,
          close_time
        )
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Dish not found',
                    },
                    { status: 404 }
                );
            }
            throw new Error(`Failed to fetch dish: ${error.message}`);
        }

        return NextResponse.json({
            success: true,
            data: dish,
        });

    } catch (error: any) {
        console.error('Error fetching dish:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}
