-- ============================================================
-- TasteMuse – Trending Engine & Geocoordinates
-- Run in Supabase SQL Editor
-- ============================================================

-- ************************************************************
-- 1. ADD GEOCOORDINATES TO RESTAURANTS
-- ************************************************************
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

COMMENT ON COLUMN restaurants.lat IS 'Latitude for Google Maps and distance calculations';
COMMENT ON COLUMN restaurants.lng IS 'Longitude for Google Maps and distance calculations';

-- ************************************************************
-- 2. FUNCTION: Calculate distance between two points (Haversine)
-- Returns distance in kilometers
-- ************************************************************
CREATE OR REPLACE FUNCTION haversine_distance(
    lat1 DOUBLE PRECISION,
    lng1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lng2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    R DOUBLE PRECISION := 6371;  -- Earth radius in km
    dlat DOUBLE PRECISION;
    dlng DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dlat := radians(lat2 - lat1);
    dlng := radians(lng2 - lng1);
    a := sin(dlat / 2) ^ 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ^ 2;
    c := 2 * asin(sqrt(a));
    RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ************************************************************
-- 3. FUNCTION: Get restaurants within radius
-- ************************************************************
CREATE OR REPLACE FUNCTION get_restaurants_nearby(
    p_lat DOUBLE PRECISION,
    p_lng DOUBLE PRECISION,
    p_radius_km DOUBLE PRECISION DEFAULT 5.0,
    p_limit INT DEFAULT 20
)
RETURNS TABLE(
    restaurant_id UUID,
    name TEXT,
    distance_km DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id AS restaurant_id,
        r.name,
        haversine_distance(p_lat, p_lng, r.lat, r.lng) AS distance_km
    FROM restaurants r
    WHERE r.is_active = true
      AND r.lat IS NOT NULL
      AND r.lng IS NOT NULL
      AND haversine_distance(p_lat, p_lng, r.lat, r.lng) <= p_radius_km
    ORDER BY distance_km ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ************************************************************
-- 4. TRENDING ENGINE: 7-day weighted formula
-- Recent interactions count more than older ones
-- ************************************************************
CREATE OR REPLACE FUNCTION get_trending_items(
    p_target_type TEXT DEFAULT NULL,  -- 'dish', 'restaurant', or NULL for both
    p_days INT DEFAULT 7,
    p_limit INT DEFAULT 10
)
RETURNS TABLE(
    target_type TEXT,
    target_id UUID,
    trending_score DOUBLE PRECISION,
    view_count BIGINT,
    interaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ui.target_type,
        ui.target_id,
        -- Weighted score: more recent = higher weight
        -- Weight = 1.0 for today, decays to ~0.14 for 7 days ago
        SUM(
            CASE ui.interaction_type
                WHEN 'view' THEN 1.0
                WHEN 'click' THEN 2.0
                WHEN 'share' THEN 3.0
                WHEN 'search' THEN 1.5
                WHEN 'chat_query' THEN 1.5
                WHEN 'map_click' THEN 2.0
                ELSE 1.0
            END
            * (1.0 / (1.0 + EXTRACT(EPOCH FROM (now() - ui.created_at)) / 86400.0))
        )::DOUBLE PRECISION AS trending_score,
        COUNT(*) FILTER (WHERE ui.interaction_type = 'view') AS view_count,
        COUNT(*) AS interaction_count
    FROM user_interactions ui
    WHERE ui.created_at > now() - (p_days || ' days')::INTERVAL
      AND ui.target_type IS NOT NULL
      AND ui.target_id IS NOT NULL
      AND (p_target_type IS NULL OR ui.target_type = p_target_type)
    GROUP BY ui.target_type, ui.target_id
    ORDER BY trending_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ************************************************************
-- 5. HYBRID RANKING FUNCTION
-- score = (semantic * 0.6) + (rating * 0.2) + (distance * 0.2)
-- ************************************************************
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
    avg_rating NUMERIC,
    distance_km DOUBLE PRECISION,
    hybrid_score DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    WITH semantic_matches AS (
        SELECT
            d.id AS doc_id,
            d.source_type,
            d.source_id,
            d.title,
            dc.content,
            (1 - (e.embedding <=> query_embedding))::FLOAT AS similarity,
            d.metadata
        FROM embeddings e
        JOIN document_chunks dc ON dc.id = e.chunk_id
        JOIN documents d ON d.id = dc.document_id
        WHERE (1 - (e.embedding <=> query_embedding)) > match_threshold
        ORDER BY e.embedding <=> query_embedding ASC
        LIMIT match_count * 3  -- Get more candidates for filtering
    ),
    enriched AS (
        SELECT
            sm.doc_id,
            sm.source_type,
            sm.source_id,
            sm.title,
            sm.content,
            sm.similarity,
            COALESCE(
                (SELECT ROUND(AVG(r.score)::numeric, 2) FROM ratings r
                 WHERE r.target_id = sm.source_id::UUID AND r.target_type = sm.source_type),
                3.0  -- Default rating if no ratings exist
            ) AS rating,
            CASE
                WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL
                     AND sm.source_type = 'restaurant'
                THEN (
                    SELECT haversine_distance(p_user_lat, p_user_lng, res.lat, res.lng)
                    FROM restaurants res WHERE res.id = sm.source_id::UUID AND res.lat IS NOT NULL
                )
                WHEN p_user_lat IS NOT NULL AND p_user_lng IS NOT NULL
                     AND sm.source_type = 'dish'
                THEN (
                    SELECT haversine_distance(p_user_lat, p_user_lng, res.lat, res.lng)
                    FROM dishes dsh
                    JOIN restaurants res ON res.id = dsh.restaurant_id
                    WHERE dsh.id = sm.source_id::UUID AND res.lat IS NOT NULL
                )
                ELSE NULL
            END AS dist_km,
            sm.metadata
        FROM semantic_matches sm
    )
    SELECT
        en.doc_id AS document_id,
        en.source_type,
        en.source_id,
        en.title,
        en.content,
        en.similarity AS semantic_similarity,
        en.rating AS avg_rating,
        en.dist_km AS distance_km,
        (
            (en.similarity * 0.6) +
            ((en.rating / 5.0) * 0.2) +
            (CASE
                WHEN en.dist_km IS NULL THEN 0.1  -- Neutral if no distance
                WHEN en.dist_km <= 1 THEN 0.2
                WHEN en.dist_km <= 3 THEN 0.15
                WHEN en.dist_km <= 5 THEN 0.1
                WHEN en.dist_km <= 10 THEN 0.05
                ELSE 0.0
            END)
        )::DOUBLE PRECISION AS hybrid_score
    FROM enriched en
    WHERE
        -- Distance filter
        (p_max_distance_km IS NULL OR en.dist_km IS NULL OR en.dist_km <= p_max_distance_km)
        -- Price filter
        AND (p_min_price IS NULL OR (en.metadata->>'min_price')::INT IS NULL OR (en.metadata->>'min_price')::INT >= p_min_price)
        AND (p_max_price IS NULL OR (en.metadata->>'max_price')::INT IS NULL OR (en.metadata->>'max_price')::INT <= p_max_price)
        -- Tags filter
        AND (p_tags IS NULL OR en.metadata->'tags' ?| p_tags)
    ORDER BY hybrid_score DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- ************************************************************
-- 6. INDEX FOR GEOSPATIAL QUERIES
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_restaurants_geo ON restaurants(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

SELECT 'Trending engine, geocoordinates, and hybrid search created successfully' AS status;
