import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ verifyEmail: vi.fn<(token: string) => Promise<void>>() }));

vi.mock('@/lib/auth', () => ({ useAuth: () => ({ verifyEmail: h.verifyEmail }) }));

import VerifyEmailPage from './page';

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    h.verifyEmail.mockReset();
  });

  it('redeems the token from the URL and shows success', async () => {
    h.verifyEmail.mockResolvedValue(undefined);
    window.history.pushState({}, '', '/verify-email?token=tok123');
    render(<VerifyEmailPage />);

    await waitFor(() => expect(h.verifyEmail).toHaveBeenCalledWith('tok123'));
    expect(await screen.findByText(/verificado/i)).toBeInTheDocument();
  });

  it('shows an error for an invalid/expired token', async () => {
    h.verifyEmail.mockRejectedValue(new Error('bad'));
    window.history.pushState({}, '', '/verify-email?token=bad');
    render(<VerifyEmailPage />);

    expect(await screen.findByText(/no válido/i)).toBeInTheDocument();
  });

  it('prompts when no token is present', async () => {
    window.history.pushState({}, '', '/verify-email');
    render(<VerifyEmailPage />);

    expect(await screen.findByText(/falta el código/i)).toBeInTheDocument();
    expect(h.verifyEmail).not.toHaveBeenCalled();
  });
});
