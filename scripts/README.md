# Database Maintenance Scripts

This directory contains utility scripts for database maintenance and fixes.

## Fix Word Wrapping

### Problem
Blog posts may have embedded newlines in their HTML content that cause words to break mid-word (e.g., "w|ell" or "befo|re"). This happens when content is typed in a narrow editor (like Quill) that saves line breaks as part of the HTML.

### Solution

Run the word wrapping fix script to clean all existing posts:

```bash
npx tsx scripts/fix-word-wrapping.ts
```

This script will:
- Remove embedded newlines within paragraphs
- Remove `<br>` tags that cause unwanted breaks
- Preserve Quill editor attributes (like `class="ql-align-justify"`)
- Remove empty paragraphs
- Only update posts that have changes

### Prevention

The system now automatically cleans content when saving posts:
- New posts are cleaned before being saved to the database
- Updated posts have their content cleaned automatically
- Words will always wrap at spaces, never breaking mid-word

### When to Use

- After importing posts from another system
- If you notice words breaking mid-word in published posts
- After editing posts in a narrow editor

**Note:** After running this script, clear your browser cache and refresh to see the changes.

## Fix Long Slugs

### Problem
Some blog posts may have slugs that exceed the filesystem's maximum filename length (255 characters). This causes build failures on platforms like Vercel with errors like:
```
Error: ENAMETOOLONG: name too long, mkdir
```

### Solution

You have two options to fix long slugs:

#### Option 1: Using TypeScript Script (Recommended)

Run the TypeScript script that will automatically detect and fix all slugs longer than 100 characters:

```bash
# Install tsx if you haven't already
npm install -g tsx

# Run the script
npx tsx scripts/fix-long-slugs.ts
```

This script will:
- Find all posts with slugs longer than 100 characters
- Generate new, shorter slugs based on the post titles
- Update the database automatically
- Show you what was changed

#### Option 2: Using SQL Migration

If you prefer to use SQL directly, you can run the migration file:

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U postgres -d postgres -f supabase/fix-long-slugs.sql
```

Or use the Supabase SQL Editor to run the contents of `supabase/fix-long-slugs.sql`.

### Prevention

The system now includes:

1. **Slug Validation**: The `PostEditor` component validates slugs and prevents creating new posts with slugs longer than 100 characters.

2. **Auto-generation**: When creating posts, slugs are automatically truncated to 100 characters while preserving word boundaries.

3. **Database Constraint** (optional): You can add a database constraint to prevent long slugs:
   ```sql
   ALTER TABLE posts
   ADD CONSTRAINT posts_slug_length_check 
   CHECK (LENGTH(slug) <= 100);
   ```

### Slug Length Limits

- **Maximum**: 100 characters (safe for all filesystems)
- **Recommended**: 50-80 characters for better SEO and readability
- **Minimum**: 1 character

### Example

A post with the title:
```
"To complain or not to complain, that should not be the question. Complaining just so you can say something helps change nothing..."
```

Will have its slug automatically shortened from 283 characters to:
```
to-complain-or-not-to-complain
```

## Other Scripts

### Create Admin User
```bash
npx tsx scripts/create-admin.ts
```

### Setup Admin
```bash
npx tsx scripts/setup-admin.ts
```

### Verify Setup
```bash
node scripts/verify-setup.js
```
