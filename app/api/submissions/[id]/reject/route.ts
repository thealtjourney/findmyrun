import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/tokens';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Validate token
  if (!token) {
    return NextResponse.redirect(`${appUrl}/submission-result?status=error&message=Missing%20token`);
  }

  const verification = verifyToken(token, id, 'reject');
  if (!verification.valid) {
    return NextResponse.redirect(
      `${appUrl}/submission-result?status=error&message=${encodeURIComponent(verification.error || 'Invalid token')}`
    );
  }

  try {
    // Fetch the submission
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.redirect(`${appUrl}/submission-result?status=error&message=Submission%20not%20found`);
    }

    // Check if already processed
    if (submission.status !== 'pending') {
      return NextResponse.redirect(
        `${appUrl}/submission-result?status=info&message=This%20submission%20has%20already%20been%20${submission.status}`
      );
    }

    // Update submission status to rejected
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (updateError) {
      console.error('Error rejecting submission:', updateError);
      return NextResponse.redirect(`${appUrl}/submission-result?status=error&message=Failed%20to%20reject%20submission`);
    }

    return NextResponse.redirect(
      `${appUrl}/submission-result?status=success&action=rejected&club=${encodeURIComponent(submission.name)}`
    );
  } catch (error) {
    console.error('Error rejecting submission:', error);
    return NextResponse.redirect(`${appUrl}/submission-result?status=error&message=An%20error%20occurred`);
  }
}
