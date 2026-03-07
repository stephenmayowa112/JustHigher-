/**
 * Script to check subscriber status
 * Run with: npx tsx scripts/check-subscribers.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubscribers() {
  console.log('🔍 Checking subscribers...\n');

  // Get all subscribers
  const { data: allSubscribers, error: allError } = await supabase
    .from('subscribers')
    .select('*')
    .order('subscribed_at', { ascending: false });

  if (allError) {
    console.error('❌ Error fetching subscribers:', allError);
    process.exit(1);
  }

  // Get active subscribers
  const { data: activeSubscribers, error: activeError } = await supabase
    .from('subscribers')
    .select('*')
    .eq('active', true)
    .order('subscribed_at', { ascending: false });

  if (activeError) {
    console.error('❌ Error fetching active subscribers:', activeError);
    process.exit(1);
  }

  console.log('📊 Subscriber Statistics:');
  console.log(`   Total subscribers: ${allSubscribers?.length || 0}`);
  console.log(`   Active subscribers: ${activeSubscribers?.length || 0}`);
  console.log(`   Inactive subscribers: ${(allSubscribers?.length || 0) - (activeSubscribers?.length || 0)}\n`);

  if (allSubscribers && allSubscribers.length > 0) {
    console.log('📋 All Subscribers:\n');
    allSubscribers.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.email}`);
      console.log(`   Status: ${sub.active ? '✅ Active' : '❌ Inactive'}`);
      console.log(`   Subscribed: ${new Date(sub.subscribed_at).toLocaleDateString()}`);
      console.log(`   Source: ${sub.source || 'unknown'}\n`);
    });
  } else {
    console.log('⚠️  No subscribers found in the database\n');
  }

  // Check if there are inactive subscribers that should be active
  const inactiveCount = (allSubscribers?.length || 0) - (activeSubscribers?.length || 0);
  if (inactiveCount > 0) {
    console.log('⚠️  WARNING: You have inactive subscribers!');
    console.log('   These subscribers will NOT receive newsletters.');
    console.log('   To activate them, run: npx tsx scripts/activate-subscribers.ts\n');
  }

  if (activeSubscribers && activeSubscribers.length === 0 && allSubscribers && allSubscribers.length > 0) {
    console.log('🔧 ISSUE FOUND: All subscribers are marked as inactive!');
    console.log('   This is why you\'re getting "No active subscribers" error.');
    console.log('   Run this command to fix: npx tsx scripts/activate-subscribers.ts\n');
  }
}

checkSubscribers()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
