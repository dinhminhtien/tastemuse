import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

/**
 * POST /api/media/upload
 * Saves media URL to the database for a restaurant or dish
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log("API Request Body:", JSON.stringify(body, null, 2));

        const isAdmin = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
        console.log("Is Supabase Admin key present:", isAdmin);
        const { type, id, media_url, media_type = 'image', is_primary = false, is_cover = false } = body;

        if (!type || !id || !media_url) {
            console.error("Validation failed: Missing fields", { type, id, hasMediaUrl: !!media_url });
            return NextResponse.json(
                { success: false, error: 'Missing required fields: type, id, media_url' },
                { status: 400 }
            );
        }

        if (type === 'restaurant') {
            console.log(`Attempting to save restaurant media for ID: ${id}`);

            // Get count for display_order
            const { count, error: countError } = await supabaseAdmin
                .from('restaurant_media')
                .select('*', { count: 'exact', head: true })
                .eq('restaurant_id', id);

            if (countError) {
                console.error("Error fetching media count:", countError);
            }

            const { data, error: insertError } = await supabaseAdmin
                .from('restaurant_media')
                .insert({
                    restaurant_id: id,
                    media_type,
                    media_url,
                    is_cover,
                    display_order: (count || 0) + 1,
                })
                .select('*')
                .single();

            if (insertError) {
                console.error("Supabase Insert Error (Restaurant):", insertError);
                return NextResponse.json({
                    success: false,
                    error: `Database error: ${insertError.message}`,
                    details: insertError,
                    code: insertError.code
                }, { status: 500 });
            }

            console.log("Successfully saved restaurant media:", data.id);
            return NextResponse.json({ success: true, data });

        } else if (type === 'dish') {
            console.log(`Attempting to save dish media for ID: ${id}`);

            // Get count for sort_order
            const { count, error: countError } = await supabaseAdmin
                .from('dish_media')
                .select('*', { count: 'exact', head: true })
                .eq('dish_id', id);

            if (countError) {
                console.error("Error fetching dish media count:", countError);
            }

            const { data, error: insertError } = await supabaseAdmin
                .from('dish_media')
                .insert({
                    dish_id: id,
                    media_type,
                    media_url,
                    is_primary,
                    sort_order: (count || 0) + 1,
                })
                .select('*')
                .single();

            if (insertError) {
                console.error("Supabase Insert Error (Dish):", insertError);
                return NextResponse.json({
                    success: false,
                    error: `Database error: ${insertError.message}`,
                    details: insertError,
                    code: insertError.code
                }, { status: 500 });
            }

            console.log("Successfully saved dish media:", data.id);
            return NextResponse.json({ success: true, data });
        } else {
            return NextResponse.json(
                { success: false, error: 'Invalid type. Must be "restaurant" or "dish"' },
                { status: 400 }
            );
        }

    } catch (error: any) {
        console.error('Final API Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Unknown server error',
                isAdminKeyPresent: !!process.env.SUPABASE_SERVICE_ROLE_KEY
            },
            { status: 500 }
        );
    }
}
