import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashSessionToken } from '@/lib/tokens';
import { cookies } from 'next/headers';

// Helper to verify owner session
async function verifyOwnerSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('owner_session');

  if (!sessionCookie) {
    return null;
  }

  const [email, token] = sessionCookie.value.split(':');
  if (!email || !token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  // Verify the session exists and is not expired
  const { data: session, error } = await supabase
    .from('owner_sessions')
    .select('owner_email')
    .eq('token_hash', tokenHash)
    .eq('owner_email', email)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (error || !session) {
    return null;
  }

  return session.owner_email;
}

// GET - fetch all clubs owned by the logged-in user
export async function GET() {
  const ownerEmail = await verifyOwnerSession();

  if (!ownerEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Get all clubs owned by this email
  const { data: clubs, error } = await supabase
    .from('clubs')
    .select('id, name, city, area, day, time, status, claimed_at')
    .eq('owner_email', ownerEmail)
    .order('name');

  if (error) {
    console.error('Failed to fetch clubs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ownerEmail,
    clubs: clubs || [],
  });
}
