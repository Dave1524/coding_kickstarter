import { loadDraft, clearDraft } from '@/hooks/useAutoSave';

describe('useAutoSave', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('loadDraft', () => {
    it('should return null when no draft exists', () => {
      const draft = loadDraft();
      expect(draft).toBeNull();
    });

    it('should load a valid draft', () => {
      const draftData = {
        idea: 'Test idea',
        answers: { q1: 'answer1' },
        questionTexts: { q1: 'Question 1?' },
        questionSet: [
          {
            id: 'q1',
            text: 'Question 1?',
            type: 'text' as const,
          },
        ],
        questionIndex: 0,
        skippedQuestions: [],
        timestamp: Date.now(),
      };

      localStorage.setItem('coding_kickstarter_draft', JSON.stringify(draftData));
      const loaded = loadDraft();

      expect(loaded).not.toBeNull();
      expect(loaded?.idea).toBe('Test idea');
      expect(loaded?.answers).toEqual({ q1: 'answer1' });
    });

    it('should return null for expired drafts (older than 24 hours)', () => {
      const oldDraft = {
        idea: 'Old idea',
        answers: {},
        questionTexts: {},
        questionSet: [],
        questionIndex: 0,
        skippedQuestions: [],
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
      };

      localStorage.setItem('coding_kickstarter_draft', JSON.stringify(oldDraft));
      const loaded = loadDraft();

      expect(loaded).toBeNull();
      // Draft should be cleared
      expect(localStorage.getItem('coding_kickstarter_draft')).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('coding_kickstarter_draft', 'invalid json');
      const loaded = loadDraft();
      // Should not throw, but return null or handle error
      expect(loaded).toBeNull();
    });
  });

  describe('clearDraft', () => {
    it('should clear draft from localStorage', () => {
      localStorage.setItem('coding_kickstarter_draft', JSON.stringify({ idea: 'test' }));
      clearDraft();
      expect(localStorage.getItem('coding_kickstarter_draft')).toBeNull();
    });

    it('should not throw when no draft exists', () => {
      expect(() => clearDraft()).not.toThrow();
    });
  });
});

