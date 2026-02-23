-- ============================================================
-- TasteMuse – Resync document_chunks & embeddings
-- Chạy script này trong Supabase SQL Editor
--
-- Vấn đề: document_chunks bị phân mảnh (chunks cũ mỗi dòng
-- 1 chunk riêng). Script này sẽ:
--   1. Xóa tất cả embeddings cũ
--   2. Xóa tất cả document_chunks cũ
--   3. Tạo lại 1 chunk/document với full raw_content
--   4. Realtime Listener sẽ tự generate embeddings mới
-- ============================================================


-- Step 1: Xóa tất cả embeddings (sẽ được regenerate)
DELETE FROM embeddings;
SELECT 'Deleted all embeddings' AS status;


-- Step 2: Xóa tất cả document_chunks cũ
DELETE FROM document_chunks;
SELECT 'Deleted all document_chunks' AS status;


-- Step 3: Tạo lại document_chunks từ documents.raw_content
-- Mỗi document → 1 chunk duy nhất (chunk_index = 0)
INSERT INTO document_chunks (document_id, chunk_index, content)
SELECT
    id AS document_id,
    0 AS chunk_index,
    raw_content AS content
FROM documents;

SELECT
    'Created ' || COUNT(*) || ' document_chunks from documents' AS status
FROM document_chunks;


-- Step 4: Verify
SELECT
    d.source_type,
    COUNT(DISTINCT d.id) AS total_documents,
    COUNT(DISTINCT dc.id) AS total_chunks,
    COUNT(DISTINCT e.id) AS total_embeddings
FROM documents d
LEFT JOIN document_chunks dc ON dc.document_id = d.id
LEFT JOIN embeddings e ON e.chunk_id = dc.id
GROUP BY d.source_type
ORDER BY d.source_type;
