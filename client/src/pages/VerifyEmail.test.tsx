import { render, waitFor, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import VerifyEmail from './VerifyEmail';
import { ROUTES } from '../utils/paths';
import { useSearchParams } from 'react-router-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: vi.fn(),
  };
});


globalThis.fetch = vi.fn();

describe('VerifyEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to HOME if params are missing', async () => {
    (useSearchParams as any).mockReturnValue([
      new URLSearchParams(''),
    ]);

    render(<VerifyEmail />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME);
    });

    expect(fetch).not.toHaveBeenCalled();
  });


  it('calls API with correct payload when params exist', async () => {
    (fetch as any).mockResolvedValue({ ok: true });

    (useSearchParams as any).mockReturnValue([
      new URLSearchParams('email=test@test.com&validationString=abc123'),
    ]);

    render(<VerifyEmail />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/mail/verify-email'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          validationString: 'abc123',
        }),
      })
    );
  });


  it('redirects on successful verification', async () => {
    (fetch as any).mockResolvedValue({ ok: true });

    (useSearchParams as any).mockReturnValue([
      new URLSearchParams('email=test@test.com&validationString=abc123'),
    ]);

    render(<VerifyEmail />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME);
    });
  });


  it('redirects even if verification fails', async () => {
    (fetch as any).mockResolvedValue({ ok: false });

    (useSearchParams as any).mockReturnValue([
      new URLSearchParams('email=test@test.com&validationString=abc123'),
    ]);

    render(<VerifyEmail />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME);
    });
  });

  
  it('redirects if fetch throws an error', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    (useSearchParams as any).mockReturnValue([
      new URLSearchParams('email=test@test.com&validationString=abc123'),
    ]);

    render(<VerifyEmail />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.HOME);
    });
  });

  it('renders loading message', () => {
    (useSearchParams as any).mockReturnValue([
      new URLSearchParams(''),
    ]);

    render(<VerifyEmail />);

    expect(
      screen.getByText(/verifying your email/i)
    ).toBeInTheDocument();
  });
});