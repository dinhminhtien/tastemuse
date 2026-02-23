/**
 * Document Sync Library
 * Automatically creates documents, document_chunks, and embeddings
 * when new restaurants or dishes are added.
 *
 * TasteMuse – RAG Pipeline Auto‑Sync
 */

import { supabase, Restaurant, Dish } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/vertex-ai';
import { RAG_CONFIG } from '@/lib/rag-config';

/* =====================================================
 * TYPES
 * ===================================================== */

interface SyncResult {
    success: boolean;
    documentId?: string;
    chunkId?: string;
    embeddingId?: string;
    error?: string;
}

/* =====================================================
 * BUILD RAW CONTENT FOR DOCUMENTS
 * ===================================================== */

/**
 * Build a rich-text description for a restaurant so the RAG model
 * has complete context when answering user queries.
 */
function buildRestaurantContent(restaurant: Restaurant): string {
    const parts: string[] = [
        `Nhà hàng: ${restaurant.name}`,
        `Địa chỉ: ${restaurant.address}, ${restaurant.ward}, ${restaurant.city}`,
    ];

    if (restaurant.phone) parts.push(`Số điện thoại: ${restaurant.phone}`);

    if (restaurant.tags && restaurant.tags.length > 0) {
        parts.push(`Loại hình: ${restaurant.tags.join(', ')}`);
    }

    if (restaurant.description) {
        parts.push(`Mô tả: ${restaurant.description}`);
    }

    if (restaurant.min_price || restaurant.max_price) {
        const price = [
            restaurant.min_price ? `${restaurant.min_price.toLocaleString()}đ` : '',
            restaurant.max_price ? `${restaurant.max_price.toLocaleString()}đ` : '',
        ]
            .filter(Boolean)
            .join(' - ');
        parts.push(`Giá: ${price}`);
    }

    if (restaurant.open_time || restaurant.close_time) {
        parts.push(
            `Giờ mở cửa: ${restaurant.open_time || '?'} - ${restaurant.close_time || '?'}`
        );
    }

    return parts.join('\n');
}

/**
 * Build a rich-text description for a dish.
 * We also pull the parent restaurant info for extra context.
 */
async function buildDishContent(dish: Dish): Promise<string> {
    // Fetch the parent restaurant for additional context
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('name, address, ward, city, tags, min_price, max_price')
        .eq('id', dish.restaurant_id)
        .single();

    const parts: string[] = [
        `Món ăn: ${dish.name}`,
    ];

    if (restaurant) {
        parts.push(`Nhà hàng: ${restaurant.name}`);
        parts.push(`Địa chỉ: ${restaurant.address}, ${restaurant.ward}, ${restaurant.city}`);
        if (restaurant.tags && restaurant.tags.length > 0) {
            parts.push(`Loại hình: ${restaurant.tags.join(', ')}`);
        }
        if (restaurant.min_price || restaurant.max_price) {
            const price = [
                restaurant.min_price ? `${restaurant.min_price.toLocaleString()}đ` : '',
                restaurant.max_price ? `${restaurant.max_price.toLocaleString()}đ` : '',
            ]
                .filter(Boolean)
                .join(' - ');
            parts.push(`Giá: ${price}`);
        }
    }

    if (dish.is_signature) {
        parts.push('⭐ Đây là món đặc trưng / signature của nhà hàng');
    }

    return parts.join('\n');
}

/* =====================================================
 * CORE SYNC FUNCTIONS
 * ===================================================== */

/**
 * Create a document + chunk + embedding for a **restaurant**.
 * Idempotent: skips if a document with the same source already exists.
 */
export async function syncRestaurantToRAG(
    restaurant: Restaurant
): Promise<SyncResult> {
    const sourceType = 'restaurant';
    const sourceId = restaurant.id;
    const title = restaurant.name;

    try {
        // 1. Check if document already exists
        const { data: existingDoc } = await supabase
            .from('documents')
            .select('id')
            .eq('source_type', sourceType)
            .eq('source_id', sourceId)
            .single();

        if (existingDoc) {
            console.log(`⏭️  Document already exists for restaurant: ${title}`);
            return { success: true, documentId: existingDoc.id };
        }

        // 2. Build raw content
        const rawContent = buildRestaurantContent(restaurant);

        // 3. Insert document
        const { data: newDoc, error: docError } = await supabase
            .from('documents')
            .insert({
                source_type: sourceType,
                source_id: sourceId,
                title,
                raw_content: rawContent,
                metadata: {
                    city: restaurant.city,
                    ward: restaurant.ward,
                    tags: restaurant.tags,
                    min_price: restaurant.min_price,
                    max_price: restaurant.max_price,
                    open_time: restaurant.open_time,
                    close_time: restaurant.close_time,
                },
            })
            .select('id')
            .single();

        if (docError) throw new Error(`Document insert failed: ${docError.message}`);

        console.log(`✅ Document created for restaurant: ${title}`);

        // 4. Create chunk
        const { data: newChunk, error: chunkError } = await supabase
            .from('document_chunks')
            .insert({
                document_id: newDoc.id,
                chunk_index: 0,
                content: rawContent,
            })
            .select('id')
            .single();

        if (chunkError) throw new Error(`Chunk insert failed: ${chunkError.message}`);

        console.log(`✅ Chunk created for restaurant: ${title}`);

        // 5. Generate & store embedding
        console.log(`🔄 Generating embedding for restaurant: ${title}`);
        const embedding = await generateEmbedding(rawContent);

        const { data: newEmbedding, error: embError } = await supabase
            .from('embeddings')
            .insert({
                chunk_id: newChunk.id,
                embedding,
                model: RAG_CONFIG.EMBEDDING_MODEL,
            })
            .select('id')
            .single();

        if (embError) throw new Error(`Embedding insert failed: ${embError.message}`);

        console.log(`✅ Embedding created for restaurant: ${title}`);

        return {
            success: true,
            documentId: newDoc.id,
            chunkId: newChunk.id,
            embeddingId: newEmbedding.id,
        };
    } catch (error: any) {
        console.error(`❌ syncRestaurantToRAG error (${title}):`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Create a document + chunk + embedding for a **dish**.
 * Idempotent: skips if a document with the same source already exists.
 */
export async function syncDishToRAG(dish: Dish): Promise<SyncResult> {
    const sourceType = 'dish';
    const sourceId = dish.id;
    const title = dish.name;

    try {
        // 1. Check if document already exists
        const { data: existingDoc } = await supabase
            .from('documents')
            .select('id')
            .eq('source_type', sourceType)
            .eq('source_id', sourceId)
            .single();

        if (existingDoc) {
            console.log(`⏭️  Document already exists for dish: ${title}`);
            return { success: true, documentId: existingDoc.id };
        }

        // 2. Build raw content (async because it fetches restaurant data)
        const rawContent = await buildDishContent(dish);

        // 3. Insert document
        const { data: newDoc, error: docError } = await supabase
            .from('documents')
            .insert({
                source_type: sourceType,
                source_id: sourceId,
                title,
                raw_content: rawContent,
                metadata: {},
            })
            .select('id')
            .single();

        if (docError) throw new Error(`Document insert failed: ${docError.message}`);

        console.log(`✅ Document created for dish: ${title}`);

        // 4. Create chunk
        const { data: newChunk, error: chunkError } = await supabase
            .from('document_chunks')
            .insert({
                document_id: newDoc.id,
                chunk_index: 0,
                content: rawContent,
            })
            .select('id')
            .single();

        if (chunkError) throw new Error(`Chunk insert failed: ${chunkError.message}`);

        console.log(`✅ Chunk created for dish: ${title}`);

        // 5. Generate & store embedding
        console.log(`🔄 Generating embedding for dish: ${title}`);
        const embedding = await generateEmbedding(rawContent);

        const { data: newEmbedding, error: embError } = await supabase
            .from('embeddings')
            .insert({
                chunk_id: newChunk.id,
                embedding,
                model: RAG_CONFIG.EMBEDDING_MODEL,
            })
            .select('id')
            .single();

        if (embError) throw new Error(`Embedding insert failed: ${embError.message}`);

        console.log(`✅ Embedding created for dish: ${title}`);

        return {
            success: true,
            documentId: newDoc.id,
            chunkId: newChunk.id,
            embeddingId: newEmbedding.id,
        };
    } catch (error: any) {
        console.error(`❌ syncDishToRAG error (${title}):`, error.message);
        return { success: false, error: error.message };
    }
}

/* =====================================================
 * BATCH SYNC (useful for initial data migration)
 * ===================================================== */

/**
 * Sync ALL restaurants that don't yet have a document.
 */
export async function syncAllRestaurants(): Promise<{
    total: number;
    synced: number;
    errors: string[];
}> {
    const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true);

    if (error || !restaurants) {
        return { total: 0, synced: 0, errors: [error?.message || 'No restaurants found'] };
    }

    const errors: string[] = [];
    let synced = 0;

    for (const r of restaurants) {
        const result = await syncRestaurantToRAG(r as Restaurant);
        if (result.success) synced++;
        else if (result.error) errors.push(`${r.name}: ${result.error}`);

        // Rate-limit protection
        await new Promise((resolve) => setTimeout(resolve, RAG_CONFIG.BATCH_DELAY_MS));
    }

    return { total: restaurants.length, synced, errors };
}

/**
 * Sync ALL dishes that don't yet have a document.
 */
export async function syncAllDishes(): Promise<{
    total: number;
    synced: number;
    errors: string[];
}> {
    const { data: dishes, error } = await supabase
        .from('dishes')
        .select('*');

    if (error || !dishes) {
        return { total: 0, synced: 0, errors: [error?.message || 'No dishes found'] };
    }

    const errors: string[] = [];
    let synced = 0;

    for (const d of dishes) {
        const result = await syncDishToRAG(d as Dish);
        if (result.success) synced++;
        else if (result.error) errors.push(`${d.name}: ${result.error}`);

        // Rate-limit protection
        await new Promise((resolve) => setTimeout(resolve, RAG_CONFIG.BATCH_DELAY_MS));
    }

    return { total: dishes.length, synced, errors };
}
