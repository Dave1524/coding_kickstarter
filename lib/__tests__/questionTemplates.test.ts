import { detectProjectType, getTemplateQuestions, getSuggestedQuestions } from '@/lib/questionTemplates';

describe('Question Templates', () => {
  describe('detectProjectType', () => {
    it('should detect ecommerce projects', () => {
      expect(detectProjectType('I want to build an online shop')).toBe('ecommerce');
      expect(detectProjectType('e-commerce store for selling products')).toBe('ecommerce');
    });

    it('should detect blog projects', () => {
      expect(detectProjectType('I want to create a blog')).toBe('blog');
      expect(detectProjectType('writing articles and posts')).toBe('blog');
    });

    it('should detect saas projects', () => {
      expect(detectProjectType('SaaS platform for teams')).toBe('saas');
      expect(detectProjectType('subscription software service')).toBe('saas');
    });

    it('should detect social projects', () => {
      expect(detectProjectType('social network app')).toBe('social');
      expect(detectProjectType('feed with posts and likes')).toBe('social');
    });

    it('should detect dashboard projects', () => {
      expect(detectProjectType('analytics dashboard')).toBe('dashboard');
      expect(detectProjectType('data visualization with charts')).toBe('dashboard');
    });

    it('should detect portfolio projects', () => {
      expect(detectProjectType('portfolio website')).toBe('portfolio');
      expect(detectProjectType('showcase my work')).toBe('portfolio');
    });

    it('should detect todo projects', () => {
      expect(detectProjectType('todo app')).toBe('todo');
      expect(detectProjectType('task management list')).toBe('todo');
    });

    it('should detect chat projects', () => {
      expect(detectProjectType('chat application')).toBe('chat');
      expect(detectProjectType('messaging platform')).toBe('chat');
    });

    it('should return null for unknown project types', () => {
      expect(detectProjectType('random idea')).toBeNull();
    });
  });

  describe('getTemplateQuestions', () => {
    it('should return questions for ecommerce', () => {
      const questions = getTemplateQuestions('ecommerce');
      expect(questions.length).toBeGreaterThan(0);
      expect(questions[0]).toHaveProperty('id');
      expect(questions[0]).toHaveProperty('text');
      expect(questions[0]).toHaveProperty('type');
    });

    it('should return questions for blog', () => {
      const questions = getTemplateQuestions('blog');
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should return empty array for invalid type', () => {
      const questions = getTemplateQuestions('invalid' as any);
      expect(questions).toEqual([]);
    });
  });

  describe('getSuggestedQuestions', () => {
    it('should return suggested questions for detected type', () => {
      const questions = getSuggestedQuestions('I want to build an ecommerce store');
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown types', () => {
      const questions = getSuggestedQuestions('random idea');
      expect(questions).toEqual([]);
    });
  });
});

