import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/tokens';
import { sendClaimApprovedEmail } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: claimId } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(
      new URL('/claim/error?reason=missing_token', request.url)
    );
  }

  // Verify the token
  const verification = verifyToken(token, claimId, 'claim-verify');
  if (!verification.valid) {
    return NextResponse.redirect(
      new URL(`/claim/error?reason=${encodeURIComponent(verification.error || 'invalid_token')}`, request.url)
    );
  }

  // Get the claim
  const { data: claim, error: claimError } = await supabase
    .from('club_claims')
    .select(`
      *,
      clubs (
        id,
        name
      )
    `)
    .eq('id', claimId)
    .single();

  if (claimError || !claim) {
    return NextResponse.redirect(
      new URL('/claim/error?reason=claim_not_found', request.url)
    );
  }

  if (claim.status !== 'pending') {
    return NextResponse.redirect(
      new URL(`/claim/error?reason=already_${claim.status}`, request.url)
    );
  }

  // Update claim to verified
  const { error: updateClaimError } = await supabase
    .from('club_claims')
    .update({
      status: 'verified',
      verified_at: new Date().toISOString(),
    })
    .eq('id', claimId);

  if (updateClaimError) {
    console.error('Failed to update claim:', updateClaimError);
    return NextResponse.redirect(
      new URL('/claim/error?reason=update_failed', request.url)
    );
  }

  // Update club with owner info
  const { error: updateClubError } = await supabase
    .from('clubs')
    .update({
      owner_email: claim.claimant_email,
      owner_name: claim.claimant_name,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', claim.club_id);

  if (updateClubError) {
    console.error('Failed to update club:', updateClubError);
    return NextResponse.redirect(
      new URL('/claim/error?reason=update_failed', request.url)
    );
  }

  // Send welcome email
  try {
    await sendClaimApprovedEmail(claim.claimant_email, claim.clubs.name);
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
  }

  // Redirect to success page
  return NextResponse.redirect(
    new URL(`/claim/success?club=${encodeURIComponent(claim.clubs.name)}`, request.url)
  );
}
