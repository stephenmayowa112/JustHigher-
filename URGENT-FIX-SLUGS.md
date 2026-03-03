# 🚨 URGENT: Fix Long Slug Before Deployment

## Problem
Your build is failing because of a blog post with an extremely long slug (283 characters):
```
to-complain-or-not-to-complain-that-should-not-be-the-question-complaining-just-so-you-can-say-something-helps-change-nothing-if-you-must-say-it-let-it-be-because-those-you-are-talking-to-can-either-change-the-situation-to-fit-you-or-change-you-to-fit-the-situation
```

This exceeds the filesystem's maximum filename length and causes:
```
Error: ENAMETOOLONG: name too long, mkdir
```

## Quick Fix (Choose One)

### Option 1: Run the Fix Script (Fastest)

```bash
# Make sure you have your environment variables set
# NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

# Run the fix script
npx tsx scripts/fix-long-slugs.ts
```

### Option 2: Manual SQL Fix (Direct)

1. Go to your Supabase Dashboard
2. Open the SQL Editor
3. Run this query:

```sql
-- Fix the long slug
UPDATE posts
SET slug = 'to-complain-or-not-to-complain'
WHERE slug LIKE 'to-complain-or-not-to-complain-that-should-not-be-the-question%';

-- Verify it worked
SELECT id, title, slug, LENGTH(slug) as slug_length
FROM posts
WHERE LENGTH(slug) > 100;
```

### Option 3: Use Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Navigate to Table Editor → posts
3. Find the post with the long slug
4. Edit the slug field to: `to-complain-or-not-to-complain`
5. Save

## After Fixing

1. Commit and push your code changes (the validation is already in place)
2. Redeploy on Vercel
3. The build should now succeed

## Prevention

The following changes have been made to prevent this in the future:

✅ Slug validation in PostEditor (max 100 characters)
✅ Auto-truncation of long slugs
✅ Helper functions to generate safe slugs
✅ Warning messages when slugs are too long

## Need Help?

If you encounter any issues:
1. Check that your environment variables are set correctly
2. Make sure you have database access
3. Verify the post exists in your database
4. Check the scripts/README.md for more details
