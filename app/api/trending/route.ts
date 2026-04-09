import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

/**
 * GET /api/trending?type=dish&days=7&limit=10
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get('type') || null;
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '10');

    try {
        const { data: trending, error } = await supabaseAdmin.rpc('get_trending_items', {
            p_target_type: targetType,
            p_days: days,
            p_limit: limit,
        });

        if (error) {
            console.error('Trending error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Enrich with names and images
        const enriched = await Promise.all(
            (trending || []).map(async (item: any) => {
                if (item.target_type === 'dish') {
                    const { data } = await supabaseAdmin
                        .from('dishes')
                        .select('name, dish_media(media_url, is_primary)')
                        .eq('id', item.target_id)
                        .single();

                    return {
                        ...item,
                        name: data?.name || 'Unknown',
                        image_url: data?.dish_media?.find((m: any) => m.is_primary)?.media_url
                            || data?.dish_media?.[0]?.media_url || null,
                    };
                } else if (item.target_type === 'restaurant') {
                    const { data } = await supabaseAdmin
                        .from('restaurants')
                        .select('name, slug, restaurant_media(media_url, is_cover)')
                        .eq('id', item.target_id)
                        .single();

                    return {
                        ...item,
                        name: data?.name || 'Unknown',
                        slug: data?.slug,
                        image_url: data?.restaurant_media?.find((m: any) => m.is_cover)?.media_url
                            || data?.restaurant_media?.[0]?.media_url || null,
                    };
                }
                return item;
            })
        );

        return NextResponse.json(
            { success: true, data: enriched },
            {
                headers: {
                    'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
                },
            }
        );
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
