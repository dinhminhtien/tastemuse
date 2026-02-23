-- ============================================================
-- TasteMuse – RLS Policies for Core Tables
-- Run in Supabase SQL Editor
--
-- Note: RLS for ratings, reviews, favorites, user_interactions
-- is already in 001-ratings-reviews-favorites.sql
-- RLS for user_taste_profiles is in 002-user-taste-profiles.sql
-- RLS for conversation_sessions/messages is in 003-conversation-sessions.sql
-- This file covers: restaurants, dishes, documents, embeddings, media
-- ============================================================

-- ************************************************************
-- 1. RESTAURANTS
-- ************************************************************
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Anyone can read active restaurants
CREATE POLICY "Public read access on restaurants"
    ON restaurants FOR SELECT
    USING (is_active = true);

-- Only service role (admin) can insert/update/delete
CREATE POLICY "Service role can manage restaurants"
    ON restaurants FOR ALL
    USING (auth.role() = 'service_role');

-- ************************************************************
-- 2. DISHES
-- ************************************************************
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Anyone can read dishes
CREATE POLICY "Public read access on dishes"
    ON dishes FOR SELECT
    USING (true);

-- Only service role can manage
CREATE POLICY "Service role can manage dishes"
    ON dishes FOR ALL
    USING (auth.role() = 'service_role');

-- ************************************************************
-- 3. RESTAURANT MEDIA
-- ************************************************************
ALTER TABLE restaurant_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on restaurant_media"
    ON restaurant_media FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage restaurant_media"
    ON restaurant_media FOR ALL
    USING (auth.role() = 'service_role');

-- ************************************************************
-- 4. DISH MEDIA
-- ************************************************************
ALTER TABLE dish_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access on dish_media"
    ON dish_media FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage dish_media"
    ON dish_media FOR ALL
    USING (auth.role() = 'service_role');

-- ************************************************************
-- 5. DOCUMENTS (RAG)
-- ************************************************************
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Documents are internal, allow read for search operations
CREATE POLICY "Authenticated users can read documents"
    ON documents FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage documents"
    ON documents FOR ALL
    USING (auth.role() = 'service_role');

-- ************************************************************
-- 6. DOCUMENT CHUNKS (RAG)
-- ************************************************************
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read document_chunks"
    ON document_chunks FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage document_chunks"
    ON document_chunks FOR ALL
    USING (auth.role() = 'service_role');

-- ************************************************************
-- 7. EMBEDDINGS (RAG)
-- ************************************************************
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read embeddings"
    ON embeddings FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage embeddings"
    ON embeddings FOR ALL
    USING (auth.role() = 'service_role');

SELECT 'RLS policies for core tables created successfully' AS status;
