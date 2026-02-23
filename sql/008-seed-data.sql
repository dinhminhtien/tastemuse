-- ============================================================
-- TasteMuse – Seed Sample Data for New Tables
-- Run in Supabase SQL Editor
--
-- Purpose: Populate ratings, reviews, favorites, and
-- user_interactions with sample data for testing/demo.
--
-- Note: This uses existing restaurants & dishes IDs from
-- the database. If you have no restaurants/dishes yet,
-- run resync-chunks-embeddings.sql first.
-- ============================================================

-- ************************************************************
-- 0. CREATE A TEST USER (if not exists)
-- We'll use an anonymous auth user for seeding.
-- If you already have a logged-in user, replace the user_id.
-- ************************************************************

-- Get all restaurant and dish IDs for seeding
DO $$
DECLARE
    r RECORD;
    d RECORD;
    test_user_id UUID;
    restaurant_ids UUID[];
    dish_ids UUID[];
    i INT;
    random_score INT;
    review_texts TEXT[] := ARRAY[
        'Món ăn rất ngon, phục vụ nhanh và thân thiện! Sẽ quay lại lần sau.',
        'Hương vị đậm đà, đúng kiểu miền Tây. Giá cả phải chăng.',
        'Không gian thoáng mát, sạch sẽ. Món ăn vừa miệng.',
        'Lần đầu đến nhưng rất ấn tượng. Nước mắm pha đặc biệt.',
        'Bún riêu ở đây ngon nhất Cần Thơ, nước lèo ngọt tự nhiên.',
        'Quán hơi đông vào giờ trưa nhưng đồ ăn xứng đáng chờ đợi.',
        'Bánh xèo giòn tan, nhân tôm đầy ắp. Rau sống tươi.',
        'Phở ở đây nước lèo trong và ngọt, thịt bò mềm. Rất ok!',
        'Quán nhỏ nhưng ấm cúng, chủ quán nhiệt tình. Giá sinh viên.',
        'Lẩu mắm ngon nhưng hơi mặn. Rau và cá thì tươi.',
        'Cơm tấm sườn nướng than hồng, mỡ hành thơm nức. Tuyệt vời!',
        'Hủ tiếu Nam Vang đúng vị, sợi hủ tiếu dai mềm.',
        'Món ăn bình thường, không có gì đặc biệt. Giá hơi cao.',
        'Gỏi cuốn tươi ngon, nước chấm đậu phộng béo ngậy.',
        'Chè bưởi ở đây rất ngon, ngọt vừa phải, mát lạnh.',
        'Nhà hàng đẹp, view sông Hậu rất đẹp buổi chiều.',
        'Đồ ăn ngon, phục vụ chuyên nghiệp. Thích hợp đi nhóm.',
        'Cá lóc nướng trui, ăn với rau rừng, cuốn bánh tráng. Đỉnh!',
        'Nem chua rán giòn, vị chua chua ngọt ngọt, cuốn lắm.',
        'Bánh tầm bì ở đây ít nơi nào bì kịp. Nước cốt dừa béo ngậy.'
    ];
    sentiments TEXT[] := ARRAY['positive', 'positive', 'positive', 'positive', 'positive', 'positive', 'positive', 'positive', 'positive', 'neutral', 'positive', 'positive', 'negative', 'positive', 'positive', 'positive', 'positive', 'positive', 'positive', 'positive'];
    sentiment_scores FLOAT[] := ARRAY[0.9, 0.85, 0.7, 0.8, 0.95, 0.6, 0.88, 0.82, 0.75, 0.1, 0.92, 0.78, -0.3, 0.8, 0.85, 0.7, 0.75, 0.95, 0.82, 0.9];
    interaction_types TEXT[] := ARRAY['click', 'view', 'search', 'share'];
BEGIN
    -- Get first user from auth.users (your logged-in account)
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;

    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No user found in auth.users. Skipping user-dependent seeds.';
        -- Still seed anonymous interactions below
    ELSE
        RAISE NOTICE 'Using test user: %', test_user_id;
    END IF;

    -- Get all restaurant IDs
    SELECT ARRAY_AGG(id) INTO restaurant_ids FROM restaurants WHERE is_active = true;
    -- Get all dish IDs
    SELECT ARRAY_AGG(id) INTO dish_ids FROM dishes;

    IF restaurant_ids IS NULL OR dish_ids IS NULL THEN
        RAISE NOTICE 'No restaurants or dishes found. Please insert data first.';
        RETURN;
    END IF;

    RAISE NOTICE 'Found % restaurants and % dishes', array_length(restaurant_ids, 1), array_length(dish_ids, 1);

    -- ************************************************************
    -- 1. SEED RATINGS (for dishes)
    -- ************************************************************
    IF test_user_id IS NOT NULL THEN
        FOR i IN 1..LEAST(array_length(dish_ids, 1), 15) LOOP
            random_score := 3 + floor(random() * 3)::int;  -- 3, 4, or 5
            INSERT INTO ratings (user_id, target_type, target_id, score)
            VALUES (test_user_id, 'dish', dish_ids[i], random_score)
            ON CONFLICT (user_id, target_type, target_id) DO UPDATE SET score = EXCLUDED.score;
        END LOOP;

        -- Seed some restaurant ratings too
        FOR i IN 1..LEAST(array_length(restaurant_ids, 1), 10) LOOP
            random_score := 3 + floor(random() * 3)::int;
            INSERT INTO ratings (user_id, target_type, target_id, score)
            VALUES (test_user_id, 'restaurant', restaurant_ids[i], random_score)
            ON CONFLICT (user_id, target_type, target_id) DO UPDATE SET score = EXCLUDED.score;
        END LOOP;

        RAISE NOTICE 'Seeded ratings for dishes and restaurants';
    END IF;

    -- ************************************************************
    -- 2. SEED REVIEWS (for dishes, with sentiment)
    -- ************************************************************
    IF test_user_id IS NOT NULL THEN
        FOR i IN 1..LEAST(array_length(dish_ids, 1), array_length(review_texts, 1)) LOOP
            INSERT INTO reviews (user_id, target_type, target_id, content, sentiment, sentiment_score)
            VALUES (
                test_user_id,
                'dish',
                dish_ids[i],
                review_texts[i],
                sentiments[i],
                sentiment_scores[i]
            )
            ON CONFLICT DO NOTHING;
        END LOOP;

        RAISE NOTICE 'Seeded reviews with sentiment analysis';
    END IF;

    -- ************************************************************
    -- 3. SEED FAVORITES (random subset of dishes)
    -- ************************************************************
    IF test_user_id IS NOT NULL THEN
        FOR i IN 1..LEAST(array_length(dish_ids, 1), 8) LOOP
            INSERT INTO favorites (user_id, target_type, target_id)
            VALUES (test_user_id, 'dish', dish_ids[i])
            ON CONFLICT DO NOTHING;
        END LOOP;

        -- Favorite some restaurants too
        FOR i IN 1..LEAST(array_length(restaurant_ids, 1), 5) LOOP
            INSERT INTO favorites (user_id, target_type, target_id)
            VALUES (test_user_id, 'restaurant', restaurant_ids[i])
            ON CONFLICT DO NOTHING;
        END LOOP;

        RAISE NOTICE 'Seeded favorites';
    END IF;

    -- ************************************************************
    -- 4. SEED USER INTERACTIONS (for trending engine)
    -- Both authenticated and anonymous
    -- ************************************************************

    -- Authenticated interactions
    IF test_user_id IS NOT NULL THEN
        FOR i IN 1..LEAST(array_length(dish_ids, 1), 20) LOOP
            -- Multiple interactions per dish (simulating activity over past week)
            FOR j IN 1..floor(random() * 5 + 1)::int LOOP
                INSERT INTO user_interactions (
                    user_id, interaction_type, target_type, target_id,
                    metadata, created_at
                ) VALUES (
                    test_user_id,
                    interaction_types[1 + floor(random() * array_length(interaction_types, 1))::int],
                    'dish',
                    dish_ids[i],
                    jsonb_build_object('source', 'seed', 'page', '/dishes'),
                    now() - (random() * interval '7 days')
                );
            END LOOP;
        END LOOP;
    END IF;

    -- Anonymous interactions (for trending without login)
    FOR i IN 1..LEAST(array_length(restaurant_ids, 1), 15) LOOP
        FOR j IN 1..floor(random() * 8 + 2)::int LOOP
            INSERT INTO user_interactions (
                session_id, interaction_type, target_type, target_id,
                metadata, created_at
            ) VALUES (
                'anon-seed-' || floor(random() * 100)::text,
                interaction_types[1 + floor(random() * array_length(interaction_types, 1))::int],
                'restaurant',
                restaurant_ids[i],
                jsonb_build_object('source', 'seed', 'page', '/restaurants'),
                now() - (random() * interval '7 days')
            );
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Seeded user interactions (authenticated + anonymous)';

END $$;

-- ************************************************************
-- 5. VERIFY SEED DATA
-- ************************************************************
SELECT 'ratings' AS "table", COUNT(*) AS "count" FROM ratings
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'favorites', COUNT(*) FROM favorites
UNION ALL
SELECT 'user_interactions', COUNT(*) FROM user_interactions;

-- Check trending (should return results now)
SELECT * FROM get_trending_items(NULL, 7, 10);

-- Check average ratings per dish
SELECT
    d.name AS dish_name,
    ROUND(AVG(r.score), 1) AS avg_rating,
    COUNT(r.id) AS rating_count
FROM dishes d
LEFT JOIN ratings r ON r.target_type = 'dish' AND r.target_id = d.id
GROUP BY d.name
HAVING COUNT(r.id) > 0
ORDER BY avg_rating DESC
LIMIT 10;

SELECT 'Seed data inserted successfully! ✅' AS status;
