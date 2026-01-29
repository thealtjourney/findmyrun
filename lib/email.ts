import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SubmissionEmailData {
  id: string;
  name: string;
  city: string;
  area: string;
  day: string;
  time: string;
  distance: string;
  meeting_point: string;
  description: string;
  pace: string;
  beginner_friendly: boolean;
  dog_friendly: boolean;
  female_only?: boolean;
  post_run: string;
  instagram: string;
  website: string;
  submitter_email: string;
  submitter_name?: string;
}

export async function sendSubmissionEmail(submission: SubmissionEmailData, approveToken: string, rejectToken: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL not configured');
  }

  const approveUrl = `${appUrl}/api/submissions/${submission.id}/approve?token=${approveToken}`;
  const rejectUrl = `${appUrl}/api/submissions/${submission.id}/reject?token=${rejectToken}`;

  const paceLabels: Record<string, string> = {
    slow: 'Relaxed / Social',
    mixed: 'Mixed abilities',
    fast: 'Fast / Training',
  };

  const features = [
    submission.beginner_friendly && '✓ Beginner friendly',
    submission.dog_friendly && '🐕 Dog friendly',
    submission.female_only && '👩 Women only',
  ].filter(Boolean).join(' • ') || 'None specified';

  const { error } = await resend.emails.send({
    from: 'Find My Run <submissions@findmyrun.club>',
    to: adminEmail,
    subject: `🏃 New Club Submission: ${submission.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #FF6B5B 0%, #FFAB9F 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">New Club Submission</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Review and approve to add to Find My Run</p>
            </div>

            <!-- Club Details -->
            <div style="padding: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 22px; font-weight: 700;">${submission.name}</h2>
              <p style="color: #6b7280; margin: 0 0 24px 0; font-size: 14px;">📍 ${submission.area}, ${submission.city}</p>

              <!-- Key Info Grid -->
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
                <div style="background: #f9fafb; border-radius: 12px; padding: 16px; text-align: center;">
                  <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">${submission.day}s</p>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Day</p>
                </div>
                <div style="background: #f9fafb; border-radius: 12px; padding: 16px; text-align: center;">
                  <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">${submission.time}</p>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Time</p>
                </div>
                <div style="background: #f9fafb; border-radius: 12px; padding: 16px; text-align: center;">
                  <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">${submission.distance || '?'}</p>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Distance</p>
                </div>
              </div>

              <!-- Details -->
              <div style="margin-bottom: 24px;">
                <div style="margin-bottom: 16px;">
                  <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Pace</p>
                  <p style="margin: 0; color: #1f2937;">${paceLabels[submission.pace] || submission.pace}</p>
                </div>

                <div style="margin-bottom: 16px;">
                  <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Meeting Point</p>
                  <p style="margin: 0; color: #1f2937;">${submission.meeting_point}</p>
                </div>

                <div style="margin-bottom: 16px;">
                  <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Description</p>
                  <p style="margin: 0; color: #1f2937; line-height: 1.5;">${submission.description || 'No description provided'}</p>
                </div>

                <div style="margin-bottom: 16px;">
                  <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Features</p>
                  <p style="margin: 0; color: #1f2937;">${features}</p>
                </div>

                ${submission.post_run ? `
                <div style="margin-bottom: 16px;">
                  <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Post-run</p>
                  <p style="margin: 0; color: #1f2937;">☕ ${submission.post_run}</p>
                </div>
                ` : ''}

                ${submission.instagram ? `
                <div style="margin-bottom: 16px;">
                  <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Instagram</p>
                  <p style="margin: 0;"><a href="https://instagram.com/${submission.instagram}" style="color: #FF6B5B; text-decoration: none;">@${submission.instagram}</a></p>
                </div>
                ` : ''}

                ${submission.website ? `
                <div style="margin-bottom: 16px;">
                  <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Website</p>
                  <p style="margin: 0;"><a href="${submission.website}" style="color: #FF6B5B; text-decoration: none;">${submission.website}</a></p>
                </div>
                ` : ''}
              </div>

              <!-- Submitter Info -->
              <div style="background: #FFF5F3; border: 1px solid #FFAB9F; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #FF6B5B; text-transform: uppercase;">Submitted by</p>
                <p style="margin: 0; color: #1f2937;">${submission.submitter_name || 'Not provided'}</p>
                <p style="margin: 4px 0 0 0;"><a href="mailto:${submission.submitter_email}" style="color: #FF6B5B; text-decoration: none;">${submission.submitter_email}</a></p>
              </div>

              <!-- Action Buttons -->
              <div style="display: flex; gap: 12px;">
                <a href="${approveUrl}" style="flex: 1; display: block; background: #10b981; color: white; text-align: center; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px;">
                  ✓ Approve
                </a>
                <a href="${rejectUrl}" style="flex: 1; display: block; background: #ef4444; color: white; text-align: center; padding: 16px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px;">
                  ✗ Reject
                </a>
              </div>

              <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
                These links are secure and expire after 7 days.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export async function sendApprovalNotification(submitterEmail: string, clubName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  await resend.emails.send({
    from: 'Find My Run <hello@findmyrun.club>',
    to: submitterEmail,
    subject: `🎉 ${clubName} is now live on Find My Run!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">You're Live! 🏃</h1>
            </div>
            <div style="padding: 32px; text-align: center;">
              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Great news! <strong>${clubName}</strong> has been approved and is now listed on Find My Run.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">
                Runners in your area can now discover your club and join your sessions.
              </p>
              <a href="${appUrl}" style="display: inline-block; background: #FF6B5B; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700;">
                View your listing
              </a>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
