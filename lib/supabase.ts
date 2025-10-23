import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate that we have the required env vars
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection function
export async function testConnection() {
  try {
    // Try to query a non-existent table to test connection
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    // If we get a "table not found" error, connection is working!
    if (error && (error.code === 'PGRST204' || error.message.includes('not find the table'))) {
      return { 
        success: true, 
        message: 'Connected to Supabase! ✅',
        details: 'Your database is empty (no tables yet), but the connection works perfectly!'
      };
    }
    
    // Any other error means connection issue
    if (error) {
      return { success: false, message: error.message, code: error.code };
    }
    
    // If we actually got data, connection definitely works
    return { success: true, message: 'Connected to Supabase! ✅', data };
  } catch (err) {
    return { 
      success: false, 
      message: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}
