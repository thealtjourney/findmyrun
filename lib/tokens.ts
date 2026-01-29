import crypto from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-secret-change-in-production';

// Token types
export type TokenAction = 'approve' | 'reject' | 'claim-verify' | 'claim-approve' | 'claim-reject' | 'owner-login';

// Token structure: timestamp.id.action.signature
// Expires after 7 days (or custom duration)

export function generateToken(id: string, action: TokenAction, expiryDays: number = 7): string {
  const timestamp = Date.now();
  const payload = `${timestamp}.${id}.${action}`;
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payload)
    .digest('hex')
    .slice(0, 16); // Shorter signature for cleaner URLs

  return Buffer.from(`${payload}.${signature}`).toString('base64url');
}

export function verifyToken(token: string, expectedId: string, expectedAction: TokenAction, expiryDays: number = 7): { valid: boolean; error?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [timestamp, id, action, signature] = decoded.split('.');

    // Check ID matches
    if (id !== expectedId) {
      return { valid: false, error: 'Invalid token: ID mismatch' };
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

    // Check expiry
    const tokenAge = Date.now() - parseInt(timestamp);
    const expiryMs = expiryDays * 24 * 60 * 60 * 1000;
    if (tokenAge > expiryMs) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid token format' };
  }
}

// Generate a random 6-character code for Instagram verification
export function generateInstagramCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// Generate a secure session token for owner dashboard
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash a session token for storage
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
