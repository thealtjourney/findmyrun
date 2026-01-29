import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/tokens';
import { sendClaimApprovedEmail } from '@/lib/email';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: claimId } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(
      new URL('/admin?error=missing_token', request.url)
    );
  }

  // Check if token is admin secret (from admin UI) or HMAC token (from email)
  const isAdminAuth = token === ADMIN_SECRET;

  if (!isAdminAuth) {
    // Verify the HMAC token from email
    const verification = verifyToken(token, claimId, 'claim-approve');
    if (!verification.valid) {
      return NextResponse.redirect(
        new URL(`/admin?error=${encodeURIComponent(verification.error || 'invalid_token')}`, request.url)
      );
    }
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
      new URL('/admin?error=claim_not_found', request.url)
    );
  }

  if (claim.status === 'verified') {
    return NextResponse.redirect(
      new URL('/admin?message=claim_already_approved', request.url)
    );
  }

  if (claim.status === 'rejected') {
    return NextResponse.redirect(
      new URL('/admin?error=claim_was_rejected', request.url)
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
      new URL('/admin?error=update_failed', request.url)
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
      new URL('/admin?error=club_update_failed', request.url)
    );
  }

  // Send welcome email to new owner
  try {
    await sendClaimApprovedEmail(claim.claimant_email, claim.clubs.name);
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
  }

  // Redirect to admin with success message
  return NextResponse.redirect(
    new URL(`/admin?message=claim_approved&club=${encodeURIComponent(claim.clubs.name)}`, request.url)
  );
}
