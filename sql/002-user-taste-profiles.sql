-- ============================================================
-- TasteMuse – User Taste Profiles (Dynamic Embedding)
-- Run in Supabase SQL Editor
-- ============================================================

-- ************************************************************
-- 1. USER TASTE PROFILES TABLE
-- ************************************************************
CREATE TABLE IF NOT EXISTS user_taste_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    taste_embedding vector(3072),  -- Same dimension as food/restaurant embeddings
    interaction_count INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,  -- Store preferences, top categories, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_taste_profiles IS 'Dynamic user taste vector updated from favorites, ratings, clicks, and searches';

-- ************************************************************
-- 2. FUNCTION: Update user taste embedding
-- Uses weighted average: new = (old * 0.7) + (interaction * 0.3)
-- ************************************************************
CREATE OR REPLACE FUNCTION update_user_taste_embedding(
    p_user_id UUID,
    p_interaction_embedding vector(3072),
    p_weight FLOAT DEFAULT 0.3
)
RETURNS void AS $$
DECLARE
    old_embedding vector(3072);
    old_weight FLOAT;
    new_weight FLOAT;
BEGIN
    old_weight := 1.0 - p_weight;
    new_weight := p_weight;

    -- Get existing embedding
    SELECT taste_embedding INTO old_embedding
    FROM user_taste_profiles
    WHERE user_id = p_user_id;

    IF old_embedding IS NULL THEN
        -- First interaction: just set the embedding directly
        INSERT INTO user_taste_profiles (user_id, taste_embedding, interaction_count)
        VALUES (p_user_id, p_interaction_embedding, 1)
        ON CONFLICT (user_id)
        DO UPDATE SET
            taste_embedding = p_interaction_embedding,
            interaction_count = user_taste_profiles.interaction_count + 1,
            last_updated = now();
    ELSE
        -- Weighted average: new = (old * 0.7) + (interaction * 0.3)
        UPDATE user_taste_profiles
        SET taste_embedding = (
            SELECT array_agg(
                (old_vals[i] * old_weight) + (new_vals[i] * new_weight)
            )::vector(3072)
            FROM generate_series(1, 3072) AS i,
            LATERAL (SELECT array_agg(v)::float[] AS old_vals FROM unnest(old_embedding::float[]) AS v) o,
            LATERAL (SELECT array_agg(v)::float[] AS new_vals FROM unnest(p_interaction_embedding::float[]) AS v) n
        ),
            interaction_count = interaction_count + 1,
            last_updated = now()
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ************************************************************
-- 3. FUNCTION: Get personalized recommendations
-- Uses user taste embedding for similarity search
-- ************************************************************
CREATE OR REPLACE FUNCTION get_personalized_recommendations(
    p_user_id UUID,
    p_limit INT DEFAULT 10,
    p_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE(
    document_id UUID,
    similarity FLOAT,
    source_type TEXT,
    title TEXT,
    content TEXT
) AS $$
DECLARE
    user_emb vector(3072);
BEGIN
    SELECT taste_embedding INTO user_emb
    FROM user_taste_profiles
    WHERE user_id = p_user_id;

    IF user_emb IS NULL THEN
        -- No taste profile yet, return popular items
        RETURN QUERY
        SELECT
            d.id AS document_id,
            0.5::FLOAT AS similarity,
            d.source_type,
            d.title,
            dc.content
        FROM documents d
        JOIN document_chunks dc ON dc.document_id = d.id
        ORDER BY d.created_at DESC
        LIMIT p_limit;
    ELSE
        -- Semantic search using user taste vector
        RETURN QUERY
        SELECT
            d.id AS document_id,
            (1 - (e.embedding <=> user_emb))::FLOAT AS similarity,
            d.source_type,
            d.title,
            dc.content
        FROM embeddings e
        JOIN document_chunks dc ON dc.id = e.chunk_id
        JOIN documents d ON d.id = dc.document_id
        WHERE (1 - (e.embedding <=> user_emb)) > p_threshold
        ORDER BY e.embedding <=> user_emb ASC
        LIMIT p_limit;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ************************************************************
-- 4. INDEXES & RLS
-- ************************************************************
CREATE INDEX IF NOT EXISTS idx_taste_user ON user_taste_profiles(user_id);

ALTER TABLE user_taste_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own taste profile"
    ON user_taste_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can upsert taste profiles"
    ON user_taste_profiles FOR ALL
    USING (auth.uid() = user_id);

SELECT 'User taste profiles table created successfully' AS status;
