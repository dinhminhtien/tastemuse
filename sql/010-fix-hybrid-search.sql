-- ============================================================
-- Fix: hybrid_search — column type mismatches
-- Run in Supabase SQL Editor
-- ============================================================

DROP FUNCTION IF EXISTS hybrid_search(vector, double precision, double precision, double precision, integer, integer, text[], double precision, integer);
DROP FUNCTION IF EXISTS hybrid_search(vector, double precision, double precision, double precision, integer, integer, text[], real, integer);

CREATE OR REPLACE FUNCTION hybrid_search(
    query_embedding vector(3072),
    p_user_lat DOUBLE PRECISION DEFAULT NULL,
    p_user_lng DOUBLE PRECISION DEFAULT NULL,
    p_max_distance_km DOUBLE PRECISION DEFAULT NULL,
    p_min_price INT DEFAULT NULL,
    p_max_price INT DEFAULT NULL,
    p_tags TEXT[] DEFAULT NULL,
    match_threshold FLOAT DEFAULT 0.3,
    match_count INT DEFAULT 10
)
RETURNS TABLE(
    document_id UUID,
    source_type TEXT,
    source_id TEXT,
    title TEXT,
    content TEXT,
    semantic_similarity FLOAT,
    avg_rating FLOAT,
    distance_km DOUBLE PRECISION,
    hybrid_score DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    WITH semantic_matches AS (
        SELECT
            d.id AS doc_id,
            d.source_type::TEXT AS s_type,
            d.source_id::TEXT AS s_id,
            d.title::TEXT AS s_title,
            dc.content::TEXT AS s_content,
            (1 - (e.embedding <=> query_embedding))::FLOAT AS similarity,
            d.metadata
        FROM embeddings e
        JOIN document_chunks dc ON dc.id = e.chunk_id
        JOIN documents d ON d.id = dc.document_id
        WHERE (1 - (e.embedding <=> query_embedding)) > match_threshold
        ORDER BY e.embedding <=> query_embedding ASC
        LIMIT match_count * 3
    ),
    enriched AS (
        SELECT
            sm.doc_id,
            sm.s_type,
            sm.s_id,
            sm.s_title,
            sm.s_content,
            sm.similarity,
            COALESCE(
                (SELECT AVG(r.score)::FLOAT FROM ratings r
                 WHERE r.target_id = sm.s_id::UUID AND r.target_type = sm.s_type),
                3.0::FLOAT
            ) AS rating,
            CASE
                WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL
                     AND sm.s_type = 'restaurant'
                THEN (
                    SELECT haversine_distance(p_user_lat, p_user_lng, res.lat, res.lng)
                    FROM restaurants res WHERE res.id = sm.s_id::UUID AND res.lat IS NOT NULL
                )
                WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL
                     AND sm.s_type = 'dish'
                THEN (
                    SELECT haversine_distance(p_user_lat, p_user_lng, res.lat, res.lng)
                    FROM dishes dsh
                    JOIN restaurants res ON res.id = dsh.restaurant_id
                    WHERE dsh.id = sm.s_id::UUID AND res.lat IS NOT NULL
                )
                ELSE NULL
            END AS dist_km,
            sm.metadata
        FROM semantic_matches sm
    )
    SELECT
        en.doc_id AS document_id,
        en.s_type AS source_type,
        en.s_id AS source_id,
        en.s_title AS title,
        en.s_content AS content,
        en.similarity::FLOAT AS semantic_similarity,
        en.rating::FLOAT AS avg_rating,
        en.dist_km::DOUBLE PRECISION AS distance_km,
        (
            (en.similarity * 0.6) +
            ((en.rating / 5.0) * 0.2) +
            (CASE
                WHEN en.dist_km IS NULL THEN 0.1
                WHEN en.dist_km <= 1 THEN 0.2
                WHEN en.dist_km <= 3 THEN 0.15
                WHEN en.dist_km <= 5 THEN 0.1
                WHEN en.dist_km <= 10 THEN 0.05
                ELSE 0.0
            END)
        )::DOUBLE PRECISION AS hybrid_score
    FROM enriched en
    WHERE
        (p_max_distance_km IS NULL OR en.dist_km IS NULL OR en.dist_km <= p_max_distance_km)
        AND (p_min_price IS NULL OR (en.metadata->>'min_price')::INT IS NULL OR (en.metadata->>'min_price')::INT >= p_min_price)
        AND (p_max_price IS NULL OR (en.metadata->>'max_price')::INT IS NULL OR (en.metadata->>'max_price')::INT <= p_max_price)
        AND (p_tags IS NULL OR en.metadata->'tags' ?| p_tags)
    ORDER BY hybrid_score DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

SELECT 'hybrid_search fixed! ✅' AS status;
