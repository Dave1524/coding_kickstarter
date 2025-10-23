/**
 * Environment Variables Checker
 * Run this to verify your .env.local is set up correctly
 * 
 * Usage: node check-env.js
 */

console.log('\n🔍 Checking Environment Variables...\n');

// Check if variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment Variable Status:');
console.log('═══════════════════════════════════════\n');

if (supabaseUrl) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL is set');
  console.log(`   Value: ${supabaseUrl.substring(0, 30)}...`);
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL is MISSING');
}

if (supabaseKey) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set');
  console.log(`   Value: ${supabaseKey.substring(0, 30)}...`);
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is MISSING');
}

console.log('\n═══════════════════════════════════════\n');

if (!supabaseUrl || !supabaseKey) {
  console.log('🚨 ACTION REQUIRED:\n');
  console.log('1. Open your .env.local file');
  console.log('2. Make sure it contains these lines:\n');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...\n');
  console.log('3. Replace with YOUR actual values from Supabase dashboard');
  console.log('4. Save the file (Ctrl+S)');
  console.log('5. Restart: npm run dev\n');
} else {
  console.log('✅ All required variables are set!\n');
  console.log('📝 Next steps:');
  console.log('1. Restart your dev server: npm run dev');
  console.log('2. Visit: http://localhost:3000/api/test-supabase\n');
}

