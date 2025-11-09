import { sanitizeInput, escapeHtml, checkRateLimit } from '@/lib/security';

describe('Security', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('should trim whitespace', () => {
      const input = '   Hello World   ';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World');
    });

    it('should handle empty strings', () => {
      const result = sanitizeInput('');
      expect(result).toBe('');
    });

    it('should preserve plain text', () => {
      const input = 'This is plain text';
      const result = sanitizeInput(input);
      expect(result).toBe('This is plain text');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      const input = '<div>Hello & World</div>';
      const result = escapeHtml(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&amp;');
    });

    it('should escape quotes', () => {
      const input = 'He said "Hello"';
      const result = escapeHtml(input);
      expect(result).toContain('&quot;');
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      // Clear rate limit map before each test
      jest.clearAllMocks();
    });

    it('should allow requests within limit', () => {
      const key = 'test-key';
      expect(checkRateLimit(key, 5, 60000)).toBe(true);
      expect(checkRateLimit(key, 5, 60000)).toBe(true);
      expect(checkRateLimit(key, 5, 60000)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      const key = 'test-key-limit';
      // Make 5 requests (the limit)
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key, 5, 60000);
      }
      // 6th request should be blocked
      expect(checkRateLimit(key, 5, 60000)).toBe(false);
    });

    it('should reset after window expires', () => {
      jest.useFakeTimers();
      const key = 'test-key-reset';
      
      // Make requests up to limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key, 5, 60000);
      }
      
      // Fast-forward time past the window
      jest.advanceTimersByTime(61000);
      
      // Should allow new requests
      expect(checkRateLimit(key, 5, 60000)).toBe(true);
      
      jest.useRealTimers();
    });
  });
});

