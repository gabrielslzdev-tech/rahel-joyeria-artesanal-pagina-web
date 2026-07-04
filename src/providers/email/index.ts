/**
 * Contrato EmailProvider (Resend). Los correos se disparan por eventos del
 * outbox, no inline. Implementación: resend.ts.
 */

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface EmailProvider {
  readonly name: "resend";
  send(input: SendEmailInput): Promise<{ id: string }>;
}

export function getEmailProvider(): EmailProvider {
  throw new Error("EmailProvider no implementado todavía (F1).");
}
