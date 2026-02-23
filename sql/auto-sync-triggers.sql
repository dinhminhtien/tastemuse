-- ============================================================
-- TasteMuse – Auto-sync Triggers
-- Chạy script này trong Supabase SQL Editor (1 lần duy nhất)
--
-- Khi INSERT/UPDATE vào restaurants hoặc dishes:
--   → Tự động tạo/cập nhật row trong documents
--   → Tự động tạo/cập nhật row trong document_chunks
--
-- Embeddings sẽ được generate bởi Realtime Listener (Next.js)
-- ============================================================

-- ************************************************************
-- 1. TRIGGER FUNCTION: restaurants → documents + document_chunks
-- ************************************************************
CREATE OR REPLACE FUNCTION sync_restaurant_to_documents()
RETURNS TRIGGER AS $$
DECLARE
    doc_id UUID;
    raw TEXT;
BEGIN
    -- Build raw_content from restaurant data
    raw := 'Nhà hàng: ' || NEW.name || E'\n'
        || 'Địa chỉ: ' || NEW.address || ', ' || NEW.ward || ', ' || NEW.city;

    IF NEW.phone IS NOT NULL AND NEW.phone <> '' THEN
        raw := raw || E'\n' || 'Số điện thoại: ' || NEW.phone;
    END IF;

    IF NEW.tags IS NOT NULL AND array_length(NEW.tags, 1) > 0 THEN
        raw := raw || E'\n' || 'Loại hình: ' || array_to_string(NEW.tags, ', ');
    END IF;

    IF NEW.description IS NOT NULL AND NEW.description <> '' THEN
        raw := raw || E'\n' || 'Mô tả: ' || NEW.description;
    END IF;

    IF NEW.min_price IS NOT NULL OR NEW.max_price IS NOT NULL THEN
        raw := raw || E'\n' || 'Giá: '
            || COALESCE(NEW.min_price::TEXT || 'đ', '')
            || CASE WHEN NEW.min_price IS NOT NULL AND NEW.max_price IS NOT NULL THEN ' - ' ELSE '' END
            || COALESCE(NEW.max_price::TEXT || 'đ', '');
    END IF;

    IF NEW.open_time IS NOT NULL OR NEW.close_time IS NOT NULL THEN
        raw := raw || E'\n' || 'Giờ mở cửa: '
            || COALESCE(NEW.open_time::TEXT, '?') || ' - ' || COALESCE(NEW.close_time::TEXT, '?');
    END IF;

    -- ---- INSERT or UPDATE ----
    IF TG_OP = 'INSERT' THEN
        -- Create document
        INSERT INTO documents (source_type, source_id, title, raw_content, metadata)
        VALUES (
            'restaurant',
            NEW.id::TEXT,
            NEW.name,
            raw,
            jsonb_build_object(
                'city', NEW.city,
                'ward', NEW.ward,
                'tags', to_jsonb(NEW.tags),
                'min_price', NEW.min_price,
                'max_price', NEW.max_price,
                'open_time', NEW.open_time,
                'close_time', NEW.close_time
            )
        )
        RETURNING id INTO doc_id;

        -- Create document chunk
        INSERT INTO document_chunks (document_id, chunk_index, content)
        VALUES (doc_id, 0, raw);

    ELSIF TG_OP = 'UPDATE' THEN
        -- Update existing document
        UPDATE documents
        SET title       = NEW.name,
            raw_content = raw,
            metadata    = jsonb_build_object(
                'city', NEW.city,
                'ward', NEW.ward,
                'tags', to_jsonb(NEW.tags),
                'min_price', NEW.min_price,
                'max_price', NEW.max_price,
                'open_time', NEW.open_time,
                'close_time', NEW.close_time
            )
        WHERE source_type = 'restaurant' AND source_id = NEW.id::TEXT
        RETURNING id INTO doc_id;

        -- Update chunk content (so the embedding will be regenerated)
        IF doc_id IS NOT NULL THEN
            UPDATE document_chunks
            SET content = raw
            WHERE document_id = doc_id AND chunk_index = 0;

            -- Delete old embedding so the Realtime Listener will regenerate it
            DELETE FROM embeddings
            WHERE chunk_id IN (
                SELECT id FROM document_chunks WHERE document_id = doc_id
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ************************************************************
-- 2. TRIGGER FUNCTION: dishes → documents + document_chunks
-- ************************************************************
CREATE OR REPLACE FUNCTION sync_dish_to_documents()
RETURNS TRIGGER AS $$
DECLARE
    doc_id UUID;
    raw TEXT;
    rest RECORD;
BEGIN
    -- Fetch parent restaurant info
    SELECT name, address, ward, city, tags, min_price, max_price
    INTO rest
    FROM restaurants
    WHERE id = NEW.restaurant_id;

    -- Build raw_content
    raw := 'Món ăn: ' || NEW.name;

    IF rest IS NOT NULL THEN
        raw := raw || E'\n' || 'Nhà hàng: ' || rest.name;
        raw := raw || E'\n' || 'Địa chỉ: ' || rest.address || ', ' || rest.ward || ', ' || rest.city;

        IF rest.tags IS NOT NULL AND array_length(rest.tags, 1) > 0 THEN
            raw := raw || E'\n' || 'Loại hình: ' || array_to_string(rest.tags, ', ');
        END IF;

        IF rest.min_price IS NOT NULL OR rest.max_price IS NOT NULL THEN
            raw := raw || E'\n' || 'Giá: '
                || COALESCE(rest.min_price::TEXT || 'đ', '')
                || CASE WHEN rest.min_price IS NOT NULL AND rest.max_price IS NOT NULL THEN ' - ' ELSE '' END
                || COALESCE(rest.max_price::TEXT || 'đ', '');
        END IF;
    END IF;

    IF NEW.is_signature THEN
        raw := raw || E'\n' || '⭐ Đây là món đặc trưng / signature của nhà hàng';
    END IF;

    -- ---- INSERT or UPDATE ----
    IF TG_OP = 'INSERT' THEN
        INSERT INTO documents (source_type, source_id, title, raw_content, metadata)
        VALUES ('dish', NEW.id::TEXT, NEW.name, raw, '{}'::jsonb)
        RETURNING id INTO doc_id;

        INSERT INTO document_chunks (document_id, chunk_index, content)
        VALUES (doc_id, 0, raw);

    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE documents
        SET title       = NEW.name,
            raw_content = raw,
            metadata    = '{}'::jsonb
        WHERE source_type = 'dish' AND source_id = NEW.id::TEXT
        RETURNING id INTO doc_id;

        IF doc_id IS NOT NULL THEN
            UPDATE document_chunks
            SET content = raw
            WHERE document_id = doc_id AND chunk_index = 0;

            -- Delete old embedding → Realtime Listener will regenerate
            DELETE FROM embeddings
            WHERE chunk_id IN (
                SELECT id FROM document_chunks WHERE document_id = doc_id
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ************************************************************
-- 3. CREATE TRIGGERS
-- ************************************************************

-- Drop existing triggers if any (idempotent)
DROP TRIGGER IF EXISTS trg_restaurant_sync ON restaurants;
DROP TRIGGER IF EXISTS trg_dish_sync ON dishes;

-- Restaurant trigger: fires AFTER INSERT or UPDATE
CREATE TRIGGER trg_restaurant_sync
    AFTER INSERT OR UPDATE ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION sync_restaurant_to_documents();

-- Dish trigger: fires AFTER INSERT or UPDATE
CREATE TRIGGER trg_dish_sync
    AFTER INSERT OR UPDATE ON dishes
    FOR EACH ROW
    EXECUTE FUNCTION sync_dish_to_documents();


-- ************************************************************
-- 4. ENABLE REALTIME on document_chunks (for the Listener)
-- ************************************************************
-- Supabase Realtime needs the table to be in the publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'document_chunks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE document_chunks;
    END IF;
END $$;


-- ************************************************************
-- 5. VERIFY: List all triggers
-- ************************************************************
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('restaurants', 'dishes')
ORDER BY event_object_table, trigger_name;
