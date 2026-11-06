-- ============================================================
-- Step 1: Run this to find your exact table names
-- ============================================================
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = ''BASE TABLE''
  AND TABLE_NAME LIKE ''%nvoice%'' OR TABLE_NAME LIKE ''%enant%''
ORDER BY TABLE_NAME;
