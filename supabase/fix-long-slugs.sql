-- Fix slugs that are too long for filesystem compatibility
-- Maximum slug length should be 100 characters

-- First, let's see which posts have long slugs
SELECT 
  id, 
  title, 
  slug,
  LENGTH(slug) as slug_length
FROM posts
WHERE LENGTH(slug) > 100
ORDER BY LENGTH(slug) DESC;

-- Update the problematic slug
-- This specific post has a 283 character slug that needs to be shortened
UPDATE posts
SET slug = 'to-complain-or-not-to-complain'
WHERE slug = 'to-complain-or-not-to-complain-that-should-not-be-the-question-complaining-just-so-you-can-say-something-helps-change-nothing-if-you-must-say-it-let-it-be-because-those-you-are-talking-to-can-either-change-the-situation-to-fit-you-or-change-you-to-fit-the-situation';

-- Add a constraint to prevent future long slugs (optional but recommended)
-- Note: This will fail if there are still slugs longer than 100 characters
ALTER TABLE posts
ADD CONSTRAINT posts_slug_length_check 
CHECK (LENGTH(slug) <= 100);

-- Verify the fix
SELECT 
  id, 
  title, 
  slug,
  LENGTH(slug) as slug_length
FROM posts
WHERE LENGTH(slug) > 100;
