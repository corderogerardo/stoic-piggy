import { Logger } from '@nestjs/common';
import { type MailMessage, MailService, type MailTransport } from './mail.service';
import {
  createMailTransport,
  LoggerTransport,
  ResendTransport,
  resolveEmailFrom,
} from './mail.transport';

class CapturingTransport implements MailTransport {
  readonly sent: MailMessage[] = [];
  async send(message: MailMessage): Promise<void> {
    this.sent.push(message);
  }
}

describe('MailService', () => {
  let transport: CapturingTransport;
  let mail: MailService;

  beforeEach(() => {
    transport = new CapturingTransport();
    mail = new MailService(transport);
  });

  it('sends a verification email containing the link in both html and text', async () => {
    const link = 'https://app.test/verify-email?token=abc123';
    await mail.sendVerificationEmail('parent@x.dev', link);

    expect(transport.sent).toHaveLength(1);
    const msg = transport.sent[0];
    expect(msg?.to).toBe('parent@x.dev');
    expect(msg?.subject).toMatch(/verifica/i);
    expect(msg?.text).toContain(link);
    expect(msg?.html).toContain(link);
  });

  it('sends a password-reset email containing the link', async () => {
    const link = 'https://app.test/reset-password?token=xyz789';
    await mail.sendPasswordResetEmail('parent@x.dev', link);

    const msg = transport.sent[0];
    expect(msg?.subject).toMatch(/contraseña/i);
    expect(msg?.text).toContain(link);
    expect(msg?.html).toContain(link);
  });
});

describe('createMailTransport', () => {
  const original = process.env.RESEND_API_KEY;
  afterEach(() => {
    if (original === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = original;
  });

  it('returns the dev logger when no API key is set', () => {
    delete process.env.RESEND_API_KEY;
    expect(createMailTransport()).toBeInstanceOf(LoggerTransport);
  });

  it('returns the Resend transport when an API key is set', () => {
    process.env.RESEND_API_KEY = 're_test_key';
    expect(createMailTransport()).toBeInstanceOf(ResendTransport);
  });
});

describe('resolveEmailFrom', () => {
  const original = process.env.EMAIL_FROM;
  afterEach(() => {
    if (original === undefined) delete process.env.EMAIL_FROM;
    else process.env.EMAIL_FROM = original;
  });

  it('falls back to the Resend onboarding sender', () => {
    delete process.env.EMAIL_FROM;
    expect(resolveEmailFrom()).toMatch(/resend\.dev/);
  });

  it('uses EMAIL_FROM when set', () => {
    process.env.EMAIL_FROM = 'Stoic Piggy <no-reply@stoicpiggy.app>';
    expect(resolveEmailFrom()).toBe('Stoic Piggy <no-reply@stoicpiggy.app>');
  });
});

describe('LoggerTransport', () => {
  it('resolves without sending (dev fallback)', async () => {
    // Silence the intentional dev warning so the test output stays clean.
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const t = new LoggerTransport();
    await expect(
      t.send({ to: 'a@b.dev', subject: 's', html: '<p>x</p>', text: 'x' }),
    ).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
