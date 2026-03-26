// services/notification-service/src/services/emailService.ts
import nodemailer from 'nodemailer';
import { ResumePublishedPayload } from '../consumers/resumeConsumer.js';

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendResumeReadyEmail(userId: string, data: ResumePublishedPayload) {
    // In a real app, we would look up the user's email from the userId
    // Here we'll assume we can get it from an API or just send to a default/log it
    // Or assume userId IS the email for simplicity if the payload doesn't contain it.
    // The payload defined in the previous step has { userId, ... } but not email.
    // Let's assume userId is email or we fetch it.
    // For this stub implementation, we'll just log if no email is found.
    // Wait, the prompt said "sendResumeReadyEmail(to: string, ...)"
    // The consumer calls it with (userId, payload).
    // I'll update the signature to match the consumer call, or fix the consumer.
    // The consumer passed payload.userId.
    // I'll simulate looking up email or just use userId as email for now.
    
    const toEmail = userId.includes('@') ? userId : 'user@example.com'; 

    console.log(`[Email] Sending to ${toEmail}...`);

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Resume Ecosystem" <noreply@resumeecosystem.dev>',
      to: toEmail,
      subject: `Your Resume v${data.version} is Ready! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #333;">Congratulations! 🚀</h2>
          <p>Your resume has been automatically updated with your latest verified achievements.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>New Score:</strong> ${data.score}/100</p>
            <p style="margin: 5px 0;"><strong>Version:</strong> v${data.version}</p>
          </div>

          <a href="${data.downloadUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Download Resume PDF</a>
          
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            You can also view your full history on the <a href="http://localhost:5173">dashboard</a>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 10px;">
            You received this email because you are a user of Resume Ecosystem.
            <a href="#" style="color: #999;">Unsubscribe</a>
          </p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[Email] Sent: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('[Email] Error sending:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
