import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuizBrowse from './QuizBrowse';

//Shared mocks
const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock Auth 
vi.mock('../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock Header and Footer components
vi.mock('components/organisms/header', () => ({
    default: () => <div data-testid="header">Header</div>,
}));

vi.mock('components/organisms/footer', () => ({
    default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('components/molecules/quiz-card', () => ({
    default: ({ quiz }: any) => <div data-testid="quiz-card">{quiz.name}</div>,
}));
const renderQuizBrowse = () => {
  return render(
    <MemoryRouter>
      <QuizBrowse />
    </MemoryRouter>
  );
};

describe('QuizBrowse Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows no quizzes message when empty', async () => {
        // Mock fetch to return empty quizzes
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ quizzes: [] }),
        }));

        renderQuizBrowse();

        // Wait for component to render after fetch
        await waitFor(() => {
            expect(screen.getByText(/no quizzes available/i)).toBeInTheDocument();
        });

        expect(screen.getByText('Header')).toBeInTheDocument();
        expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('renders quizzes and allows clicking', async () => {
        const mockQuizzes = [
            { quiz_id: 1, name: 'Math Quiz', subject_name: 'Math', attempt_count: 10 },
            { quiz_id: 2, name: 'History Quiz', subject_name: 'History', attempt_count: 5 },
        ];

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ quizzes: mockQuizzes }),
        }));

        renderQuizBrowse();
        // Wait for quizzes to render
        const mathQuiz = await screen.findByText('Math Quiz');
        const historyQuiz = await screen.findByText('History Quiz');

        expect(mathQuiz).toBeInTheDocument();
        expect(historyQuiz).toBeInTheDocument();

        // Simulate click on Math Quiz
        const quizCard = screen.getByText('Math Quiz');
        fireEvent.click(quizCard);

        expect(quizCard).toBeInTheDocument();
    });
    
        
});