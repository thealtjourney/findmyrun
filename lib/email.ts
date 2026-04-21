import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SessionData {
  day: string;
  time: string;
  distance?: string;
  type?: string;
}

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
  sessions?: SessionData[];
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

  const sessionTypeLabels: Record<string, string> = {
    '': 'Regular run',
    'social': 'Social run',
    'long': 'Long run',
    'track': 'Track session',
    'intervals': 'Intervals / Speed',
    'tempo': 'Tempo run',
    'trail': 'Trail run',
  };

  // Generate sessions HTML - use sessions array if available, otherwise fall back to single session
  const sessions = submission.sessions && submission.sessions.length > 0
    ? submission.sessions
    : [{ day: submission.day, time: submission.time, distance: submission.distance, type: '' }];

  const sessionsHtml = sessions.map((session, index) => `
    <div style="background: #f9fafb; border-radius: 12px; padding: 16px; ${index > 0 ? 'margin-top: 12px;' : ''}">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 14px; font-weight: 700; color: #1f2937;">${session.day}s at ${session.time}</span>
        ${session.type ? `<span style="background: #FF6B5B; color: white; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">${sessionTypeLabels[session.type] || session.type}</span>` : ''}
      </div>
      ${session.distance ? `<p style="margin: 0; font-size: 13px; color: #6b7280;">Distance: ${session.distance}</p>` : ''}
    </div>
  `).join('');

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

              <!-- Sessions -->
              <div style="margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Sessions (${sessions.length})</p>
                ${sessionsHtml}
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

// ============================================
// CLAIM VERIFICATION EMAILS
// ============================================

export async function sendClaimVerificationEmail(
  recipientEmail: string,
  clubName: string,
  claimId: string,
  verifyToken: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${appUrl}/api/claims/${claimId}/verify?token=${verifyToken}`;

  await resend.emails.send({
    from: 'Find My Run <hello@findmyrun.club>',
    to: recipientEmail,
    subject: `Verify your ownership of ${clubName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="background: linear-gradient(135deg, #FF6B5B 0%, #FFAB9F 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">Claim Your Club</h1>
            </div>
            <div style="padding: 32px; text-align: center;">
              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Someone is claiming ownership of <strong>${clubName}</strong> on Find My Run.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">
                If this is you, click the button below to verify and gain access to edit your club listing.
              </p>
              <a href="${verifyUrl}" style="display: inline-block; background: #FF6B5B; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700;">
                Verify Ownership
              </a>
              <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0 0;">
                This link expires in 7 days. If you didn't request this, you can ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendClaimAdminNotification(
  clubName: string,
  claimantEmail: string,
  claimantName: string | null,
  verificationMethod: string,
  instagramCode: string | null,
  claimId: string,
  approveToken: string,
  rejectToken: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL not configured');
  }

  const approveUrl = `${appUrl}/api/admin/claims/${claimId}/approve?token=${approveToken}`;
  const rejectUrl = `${appUrl}/api/admin/claims/${claimId}/reject?token=${rejectToken}`;

  await resend.emails.send({
    from: 'Find My Run <claims@findmyrun.club>',
    to: adminEmail,
    subject: `🔑 Club Claim: ${clubName} via ${verificationMethod}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">Club Ownership Claim</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">via ${verificationMethod === 'instagram' ? 'Instagram DM' : 'Email'}</p>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #1f2937; margin: 0 0 8px 0; font-size: 20px;">${clubName}</h2>

              <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Claimant</p>
                <p style="margin: 0; color: #1f2937; font-weight: 600;">${claimantName || 'Not provided'}</p>
                <p style="margin: 4px 0 0 0;"><a href="mailto:${claimantEmail}" style="color: #FF6B5B; text-decoration: none;">${claimantEmail}</a></p>
              </div>

              ${verificationMethod === 'instagram' && instagramCode ? `
              <div style="background: #FFF5F3; border: 1px solid #FFAB9F; border-radius: 12px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #FF6B5B; text-transform: uppercase;">Instagram Verification Code</p>
                <p style="margin: 0; font-size: 24px; font-weight: 800; color: #1f2937; font-family: monospace;">${instagramCode}</p>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #6b7280;">
                  The claimant should DM this code to @findmyrun from the club's Instagram account.
                </p>
              </div>
              ` : ''}

              <div style="display: flex; gap: 12px; margin-top: 24px;">
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
}

export async function sendClaimApprovedEmail(
  ownerEmail: string,
  clubName: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const dashboardUrl = `${appUrl}/owner`;

  await resend.emails.send({
    from: 'Find My Run <hello@findmyrun.club>',
    to: ownerEmail,
    subject: `🎉 You now own ${clubName} on Find My Run!`,
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
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">You're the Owner! 🔑</h1>
            </div>
            <div style="padding: 32px; text-align: center;">
              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Your claim for <strong>${clubName}</strong> has been approved!
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">
                You can now edit your club details, update session times, and keep your listing fresh.
              </p>
              <a href="${dashboardUrl}" style="display: inline-block; background: #FF6B5B; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700;">
                Go to Owner Dashboard
              </a>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendClaimRejectedEmail(
  claimantEmail: string,
  clubName: string,
  reason?: string
) {
  await resend.emails.send({
    from: 'Find My Run <hello@findmyrun.club>',
    to: claimantEmail,
    subject: `Update on your claim for ${clubName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="background: #6b7280; padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">Claim Update</h1>
            </div>
            <div style="padding: 32px; text-align: center;">
              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Unfortunately, we couldn't verify your ownership of <strong>${clubName}</strong>.
              </p>
              ${reason ? `<p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">${reason}</p>` : ''}
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                If you believe this is an error, please reply to this email and we'll help sort it out.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendOwnerLoginEmail(
  ownerEmail: string,
  loginToken: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const loginUrl = `${appUrl}/api/owner/auth?token=${loginToken}&email=${encodeURIComponent(ownerEmail)}`;

  await resend.emails.send({
    from: 'Find My Run <hello@findmyrun.club>',
    to: ownerEmail,
    subject: 'Your login link for Find My Run',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="background: linear-gradient(135deg, #FF6B5B 0%, #FFAB9F 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">Sign In</h1>
            </div>
            <div style="padding: 32px; text-align: center;">
              <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Click the button below to sign in to your owner dashboard.
              </p>
              <a href="${loginUrl}" style="display: inline-block; background: #FF6B5B; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700;">
                Sign In to Dashboard
              </a>
              <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0 0;">
                This link expires in 1 hour. If you didn't request this, you can ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

// ----------------------------------------------------------------------------
// Weekly broken-links report (triggered by the check-links cron).
// ----------------------------------------------------------------------------

export interface BrokenLinkItem {
  name: string;
  city: string;
  instagram: { ok: boolean; url: string; reason?: string } | null;
  website: { ok: boolean; url: string; reason?: string } | null;
}

export async function sendBrokenLinksReport(broken: BrokenLinkItem[]) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL not configured');
  }
  if (broken.length === 0) return;

  // Group by city for readability.
  const byCity = new Map<string, BrokenLinkItem[]>();
  for (const b of broken) {
    const list = byCity.get(b.city) ?? [];
    list.push(b);
    byCity.set(b.city, list);
  }

  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const cityBlocks = Array.from(byCity.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([city, clubs]) => {
      const items = clubs
        .map((c) => {
          const bits: string[] = [];
          if (c.instagram && !c.instagram.ok) {
            bits.push(
              `<li style="color: #6b7280;">Instagram — <a href="${escape(c.instagram.url)}" style="color: #FF6B5B;">${escape(c.instagram.url)}</a> <span style="color: #9ca3af;">(${escape(c.instagram.reason ?? 'broken')})</span></li>`
            );
          }
          if (c.website && !c.website.ok) {
            bits.push(
              `<li style="color: #6b7280;">Website — <a href="${escape(c.website.url)}" style="color: #FF6B5B;">${escape(c.website.url)}</a> <span style="color: #9ca3af;">(${escape(c.website.reason ?? 'broken')})</span></li>`
            );
          }
          return `
            <li style="margin-bottom: 12px;">
              <strong style="color: #1f2937;">${escape(c.name)}</strong>
              <ul style="margin: 4px 0 0; padding-left: 18px; font-size: 13px;">${bits.join('')}</ul>
            </li>
          `;
        })
        .join('');
      return `
        <h3 style="color: #1f2937; margin: 24px 0 8px; font-size: 15px; font-weight: 700;">${escape(city)}</h3>
        <ul style="margin: 0; padding-left: 20px;">${items}</ul>
      `;
    })
    .join('');

  const { error } = await resend.emails.send({
    from: 'Find My Run <hello@findmyrun.club>',
    to: adminEmail,
    subject: `🔗 ${broken.length} club${broken.length === 1 ? '' : 's'} with broken links`,
    html: `<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
    <div style="max-width: 640px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <div style="background: linear-gradient(135deg, #FF6B5B 0%, #FFAB9F 100%); padding: 28px 32px;">
        <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800;">Weekly link check</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0; font-size: 14px;">
          ${broken.length} club${broken.length === 1 ? ' has' : 's have'} links that need attention.
        </p>
      </div>
      <div style="padding: 24px 32px 32px;">
        ${cityBlocks}
        <p style="color: #9ca3af; font-size: 12px; margin-top: 28px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
          Run weekly by Vercel Cron. "Broken" means a non-2xx HTTP response, timeout, or network error.
          Instagram sometimes flags bot traffic with a 401/403 — real breakage usually shows as a 404.
        </p>
      </div>
    </div>
  </body>
</html>`,
  });

  if (error) {
    throw new Error(`Failed to send broken-links report: ${error.message}`);
  }
}

// ----------------------------------------------------------------------------
// User-submitted issue report on a club listing.
// ----------------------------------------------------------------------------

const REPORT_REASON_LABELS: Record<string, string> = {
  club_inactive: 'Club is no longer active',
  wrong_meeting_info: 'Wrong meeting day / time',
  wrong_location: 'Wrong location or meeting point',
  broken_link: 'Broken link (Instagram / website)',
  inappropriate: 'Inappropriate content',
  other: 'Other',
};

export async function sendClubReportEmail(report: {
  clubName: string;
  clubCity: string;
  reason: string;
  note?: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error('ADMIN_EMAIL not configured');

  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const label = REPORT_REASON_LABELS[report.reason] ?? report.reason;
  const noteHtml = report.note
    ? `<div style="margin-top: 16px;">
         <p style="margin: 0 0 6px; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">Note from reporter</p>
         <p style="margin: 0; color: #1f2937; line-height: 1.5; white-space: pre-wrap;">${escape(report.note)}</p>
       </div>`
    : '';

  const { error } = await resend.emails.send({
    from: 'Find My Run <hello@findmyrun.club>',
    to: adminEmail,
    subject: `⚠️ Issue reported on ${report.clubName} (${report.clubCity})`,
    html: `<!DOCTYPE html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
    <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <div style="background: linear-gradient(135deg, #FF6B5B 0%, #FFAB9F 100%); padding: 24px 28px;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 800;">Club issue reported</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0; font-size: 14px;">
          A visitor flagged a problem with a club listing.
        </p>
      </div>
      <div style="padding: 24px 28px;">
        <h2 style="color: #1f2937; margin: 0 0 4px; font-size: 18px; font-weight: 700;">${escape(report.clubName)}</h2>
        <p style="color: #6b7280; margin: 0 0 20px; font-size: 13px;">📍 ${escape(report.clubCity)}</p>
        <div style="background: #FFF5F3; border-left: 3px solid #FF6B5B; padding: 12px 16px; border-radius: 8px;">
          <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #FF6B5B; text-transform: uppercase;">Reason</p>
          <p style="margin: 0; color: #1f2937; font-weight: 600;">${escape(label)}</p>
        </div>
        ${noteHtml}
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 14px;">
          Reports are anonymous — we don't collect the reporter's identity unless they volunteer it in the note.
        </p>
      </div>
    </div>
  </body>
</html>`,
  });

  if (error) {
    throw new Error(`Failed to send club-report email: ${error.message}`);
  }
}
