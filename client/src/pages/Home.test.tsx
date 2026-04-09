import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

// Mock static image import
vi.mock('/img/pexels-cottonbro-6333728-lowres.jpg', () => ({
  default: 'mocked-image.jpg',
}));

// Mock Header and Footer components
vi.mock('components/organisms/header', () => ({
    default: () => <div data-testid="header">Header</div>,
}));

vi.mock('components/organisms/footer', () => ({
    default: () => <div data-testid="footer">Footer</div>,
}));

describe('Home Component UI', () => {
    it('renders main sections and buttons', () => {
        render(
        <MemoryRouter>
            <Home />
        </MemoryRouter>
        );

        // Header/Footer mocks
        expect(screen.getByText('Header')).toBeInTheDocument();
        expect(screen.getByText('Footer')).toBeInTheDocument();

        // Welcome headings
        expect(screen.getByRole('heading', { name: /welcome to/i })).toBeInTheDocument();
        expect(screen.getByText('Quiddle')).toBeInTheDocument();

        // Get Started button
        expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();

        // Features
        expect(screen.getByRole('heading', { name: /what is quiddle\?/i })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /our goal/i })).toBeInTheDocument();

        // FAQ section
        expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeInTheDocument();
        expect(screen.getByText(/how do i access quizzes\?/i)).toBeInTheDocument();
        expect(screen.getByText(/how does it work\?/i)).toBeInTheDocument();
    });

    it('toggles FAQ items when clicked', () => {
        render(<MemoryRouter><Home /></MemoryRouter>);

        const faq1Button = screen.getByText(/how do i access quizzes\?/i);
        const faq1Content = screen.getByText(/simply, after logging in/i).parentElement!;

        const faq2Button = screen.getByText(/how does it work\?/i);
        const faq2Content = screen.getByText(/once you have created an account/i).parentElement!;

        // Initially hidden
        expect(faq1Content).toHaveClass('max-h-0');
        expect(faq2Content).toHaveClass('max-h-0');

        // Toggle first FAQ
        fireEvent.click(faq1Button);
        expect(faq1Content).toHaveClass('max-h-40');

        // Toggle second FAQ
        fireEvent.click(faq2Button);
        expect(faq2Content).toHaveClass('max-h-40');
    });
});