import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/supabase';

/**
 * Test Supabase Cloud Connection
 * 
 * This endpoint verifies that:
 * 1. Environment variables are loaded correctly
 * 2. Supabase client can connect to your cloud database
 * 3. Authentication works
 * 
 * Visit: http://localhost:3000/api/test-supabase
 */
export async function GET() {
  try {
    // Test the connection
    const result = await testConnection();
    
    if (result.success) {
      return NextResponse.json({
        status: 'success',
        message: '✅ Supabase connection successful!',
        details: result.message,
        env: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...'
        }
      }, { status: 200 });
    } else {
      return NextResponse.json({
        status: 'error',
        message: '❌ Supabase connection failed',
        error: result.message,
        env: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: '❌ Error testing Supabase',
      error: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Check your .env.local file and restart the dev server'
    }, { status: 500 });
  }
}

