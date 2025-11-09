import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

// Mock the API routes
global.fetch = jest.fn();

// Mock PDFDownload component
jest.mock('@/components/PDFDownload', () => {
  return function MockPDFDownload(props: any) {
    return <div data-testid="pdf-download">PDF Download Component</div>;
  };
});

// Mock EarlyAccessModal component
jest.mock('@/components/EarlyAccessModal', () => {
  return function MockEarlyAccessModal(props: any) {
    return props.isOpen ? <div data-testid="early-access-modal">Early Access Modal</div> : null;
  };
});

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  analytics: {
    questionGenerated: jest.fn(),
    questionAnswered: jest.fn(),
    questionSkipped: jest.fn(),
    questionNavigatedBack: jest.fn(),
    readinessChecked: jest.fn(),
    guideGenerated: jest.fn(),
    errorOccurred: jest.fn(),
  },
}));

describe('Questionnaire Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  describe('Idea Input and Question Generation', () => {
    it('should render the idea input form', () => {
      render(<Home />);
      expect(screen.getByLabelText(/what do you want to build/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start questionnaire/i })).toBeInTheDocument();
    });

    it('should disable submit button when idea is empty', () => {
      render(<Home />);
      const submitButton = screen.getByRole('button', { name: /start questionnaire/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when idea is entered', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      const ideaInput = screen.getByLabelText(/what do you want to build/i);
      await user.type(ideaInput, 'I want to build a todo app');
      
      const submitButton = screen.getByRole('button', { name: /start questionnaire/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should generate questions when idea is submitted', async () => {
      const user = userEvent.setup();
      const mockQuestions = [
        { id: 'q1', text: 'What is your technical level?', type: 'text' as const },
        { id: 'q2', text: 'What features do you need?', type: 'text' as const },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          questions: mockQuestions,
          readyToGenerate: false,
        }),
      });

      render(<Home />);
      
      const ideaInput = screen.getByLabelText(/what do you want to build/i);
      await user.type(ideaInput, 'I want to build a todo app');
      
      const submitButton = screen.getByRole('button', { name: /start questionnaire/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/question 1 of 2/i)).toBeInTheDocument();
        expect(screen.getByText('What is your technical level?')).toBeInTheDocument();
      });
    });

    it('should show error when question generation fails', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to generate questions' }),
      });

      render(<Home />);
      
      const ideaInput = screen.getByLabelText(/what do you want to build/i);
      await user.type(ideaInput, 'I want to build a todo app');
      
      const submitButton = screen.getByRole('button', { name: /start questionnaire/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to generate questions/i)).toBeInTheDocument();
      });
    });
  });

  describe('Question Navigation', () => {
    const mockQuestions = [
      { id: 'q1', text: 'What is your technical level?', type: 'text' as const },
      { id: 'q2', text: 'What features do you need?', type: 'text' as const },
      { id: 'q3', text: 'What is your budget?', type: 'select' as const, options: ['Free', 'Paid'] },
    ];

    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          questions: mockQuestions,
          readyToGenerate: false,
        }),
      });

      const user = userEvent.setup();
      render(<Home />);
      
      const ideaInput = screen.getByLabelText(/what do you want to build/i);
      await user.type(ideaInput, 'I want to build a todo app');
      
      const submitButton = screen.getByRole('button', { name: /start questionnaire/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('What is your technical level?')).toBeInTheDocument();
      });
    });

    it('should display first question after generation', () => {
      expect(screen.getByText(/question 1 of 3/i)).toBeInTheDocument();
      expect(screen.getByText('What is your technical level?')).toBeInTheDocument();
    });

    it('should disable Next button when answer is empty', () => {
      const nextButton = screen.getByRole('button', { name: /next question/i });
      expect(nextButton).toBeDisabled();
    });

    it('should enable Next button when answer is provided', async () => {
      const user = userEvent.setup();
      const answerInput = screen.getByLabelText('What is your technical level?');
      await user.type(answerInput, 'Beginner');
      
      const nextButton = screen.getByRole('button', { name: /next question/i });
      expect(nextButton).not.toBeDisabled();
    });

    it('should move to next question when Next is clicked', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          readyToGenerate: false,
          needsMoreQuestions: false,
        }),
      });

      const answerInput = screen.getByLabelText('What is your technical level?');
      await user.type(answerInput, 'Beginner');
      
      const nextButton = screen.getByRole('button', { name: /next question/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/question 2 of 3/i)).toBeInTheDocument();
        expect(screen.getByText('What features do you need?')).toBeInTheDocument();
      });
    });

    it('should show Previous button on second question', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          readyToGenerate: false,
          needsMoreQuestions: false,
        }),
      });

      const answerInput = screen.getByLabelText('What is your technical level?');
      await user.type(answerInput, 'Beginner');
      
      const nextButton = screen.getByRole('button', { name: /next question/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      });
    });

    it('should navigate back to previous question', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          readyToGenerate: false,
          needsMoreQuestions: false,
        }),
      });

      // Answer first question and move forward
      const answerInput = screen.getByLabelText('What is your technical level?');
      await user.type(answerInput, 'Beginner');
      
      const nextButton = screen.getByRole('button', { name: /next question/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('What features do you need?')).toBeInTheDocument();
      });

      // Navigate back
      const previousButton = screen.getByRole('button', { name: /previous/i });
      await user.click(previousButton);

      await waitFor(() => {
        expect(screen.getByText('What is your technical level?')).toBeInTheDocument();
        const input = screen.getByLabelText('What is your technical level?') as HTMLInputElement;
        expect(input.value).toBe('Beginner');
      });
    });

    it('should render select dropdown for select type questions', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          readyToGenerate: false,
          needsMoreQuestions: false,
        }),
      });

      // Answer first two questions
      const answerInput1 = screen.getByLabelText('What is your technical level?');
      await user.type(answerInput1, 'Beginner');
      await user.click(screen.getByRole('button', { name: /next question/i }));

      await waitFor(() => {
        expect(screen.getByText('What features do you need?')).toBeInTheDocument();
      });

      const answerInput2 = screen.getByLabelText('What features do you need?');
      await user.type(answerInput2, 'Task management');
      await user.click(screen.getByRole('button', { name: /next question/i }));

      await waitFor(() => {
        expect(screen.getByText('What is your budget?')).toBeInTheDocument();
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });
  });

  describe('Question Skipping', () => {
    const mockQuestions = [
      { id: 'q1', text: 'What is your technical level?', type: 'text' as const },
      { id: 'q2', text: 'What features do you need?', type: 'text' as const },
    ];

    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          questions: mockQuestions,
          readyToGenerate: false,
        }),
      });

      const user = userEvent.setup();
      render(<Home />);
      
      const ideaInput = screen.getByLabelText(/what do you want to build/i);
      await user.type(ideaInput, 'I want to build a todo app');
      
      const submitButton = screen.getByRole('button', { name: /start questionnaire/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('What is your technical level?')).toBeInTheDocument();
      });
    });

    it('should show skip confirmation modal when skip is clicked', async () => {
      const user = userEvent.setup();
      const skipButton = screen.getByRole('button', { name: /skip/i });
      await user.click(skipButton);

      await waitFor(() => {
        expect(screen.getByText(/skip this question/i)).toBeInTheDocument();
        expect(screen.getByText(/you can answer this question later/i)).toBeInTheDocument();
      });
    });

    it('should skip question when confirmed', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          readyToGenerate: false,
          needsMoreQuestions: false,
        }),
      });

      const skipButton = screen.getByRole('button', { name: /skip/i });
      await user.click(skipButton);

      await waitFor(() => {
        expect(screen.getByText(/skip this question/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /yes, skip/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('What features do you need?')).toBeInTheDocument();
        expect(screen.getByText(/1 skipped/i)).toBeInTheDocument();
      });
    });

    it('should show skipped questions in answer summary', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          readyToGenerate: false,
          needsMoreQuestions: false,
        }),
      });

      const skipButton = screen.getByRole('button', { name: /skip/i });
      await user.click(skipButton);

      const confirmButton = screen.getByRole('button', { name: /yes, skip/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/skipped/i)).toBeInTheDocument();
      });
    });
  });

  describe('Input Validation', () => {
    const mockQuestions = [
      { id: 'q1', text: 'What is your email?', type: 'text' as const },
    ];

    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          questions: mockQuestions,
          readyToGenerate: false,
        }),
      });

      const user = userEvent.setup();
      render(<Home />);
      
      const ideaInput = screen.getByLabelText(/what do you want to build/i);
      await user.type(ideaInput, 'I want to build a todo app');
      
      const submitButton = screen.getByRole('button', { name: /start questionnaire/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('What is your email?')).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email', async () => {
      const user = userEvent.setup();
      const answerInput = screen.getByLabelText('What is your email?');
      await user.type(answerInput, 'invalid-email');
      
      const nextButton = screen.getByRole('button', { name: /next question/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    it('should accept valid email format', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          readyToGenerate: false,
          needsMoreQuestions: false,
        }),
      });

      const answerInput = screen.getByLabelText('What is your email?');
      await user.type(answerInput, 'user@example.com');
      
      const nextButton = screen.getByRole('button', { name: /next question/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.queryByText(/valid email/i)).not.toBeInTheDocument();
      });
    });

    it('should show character counter for text inputs', () => {
      const answerInput = screen.getByLabelText('What is your email?');
      expect(screen.getByText(/0\/500 characters/i)).toBeInTheDocument();
    });
  });

  describe('Answer Summary', () => {
    const mockQuestions = [
      { id: 'q1', text: 'What is your technical level?', type: 'text' as const },
      { id: 'q2', text: 'What features do you need?', type: 'text' as const },
    ];

    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          questions: mockQuestions,
          readyToGenerate: false,
        }),
      });

      const user = userEvent.setup();
      render(<Home />);
      
      const ideaInput = screen.getByLabelText(/what do you want to build/i);
      await user.type(ideaInput, 'I want to build a todo app');
      
      const submitButton = screen.getByRole('button', { name: /start questionnaire/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('What is your technical level?')).toBeInTheDocument();
      });
    });

    it('should show answered questions in summary', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          readyToGenerate: false,
          needsMoreQuestions: false,
        }),
      });

      const answerInput = screen.getByLabelText('What is your technical level?');
      await user.type(answerInput, 'Beginner');
      
      const nextButton = screen.getByRole('button', { name: /next question/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/answered: 1\/2/i)).toBeInTheDocument();
        expect(screen.getByText(/beginner/i)).toBeInTheDocument();
      });
    });

    it('should allow editing answers from summary', async () => {
      const user = userEvent.setup();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          readyToGenerate: false,
          needsMoreQuestions: false,
        }),
      });

      // Answer first question
      const answerInput = screen.getByLabelText('What is your technical level?');
      await user.type(answerInput, 'Beginner');
      
      const nextButton = screen.getByRole('button', { name: /next question/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/beginner/i)).toBeInTheDocument();
      });

      // Click on answer summary to edit
      const answerSummary = screen.getByText(/beginner/i).closest('div');
      if (answerSummary) {
        await user.click(answerSummary);
      }

      await waitFor(() => {
        const input = screen.getByLabelText('What is your technical level?') as HTMLInputElement;
        expect(input.value).toBe('Beginner');
      });
    });
  });

  describe('Guide Generation', () => {
    const mockQuestions = [
      { id: 'q1', text: 'What is your technical level?', type: 'text' as const },
    ];

    beforeEach(async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            questions: mockQuestions,
            readyToGenerate: false,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            readyToGenerate: true,
            needsMoreQuestions: false,
          }),
        });

      const user = userEvent.setup();
      render(<Home />);
      
      const ideaInput = screen.getByLabelText(/what do you want to build/i);
      await user.type(ideaInput, 'I want to build a todo app');
      
      const submitButton = screen.getByRole('button', { name: /start questionnaire/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('What is your technical level?')).toBeInTheDocument();
      });
    });

    it('should auto-generate guide when all questions answered', async () => {
      const user = userEvent.setup();
      
      const mockGuide = {
        provider: 'openai',
        model: 'gpt-4o-mini',
        idea: 'I want to build a todo app',
        answers: { q1: 'Beginner' },
        output: {
          top5: [],
          kanbanMarkdown: '| To Do | In Progress | Done |',
          blueprint: {
            epics: {
              input: [],
              output: [],
              export: [],
              history: [],
            },
          },
          pdfMeta: {
            appName: 'Todo App',
            gradient: ['#3b82f6', '#8b5cf6'],
            timestamp: new Date().toISOString(),
          },
        },
        timestamp: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockGuide,
      });

      const answerInput = screen.getByLabelText('What is your technical level?');
      await user.type(answerInput, 'Beginner');
      
      const nextButton = screen.getByRole('button', { name: /finish questions/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByTestId('pdf-download')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});

