-- ============================================================
-- Fix: update_user_taste_embedding — vector ↔ float[] casting
-- Run in Supabase SQL Editor
-- ============================================================

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
    old_arr FLOAT[];
    new_arr FLOAT[];
    result_arr FLOAT[];
    i INT;
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
        -- Cast vector → text → float[] (pgvector doesn't support direct cast to float[])
        old_arr := old_embedding::text::float[];
        new_arr := p_interaction_embedding::text::float[];

        -- Weighted average element-by-element
        result_arr := ARRAY[]::FLOAT[];
        FOR i IN 1..array_length(old_arr, 1) LOOP
            result_arr := result_arr || ((old_arr[i] * old_weight) + (new_arr[i] * new_weight));
        END LOOP;

        UPDATE user_taste_profiles
        SET taste_embedding = result_arr::text::vector(3072),
            interaction_count = interaction_count + 1,
            last_updated = now()
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT 'update_user_taste_embedding fixed! ✅' AS status;
