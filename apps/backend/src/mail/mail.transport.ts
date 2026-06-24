import { Logger } from '@nestjs/common';
import { Resend } from 'resend';
import type { MailMessage, MailTransport } from './mail.service';

/** Sends real email via Resend. Used whenever RESEND_API_KEY is set. */
export class ResendTransport implements MailTransport {
  private readonly resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async send(message: MailMessage): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: resolveEmailFrom(),
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    if (error) {
      throw new Error(`Resend failed to send to ${message.to}: ${error.message}`);
    }
  }
}

/**
 * Dev/test fallback when no RESEND_API_KEY is configured: don't send anything,
 * just log the link so local flows (and `docker compose` runs) are testable
 * without an email provider. Mirrors the JWT dev-secret fail-soft in AuthService.
 */
export class LoggerTransport implements MailTransport {
  private readonly logger = new Logger('MailService');

  async send(message: MailMessage): Promise<void> {
    this.logger.warn(
      `RESEND_API_KEY not set — email NOT sent. to=${message.to} subject="${message.subject}"\n${message.text}`,
    );
  }
}

/**
 * Choose the transport from the environment: Resend when a key is present,
 * otherwise the dev logger. The e2e suite overrides MAIL_TRANSPORT with a
 * capturing fake instead of relying on this.
 */
export function createMailTransport(): MailTransport {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && apiKey.length > 0) return new ResendTransport(apiKey);
  return new LoggerTransport();
}

/**
 * The verified "From" address. Defaults to Resend's onboarding sender, which can
 * only deliver to your own account email — set EMAIL_FROM to a verified domain
 * address (e.g. "Stoic Piggy <no-reply@stoicpiggy.app>") for real delivery.
 */
export function resolveEmailFrom(): string {
  const from = process.env.EMAIL_FROM;
  return from && from.length > 0 ? from : 'Stoic Piggy <onboarding@resend.dev>';
}
