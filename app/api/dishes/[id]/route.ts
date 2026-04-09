import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin, Dish } from '@/lib/db/supabase';
import { syncDishToRAG } from '@/lib/db/document-sync';

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

/**
 * PATCH /api/dishes/[id]
 * Update a single dish's data
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
        delete updates.restaurant_id;
        delete updates.restaurants;
        delete updates.dish_media;
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

        const { data: dishes, error } = await supabaseAdmin
            .from('dishes')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            throw new Error(`Failed to update dish in DB: ${error.message}`);
        }

        if (!dishes || dishes.length === 0) {
            throw new Error(`Cập nhật thất bại. Không tìm thấy ID hoặc bị chặn bởi RLS (id: ${id}).`);
        }

        const dish = dishes[0];

        // Sync to RAG pipeline after update
        await syncDishToRAG(dish as Dish);

        return NextResponse.json({
            success: true,
            data: dish,
        });

    } catch (error: any) {
        console.error('Error updating dish:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}
