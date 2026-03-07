/**
 * Script to activate all subscribers
 * Run with: npx tsx scripts/activate-subscribers.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function activateAllSubscribers() {
  console.log('🔧 Activating all subscribers...\n');

  // Get all inactive subscribers
  const { data: inactiveSubscribers, error: fetchError } = await supabase
    .from('subscribers')
    .select('*')
    .eq('active', false);

  if (fetchError) {
    console.error('❌ Error fetching subscribers:', fetchError);
    process.exit(1);
  }

  if (!inactiveSubscribers || inactiveSubscribers.length === 0) {
    console.log('✅ All subscribers are already active!');
    process.exit(0);
  }

  console.log(`Found ${inactiveSubscribers.length} inactive subscriber(s):\n`);
  inactiveSubscribers.forEach((sub, index) => {
    console.log(`${index + 1}. ${sub.email}`);
  });

  console.log('\n🔄 Activating subscribers...\n');

  // Activate all subscribers
  const { error: updateError } = await supabase
    .from('subscribers')
    .update({ active: true })
    .eq('active', false);

  if (updateError) {
    console.error('❌ Error activating subscribers:', updateError);
    process.exit(1);
  }

  console.log(`✅ Successfully activated ${inactiveSubscribers.length} subscriber(s)!`);
  console.log('\n📧 You can now send newsletters to all subscribers.');
}

activateAllSubscribers()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
