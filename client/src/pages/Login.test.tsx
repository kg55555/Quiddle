import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { ROUTES } from '../utils/paths';
import { AuthProvider } from "../context/AuthContext";

// Mock environment variable
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_APP_BACKEND_URL: 'http://localhost:3000',
    },
  },
});

// Mock fetch globally
globalThis.fetch = vi.fn();

// Mock Header and Footer components
vi.mock('components/organisms/header', () => ({
    default: () => <div data-testid="header">Header</div>,
}));

vi.mock('components/organisms/footer', () => ({
    default: () => <div data-testid="footer">Footer</div>,
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
        useLocation: () => ({
            state: { from: ROUTES.HOME },
            pathname: '/login',
        }),
    };
});

describe('Login Component', () => {
    let mockLogin: ReturnType<typeof vi.fn>;
    let mockNavigate: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockLogin = vi.fn();
        mockNavigate = vi.fn();
        // Reset fetch mock
        (globalThis.fetch as any).mockClear();
    });

    const renderLogin = () => {
        const mockAuthValue = {
        login: mockLogin
        };
        return render(
        <BrowserRouter>
            <AuthProvider value={mockAuthValue}>
                    <Login />
            </AuthProvider>
            </BrowserRouter>
        );
    };

    // ===== Rendering Tests =====
    describe('Rendering', () => {
        it('should render the login form with all required fields', () => {
        renderLogin();     
            expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
        });

        it('should render Header and Footer components', () => {
            renderLogin();
            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('footer')).toBeInTheDocument();
        });

        it('should have initial empty form values', () => {
            renderLogin();
        
            const emailInput = screen.getByPlaceholderText('Enter your email') as HTMLInputElement;
            const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;
        
            expect(emailInput.value).toBe('');
            expect(passwordInput.value).toBe('');
        });
    });


});
