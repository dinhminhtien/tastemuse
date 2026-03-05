/**
 * Realtime Sync – Embedding Auto-Generation
 *
 * Listens to Supabase Realtime events on `document_chunks` table.
 * When a new chunk appears (or is updated) WITHOUT an embedding,
 * this listener automatically generates one via Gemini and stores it.
 *
 * This module is started once by `instrumentation.ts` when Next.js boots.
 */

import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { generateEmbedding } from '@/lib/gemini-ai';
import { RAG_CONFIG } from '@/lib/rag-config';

/* =====================================================
 * SINGLETON STATE
 * ===================================================== */

let channel: RealtimeChannel | null = null;
let isRunning = false;

// Use a dedicated Supabase client for Realtime (with service role for reliability)
function getRealtimeClient() {
    const url = process.env.NEXT_PUBLIC_TASTEMUSESUPABASE_URL!;
    const key =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_TASTEMUSESUPABASE_ANON_KEY!;

    return createClient(url, key, {
        realtime: {
            params: { eventsPerSecond: 2 },
        },
    });
}

/* =====================================================
 * CORE: Process a single chunk
 * ===================================================== */

async function processChunk(chunkId: string, content: string) {
    const supabase = getRealtimeClient();

    try {
        // 1. Check if embedding already exists
        const { data: existing } = await supabase
            .from('embeddings')
            .select('id')
            .eq('chunk_id', chunkId)
            .maybeSingle();

        if (existing) {
            console.log(`⏭️  [Realtime] Embedding already exists for chunk ${chunkId}`);
            return;
        }

        // 2. Generate embedding via Gemini
        console.log(`🔄 [Realtime] Generating embedding for chunk ${chunkId}...`);
        const embedding = await generateEmbedding(content);

        // 3. Store embedding
        const { error } = await supabase.from('embeddings').insert({
            chunk_id: chunkId,
            embedding,
            model: RAG_CONFIG.EMBEDDING_MODEL,
        });

        if (error) {
            console.error(`❌ [Realtime] Failed to store embedding: ${error.message}`);
        } else {
            console.log(`✅ [Realtime] Embedding created for chunk ${chunkId}`);
        }
    } catch (err: any) {
        console.error(`❌ [Realtime] Error processing chunk ${chunkId}:`, err.message);
    }
}

/* =====================================================
 * PROCESS BACKLOG: Auto-detect & sync missing data
 * (runs once on startup)
 *
 * Layer 1: restaurants/dishes without documents → create document + chunk
 * Layer 2: chunks without embeddings → generate via Gemini
 * ===================================================== */

async function syncMissingDocuments() {
    const supabase = getRealtimeClient();

    // --- Layer 1A: Find restaurants without a document ---
    console.log('🔍 [Backlog] Checking for restaurants without documents...');

    const { data: allRestaurants } = await supabase
        .from('restaurants')
        .select('id, name, address, ward, district, city, phone, tags, description, open_time, close_time, min_price, max_price')
        .eq('is_active', true);

    if (allRestaurants && allRestaurants.length > 0) {
        let restaurantsSynced = 0;

        for (const r of allRestaurants) {
            // Check if a document already exists for this restaurant
            const { data: existingDoc } = await supabase
                .from('documents')
                .select('id')
                .eq('source_type', 'restaurant')
                .eq('source_id', r.id)
                .maybeSingle();

            if (!existingDoc) {
                // Build raw content
                const parts: string[] = [
                    `Nhà hàng: ${r.name}`,
                    `Địa chỉ: ${r.address}, ${r.ward}, ${r.district ? r.district + ', ' : ''}${r.city}`,
                ];
                if (r.phone) parts.push(`Số điện thoại: ${r.phone}`);
                if (r.tags && r.tags.length > 0) parts.push(`Loại hình: ${r.tags.join(', ')}`);
                if (r.description) parts.push(`Mô tả: ${r.description}`);
                if (r.min_price || r.max_price) {
                    const price = [
                        r.min_price ? `${r.min_price.toLocaleString()}đ` : '',
                        r.max_price ? `${r.max_price.toLocaleString()}đ` : '',
                    ].filter(Boolean).join(' - ');
                    parts.push(`Giá: ${price}`);
                }
                if (r.open_time || r.close_time) {
                    parts.push(`Giờ mở cửa: ${r.open_time || '?'} - ${r.close_time || '?'}`);
                }
                const rawContent = parts.join('\n');

                // Create document
                const { data: newDoc, error: docErr } = await supabase
                    .from('documents')
                    .insert({
                        source_type: 'restaurant',
                        source_id: r.id,
                        title: r.name,
                        raw_content: rawContent,
                        metadata: {
                            city: r.city, district: r.district, ward: r.ward, tags: r.tags,
                            min_price: r.min_price, max_price: r.max_price,
                            open_time: r.open_time, close_time: r.close_time,
                        },
                    })
                    .select('id')
                    .single();

                if (docErr) {
                    console.error(`❌ [Backlog] Doc create failed for restaurant ${r.name}: ${docErr.message}`);
                    continue;
                }

                // Create chunk
                await supabase.from('document_chunks').insert({
                    document_id: newDoc.id,
                    chunk_index: 0,
                    content: rawContent,
                });

                restaurantsSynced++;
                console.log(`✅ [Backlog] Created document + chunk for restaurant: ${r.name}`);
            }
        }

        if (restaurantsSynced > 0) {
            console.log(`📦 [Backlog] Synced ${restaurantsSynced} restaurants`);
        } else {
            console.log('✅ [Backlog] All restaurants already have documents');
        }
    }

    // --- Layer 1B: Find dishes without a document ---
    console.log('🔍 [Backlog] Checking for dishes without documents...');

    const { data: allDishes } = await supabase
        .from('dishes')
        .select('id, name, restaurant_id, is_signature');

    if (allDishes && allDishes.length > 0) {
        let dishesSynced = 0;

        for (const d of allDishes) {
            const { data: existingDoc } = await supabase
                .from('documents')
                .select('id')
                .eq('source_type', 'dish')
                .eq('source_id', d.id)
                .maybeSingle();

            if (!existingDoc) {
                // Fetch parent restaurant
                const { data: rest } = await supabase
                    .from('restaurants')
                    .select('name, address, ward, district, city, tags, min_price, max_price')
                    .eq('id', d.restaurant_id)
                    .single();

                const parts: string[] = [`Món ăn: ${d.name}`];
                if (rest) {
                    parts.push(`Nhà hàng: ${rest.name}`);
                    parts.push(`Địa chỉ: ${rest.address}, ${rest.ward}, ${rest.district ? rest.district + ', ' : ''}${rest.city}`);
                    if (rest.tags && rest.tags.length > 0) parts.push(`Loại hình: ${rest.tags.join(', ')}`);
                    if (rest.min_price || rest.max_price) {
                        const price = [
                            rest.min_price ? `${rest.min_price.toLocaleString()}đ` : '',
                            rest.max_price ? `${rest.max_price.toLocaleString()}đ` : '',
                        ].filter(Boolean).join(' - ');
                        parts.push(`Giá: ${price}`);
                    }
                }
                if (d.is_signature) parts.push('⭐ Đây là món đặc trưng / signature của nhà hàng');
                const rawContent = parts.join('\n');

                // Create document
                const { data: newDoc, error: docErr } = await supabase
                    .from('documents')
                    .insert({
                        source_type: 'dish',
                        source_id: d.id,
                        title: d.name,
                        raw_content: rawContent,
                        metadata: {},
                    })
                    .select('id')
                    .single();

                if (docErr) {
                    console.error(`❌ [Backlog] Doc create failed for dish ${d.name}: ${docErr.message}`);
                    continue;
                }

                // Create chunk
                await supabase.from('document_chunks').insert({
                    document_id: newDoc.id,
                    chunk_index: 0,
                    content: rawContent,
                });

                dishesSynced++;
                console.log(`✅ [Backlog] Created document + chunk for dish: ${d.name}`);
            }
        }

        if (dishesSynced > 0) {
            console.log(`📦 [Backlog] Synced ${dishesSynced} dishes`);
        } else {
            console.log('✅ [Backlog] All dishes already have documents');
        }
    }
}

async function syncMissingEmbeddings() {
    const supabase = getRealtimeClient();

    // --- Layer 2: Find chunks without embeddings ---
    console.log('🔍 [Backlog] Checking for chunks without embeddings...');

    const { data: chunks, error } = await supabase
        .from('document_chunks')
        .select('id, content')
        .order('created_at', { ascending: true });

    if (error || !chunks) {
        console.error('❌ [Backlog] Failed to fetch chunks:', error?.message);
        return;
    }

    let processed = 0;
    for (const chunk of chunks) {
        const { data: existing } = await supabase
            .from('embeddings')
            .select('id')
            .eq('chunk_id', chunk.id)
            .maybeSingle();

        if (!existing) {
            await processChunk(chunk.id, chunk.content);
            processed++;
            // Rate-limit protection
            await new Promise((r) => setTimeout(r, RAG_CONFIG.BATCH_DELAY_MS));
        }
    }

    if (processed > 0) {
        console.log(`✅ [Backlog] Generated ${processed} missing embeddings`);
    } else {
        console.log('✅ [Backlog] All chunks already have embeddings');
    }
}

async function processBacklog() {
    console.log('\n========================================');
    console.log('📦 [Backlog] Starting full sync check...');
    console.log('========================================\n');

    // Layer 1: Sync missing documents + chunks
    await syncMissingDocuments();

    // Layer 2: Sync missing embeddings
    await syncMissingEmbeddings();

    console.log('\n✅ [Backlog] Full sync check completed!\n');
}

/* =====================================================
 * START / STOP THE LISTENER
 * ===================================================== */

export async function startRealtimeSync() {
    if (isRunning) {
        console.log('⚠️  [Realtime] Sync is already running');
        return;
    }

    const supabase = getRealtimeClient();

    console.log('🚀 [Realtime] Starting embedding auto-sync listener...');

    // 1. Process any existing backlog first
    await processBacklog();

    // 2. Subscribe to INSERT and UPDATE on document_chunks
    channel = supabase
        .channel('document-chunks-sync')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'document_chunks',
            },
            async (payload) => {
                const { id, content } = payload.new as { id: string; content: string };
                console.log(`📩 [Realtime] New chunk detected: ${id}`);
                await processChunk(id, content);
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'document_chunks',
            },
            async (payload) => {
                const { id, content } = payload.new as { id: string; content: string };
                console.log(`📝 [Realtime] Chunk updated: ${id}`);

                // Delete old embedding first (trigger already does this, but just in case)
                const { error } = await supabase
                    .from('embeddings')
                    .delete()
                    .eq('chunk_id', id);

                if (error) {
                    console.error(`❌ [Realtime] Failed to delete old embedding: ${error.message}`);
                }

                await processChunk(id, content);
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                isRunning = true;
                console.log('✅ [Realtime] Subscribed to document_chunks changes');
                console.log('🎧 [Realtime] Listening for new restaurants & dishes...');
            } else if (status === 'CHANNEL_ERROR') {
                console.error('❌ [Realtime] Channel error – will retry...');
                isRunning = false;
            } else if (status === 'TIMED_OUT') {
                console.error('⏰ [Realtime] Subscription timed out');
                isRunning = false;
            }
        });
}

export async function stopRealtimeSync() {
    if (channel) {
        const supabase = getRealtimeClient();
        await supabase.removeChannel(channel);
        channel = null;
        isRunning = false;
        console.log('🛑 [Realtime] Embedding sync listener stopped');
    }
}

export function isRealtimeSyncRunning(): boolean {
    return isRunning;
}
