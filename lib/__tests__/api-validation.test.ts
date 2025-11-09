import {
  validateGenerateQuestionsResponse,
  validateCheckReadinessResponse,
  isValidGenerateQuestionsResponse,
  isValidCheckReadinessResponse,
} from '@/lib/api-validation';

describe('API Validation', () => {
  describe('validateGenerateQuestionsResponse', () => {
    it('should validate a valid response', () => {
      const validResponse = {
        questions: [
          {
            id: 'q1',
            text: 'What is your answer?',
            type: 'text' as const,
          },
        ],
        readyToGenerate: false,
      };

      const result = validateGenerateQuestionsResponse(validResponse);
      expect(result.questions).toHaveLength(1);
      expect(result.readyToGenerate).toBe(false);
    });

    it('should throw on invalid response', () => {
      const invalidResponse = {
        questions: [],
        readyToGenerate: false,
      };

      expect(() => validateGenerateQuestionsResponse(invalidResponse)).toThrow();
    });

    it('should validate select type questions', () => {
      const validResponse = {
        questions: [
          {
            id: 'q1',
            text: 'Choose an option?',
            type: 'select' as const,
            options: ['Option 1', 'Option 2'],
          },
        ],
        readyToGenerate: false,
      };

      const result = validateGenerateQuestionsResponse(validResponse);
      expect(result.questions[0].type).toBe('select');
      expect(result.questions[0].options).toEqual(['Option 1', 'Option 2']);
    });
  });

  describe('validateCheckReadinessResponse', () => {
    it('should validate a valid response with more questions', () => {
      const validResponse = {
        readyToGenerate: false,
        needsMoreQuestions: true,
        nextQuestions: [
          {
            id: 'q2',
            text: 'Another question?',
            type: 'text' as const,
          },
        ],
      };

      const result = validateCheckReadinessResponse(validResponse);
      expect(result.readyToGenerate).toBe(false);
      expect(result.needsMoreQuestions).toBe(true);
      expect(result.nextQuestions).toHaveLength(1);
    });

    it('should validate a valid response ready to generate', () => {
      const validResponse = {
        readyToGenerate: true,
        needsMoreQuestions: false,
      };

      const result = validateCheckReadinessResponse(validResponse);
      expect(result.readyToGenerate).toBe(true);
      expect(result.needsMoreQuestions).toBe(false);
    });

    it('should throw on invalid response', () => {
      const invalidResponse = {
        readyToGenerate: 'yes', // Should be boolean
        needsMoreQuestions: false,
      };

      expect(() => validateCheckReadinessResponse(invalidResponse)).toThrow();
    });
  });

  describe('Type guards', () => {
    it('isValidGenerateQuestionsResponse should return true for valid data', () => {
      const validData = {
        questions: [{ id: 'q1', text: 'Test?', type: 'text' as const }],
        readyToGenerate: false,
      };
      expect(isValidGenerateQuestionsResponse(validData)).toBe(true);
    });

    it('isValidGenerateQuestionsResponse should return false for invalid data', () => {
      const invalidData = { questions: [] };
      expect(isValidGenerateQuestionsResponse(invalidData)).toBe(false);
    });

    it('isValidCheckReadinessResponse should return true for valid data', () => {
      const validData = {
        readyToGenerate: true,
        needsMoreQuestions: false,
      };
      expect(isValidCheckReadinessResponse(validData)).toBe(true);
    });

    it('isValidCheckReadinessResponse should return false for invalid data', () => {
      const invalidData = { readyToGenerate: 'yes' };
      expect(isValidCheckReadinessResponse(invalidData)).toBe(false);
    });
  });
});

