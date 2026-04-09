import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Hub from './Hub';
import { ROUTES } from '../utils/paths';

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


const renderHub = () => {
  return render(
    <MemoryRouter>
      <Hub />
    </MemoryRouter>
  );
};



describe('Hub Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to login if no token', async () => {
        mockUseAuth.mockReturnValue({
        token: null,
        });

        renderHub();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LOGIN);
        });
    });

    it('shows loading when fetching quizzes', () => {
        mockUseAuth.mockReturnValue({
            token: 'fake-token',
        });

        // if not resolved, stays loading
        globalThis.fetch = vi.fn(() => new Promise(() => {})) as any;
        // if resolved, expect to see hub
         renderHub();
        expect(
            screen.getByText(/loading your quizzes/i)
        ).toBeInTheDocument();
    });

    // Shows empty state
    it('shows empty state when no quizzes exist', async () => {
        mockUseAuth.mockReturnValue({
            token: 'fake-token',
        });

        globalThis.fetch = vi.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
        })
        ) as any;

        renderHub();

        await waitFor(() => {
        expect(
            screen.getByText(/no quizzes yet/i)
        ).toBeInTheDocument();
        });
        expect(screen.getByText('Header')).toBeInTheDocument();
        expect(screen.getByText('Footer')).toBeInTheDocument();
    });
});