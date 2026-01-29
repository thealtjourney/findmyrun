import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/tokens';
import { sendClaimRejectedEmail } from '@/lib/email';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: claimId } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const reason = searchParams.get('reason');

  if (!token) {
    return NextResponse.redirect(
      new URL('/admin?error=missing_token', request.url)
    );
  }

  // Check if token is admin secret (from admin UI) or HMAC token (from email)
  const isAdminAuth = token === ADMIN_SECRET;

  if (!isAdminAuth) {
    // Verify the HMAC token from email
    const verification = verifyToken(token, claimId, 'claim-reject');
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

  if (claim.status !== 'pending') {
    return NextResponse.redirect(
      new URL(`/admin?message=claim_already_${claim.status}`, request.url)
    );
  }

  // Update claim to rejected
  const { error: updateError } = await supabase
    .from('club_claims')
    .update({
      status: 'rejected',
      rejected_reason: reason || null,
    })
    .eq('id', claimId);

  if (updateError) {
    console.error('Failed to update claim:', updateError);
    return NextResponse.redirect(
      new URL('/admin?error=update_failed', request.url)
    );
  }

  // Send rejection email
  try {
    await sendClaimRejectedEmail(
      claim.claimant_email,
      claim.clubs.name,
      reason || undefined
    );
  } catch (emailError) {
    console.error('Failed to send rejection email:', emailError);
  }

  // Redirect to admin with success message
  return NextResponse.redirect(
    new URL(`/admin?message=claim_rejected&club=${encodeURIComponent(claim.clubs.name)}`, request.url)
  );
}
