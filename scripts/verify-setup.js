/**
 * Setup Verification Script
 * Run this to verify your environment is configured correctly
 * 
 * Usage: node scripts/verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying JustHigher Blog Setup...\n');

let hasErrors = false;

// Check 1: .env.local exists
console.log('1️⃣  Checking .env.local file...');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env.local file exists\n');
  
  // Read and check environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  console.log('2️⃣  Checking required environment variables...');
  requiredVars.forEach(varName => {
    if (envContent.includes(varName) && !envContent.includes(`${varName}=your_`)) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ❌ ${varName} is missing or not configured`);
      hasErrors = true;
    }
  });
  console.log('');
  
  // Check optional vars
  console.log('3️⃣  Checking optional environment variables...');
  const optionalVars = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SITE_URL',
    'UPSTASH_REDIS_REST_URL',
  ];
  
  optionalVars.forEach(varName => {
    if (envContent.includes(varName) && !envContent.includes(`${varName}=your_`)) {
      console.log(`   ✅ ${varName} is set`);
    } else {
      console.log(`   ⚠️  ${varName} is not set (optional)`);
    }
  });
  console.log('');
  
} else {
  console.log('   ❌ .env.local file not found!\n');
  console.log('   📝 Create .env.local by copying .env.local.example:');
  console.log('      cp .env.local.example .env.local\n');
  hasErrors = true;
}

// Check 2: Node modules
console.log('4️⃣  Checking node_modules...');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules exists\n');
} else {
  console.log('   ❌ node_modules not found!\n');
  console.log('   📝 Run: npm install\n');
  hasErrors = true;
}

// Check 3: Required directories
console.log('5️⃣  Checking required directories...');
const requiredDirs = [
  'src/app',
  'src/components',
  'src/lib',
  'public',
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(dirPath)) {
    console.log(`   ✅ ${dir} exists`);
  } else {
    console.log(`   ❌ ${dir} not found!`);
    hasErrors = true;
  }
});
console.log('');

// Check 4: Supabase files
console.log('6️⃣  Checking Supabase setup files...');
const supabaseFiles = [
  'supabase/schema.sql',
  'supabase/rls-policies.sql',
];

supabaseFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ⚠️  ${file} not found (may need to be created)`);
  }
});
console.log('');

// Summary
console.log('═══════════════════════════════════════════════════════');
if (hasErrors) {
  console.log('❌ Setup verification FAILED');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Fix the errors listed above');
  console.log('2. Make sure you have a Supabase project created');
  console.log('3. Copy your Supabase credentials to .env.local');
  console.log('4. Run the database setup scripts in Supabase SQL Editor');
  console.log('5. Create an admin user (see docs/TROUBLESHOOTING.md)');
  console.log('');
  console.log('📚 For detailed help, see: docs/TROUBLESHOOTING.md');
  process.exit(1);
} else {
  console.log('✅ Setup verification PASSED');
  console.log('');
  console.log('🎉 Your environment looks good!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Make sure your Supabase project is active');
  console.log('2. Run database setup scripts (if not done):');
  console.log('   - supabase/schema.sql');
  console.log('   - supabase/rls-policies.sql');
  console.log('3. Create an admin user:');
  console.log('   - npx tsx scripts/create-admin.ts');
  console.log('   - OR use Supabase Dashboard');
  console.log('4. Start the dev server:');
  console.log('   - npm run dev');
  console.log('');
  console.log('📚 For more help, see: docs/TROUBLESHOOTING.md');
  process.exit(0);
}
