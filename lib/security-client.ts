// Client-only sanitization utility
// This file should only be imported in client components

'use client';

// Sanitize user input to prevent XSS attacks (client-side only)
// Uses enhanced sanitization for client-side
export function sanitizeInputSync(input: string): string {
  if (typeof window === 'undefined') {
    return input.replace(/<[^>]*>/g, '').trim();
  }
  
  // Enhanced client-side sanitization (without DOMPurify to avoid SSR issues)
  // Remove HTML tags and dangerous characters
  let sanitized = input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
  
  return sanitized;
}

