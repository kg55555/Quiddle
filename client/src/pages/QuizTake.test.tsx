import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Route, Routes } from "react-router-dom";
import QuizTake from './QuizTake';

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

vi.mock('../api/quiz', () => ({
  fetchQuiz: vi.fn(() => new Promise(() => {})), // never resolves
}));

const renderQuizTake = (route = '/quiz/123') => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/quiz" element={<QuizTake />} />
        <Route path="/quiz/:quizId" element={<QuizTake />} />
      </Routes>
    </MemoryRouter>
  );
};


describe('QuizCreate Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows loading initially', () => {
        mockUseAuth.mockReturnValue({ token: 'fake-token' });
        renderQuizTake();
        expect(screen.getByText('Loading quiz...')).toBeInTheDocument();
    });

    it('shows error if fetch fails', async () => {
        mockUseAuth.mockReturnValue({ token: 'fake-token' });

        vi.stubGlobal('fetch', vi.fn(() =>
            Promise.resolve({
            ok: false,
            json: async () => ({ error: 'Failed to load quiz' }),
            })
        ));

        renderQuizTake();

        expect(await screen.findByText('Failed to load quiz')).toBeInTheDocument();
    });

    it('renders quiz questions after loading', async () => {
  mockUseAuth.mockReturnValue({ token: 'fake-token' });

    vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
            ok: true,
            json: async () => ({
                quiz: {
                    name: 'Sample Quiz',
                    questions: [
                        {
                        question_id: 1,
                        type: 'MC',
                        description: 'What is 2+2?',
                        answers: [
                            { answer_id: 1, answer_description: '4', is_correct: true },
                            { answer_id: 2, answer_description: '5', is_correct: false },
                        ],
                        },
                    ],
                },
            }),
        })
    ));

    renderQuizTake();

    // waits for loading → finished
    expect(await screen.findByText('Sample Quiz')).toBeInTheDocument();
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('shows error if quizId is missing', async () => {
        mockUseAuth.mockReturnValue({ token: 'fake-token' });
        renderQuizTake('/quiz');
        expect(await screen.findByText(/Quiz ID is missing/i)).toBeInTheDocument();
    });

    it('shows error if user is not logged in', async () => {
        mockUseAuth.mockReturnValue({ token: null });
        renderQuizTake();
        expect(await screen.findByText(/must be logged in/i)).toBeInTheDocument();
    });
});