import { validateAnswer, validateIdea } from '@/lib/validation';

describe('Validation', () => {
  describe('validateIdea', () => {
    it('should validate a valid idea', () => {
      const result = validateIdea('I want to build a todo app for managing daily tasks');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject ideas that are too short', () => {
      const result = validateIdea('Short');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too short');
    });

    it('should reject ideas that are too long', () => {
      const longIdea = 'a'.repeat(501);
      const result = validateIdea(longIdea);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too long');
    });

    it('should trim whitespace', () => {
      const result = validateIdea('   Valid idea with spaces   ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateAnswer', () => {
    it('should validate a valid answer', () => {
      const result = validateAnswer('This is a valid answer', 'q1', 'What is your answer?');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty answers', () => {
      const result = validateAnswer('', 'q1', 'What is your answer?');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject answers that are too long', () => {
      const longAnswer = 'a'.repeat(501);
      const result = validateAnswer(longAnswer, 'q1', 'What is your answer?');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too long');
    });

    it('should validate email format when question mentions email', () => {
      const result = validateAnswer('invalid-email', 'q1', 'What is your email address?');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('email');
    });

    it('should accept valid email format', () => {
      const result = validateAnswer('user@example.com', 'q1', 'What is your email address?');
      expect(result.isValid).toBe(true);
    });

    it('should validate URL format when question mentions URL', () => {
      const result = validateAnswer('not-a-url', 'q1', 'What is your website URL?');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('URL');
    });

    it('should accept valid URL format', () => {
      const result = validateAnswer('https://example.com', 'q1', 'What is your website URL?');
      expect(result.isValid).toBe(true);
    });
  });
});

