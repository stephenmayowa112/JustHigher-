const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ilzgxrpagzetyokvabzp.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const post = {
    title: 'Test Post',
    content: '<p>Test content</p>',
    slug: 'test-post-' + Date.now(),
    meta_description: 'test',
    tags: ['test'],
    published_at: new Date().toISOString()
  };

  console.log('Inserting post...', post);
  const { data, error } = await supabase.from('posts').insert(post).select().single();
  
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert success:', data);
    // clean up
    await supabase.from('posts').delete().eq('id', data.id);
  }
}

testInsert();
