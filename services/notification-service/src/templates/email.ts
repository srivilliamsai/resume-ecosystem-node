// services/notification-service/src/templates/email.ts
// HTML email templates for notifications

export interface ResumePublishedData {
  userName: string;
  resumeScore: number;
  versionId: string;
  activitiesCount: number;
  downloadUrl: string;
  viewUrl: string;
}

export interface ActivityVerifiedData {
  userName: string;
  activityTitle: string;
  activityType: string;
  verifiedAt: string;
}

/**
 * Base email layout wrapper
 */
function baseLayout(content: string, previewText: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Resume Ecosystem</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f4f4f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 30px 40px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
    }
    .content {
      padding: 40px;
    }
    .content h2 {
      margin: 0 0 20px 0;
      font-size: 22px;
      color: #1a1a1a;
    }
    .content p {
      margin: 0 0 16px 0;
      color: #4a4a4a;
    }
    .score-badge {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 18px;
      font-weight: 600;
      margin: 10px 0;
    }
    .stats {
      display: flex;
      justify-content: space-around;
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .stat-item {
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
    }
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 10px 5px;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .button-secondary {
      background: #ffffff;
      color: #667eea !important;
      border: 2px solid #667eea;
    }
    .cta-section {
      text-align: center;
      margin: 30px 0;
    }
    .footer {
      background-color: #f8fafc;
      padding: 30px 40px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 20px 0;
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
      }
      .header, .content, .footer {
        padding: 20px;
      }
      .stats {
        flex-direction: column;
        gap: 15px;
      }
      .button {
        display: block;
        margin: 10px 0;
      }
    }
  </style>
</head>
<body>
  <!-- Preview text (hidden) -->
  <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>

  <div class="container">
    <div class="email-wrapper">
      ${content}

      <div class="footer">
        <p>
          <strong>Resume Ecosystem</strong><br>
          Your verified professional profile
        </p>
        <p style="margin-top: 15px;">
          <a href="#">Manage Preferences</a> &bull;
          <a href="#">Unsubscribe</a> &bull;
          <a href="#">Help</a>
        </p>
        <p style="margin-top: 15px; font-size: 11px; color: #9ca3af;">
          This email was sent by Resume Ecosystem. If you didn't expect this email,
          you can safely ignore it.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Resume Published email template
 */
export function resumePublishedEmail(data: ResumePublishedData): string {
  const content = `
    <div class="header">
      <h1>Your Resume is Ready!</h1>
      <p>A new version has been published</p>
    </div>

    <div class="content">
      <h2>Hi ${escapeHtml(data.userName)},</h2>

      <p>
        Great news! Your resume has been automatically updated with your latest
        verified activities. Here's a summary of your new resume:
      </p>

      <div style="text-align: center; margin: 25px 0;">
        <div class="score-badge">
          Resume Score: ${data.resumeScore}/100
        </div>
      </div>

      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">${data.activitiesCount}</div>
          <div class="stat-label">Verified Activities</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${getScoreGrade(data.resumeScore)}</div>
          <div class="stat-label">Overall Grade</div>
        </div>
      </div>

      <p>
        Your resume now includes all your verified internships, courses, hackathons,
        and projects. Each entry has been authenticated to ensure credibility.
      </p>

      <div class="cta-section">
        <a href="${escapeHtml(data.downloadUrl)}" class="button">
          Download PDF
        </a>
        <a href="${escapeHtml(data.viewUrl)}" class="button button-secondary">
          View Online
        </a>
      </div>

      <div class="divider"></div>

      <p style="font-size: 14px; color: #6b7280;">
        <strong>Tips to improve your score:</strong>
      </p>
      <ul style="font-size: 14px; color: #6b7280; padding-left: 20px;">
        <li>Add more verified activities from different categories</li>
        <li>Complete pending verifications</li>
        <li>Keep your profile information up to date</li>
      </ul>
    </div>
  `;

  return baseLayout(
    content,
    `Your resume is ready! Score: ${data.resumeScore}/100 with ${data.activitiesCount} verified activities.`
  );
}

/**
 * Activity Verified email template
 */
export function activityVerifiedEmail(data: ActivityVerifiedData): string {
  const content = `
    <div class="header">
      <h1>Activity Verified!</h1>
      <p>Your ${escapeHtml(data.activityType.toLowerCase())} has been authenticated</p>
    </div>

    <div class="content">
      <h2>Hi ${escapeHtml(data.userName)},</h2>

      <p>
        Your activity has been successfully verified and will now appear on your
        resume with a verification badge.
      </p>

      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; font-weight: 600; color: #065f46;">
          ${escapeHtml(data.activityTitle)}
        </p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #047857;">
          ${escapeHtml(data.activityType)} • Verified on ${escapeHtml(data.verifiedAt)}
        </p>
      </div>

      <p>
        Verified activities are marked with a special badge and can significantly
        boost your resume score. Employers can trust that this entry has been
        authenticated.
      </p>

      <div class="cta-section">
        <a href="#" class="button">
          View Resume
        </a>
      </div>
    </div>
  `;

  return baseLayout(
    content,
    `Your ${data.activityType} "${data.activityTitle}" has been verified!`
  );
}

/**
 * Welcome email template
 */
export function welcomeEmail(userName: string): string {
  const content = `
    <div class="header">
      <h1>Welcome to Resume Ecosystem!</h1>
      <p>Build verified resumes that stand out</p>
    </div>

    <div class="content">
      <h2>Hi ${escapeHtml(userName)},</h2>

      <p>
        Welcome! We're excited to have you on board. Resume Ecosystem helps you
        build credible, verified resumes from your real professional experiences.
      </p>

      <p><strong>Here's how to get started:</strong></p>

      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 15px 0;">
          <strong>1. Add Activities</strong><br>
          <span style="font-size: 14px; color: #6b7280;">
            Import or manually add your internships, courses, hackathons, and projects.
          </span>
        </p>
        <p style="margin: 0 0 15px 0;">
          <strong>2. Verify Them</strong><br>
          <span style="font-size: 14px; color: #6b7280;">
            Connect to platforms or upload certificates to verify your activities.
          </span>
        </p>
        <p style="margin: 0;">
          <strong>3. Generate Resume</strong><br>
          <span style="font-size: 14px; color: #6b7280;">
            Your resume is automatically built and scored based on verified entries.
          </span>
        </p>
      </div>

      <div class="cta-section">
        <a href="#" class="button">
          Get Started
        </a>
      </div>
    </div>
  `;

  return baseLayout(content, `Welcome to Resume Ecosystem! Let's build your verified resume.`);
}

/**
 * Helper: Convert score to grade
 */
function getScoreGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "A-";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 65) return "B-";
  if (score >= 60) return "C+";
  if (score >= 55) return "C";
  return "C-";
}

/**
 * Helper: Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}
