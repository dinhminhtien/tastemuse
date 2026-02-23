-- ============================================================
-- TasteMuse – Performance Indexes for Core Tables
-- Run in Supabase SQL Editor
--
-- Note: Table-specific indexes are already created in:
--   001 → ratings, reviews, favorites, user_interactions
--   002 → user_taste_profiles
--   003 → conversation_sessions, conversation_messages
--   004 → restaurants.lat/lng (geo index)
-- This file adds indexes for: restaurants, dishes, documents,
-- document_chunks, embeddings, and cross-table query patterns.
-- ============================================================

-- ************************************************************
-- 1. RESTAURANTS INDEXES
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_restaurants_slug      ON restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_city      ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_restaurants_ward      ON restaurants(ward);
CREATE INDEX IF NOT EXISTS idx_restaurants_active    ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurants_tags      ON restaurants USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_restaurants_price     ON restaurants(min_price, max_price);
CREATE INDEX IF NOT EXISTS idx_restaurants_name_norm ON restaurants(normalized_name);
CREATE INDEX IF NOT EXISTS idx_restaurants_created   ON restaurants(created_at DESC);

-- ************************************************************
-- 2. DISHES INDEXES
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_dishes_restaurant    ON dishes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dishes_name_norm     ON dishes(normalized_name);
CREATE INDEX IF NOT EXISTS idx_dishes_signature     ON dishes(is_signature) WHERE is_signature = true;
CREATE INDEX IF NOT EXISTS idx_dishes_created       ON dishes(created_at DESC);

-- ************************************************************
-- 3. MEDIA INDEXES
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_restaurant_media_rid   ON restaurant_media(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_media_cover ON restaurant_media(restaurant_id, is_cover) WHERE is_cover = true;
CREATE INDEX IF NOT EXISTS idx_dish_media_did         ON dish_media(dish_id);
CREATE INDEX IF NOT EXISTS idx_dish_media_primary     ON dish_media(dish_id, is_primary) WHERE is_primary = true;

-- ************************************************************
-- 4. RAG INDEXES (documents, chunks, embeddings)
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_documents_source     ON documents(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_documents_type       ON documents(source_type);
CREATE INDEX IF NOT EXISTS idx_documents_created    ON documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chunks_document      ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_created       ON document_chunks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_embeddings_chunk     ON embeddings(chunk_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_model     ON embeddings(model);

-- ************************************************************
-- 5. COMPOSITE INDEXES for common query patterns
-- ************************************************************

-- For "get all ratings for a dish/restaurant ordered by date"
CREATE INDEX IF NOT EXISTS idx_ratings_target_date
    ON ratings(target_type, target_id, created_at DESC);

-- For "get all reviews for a dish/restaurant, exclude flagged"
CREATE INDEX IF NOT EXISTS idx_reviews_target_active
    ON reviews(target_type, target_id, created_at DESC)
    WHERE is_flagged = false;

-- For "get user's favorites ordered by date"
CREATE INDEX IF NOT EXISTS idx_favorites_user_date
    ON favorites(user_id, created_at DESC);

-- For "get trending items in last N days"
CREATE INDEX IF NOT EXISTS idx_interactions_trending
    ON user_interactions(target_type, target_id, created_at DESC)
    WHERE target_type IS NOT NULL AND target_id IS NOT NULL;

-- ************************************************************
-- 6. FULL-TEXT SEARCH (optional, for search bar)
-- Vietnamese text search on restaurant names and descriptions
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_restaurants_fts
    ON restaurants USING GIN(
        to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(address, ''))
    );

CREATE INDEX IF NOT EXISTS idx_dishes_fts
    ON dishes USING GIN(
        to_tsvector('simple', coalesce(name, ''))
    );

-- ************************************************************
-- 7. ANALYZE tables for query planner
-- ************************************************************
ANALYZE restaurants;
ANALYZE dishes;
ANALYZE restaurant_media;
ANALYZE dish_media;
ANALYZE documents;
ANALYZE document_chunks;
ANALYZE embeddings;

SELECT 'Performance indexes created and tables analyzed successfully' AS status;
