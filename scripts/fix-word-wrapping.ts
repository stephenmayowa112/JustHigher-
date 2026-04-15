/**
 * Fix word wrapping issues in blog posts
 * This script cleans embedded newlines from post content that cause mid-word wrapping
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Clean post content by removing embedded newlines that cause word wrapping issues
 */
function cleanPostContent(content: string): string {
  // Replace non-breaking spaces (both Unicode and HTML entities) with regular spaces
  let cleaned = content.replace(/\u00A0/g, ' ');
  cleaned = cleaned.replace(/&nbsp;/g, ' ');
  
  // Remove <br> and <br/> tags that might be causing breaks
  cleaned = cleaned.replace(/<br\s*\/?>/gi, ' ');
  
  // Remove unwanted line breaks within HTML paragraphs
  // This preserves attributes like class="ql-align-justify"
  cleaned = cleaned.replace(/<p([^>]*)>([^<]*?)<\/p>/g, (match, attrs, innerText) => {
    // Remove newlines and collapse multiple spaces within paragraph text
    const cleanedText = innerText
      .replace(/\s*\n\s*/g, ' ')  // Remove newlines
      .replace(/\s+/g, ' ')        // Collapse multiple spaces
      .trim();
    
    return cleanedText ? `<p${attrs}>${cleanedText}</p>` : '';
  });
  
  // Remove any remaining empty paragraphs
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/g, '');
  
  // Remove standalone newlines between tags
  cleaned = cleaned.replace(/>\s*\n\s*</g, '><');
  
  return cleaned;
}

async function fixWordWrapping() {
  console.log('🔧 Starting word wrapping fix...\n');

  try {
    // Fetch all posts
    const { data: posts, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, content, slug')
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch posts: ${fetchError.message}`);
    }

    if (!posts || posts.length === 0) {
      console.log('ℹ️  No posts found to fix');
      return;
    }

    console.log(`📝 Found ${posts.length} posts to process\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const post of posts) {
      const originalContent = post.content;
      const cleanedContent = cleanPostContent(originalContent);

      // Only update if content actually changed
      if (originalContent !== cleanedContent) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({ content: cleanedContent })
          .eq('id', post.id);

        if (updateError) {
          console.error(`❌ Failed to update post "${post.title}": ${updateError.message}`);
          continue;
        }

        console.log(`✅ Updated: "${post.title}" (${post.slug})`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped: "${post.title}" (no changes needed)`);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   Total posts: ${posts.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log('='.repeat(60));
    console.log('\n✨ Word wrapping fix completed successfully!');
    console.log('💡 Tip: Clear your browser cache and refresh to see the changes');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run the script
fixWordWrapping();
