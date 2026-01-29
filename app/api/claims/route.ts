import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateToken, generateInstagramCode } from '@/lib/tokens';
import { sendClaimVerificationEmail, sendClaimAdminNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clubId, claimantEmail, claimantName, verificationMethod } = body;

    // Validate required fields
    if (!clubId || !claimantEmail || !verificationMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: clubId, claimantEmail, verificationMethod' },
        { status: 400 }
      );
    }

    if (!['email', 'instagram'].includes(verificationMethod)) {
      return NextResponse.json(
        { error: 'Invalid verification method. Must be "email" or "instagram"' },
        { status: 400 }
      );
    }

    // Check club exists and is not already claimed
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id, name, contact_email, instagram, owner_email')
      .eq('id', clubId)
      .single();

    if (clubError || !club) {
      return NextResponse.json(
        { error: 'Club not found' },
        { status: 404 }
      );
    }

    if (club.owner_email) {
      return NextResponse.json(
        { error: 'This club has already been claimed' },
        { status: 400 }
      );
    }

    // Check for pending claims on this club
    const { data: existingClaim } = await supabase
      .from('club_claims')
      .select('id, status')
      .eq('club_id', clubId)
      .eq('status', 'pending')
      .single();

    if (existingClaim) {
      return NextResponse.json(
        { error: 'There is already a pending claim for this club' },
        { status: 400 }
      );
    }

    // For email verification, check if club has a contact email
    if (verificationMethod === 'email' && !club.contact_email) {
      return NextResponse.json(
        { error: 'This club has no contact email on file. Please use Instagram verification.' },
        { status: 400 }
      );
    }

    // Generate Instagram code if needed
    const instagramCode = verificationMethod === 'instagram' ? generateInstagramCode() : null;

    // Create the claim
    const claimData = {
      club_id: clubId,
      claimant_email: claimantEmail,
      claimant_name: claimantName || null,
      verification_method: verificationMethod,
      status: 'pending',
      instagram_code: instagramCode,
      token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    const { data: claim, error: claimError } = await supabase
      .from('club_claims')
      .insert([claimData])
      .select()
      .single();

    if (claimError) {
      console.error('Failed to create claim:', claimError);
      return NextResponse.json(
        { error: 'Failed to create claim' },
        { status: 500 }
      );
    }

    // Send appropriate emails
    try {
      if (verificationMethod === 'email') {
        // Send verification email to the club's contact email
        const verifyToken = generateToken(claim.id, 'claim-verify');
        await sendClaimVerificationEmail(
          club.contact_email!,
          club.name,
          claim.id,
          verifyToken
        );
      } else {
        // Instagram verification - notify admin
        const approveToken = generateToken(claim.id, 'claim-approve');
        const rejectToken = generateToken(claim.id, 'claim-reject');
        await sendClaimAdminNotification(
          club.name,
          claimantEmail,
          claimantName,
          verificationMethod,
          instagramCode,
          claim.id,
          approveToken,
          rejectToken
        );
      }
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the request - claim is still created
    }

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      verificationMethod,
      instagramCode: verificationMethod === 'instagram' ? instagramCode : undefined,
      clubName: club.name,
      message: verificationMethod === 'email'
        ? 'Verification email sent to the club contact email'
        : 'Please DM the code to @findmyrun from your club Instagram account',
    });

  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json(
      { error: 'Failed to process claim' },
      { status: 500 }
    );
  }
}

// GET - check claim status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const claimId = searchParams.get('id');

  if (!claimId) {
    return NextResponse.json(
      { error: 'Claim ID required' },
      { status: 400 }
    );
  }

  const { data: claim, error } = await supabase
    .from('club_claims')
    .select(`
      id,
      status,
      verification_method,
      created_at,
      verified_at,
      clubs (
        id,
        name
      )
    `)
    .eq('id', claimId)
    .single();

  if (error || !claim) {
    return NextResponse.json(
      { error: 'Claim not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(claim);
}
