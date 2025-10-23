import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// This connects your app to your Supabase database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Example: Fetch data from a table
export async function fetchUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error('Error fetching users:', error);
    return null;
  }
  
  return data;
}

// Example: Insert new data
export async function createUser(email: string, name: string) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, name }]);
  
  if (error) {
    console.error('Error creating user:', error);
    return null;
  }
  
  return data;
}
