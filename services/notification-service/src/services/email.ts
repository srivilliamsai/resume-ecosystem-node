// services/notification-service/src/services/email.ts
// Email service using Nodemailer

import nodemailer, { Transporter } from "nodemailer";
import { createLogger } from "common-lib";

const logger = createLogger({ serviceName: "notification-service" });

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host) {
      logger.warn("SMTP_HOST not configured - email sending disabled");
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user && pass ? { user, pass } : undefined,
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === "production",
        },
      });

      this.isConfigured = true;
      logger.info({ host, port }, "Email service initialized");
    } catch (error) {
      logger.error({ error }, "Failed to initialize email service");
    }
  }

  /**
   * Verify SMTP connection
   */
  async verify(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info("SMTP connection verified");
      return true;
    } catch (error) {
      logger.error({ error }, "SMTP verification failed");
      return false;
    }
  }

  /**
   * Send an email
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn({ to: options.to }, "Email not sent - SMTP not configured");
      return {
        success: false,
        error: "SMTP not configured",
      };
    }

    const from = process.env.SMTP_FROM || "noreply@resume-ecosystem.com";

    try {
      const result = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      });

      logger.info(
        { messageId: result.messageId, to: options.to },
        "Email sent successfully"
      );

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error({ error, to: options.to }, "Failed to send email");

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Simple HTML to text conversion
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Check if email service is configured
   */
  isEnabled(): boolean {
    return this.isConfigured;
  }
}

// Singleton instance
export const emailService = new EmailService();

export default emailService;
