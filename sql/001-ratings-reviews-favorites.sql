-- ============================================================
-- TasteMuse – Ratings, Reviews, Favorites & Interaction Tracking
-- Run in Supabase SQL Editor
-- ============================================================

-- ************************************************************
-- 1. RATINGS TABLE
-- ************************************************************
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('dish', 'restaurant')),
    target_id UUID NOT NULL,
    score SMALLINT NOT NULL CHECK (score >= 1 AND score <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- One rating per user per target
    UNIQUE (user_id, target_type, target_id)
);

COMMENT ON TABLE ratings IS 'User ratings (1-5 stars) for dishes and restaurants';

-- ************************************************************
-- 2. REVIEWS TABLE
-- ************************************************************
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('dish', 'restaurant')),
    target_id UUID NOT NULL,
    content TEXT NOT NULL CHECK (length(content) >= 10),
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    sentiment_score FLOAT,  -- -1.0 to 1.0
    is_flagged BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE reviews IS 'User reviews with optional AI sentiment analysis';

-- ************************************************************
-- 3. FAVORITES TABLE
-- ************************************************************
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('dish', 'restaurant')),
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- One favorite per user per target
    UNIQUE (user_id, target_type, target_id)
);

COMMENT ON TABLE favorites IS 'User saved/favorited dishes and restaurants';

-- ************************************************************
-- 4. USER INTERACTIONS TABLE (History Tracking)
-- ************************************************************
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL for anonymous
    session_id TEXT,  -- For anonymous tracking
    interaction_type TEXT NOT NULL CHECK (interaction_type IN (
        'view', 'click', 'search', 'chat_query', 'share', 'map_click'
    )),
    target_type TEXT CHECK (target_type IN ('dish', 'restaurant')),
    target_id UUID,
    metadata JSONB DEFAULT '{}',  -- Extra context (search query, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_interactions IS 'Tracks user behavior: views, clicks, searches for analytics & recommendations';

-- ************************************************************
-- 5. VIEWS: Aggregated rating stats
-- ************************************************************

-- Average rating for dishes
CREATE OR REPLACE VIEW dish_rating_stats AS
SELECT
    target_id AS dish_id,
    COUNT(*) AS rating_count,
    ROUND(AVG(score)::numeric, 2) AS avg_rating
FROM ratings
WHERE target_type = 'dish'
GROUP BY target_id;

-- Average rating for restaurants
CREATE OR REPLACE VIEW restaurant_rating_stats AS
SELECT
    target_id AS restaurant_id,
    COUNT(*) AS rating_count,
    ROUND(AVG(score)::numeric, 2) AS avg_rating
FROM ratings
WHERE target_type = 'restaurant'
GROUP BY target_id;

-- ************************************************************
-- 6. HELPER FUNCTION: Get average rating
-- ************************************************************
CREATE OR REPLACE FUNCTION get_avg_rating(
    p_target_type TEXT,
    p_target_id UUID
)
RETURNS TABLE(avg_rating NUMERIC, rating_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROUND(AVG(r.score)::numeric, 2),
        COUNT(*)
    FROM ratings r
    WHERE r.target_type = p_target_type
      AND r.target_id = p_target_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ************************************************************
-- 7. INDEXES
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_ratings_target       ON ratings(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user         ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_target       ON reviews(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user         ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment    ON reviews(sentiment);
CREATE INDEX IF NOT EXISTS idx_favorites_user       ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_target     ON favorites(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user    ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_target  ON user_interactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type    ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON user_interactions(created_at DESC);

-- ************************************************************
-- 8. ENABLE RLS
-- ************************************************************
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Ratings policies
CREATE POLICY "Anyone can read ratings"
    ON ratings FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create ratings"
    ON ratings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
    ON ratings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
    ON ratings FOR DELETE
    USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Anyone can read non-flagged reviews"
    ON reviews FOR SELECT
    USING (is_flagged = false OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
    ON reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can read own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- User interactions policies
CREATE POLICY "Users can read own interactions"
    ON user_interactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create interactions"
    ON user_interactions FOR INSERT
    WITH CHECK (true);

-- ************************************************************
-- 9. AUTO-UPDATE updated_at
-- ************************************************************
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

SELECT 'Ratings, Reviews, Favorites, and Interactions tables created successfully' AS status;
