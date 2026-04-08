import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { ROUTES } from '../utils/paths';
import { AuthProvider } from "../context/AuthContext";
import userEvent from '@testing-library/user-event';


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

        const VALID_EMAIL = 'test@example.com';
        const VALID_PASSWORD = 'password123';
        
        // Mock successful login response
        (globalThis.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                token: 'fake-jwt-token',
                user: { email: VALID_EMAIL },
            }),
        });

    });

     // ===== State Management Tests =====
    describe('State Management - handleChange', () => {
        it('should update email field when user types', async () => {
            const user = userEvent.setup();
            renderLogin();
            
            const emailInput = screen.getByPlaceholderText('Enter your email');
            await user.type(emailInput, 'test@example.com');
            
            expect(emailInput).toHaveValue('test@example.com');
        });

        it('should update password field when user types', async () => {
            const user = userEvent.setup();
            renderLogin();
            
            const passwordInput = screen.getByPlaceholderText('Enter your password');
            await user.type(passwordInput, 'securePassword123');
            
            expect(passwordInput).toHaveValue('securePassword123');
        });

        it('should handle multiple field changes independently', async () => {
            const user = userEvent.setup();
            renderLogin();
            
            const emailInput = screen.getByPlaceholderText('Enter your email');
            const passwordInput = screen.getByPlaceholderText('Enter your password');
            
            await user.type(emailInput, 'user@test.com');
            await user.type(passwordInput, 'pass123');
            
            expect(emailInput).toHaveValue('user@test.com');
            expect(passwordInput).toHaveValue('pass123');
        });
    });

    // ===== API Tests =====
    describe('Sneding Data to API', () => {
        it('should show error for invalid credentials', async () => {
            renderLogin();

            const emailInput = screen.getByPlaceholderText('Enter your email');
            const passwordInput = screen.getByPlaceholderText('Enter your password');
            const alertMock = vi.fn();
            window.alert = alertMock;

            fireEvent.change(emailInput, {
                target: { value: 'wrong@example.com' },
            });
            
            fireEvent.change(passwordInput, {
                target: { value: 'wrongpassword' },
            });

            // Mock failed API response
            (globalThis.fetch as any).mockResolvedValueOnce({
                status: 401,
                ok: false,
                json: async () => ({}),
            });

            fireEvent.click(screen.getByRole('button', { name: 'Login' }));

            await waitFor(() => {
                expect(alertMock).toHaveBeenCalled();
            });

            expect(alertMock.mock.calls[0][0]).toMatch(/Login failed/i);
        });

        it('should send correct email and password to API', async () => {
            renderLogin();

            const emailInput = screen.getByPlaceholderText('Enter your email');
            const passwordInput = screen.getByPlaceholderText('Enter your password');
            const button = screen.getByRole('button', { name: 'Login' });

            const testEmail = 'test@example.com';
            const testPassword = 'password123';

            fireEvent.change(emailInput, {
                target: { value: testEmail },
            });

            fireEvent.change(passwordInput, {
                target: { value: testPassword },
            });

            // Mock API response so the call resolves
            (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({}),
            });

            fireEvent.click(button);

            await waitFor(() => {
                expect(globalThis.fetch).toHaveBeenCalled();
            });
            expect(globalThis.fetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/auth/login',
                    expect.objectContaining({
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: testEmail,
                            password: testPassword,
                        }),
                    })
            );
        });
    });
});
