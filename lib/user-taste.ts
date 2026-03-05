/**
 * User Taste Embedding – Dynamic user vector management
 *
 * new_user_vector = (old_vector * 0.7) + (interaction_vector * 0.3)
 *
 * TasteMuse – Personalization Engine
 */

import { supabaseAdmin as supabase } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/gemini-ai';

/* =====================================================
 * WEIGHTS FOR DIFFERENT INTERACTIONS
 * ===================================================== */

const TASTE_WEIGHTS = {
    favorite: 0.35,      // Strong signal
    rating_5: 0.30,      // Loves it
    rating_4: 0.25,      // Likes it
    rating_3: 0.15,      // Neutral
    rating_2: 0.05,      // Dislikes
    rating_1: 0.0,       // Skip (negative signal handled differently)
    click: 0.10,         // Mild interest
    search: 0.20,        // Intent signal
    chat_query: 0.20,    // Intent signal
} as const;

/* =====================================================
 * UPDATE USER TASTE VECTOR
 * ===================================================== */

/**
 * Update user taste embedding based on an interaction
 */
export async function updateUserTaste(
    userId: string,
    interactionType: 'favorite' | 'rating' | 'click' | 'search' | 'chat_query',
    options: {
        targetId?: string;          // For favorite, rating, click: the dish/restaurant ID
        targetType?: 'dish' | 'restaurant';
        ratingScore?: number;       // For rating: 1-5
        searchQuery?: string;       // For search/chat_query: the text
        content?: string;           // Pre-built content string (for RAG docs)
    } = {}
): Promise<void> {
    try {
        // Determine the weight based on interaction type
        let weight: number;
        if (interactionType === 'rating' && options.ratingScore) {
            const key = `rating_${options.ratingScore}` as keyof typeof TASTE_WEIGHTS;
            weight = TASTE_WEIGHTS[key] ?? TASTE_WEIGHTS.rating_3;
        } else if (interactionType !== 'rating') {
            weight = TASTE_WEIGHTS[interactionType] ?? 0.1;
        } else {
            weight = TASTE_WEIGHTS.rating_3;
        }

        // Skip if weight is 0 (e.g., 1-star rating)
        if (weight <= 0) return;

        // Generate the interaction embedding
        let interactionEmbedding: number[];

        if (options.searchQuery) {
            // For search/chat queries, embed the query text
            interactionEmbedding = await generateEmbedding(options.searchQuery);
        } else if (options.targetId) {
            // For favorites, ratings, clicks: get the document embedding for this target
            const targetEmb = await getTargetEmbedding(options.targetId, options.targetType);
            if (!targetEmb) return; // No embedding found for target
            interactionEmbedding = targetEmb;
        } else if (options.content) {
            // Pre-built content string
            interactionEmbedding = await generateEmbedding(options.content);
        } else {
            return; // Nothing to embed
        }

        // Call the SQL function to update the taste vector
        const { error } = await supabase.rpc('update_user_taste_embedding', {
            p_user_id: userId,
            p_interaction_embedding: interactionEmbedding,
            p_weight: weight,
        });

        if (error) {
            console.error(`❌ update_user_taste_embedding failed:`, error.message);
            // Fallback: do it in TypeScript
            await updateTasteInTypescript(userId, interactionEmbedding, weight);
        } else {
            console.log(`✅ User taste updated (type: ${interactionType}, weight: ${weight})`);
        }
    } catch (error) {
        console.error('❌ updateUserTaste error:', error);
    }
}

/* =====================================================
 * HELPERS
 * ===================================================== */

/**
 * Get the embedding vector for a dish or restaurant target
 */
async function getTargetEmbedding(
    targetId: string,
    targetType?: 'dish' | 'restaurant'
): Promise<number[] | null> {
    // Find the document for this target
    const query = supabase
        .from('documents')
        .select('id')
        .eq('source_id', targetId);

    if (targetType) {
        query.eq('source_type', targetType);
    }

    const { data: doc } = await query.single();
    if (!doc) return null;

    // Get the embedding for this document's chunk
    const { data: chunk } = await supabase
        .from('document_chunks')
        .select('id')
        .eq('document_id', doc.id)
        .single();

    if (!chunk) return null;

    const { data: embedding } = await supabase
        .from('embeddings')
        .select('embedding')
        .eq('chunk_id', chunk.id)
        .single();

    return embedding?.embedding || null;
}

/**
 * Fallback: Update taste in TypeScript if SQL function isn't available
 * new = (old * (1-weight)) + (interaction * weight)
 */
async function updateTasteInTypescript(
    userId: string,
    interactionEmbedding: number[],
    weight: number
): Promise<void> {
    // Get existing profile
    const { data: profile } = await supabase
        .from('user_taste_profiles')
        .select('taste_embedding, interaction_count')
        .eq('user_id', userId)
        .single();

    if (!profile || !profile.taste_embedding) {
        // First interaction: set directly
        await supabase
            .from('user_taste_profiles')
            .upsert({
                user_id: userId,
                taste_embedding: interactionEmbedding,
                interaction_count: 1,
                last_updated: new Date().toISOString(),
            })
            .eq('user_id', userId);
        return;
    }
    // Supabase returns vector type as a string like "[0.1,0.2,...]"
    // Parse it into a number array
    let oldEmbedding: number[];
    if (typeof profile.taste_embedding === 'string') {
        oldEmbedding = JSON.parse(profile.taste_embedding);
    } else if (Array.isArray(profile.taste_embedding)) {
        oldEmbedding = profile.taste_embedding;
    } else {
        // Unknown format, treat as first interaction
        await supabase
            .from('user_taste_profiles')
            .update({
                taste_embedding: interactionEmbedding,
                interaction_count: (profile.interaction_count || 0) + 1,
                last_updated: new Date().toISOString(),
            })
            .eq('user_id', userId);
        return;
    }

    // Weighted average
    const oldWeight = 1 - weight;
    const newEmbedding = oldEmbedding.map(
        (val: number, i: number) => val * oldWeight + interactionEmbedding[i] * weight
    );

    await supabase
        .from('user_taste_profiles')
        .update({
            taste_embedding: newEmbedding,
            interaction_count: (profile.interaction_count || 0) + 1,
            last_updated: new Date().toISOString(),
        })
        .eq('user_id', userId);
}

/**
 * Get personalized recommendations for a user
 */
export async function getPersonalizedRecommendations(
    userId: string,
    limit: number = 10
) {
    const { data, error } = await supabase.rpc('get_personalized_recommendations', {
        p_user_id: userId,
        p_limit: limit,
        p_threshold: 0.3,
    });

    if (error) {
        console.error('❌ Personalized recommendations error:', error);
        return [];
    }

    return data || [];
}
