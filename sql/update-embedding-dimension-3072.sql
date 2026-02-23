-- ============================================================
-- TasteMuse – Update embedding dimension to 3072
-- Chạy script này trong Supabase SQL Editor
--
-- gemini-embedding-001 outputs 3072 dimensions natively.
--
-- ⚠️  HNSW / IVFFlat indexes giới hạn 2000 dims.
--     Với dataset nhỏ/vừa (< 10k rows), sequential scan
--     vẫn rất nhanh (<50ms). Nếu cần scale lên, có thể
--     truncate về 2000 dims sau.
-- ============================================================


-- 1. Xóa tất cả embeddings cũ (sẽ được regenerate bởi Realtime Listener)
-- ============================================================
DELETE FROM embeddings;


-- 2. Drop HNSW index (đây là nguyên nhân gây lỗi 2000-dim limit)
-- ============================================================
-- Tìm và drop tất cả index trên cột embedding
DO $$
DECLARE
    idx RECORD;
BEGIN
    FOR idx IN
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'embeddings'
          AND indexdef ILIKE '%embedding%'
          AND indexname NOT LIKE '%pkey%'
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I', idx.indexname);
        RAISE NOTICE 'Dropped index: %', idx.indexname;
    END LOOP;
END $$;


-- 3. Alter column to vector(3072)
-- ============================================================
ALTER TABLE embeddings
    ALTER COLUMN embedding TYPE vector(3072);


-- 4. Update match_documents function for 3072 dimensions
-- ============================================================
DROP FUNCTION IF EXISTS match_documents(vector, double precision, integer);
DROP FUNCTION IF EXISTS match_documents(vector, float, integer);

CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(3072),
    match_threshold float DEFAULT 0.3,
    match_count int DEFAULT 4
)
RETURNS TABLE (
    document_id UUID,
    similarity float,
    source_type TEXT,
    source_id UUID,
    title TEXT,
    content TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id AS document_id,
        (1 - (e.embedding <=> query_embedding))::float AS similarity,
        d.source_type::TEXT,
        d.source_id,
        d.title::TEXT,
        dc.content::TEXT
    FROM embeddings e
    JOIN document_chunks dc ON dc.id = e.chunk_id
    JOIN documents d ON d.id = dc.document_id
    WHERE 1 - (e.embedding <=> query_embedding) > match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;


-- 5. Verify the change
-- ============================================================
SELECT
    column_name,
    udt_name,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'embeddings' AND column_name = 'embedding';

-- Check no indexes remain on the embedding column
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'embeddings';
