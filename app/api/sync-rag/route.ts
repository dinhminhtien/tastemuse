import { NextRequest, NextResponse } from 'next/server';
import {
    syncAllRestaurants,
    syncAllDishes,
    syncRestaurantToRAG,
    syncDishToRAG,
} from '@/lib/db/document-sync';
import { supabase, Restaurant, Dish } from '@/lib/db/supabase';
import {
    startRealtimeSync,
    stopRealtimeSync,
    isRealtimeSyncRunning,
} from '@/lib/db/realtime-sync';

/**
 * POST /api/sync-rag
 * Manually trigger RAG sync or control the Realtime listener.
 *
 * Body:
 * {
 *   type?: 'all' | 'restaurants' | 'dishes' | 'single' | 'start-realtime' | 'stop-realtime',
 *   source_type?: 'restaurant' | 'dish',   // required when type = 'single'
 *   source_id?: string,                     // required when type = 'single'
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const syncType = body.type || 'all';

        console.log(`🚀 Starting RAG sync (type: ${syncType})...`);

        // --- Realtime listener control ---
        if (syncType === 'start-realtime') {
            await startRealtimeSync();
            return NextResponse.json({
                success: true,
                message: 'Realtime sync started',
                running: isRealtimeSyncRunning(),
            });
        }

        if (syncType === 'stop-realtime') {
            await stopRealtimeSync();
            return NextResponse.json({
                success: true,
                message: 'Realtime sync stopped',
                running: isRealtimeSyncRunning(),
            });
        }

        // --- Single entity sync ---
        if (syncType === 'single') {
            const { source_type, source_id } = body;

            if (!source_type || !source_id) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Cần source_type ("restaurant" | "dish") và source_id',
                    },
                    { status: 400 }
                );
            }

            if (source_type === 'restaurant') {
                const { data, error } = await supabase
                    .from('restaurants')
                    .select('*')
                    .eq('id', source_id)
                    .single();

                if (error || !data) {
                    return NextResponse.json(
                        { success: false, error: `Không tìm thấy restaurant: ${source_id}` },
                        { status: 404 }
                    );
                }

                const result = await syncRestaurantToRAG(data as Restaurant);
                return NextResponse.json({ success: result.success, result });
            }

            if (source_type === 'dish') {
                const { data, error } = await supabase
                    .from('dishes')
                    .select('*')
                    .eq('id', source_id)
                    .single();

                if (error || !data) {
                    return NextResponse.json(
                        { success: false, error: `Không tìm thấy dish: ${source_id}` },
                        { status: 404 }
                    );
                }

                const result = await syncDishToRAG(data as Dish);
                return NextResponse.json({ success: result.success, result });
            }

            return NextResponse.json(
                { success: false, error: 'source_type phải là "restaurant" hoặc "dish"' },
                { status: 400 }
            );
        }

        // --- Batch sync ---
        const results: Record<string, any> = {};

        if (syncType === 'all' || syncType === 'restaurants') {
            console.log('📦 Syncing restaurants...');
            results.restaurants = await syncAllRestaurants();
            console.log(
                `✅ Restaurants: ${results.restaurants.synced}/${results.restaurants.total} synced`
            );
        }

        if (syncType === 'all' || syncType === 'dishes') {
            console.log('📦 Syncing dishes...');
            results.dishes = await syncAllDishes();
            console.log(
                `✅ Dishes: ${results.dishes.synced}/${results.dishes.total} synced`
            );
        }

        return NextResponse.json({
            success: true,
            message: 'RAG sync completed',
            results,
        });
    } catch (error: any) {
        console.error('❌ RAG sync error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/sync-rag
 * Returns the current sync status – how many restaurants/dishes have
 * a corresponding document vs. how many are missing.
 * Also shows whether the Realtime listener is running.
 */
export async function GET() {
    try {
        // Count total restaurants & dishes
        const { count: totalRestaurants } = await supabase
            .from('restaurants')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        const { count: totalDishes } = await supabase
            .from('dishes')
            .select('*', { count: 'exact', head: true });

        // Count documents by source_type
        const { count: restaurantDocs } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('source_type', 'restaurant');

        const { count: dishDocs } = await supabase
            .from('documents')
            .select('*', { count: 'exact', head: true })
            .eq('source_type', 'dish');

        // Count embeddings
        const { count: totalEmbeddings } = await supabase
            .from('embeddings')
            .select('*', { count: 'exact', head: true });

        // Count chunks without embeddings
        const { count: totalChunks } = await supabase
            .from('document_chunks')
            .select('*', { count: 'exact', head: true });

        return NextResponse.json({
            success: true,
            status: {
                restaurants: {
                    total: totalRestaurants || 0,
                    synced: restaurantDocs || 0,
                    missing: (totalRestaurants || 0) - (restaurantDocs || 0),
                },
                dishes: {
                    total: totalDishes || 0,
                    synced: dishDocs || 0,
                    missing: (totalDishes || 0) - (dishDocs || 0),
                },
                totalChunks: totalChunks || 0,
                totalEmbeddings: totalEmbeddings || 0,
                pendingEmbeddings: (totalChunks || 0) - (totalEmbeddings || 0),
                realtimeListener: {
                    running: isRealtimeSyncRunning(),
                },
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
