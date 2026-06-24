import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  resetPassword: vi.fn<(token: string, password: string) => Promise<void>>(),
}));

vi.mock('@/lib/auth', () => ({ useAuth: () => ({ resetPassword: h.resetPassword }) }));

import ResetPasswordPage from './page';

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    h.resetPassword.mockReset().mockResolvedValue(undefined);
  });

  it('submits the new password with the URL token and confirms', async () => {
    window.history.pushState({}, '', '/reset-password?token=tok123');
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    await user.type(screen.getByPlaceholderText(/mínimo 8/i), 'brand-new-pass');
    await user.click(screen.getByRole('button', { name: /restablecer/i }));

    expect(h.resetPassword).toHaveBeenCalledWith('tok123', 'brand-new-pass');
    expect(await screen.findByText(/se actualizó/i)).toBeInTheDocument();
  });

  it('shows an error when the token is rejected', async () => {
    h.resetPassword.mockRejectedValue(new Error('This reset link is invalid or has expired.'));
    window.history.pushState({}, '', '/reset-password?token=bad');
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    await user.type(screen.getByPlaceholderText(/mínimo 8/i), 'brand-new-pass');
    await user.click(screen.getByRole('button', { name: /restablecer/i }));

    expect(await screen.findByText(/invalid or has expired/i)).toBeInTheDocument();
  });

  it('prompts when the token is missing from the URL', () => {
    window.history.pushState({}, '', '/reset-password');
    render(<ResetPasswordPage />);

    expect(screen.getByText(/falta el código/i)).toBeInTheDocument();
  });
});
