import { Inject, Injectable } from '@nestjs/common';

/** A fully-rendered message handed to a transport. */
export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Pluggable mail transport. Production uses Resend; dev/test swap in a logger or
 * a capturing fake (see `mail.transport.ts` and the e2e suite) so no real email
 * is sent and tests can assert on the rendered link.
 */
export interface MailTransport {
  send(message: MailMessage): Promise<void>;
}

/** DI token for the transport so it can be overridden in tests. */
export const MAIL_TRANSPORT = Symbol('MAIL_TRANSPORT');

@Injectable()
export class MailService {
  constructor(@Inject(MAIL_TRANSPORT) private readonly transport: MailTransport) {}

  /** Send the "confirm your email" link to a freshly-registered parent. */
  async sendVerificationEmail(to: string, link: string): Promise<void> {
    await this.transport.send({
      to,
      subject: 'Verifica tu correo · Stoic Piggy',
      text: verificationText(link),
      html: layout('Verifica tu correo', 'Confirma tu correo', 'Verificar correo', link, [
        'Gracias por crear tu cuenta de Stoic Piggy.',
        'Confirma que este correo es tuyo para activar todas las funciones.',
      ]),
    });
  }

  /** Notify a parent that their kid asked (from the app) to delete the family account. */
  async sendAccountDeletionRequestEmail(
    to: string,
    childName: string,
    dashboardLink: string,
  ): Promise<void> {
    await this.transport.send({
      to,
      subject: 'Solicitud para eliminar la cuenta · Stoic Piggy',
      text: deletionRequestText(childName, dashboardLink),
      html: layout(
        'Solicitud para eliminar la cuenta',
        'Tu hijo pidió eliminar la cuenta',
        'Abrir el panel',
        dashboardLink,
        [
          `${childName} solicitó eliminar la cuenta familiar desde la app de Stoic Piggy.`,
          'Solo tú, como titular de la cuenta, puedes eliminarla: abre el panel y ve a Ajustes → Eliminar cuenta. Esto borra de forma permanente todos los datos de tu familia.',
        ],
      ),
    });
  }

  /** Send the password-reset link to a parent who asked to reset. */
  async sendPasswordResetEmail(to: string, link: string): Promise<void> {
    await this.transport.send({
      to,
      subject: 'Restablece tu contraseña · Stoic Piggy',
      text: resetText(link),
      html: layout(
        'Restablece tu contraseña',
        'Restablece tu contraseña',
        'Crear nueva contraseña',
        link,
        [
          'Recibimos una solicitud para restablecer tu contraseña.',
          'Si no fuiste tú, ignora este mensaje: tu contraseña no cambiará.',
        ],
      ),
    });
  }
}

const verificationText = (link: string) =>
  `Verifica tu correo de Stoic Piggy abriendo este enlace:\n${link}\n\nEl enlace caduca en 24 horas. Si no creaste esta cuenta, ignora este mensaje.`;

const resetText = (link: string) =>
  `Restablece tu contraseña de Stoic Piggy abriendo este enlace:\n${link}\n\nEl enlace caduca en 1 hora. Si no lo solicitaste, ignora este mensaje y tu contraseña seguirá igual.`;

const deletionRequestText = (childName: string, link: string) =>
  `${childName} solicitó eliminar la cuenta familiar de Stoic Piggy desde la app.\n\nSolo tú, como titular de la cuenta, puedes eliminarla. Abre el panel y ve a Ajustes → Eliminar cuenta:\n${link}\n\nEsto borra de forma permanente todos los datos de tu familia.`;

/** Minimal, inline-styled responsive email shell (no external CSS in email clients). */
function layout(
  preheader: string,
  heading: string,
  cta: string,
  link: string,
  paragraphs: string[],
): string {
  const body = paragraphs
    .map(
      (p) => `<p style="margin:0 0 14px;font-size:15px;line-height:22px;color:#3b4658;">${p}</p>`,
    )
    .join('');
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f4f1ea;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<span style="display:none;opacity:0;color:transparent;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:440px;background:#ffffff;border-radius:18px;padding:32px;">
<tr><td>
<div style="font-size:13px;font-weight:800;letter-spacing:0.6px;color:#e0594b;margin-bottom:8px;">STOIC PIGGY</div>
<h1 style="margin:0 0 16px;font-size:22px;color:#0b1320;">${heading}</h1>
${body}
<a href="${link}" style="display:inline-block;margin:8px 0 18px;background:#e0594b;color:#fff;text-decoration:none;font-weight:800;font-size:15px;padding:13px 22px;border-radius:13px;">${cta}</a>
<p style="margin:0;font-size:12px;line-height:18px;color:#8a93a0;">O copia y pega este enlace:<br><span style="color:#3b4658;word-break:break-all;">${link}</span></p>
</td></tr></table></td></tr></table></body></html>`;
}
