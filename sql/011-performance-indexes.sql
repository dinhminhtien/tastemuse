-- ============================================================
-- TasteMuse – Additional Performance Indexes
-- Run in Supabase SQL Editor (after 006-indexes.sql)
-- ============================================================

-- ************************************************************
-- 1. HNSW INDEX for fast vector similarity search
-- This dramatically speeds up embedding <=> queries
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_embeddings_hnsw
    ON embeddings USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ************************************************************
-- 2. Covering index for favorites page query
-- Avoids table lookups when fetching user favorites
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_favorites_user_covering
    ON favorites(user_id, created_at DESC)
    INCLUDE (target_type, target_id);

-- ************************************************************
-- 3. Covering index for ratings lookup in hybrid_search
-- The function joins ratings.target_id + target_type frequently
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_ratings_target_avg
    ON ratings(target_type, target_id);

-- ************************************************************
-- 4. Partial index: active restaurants with geo for hybrid_search
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_restaurants_active_geo
    ON restaurants(id)
    INCLUDE (lat, lng, name)
    WHERE is_active = true AND lat IS NOT NULL AND lng IS NOT NULL;

-- ************************************************************
-- 5. Index for dishes → restaurant join in hybrid_search
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_geo
    ON dishes(id)
    INCLUDE (restaurant_id);

-- ************************************************************
-- 6. Composite index for document_chunks → documents join
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_chunks_doc_content
    ON document_chunks(document_id, id);

-- ************************************************************
-- 7. Set work_mem higher for embedding queries (session-level)
-- ************************************************************
-- ALTER DATABASE postgres SET work_mem = '256MB';

-- ************************************************************
-- 8. ANALYZE updated tables
-- ************************************************************
ANALYZE embeddings;
ANALYZE favorites;
ANALYZE ratings;
ANALYZE restaurants;
ANALYZE dishes;
ANALYZE document_chunks;

SELECT 'Performance indexes v2 created and tables analyzed ✅' AS status;
