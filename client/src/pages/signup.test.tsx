import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Signup from './signup';

// Mock Header and Footer components
vi.mock('components/organisms/header', () => ({
    default: () => <div data-testid="header">Header</div>,
}));

vi.mock('components/organisms/footer', () => ({
    default: () => <div data-testid="footer">Footer</div>,
}));

const renderSignup = () => {
  return render(
    <MemoryRouter>
        <Signup />
    </MemoryRouter>
  );
};

describe('SignUp Component UI', () => {
    it('renders main sections and buttons', () => {
        
        renderSignup();

        expect(screen.getByText('Sign up page')).toBeInTheDocument();

        // Welcome headings
        expect(screen.getByRole('heading', { name: /welcome to/i })).toBeInTheDocument();
        expect(screen.getByText('Quiddle')).toBeInTheDocument();

        // Get Login button
        expect(screen.getByRole('link', { name: /Login here/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();

        
    });

    it('renders the correct initial input values', () => {
        renderSignup();

        expect(screen.getByLabelText('First Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();

    });
});