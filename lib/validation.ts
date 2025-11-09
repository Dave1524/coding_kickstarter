import { z } from 'zod';

// Validation schema for project idea
export const IdeaSchema = z.string()
  .min(10, 'Idea too short (minimum 10 characters)')
  .max(500, 'Idea too long (maximum 500 characters)')
  .trim();

// Base answer validation schema
export const AnswerSchema = z.string()
  .min(1, 'Answer cannot be empty')
  .max(500, 'Answer too long (maximum 500 characters)')
  .trim();

// Email validation schema
export const EmailAnswerSchema = z.string()
  .email('Please enter a valid email address')
  .max(255, 'Email too long')
  .trim();

// URL validation schema
export const UrlAnswerSchema = z.string()
  .url('Please enter a valid URL')
  .max(500, 'URL too long')
  .trim();

// Question answer validation with optional type-specific validation
export function validateAnswer(answer: string, questionId: string, questionText: string): { isValid: boolean; error?: string } {
  // Check if answer is empty
  const emptyResult = AnswerSchema.safeParse(answer);
  if (!emptyResult.success) {
    return { isValid: false, error: emptyResult.error.issues[0].message };
  }

  // Check for email format if question mentions email
  if (questionText.toLowerCase().includes('email') && answer.includes('@')) {
    const emailResult = EmailAnswerSchema.safeParse(answer);
    if (!emailResult.success) {
      return { isValid: false, error: emailResult.error.issues[0].message };
    }
  }

  // Check for URL format if question mentions url/website/link
  const urlKeywords = ['url', 'website', 'link', 'domain', 'http'];
  if (urlKeywords.some(keyword => questionText.toLowerCase().includes(keyword)) && (answer.startsWith('http') || answer.includes('.'))) {
    const urlResult = UrlAnswerSchema.safeParse(answer);
    if (!urlResult.success) {
      return { isValid: false, error: urlResult.error.issues[0].message };
    }
  }

  return { isValid: true };
}

// Validate idea input
export function validateIdea(idea: string): { isValid: boolean; error?: string } {
  const result = IdeaSchema.safeParse(idea);
  if (!result.success) {
    return { isValid: false, error: result.error.issues[0].message };
  }
  return { isValid: true };
}

