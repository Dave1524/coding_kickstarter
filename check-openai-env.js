/**
 * OpenAI Environment Variable Checker
 * Run this to verify your OpenAI API key is loaded correctly
 * 
 * Usage: node check-openai-env.js
 */

console.log('\n🔍 Checking OpenAI Environment Variables...\n');

const openaiKey = process.env.OPENAI_API_KEY;

console.log('═══════════════════════════════════════\n');

if (openaiKey) {
  console.log('✅ OPENAI_API_KEY is set');
  console.log(`   Starts with: ${openaiKey.substring(0, 15)}...`);
  console.log(`   Length: ${openaiKey.length} characters`);
  
  // Check if it looks valid
  if (openaiKey.startsWith('sk-proj-') || openaiKey.startsWith('sk-')) {
    console.log('   Format: ✅ Looks correct!');
  } else {
    console.log('   Format: ⚠️  Should start with "sk-proj-" or "sk-"');
  }
} else {
  console.log('❌ OPENAI_API_KEY is MISSING');
}

console.log('\n═══════════════════════════════════════\n');

if (!openaiKey) {
  console.log('🚨 ACTION REQUIRED:\n');
  console.log('1. Open your .env.local file');
  console.log('2. Make sure it contains this line:\n');
  console.log('   OPENAI_API_KEY=sk-proj-your-actual-key-here\n');
  console.log('3. NO spaces around the = sign');
  console.log('4. NO quotes around the key');
  console.log('5. Save the file (Ctrl+S)');
  console.log('6. RESTART dev server:');
  console.log('   - Press Ctrl+C to stop');
  console.log('   - Run: npm run dev\n');
} else {
  console.log('✅ Environment variable loaded successfully!\n');
  console.log('If your app still shows errors:');
  console.log('1. RESTART the dev server (Ctrl+C, then npm run dev)');
  console.log('2. Hard refresh browser (Ctrl+Shift+R)');
  console.log('3. Check OpenAI dashboard for credits/usage\n');
}


