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
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    if (error && error.code === 'PGRST204') {
      // Table doesn't exist, but connection works!
      return { success: true, message: 'Connected to Supabase! (No tables yet)' };
    }
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    return { success: true, message: 'Connected to Supabase!', data };
  } catch (err) {
    return { 
      success: false, 
      message: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}
