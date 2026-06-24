import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Parent = {
  role: 'parent';
  id: string;
  email: string;
  displayName: string;
  emailVerifiedAt: string | null;
};

const h = vi.hoisted(() => ({
  parent: null as Parent | null,
  resendVerification: vi.fn<() => Promise<void>>(),
}));

vi.mock('@/lib/auth', () => ({
  useAuth: () => ({ parent: h.parent, resendVerification: h.resendVerification }),
}));

import { VerifyEmailBanner } from './VerifyEmailBanner';

const parent = (emailVerifiedAt: string | null): Parent => ({
  role: 'parent',
  id: 'p1',
  email: 'a@b.dev',
  displayName: 'Ann',
  emailVerifiedAt,
});

describe('VerifyEmailBanner', () => {
  beforeEach(() => {
    h.resendVerification.mockReset().mockResolvedValue(undefined);
  });

  it('renders nothing once the parent is verified', () => {
    h.parent = parent('2026-01-01T00:00:00.000Z');
    const { container } = render(<VerifyEmailBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when there is no parent yet', () => {
    h.parent = null;
    const { container } = render(<VerifyEmailBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('prompts to verify and resends, then confirms', async () => {
    h.parent = parent(null);
    const user = userEvent.setup();
    render(<VerifyEmailBanner />);

    expect(screen.getByText(/verifica tu correo/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reenviar/i }));

    expect(h.resendVerification).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/revisa tu bandeja/i)).toBeInTheDocument();
  });

  it('shows an error if the resend fails', async () => {
    h.parent = parent(null);
    h.resendVerification.mockRejectedValue(new Error('nope'));
    const user = userEvent.setup();
    render(<VerifyEmailBanner />);

    await user.click(screen.getByRole('button', { name: /reenviar/i }));
    expect(await screen.findByText(/no se pudo enviar/i)).toBeInTheDocument();
  });

  it('renders in English when lang=en', () => {
    h.parent = parent(null);
    render(<VerifyEmailBanner lang="en" />);
    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
  });
});
