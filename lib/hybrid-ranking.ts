/**
 * Hybrid Ranking Module
 * score = (semantic_similarity * 0.6) + (rating_score * 0.2) + (distance_score * 0.2)
 *
 * TasteMuse – Recommendation Ranking Engine
 */

import { supabaseAdmin as supabase } from '@/lib/supabase';
import type { HybridSearchResult, ChatFilters } from '@/types/database';

/* =====================================================
 * RANKING WEIGHTS
 * ===================================================== */

export const RANKING_WEIGHTS = {
    SEMANTIC: 0.6,
    RATING: 0.2,
    DISTANCE: 0.2,
} as const;

/* =====================================================
 * HYBRID SEARCH (calls the SQL function)
 * ===================================================== */

/**
 * Perform hybrid search combining semantic similarity, ratings, and distance
 */
export async function hybridSearch(
    queryEmbedding: number[],
    options: {
        userLat?: number;
        userLng?: number;
        filters?: ChatFilters;
        matchThreshold?: number;
        matchCount?: number;
    } = {}
): Promise<HybridSearchResult[]> {
    const {
        userLat,
        userLng,
        filters = {},
        matchThreshold = 0.3,
        matchCount = 6,
    } = options;

    try {
        const { data, error } = await supabase.rpc('hybrid_search', {
            query_embedding: queryEmbedding,
            p_user_lat: userLat ?? null,
            p_user_lng: userLng ?? null,
            p_max_distance_km: filters.maxDistance ?? null,
            p_min_price: filters.budget?.min ?? null,
            p_max_price: filters.budget?.max ?? null,
            p_tags: filters.tags ?? null,
            match_threshold: matchThreshold,
            match_count: matchCount,
        });

        if (error) {
            console.error('❌ Hybrid search error:', error.message);
            // Fallback to basic semantic search
            return fallbackSearch(queryEmbedding, matchThreshold, matchCount);
        }

        return (data || []) as HybridSearchResult[];
    } catch (error) {
        console.error('❌ Hybrid search exception:', error);
        return fallbackSearch(queryEmbedding, matchThreshold, matchCount);
    }
}

/**
 * Fallback to basic semantic search if hybrid_search function isn't available yet
 */
async function fallbackSearch(
    queryEmbedding: number[],
    matchThreshold: number,
    matchCount: number
): Promise<HybridSearchResult[]> {
    const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
    });

    if (error || !data) return [];

    return data.map((match: any) => ({
        document_id: match.document_id,
        source_type: match.source_type || 'unknown',
        source_id: match.source_id || '',
        title: match.title,
        content: match.content,
        semantic_similarity: match.similarity,
        avg_rating: 0,
        distance_km: undefined,
        hybrid_score: match.similarity, // No hybrid scoring in fallback
    }));
}

/* =====================================================
 * CLIENT-SIDE HYBRID SCORING (fallback if no SQL fn)
 * ===================================================== */

/**
 * Calculate hybrid score for a single result
 * Used when the SQL function isn't available
 */
export function calculateHybridScore(
    semanticSimilarity: number,
    avgRating: number = 3.0,
    distanceKm?: number
): number {
    const ratingScore = avgRating / 5.0;
    const distanceScore = getDistanceScore(distanceKm);

    return (
        semanticSimilarity * RANKING_WEIGHTS.SEMANTIC +
        ratingScore * RANKING_WEIGHTS.RATING +
        distanceScore * RANKING_WEIGHTS.DISTANCE
    );
}

/**
 * Convert distance in km to a 0-1 score
 * Closer = higher score
 */
function getDistanceScore(distanceKm?: number): number {
    if (distanceKm === undefined || distanceKm === null) return 0.1; // Neutral
    if (distanceKm <= 1) return 1.0;
    if (distanceKm <= 3) return 0.75;
    if (distanceKm <= 5) return 0.5;
    if (distanceKm <= 10) return 0.25;
    return 0.0;
}

/* =====================================================
 * FORMAT RESULTS FOR LLM CONTEXT
 * ===================================================== */

/**
 * Format hybrid search results into context string for LLM
 */
export function formatHybridContext(results: HybridSearchResult[]): string {
    if (!results || results.length === 0) {
        return 'Không tìm thấy thông tin phù hợp với yêu cầu của bạn.';
    }

    return results
        .map((r, index) => {
            const parts = [
                `${index + 1}. ${r.title}`,
                `   Độ phù hợp: ${(r.hybrid_score * 100).toFixed(1)}%`,
            ];

            if (r.avg_rating > 0) {
                parts.push(`   Đánh giá: ${r.avg_rating}/5 ⭐`);
            }

            if (r.distance_km !== undefined && r.distance_km !== null) {
                parts.push(`   Khoảng cách: ${r.distance_km.toFixed(1)} km`);
            }

            parts.push(`   ${r.content}`);

            return parts.join('\n');
        })
        .join('\n\n');
}
