import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env.local manually
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.substring(0, eqIdx).trim();
      const value = trimmed.substring(eqIdx + 1).trim();
      process.env[key] = value;
    }
  } catch (e) {
    console.error('Could not read .env.local:', e);
    process.exit(1);
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Supabase URL:', supabaseUrl);
console.log('Service key present:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = 'justhigher8@gmail.com';
const PASSWORD = 'Justhigher1234';

async function main() {
  console.log('Setting up admin user:', EMAIL);

  // First, try to list users to see if this email already exists
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Error listing users:', listError.message);
    process.exit(1);
  }

  const existingUser = listData.users.find((u) => u.email === EMAIL);

  if (existingUser) {
    console.log('User already exists (ID:', existingUser.id, '). Updating password and confirming email...');

    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });

    if (error) {
      console.error('Error updating user:', error.message);
      process.exit(1);
    }

    console.log('User updated successfully!');
    console.log('User ID:', data.user.id);
  } else {
    console.log('User does not exist. Creating new admin user...');

    const { data, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });

    if (error) {
      console.error('Error creating user:', error.message);
      process.exit(1);
    }

    console.log('Admin user created successfully!');
    console.log('User ID:', data.user.id);
  }

  console.log('\nYou can now log in at /admin/login with:');
  console.log('  Email:', EMAIL);
  console.log('  Password:', PASSWORD);
}

main();
