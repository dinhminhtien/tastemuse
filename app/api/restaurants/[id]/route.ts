import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, Restaurant } from '@/lib/supabase';
import { syncRestaurantToRAG } from '@/lib/document-sync';

/**
 * GET /api/restaurants/[id]
 * Fetch a single restaurant by ID with dishes
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

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

/**
 * PATCH /api/restaurants/[id]
 * Update a single restaurant's data
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const updates = await req.json();

        // Optional: Ensure user is admin or authenticated before update
        // We skip strict auth for now since it's an internal tool

        // Avoid touching sensitive fields or joined relations
        delete updates.id;
        delete updates.created_at;
        delete updates.restaurant_media;
        delete updates.dishes;
        delete updates.avg_rating;
        delete updates.rating_count;

        // If name changes, we should ideally re-normalize it
        if (updates.name) {
            updates.normalized_name = updates.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'D')
                .trim();
        }

        const { data: restaurants, error } = await supabaseAdmin
            .from('restaurants')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            throw new Error(`Failed to update restaurant in DB: ${error.message}`);
        }

        if (!restaurants || restaurants.length === 0) {
            throw new Error(`Cập nhật thất bại. Không tìm thấy ID hoặc bị chặn bởi RLS (id: ${id}).`);
        }

        const restaurant = restaurants[0];

        // Sync to RAG pipeline after update
        await syncRestaurantToRAG(restaurant as Restaurant);

        return NextResponse.json({
            success: true,
            data: restaurant,
        });

    } catch (error: any) {
        console.error('Error updating restaurant:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}
