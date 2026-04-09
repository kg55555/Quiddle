import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Route, Routes } from "react-router-dom";
import QuizCreate from './QuizCreate';

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

const renderQuizCreate = () => {
  return render(
    <MemoryRouter initialEntries={['/quiz-edit/123']}>
      <Routes>
        <Route path="/quiz-edit/:quizId" element={<QuizCreate />} />
      </Routes>
    </MemoryRouter>
  );
};

const renderCreate = () => {
  return render(
    <MemoryRouter initialEntries={['/quiz-create']}>
      <Routes>
        <Route path="/quiz-create" element={<QuizCreate />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('QuizCreate Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('shows loading state while fetching quiz', () => {
        mockUseAuth.mockReturnValue({
            token: 'fake-token',
        });

        renderQuizCreate()
        expect(screen.getByText('Loading quiz...')).toBeInTheDocument()
    })

    it('renders quiz creation form when not loading', () => {
        mockUseAuth.mockReturnValue({
            token: 'fake-token',
        });

        renderCreate();

        // Title
        expect(screen.getByText('Quiz Creation')).toBeInTheDocument();

        // Inputs
        expect(screen.getByPlaceholderText('eg. Midterm Practice')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('e.g. MATH101')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Type your description here')).toBeInTheDocument();
        // Buttons / sections
        expect(screen.getByText('Add Questions')).toBeInTheDocument();
    });

});