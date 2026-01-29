import crypto from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-secret-change-in-production';

// Token structure: timestamp.submissionId.action.signature
// Expires after 7 days

export function generateToken(submissionId: string, action: 'approve' | 'reject'): string {
  const timestamp = Date.now();
  const payload = `${timestamp}.${submissionId}.${action}`;
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payload)
    .digest('hex')
    .slice(0, 16); // Shorter signature for cleaner URLs

  return Buffer.from(`${payload}.${signature}`).toString('base64url');
}

export function verifyToken(token: string, submissionId: string, expectedAction: 'approve' | 'reject'): { valid: boolean; error?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [timestamp, id, action, signature] = decoded.split('.');

    // Check submission ID matches
    if (id !== submissionId) {
      return { valid: false, error: 'Invalid token: submission mismatch' };
    }

    // Check action matches
    if (action !== expectedAction) {
      return { valid: false, error: 'Invalid token: action mismatch' };
    }

    // Verify signature
    const payload = `${timestamp}.${id}.${action}`;
    const expectedSignature = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(payload)
      .digest('hex')
      .slice(0, 16);

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid token: signature mismatch' };
    }

    // Check expiry (7 days)
    const tokenAge = Date.now() - parseInt(timestamp);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (tokenAge > sevenDays) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid token format' };
  }
}
