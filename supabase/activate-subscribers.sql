-- Activate all subscribers
-- This will set all subscribers to active status so they can receive newsletters

-- First, check current status
SELECT 
  COUNT(*) as total_subscribers,
  SUM(CASE WHEN active = true THEN 1 ELSE 0 END) as active_subscribers,
  SUM(CASE WHEN active = false THEN 1 ELSE 0 END) as inactive_subscribers
FROM subscribers;

-- Show all subscribers with their status
SELECT 
  email,
  active,
  subscribed_at,
  source
FROM subscribers
ORDER BY subscribed_at DESC;

-- Activate all subscribers
UPDATE subscribers
SET active = true
WHERE active = false;

-- Verify the update
SELECT 
  COUNT(*) as total_subscribers,
  SUM(CASE WHEN active = true THEN 1 ELSE 0 END) as active_subscribers,
  SUM(CASE WHEN active = false THEN 1 ELSE 0 END) as inactive_subscribers
FROM subscribers;

-- Show updated subscribers
SELECT 
  email,
  active,
  subscribed_at,
  source
FROM subscribers
ORDER BY subscribed_at DESC;
