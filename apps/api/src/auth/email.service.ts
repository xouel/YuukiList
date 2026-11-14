/**
 * YuukiList — Serviço de Envio de E-mails Transacionais
 * Conforme Requisito: Password Recovery Request and Token Issuance
 * Meta R$ 0 / Custo Zero permanente: Integração direta com Brevo HTTP API v3
 */

import { EmailDeliveryConfigError } from './errors.ts';

export interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface IEmailService {
  send(options: SendEmailOptions): Promise<boolean>;
}

export class MemoryEmailService implements IEmailService {
  public sentEmails: SendEmailOptions[] = [];

  async send(options: SendEmailOptions): Promise<boolean> {
    this.sentEmails.push({ ...options });
    return true;
  }

  clear(): void {
    this.sentEmails = [];
  }
}

export class BrevoEmailService implements IEmailService {
  private readonly apiKey?: string;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor(apiKey?: string, mailFrom?: string) {
    this.apiKey = apiKey || process.env.BREVO_API_KEY;
    const rawFrom = mailFrom || process.env.MAIL_FROM || 'YuukiList <no-reply@yuukilist.app>';
    const match = rawFrom.match(/^(?:([^<]+)<)?([^>]+)>?$/);
    if (match) {
      this.senderName = (match[1] || 'YuukiList').trim();
      this.senderEmail = (match[2] || 'no-reply@yuukilist.app').trim();
    } else {
      this.senderName = 'YuukiList';
      this.senderEmail = 'no-reply@yuukilist.app';
    }
  }

  async send(options: SendEmailOptions): Promise<boolean> {
    if (!this.apiKey) {
      const isProduction =
        process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
      if (isProduction) {
        throw new EmailDeliveryConfigError(
          'Serviço de envio de e-mails não configurado no ambiente de produção.'
        );
      }
      // Em desenvolvimento e testes sem API key, simula envio com sucesso
      return true;
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: this.senderName,
            email: this.senderEmail,
          },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.htmlContent,
          textContent: options.textContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('Falha ao enviar e-mail via Brevo API:', response.status, errorText);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Erro de conexão ao enviar e-mail via Brevo API:', err);
      return false;
    }
  }
}

