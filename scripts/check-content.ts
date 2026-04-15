/**
 * Check post content for embedded newlines and other issues
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkContent() {
  console.log('🔍 Checking post content for issues...\n');

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, slug, content')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  if (!posts || posts.length === 0) {
    console.log('ℹ️  No posts found');
    return;
  }

  console.log(`📝 Checking ${posts.length} most recent posts:\n`);

  for (const post of posts) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Post: "${post.title}" (${post.slug})`);
    console.log('='.repeat(60));

    // Check for embedded newlines in paragraphs
    const paragraphsWithNewlines = post.content.match(/<p[^>]*>[^<]*\n[^<]*<\/p>/g);
    if (paragraphsWithNewlines) {
      console.log(`⚠️  Found ${paragraphsWithNewlines.length} paragraphs with embedded newlines`);
      console.log('Sample:', paragraphsWithNewlines[0].substring(0, 100) + '...');
    } else {
      console.log('✅ No embedded newlines in paragraphs');
    }

    // Check for <br> tags
    const brTags = post.content.match(/<br\s*\/?>/gi);
    if (brTags) {
      console.log(`⚠️  Found ${brTags.length} <br> tags`);
    } else {
      console.log('✅ No <br> tags');
    }

    // Check for non-breaking spaces
    const nbspCount = (post.content.match(/\u00A0/g) || []).length;
    if (nbspCount > 0) {
      console.log(`⚠️  Found ${nbspCount} non-breaking spaces (\\u00A0)`);
    } else {
      console.log('✅ No non-breaking spaces');
    }

    // Check for empty paragraphs
    const emptyParagraphs = post.content.match(/<p[^>]*>\s*<\/p>/g);
    if (emptyParagraphs) {
      console.log(`⚠️  Found ${emptyParagraphs.length} empty paragraphs`);
    } else {
      console.log('✅ No empty paragraphs');
    }

    // Show first 200 chars of content
    console.log('\nFirst 200 chars of content:');
    console.log(post.content.substring(0, 200).replace(/\n/g, '\\n'));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Check complete!');
}

checkContent();
