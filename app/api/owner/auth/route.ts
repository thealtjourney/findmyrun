import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashSessionToken, generateSessionToken } from '@/lib/tokens';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.redirect(
      new URL('/owner/login?error=invalid_link', request.url)
    );
  }

  // Hash the token to compare with stored hash
  const tokenHash = hashSessionToken(token);

  // Find the session
  const { data: session, error: sessionError } = await supabase
    .from('owner_sessions')
    .select('*')
    .eq('token_hash', tokenHash)
    .eq('owner_email', email)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (sessionError || !session) {
    return NextResponse.redirect(
      new URL('/owner/login?error=invalid_or_expired', request.url)
    );
  }

  // Delete the used session token (one-time use)
  await supabase
    .from('owner_sessions')
    .delete()
    .eq('id', session.id);

  // Create a longer-lived session cookie
  const cookieStore = await cookies();
  const sessionCookieToken = generateSessionToken();
  const sessionCookieHash = hashSessionToken(sessionCookieToken);
  const cookieExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Store the new session
  await supabase
    .from('owner_sessions')
    .insert([{
      owner_email: email,
      token_hash: sessionCookieHash,
      expires_at: cookieExpiry.toISOString(),
    }]);

  // Set the session cookie
  cookieStore.set('owner_session', `${email}:${sessionCookieToken}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: cookieExpiry,
    path: '/',
  });

  // Redirect to dashboard
  return NextResponse.redirect(
    new URL('/owner', request.url)
  );
}

// POST - logout
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('owner_session');

  if (sessionCookie) {
    const [email, token] = sessionCookie.value.split(':');
    if (email && token) {
      const tokenHash = hashSessionToken(token);
      // Delete the session from database
      await supabase
        .from('owner_sessions')
        .delete()
        .eq('token_hash', tokenHash)
        .eq('owner_email', email);
    }
  }

  // Clear the cookie
  cookieStore.delete('owner_session');

  return NextResponse.json({ success: true });
}
