import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const login = vi.fn().mockResolvedValue(undefined);
const register = vi.fn().mockResolvedValue(undefined);
const requestPasswordReset = vi.fn().mockResolvedValue(undefined);

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({
    status: 'anonymous',
    parent: null,
    login,
    register,
    requestPasswordReset,
    logout: vi.fn(),
  }),
}));

import { AuthScreen } from './AuthScreen';

describe('AuthScreen', () => {
  beforeEach(() => {
    login.mockClear();
    register.mockClear();
    requestPasswordReset.mockClear();
    window.history.pushState({}, '', '/'); // reset URL between tests
  });

  it('opens directly in sign-up mode when arriving with ?signup', async () => {
    window.history.pushState({}, '', '/?signup=1');
    render(<AuthScreen />);
    // The NOMBRE field only renders in register mode.
    expect(await screen.findByPlaceholderText(/tu nombre/i)).toBeInTheDocument();
  });

  it('logs in with email and password', async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.type(screen.getByPlaceholderText(/tucorreo/i), 'pat@x.dev');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(login).toHaveBeenCalledWith('pat@x.dev', 'password123');
    expect(register).not.toHaveBeenCalled();
  });

  it('switches to register and creates an account', async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    // In login mode there is exactly one "Crear cuenta" button — the tab.
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));
    await user.type(screen.getByPlaceholderText(/tu nombre/i), 'Pat');
    await user.type(screen.getByPlaceholderText(/tucorreo/i), 'pat@x.dev');
    // Submit via Enter to avoid the now-duplicate "Crear cuenta" (tab + submit).
    await user.type(screen.getByPlaceholderText(/mínimo 8/i), 'password123{Enter}');

    expect(register).toHaveBeenCalledWith('pat@x.dev', 'password123', 'Pat');
  });

  it('requests a password reset from the forgot view', async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByRole('button', { name: /olvidaste/i }));
    await user.type(screen.getByPlaceholderText(/tucorreo/i), 'pat@x.dev');
    await user.click(screen.getByRole('button', { name: /enviar enlace/i }));

    expect(requestPasswordReset).toHaveBeenCalledWith('pat@x.dev');
    expect(login).not.toHaveBeenCalled();
    // Always-OK confirmation (no account enumeration).
    expect(await screen.findByText(/te enviamos un enlace/i)).toBeInTheDocument();
  });
});
