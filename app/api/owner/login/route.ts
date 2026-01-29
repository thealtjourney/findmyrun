import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateSessionToken, hashSessionToken } from '@/lib/tokens';
import { sendOwnerLoginEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if this email owns any clubs
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('id, name')
      .eq('owner_email', email);

    if (clubsError) {
      console.error('Error checking club ownership:', clubsError);
      return NextResponse.json(
        { error: 'Failed to verify ownership' },
        { status: 500 }
      );
    }

    if (!clubs || clubs.length === 0) {
      // Don't reveal whether the email exists - just say we sent it
      return NextResponse.json({
        success: true,
        message: 'If you own any clubs, you will receive a login link shortly.',
      });
    }

    // Generate a secure session token
    const sessionToken = generateSessionToken();
    const tokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store the session token
    const { error: sessionError } = await supabase
      .from('owner_sessions')
      .insert([{
        owner_email: email,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      }]);

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create login session' },
        { status: 500 }
      );
    }

    // Send login email
    try {
      await sendOwnerLoginEmail(email, sessionToken);
    } catch (emailError) {
      console.error('Failed to send login email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send login email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login link sent to your email',
    });

  } catch (error) {
    console.error('Error in owner login:', error);
    return NextResponse.json(
      { error: 'Failed to process login request' },
      { status: 500 }
    );
  }
}
