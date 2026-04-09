import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import Profile from './Profile';
import { MemoryRouter } from 'react-router-dom';


// mock auth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ token: 'fake-token' }),
}));

// Mock Header and Footer components
vi.mock('components/organisms/header', () => ({
    default: () => <div data-testid="header">Header</div>,
}));

vi.mock('components/organisms/footer', () => ({
    default: () => <div data-testid="footer">Footer</div>,
}));

const renderProfile = () => {
  return render(
    <MemoryRouter>
        <Profile />
    </MemoryRouter>
  );
};

describe('Profile tabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          first_name: 'John',
          middle_name: '',
          last_name: 'Doe',
        }),
      })
    ) as any;
  });

  it('Default: Profile Tab', async () => {
    renderProfile();

    expect(
      await screen.findByText(/profile information/i)
    ).toBeInTheDocument();
  });

    it('Quiz History tab', async () => {
        const mockFetch = vi.fn();

        // Call to Profile
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
            first_name: 'John',
            middle_name: '',
            last_name: 'Doe',
            }),
        });

        // Call to Quiz History
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
            quizHistory: [],
            }),
        });

        globalThis.fetch = mockFetch as any;

        renderProfile();

        await userEvent.click(
            screen.getByRole('button', { name: /quiz history/i })
        );

        expect(
            await screen.findByRole('heading', { name: /quiz history/i })
        ).toBeInTheDocument();
    });

  it('Created Quizzes tab', async () => {
    renderProfile();

    await userEvent.click(
      screen.getByRole('button', { name: /created quizzes/i })
    );

    expect(
        screen.getByRole('heading', { name: /created quizzes/i })
    ).toBeInTheDocument();
  });
});