import { NextRequest, NextResponse } from 'next/server';
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

// GET - fetch club details for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerEmail = await verifyOwnerSession();

  if (!ownerEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id: clubId } = await params;

  // Get the club and verify ownership
  const { data: club, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', clubId)
    .eq('owner_email', ownerEmail)
    .single();

  if (error || !club) {
    return NextResponse.json(
      { error: 'Club not found or you do not have permission to edit it' },
      { status: 404 }
    );
  }

  return NextResponse.json(club);
}

// PUT - update club details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ownerEmail = await verifyOwnerSession();

  if (!ownerEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { id: clubId } = await params;

  // Verify ownership first
  const { data: existingClub, error: fetchError } = await supabase
    .from('clubs')
    .select('id, owner_email')
    .eq('id', clubId)
    .eq('owner_email', ownerEmail)
    .single();

  if (fetchError || !existingClub) {
    return NextResponse.json(
      { error: 'Club not found or you do not have permission to edit it' },
      { status: 404 }
    );
  }

  const body = await request.json();

  // Whitelist of fields owners can edit
  const allowedFields = [
    'name',
    'area',
    'day',
    'time',
    'distance',
    'meeting_point',
    'description',
    'pace',
    'terrain',
    'beginner_friendly',
    'dog_friendly',
    'female_only',
    'post_run',
    'instagram',
    'website',
    'contact_email',
  ];

  // Filter to only allowed fields
  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 }
    );
  }

  // Update the club
  const { data: updatedClub, error: updateError } = await supabase
    .from('clubs')
    .update(updateData)
    .eq('id', clubId)
    .select()
    .single();

  if (updateError) {
    console.error('Failed to update club:', updateError);
    return NextResponse.json(
      { error: 'Failed to update club' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    club: updatedClub,
  });
}
