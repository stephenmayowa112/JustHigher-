/**
 * Script to fix slugs that are too long for the filesystem
 * Run with: npx tsx scripts/fix-long-slugs.ts
 */

import { createClient } from '@supabase/supabase-js';
import { generateSlug } from '../src/lib/validation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixLongSlugs() {
  console.log('🔍 Checking for posts with long slugs...\n');

  // Fetch all posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching posts:', error);
    process.exit(1);
  }

  if (!posts || posts.length === 0) {
    console.log('✅ No posts found');
    return;
  }

  console.log(`📊 Found ${posts.length} posts\n`);

  let fixedCount = 0;
  const MAX_SLUG_LENGTH = 100;

  for (const post of posts) {
    if (post.slug.length > MAX_SLUG_LENGTH) {
      const oldSlug = post.slug;
      const newSlug = generateSlug(post.title, MAX_SLUG_LENGTH);

      console.log(`⚠️  Found long slug (${oldSlug.length} chars):`);
      console.log(`   Title: ${post.title}`);
      console.log(`   Old slug: ${oldSlug.substring(0, 80)}...`);
      console.log(`   New slug: ${newSlug}`);

      // Update the post with the new slug
      const { error: updateError } = await supabase
        .from('posts')
        .update({ slug: newSlug })
        .eq('id', post.id);

      if (updateError) {
        console.error(`   ❌ Error updating post: ${updateError.message}\n`);
      } else {
        console.log(`   ✅ Updated successfully\n`);
        fixedCount++;
      }
    }
  }

  if (fixedCount === 0) {
    console.log('✅ No slugs needed fixing. All slugs are within the 100 character limit.');
  } else {
    console.log(`\n✅ Fixed ${fixedCount} slug(s)`);
  }
}

// Run the script
fixLongSlugs()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
