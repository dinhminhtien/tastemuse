-- ============================================================
-- TasteMuse – Add Geocoordinates to Restaurants
-- Run in Supabase SQL Editor
--
-- Note: The ALTER TABLE and haversine_distance function are
-- also defined in 004-trending-geocoords.sql.
-- This file provides a focused migration + sample data
-- for Can Tho restaurants.
-- ============================================================

-- ************************************************************
-- 1. ADD COLUMNS (safe to re-run)
-- ************************************************************
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

COMMENT ON COLUMN restaurants.lat IS 'Latitude (WGS84) for distance calculations and Google Maps';
COMMENT ON COLUMN restaurants.lng IS 'Longitude (WGS84) for distance calculations and Google Maps';

-- ************************************************************
-- 2. UPDATE EXISTING RESTAURANTS WITH APPROXIMATE COORDINATES
-- Can Tho city center: ~10.0452, 105.7469
-- Coordinates below are approximate for demonstration.
-- Replace with real values from Google Maps Geocoding API.
-- ************************************************************

-- Set default for Can Tho restaurants without coordinates
-- (approximate center of each ward)
UPDATE restaurants
SET
    lat = CASE ward
        WHEN 'Ninh Kiều' THEN 10.0300 + (random() * 0.02)
        WHEN 'Bình Thủy' THEN 10.0650 + (random() * 0.02)
        WHEN 'Cái Răng'  THEN 10.0100 + (random() * 0.02)
        WHEN 'Ô Môn'     THEN 10.1100 + (random() * 0.02)
        WHEN 'Thốt Nốt'  THEN 10.2200 + (random() * 0.02)
        WHEN 'Phong Điền' THEN 10.0800 + (random() * 0.02)
        WHEN 'Cờ Đỏ'     THEN 10.0500 + (random() * 0.02)
        WHEN 'Thới Lai'   THEN 10.0700 + (random() * 0.02)
        WHEN 'Vĩnh Thạnh' THEN 10.1500 + (random() * 0.02)
        ELSE 10.0452 + (random() * 0.03)
    END,
    lng = CASE ward
        WHEN 'Ninh Kiều' THEN 105.7700 + (random() * 0.02)
        WHEN 'Bình Thủy' THEN 105.7400 + (random() * 0.02)
        WHEN 'Cái Răng'  THEN 105.7800 + (random() * 0.02)
        WHEN 'Ô Môn'     THEN 105.6300 + (random() * 0.02)
        WHEN 'Thốt Nốt'  THEN 105.5400 + (random() * 0.02)
        WHEN 'Phong Điền' THEN 105.6800 + (random() * 0.02)
        WHEN 'Cờ Đỏ'     THEN 105.6500 + (random() * 0.02)
        WHEN 'Thới Lai'   THEN 105.5800 + (random() * 0.02)
        WHEN 'Vĩnh Thạnh' THEN 105.6100 + (random() * 0.02)
        ELSE 105.7469 + (random() * 0.03)
    END
WHERE lat IS NULL AND lng IS NULL;

-- ************************************************************
-- 3. VERIFY
-- ************************************************************
SELECT
    name,
    ward,
    lat,
    lng,
    CASE
        WHEN lat IS NOT NULL AND lng IS NOT NULL THEN '✅'
        ELSE '❌'
    END AS has_coords
FROM restaurants
WHERE is_active = true
ORDER BY ward, name;

SELECT
    COUNT(*) FILTER (WHERE lat IS NOT NULL) AS with_coords,
    COUNT(*) FILTER (WHERE lat IS NULL) AS without_coords,
    COUNT(*) AS total
FROM restaurants
WHERE is_active = true;

SELECT 'Geocoordinates added to restaurants successfully' AS status;
