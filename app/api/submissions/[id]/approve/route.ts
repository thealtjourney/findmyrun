import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/tokens';
import { geocodeMeetingPoint } from '@/lib/geocode';
import { sendApprovalNotification } from '@/lib/email';

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

  const verification = verifyToken(token, id, 'approve');
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

    // Geocode the meeting point
    const { lat, lng } = await geocodeMeetingPoint(
      submission.meeting_point,
      submission.area,
      submission.city
    );

    // Parse sessions from submission
    const sessions = submission.sessions || [];
    const primarySession = sessions.length > 0 ? sessions[0] : { day: submission.day, time: submission.time, distance: submission.distance };

    // Create the club entry (using primary session for backward compatibility)
    const clubData = {
      name: submission.name,
      city: submission.city,
      area: submission.area,
      lat,
      lng,
      day: primarySession.day || submission.day,
      time: primarySession.time || submission.time,
      distance: primarySession.distance || submission.distance,
      meeting_point: submission.meeting_point,
      description: submission.description,
      pace: submission.pace || 'mixed',
      terrain: submission.terrain,
      beginner_friendly: submission.beginner_friendly || false,
      dog_friendly: submission.dog_friendly || false,
      female_only: submission.female_only || false,
      post_run: submission.post_run,
      instagram: submission.instagram,
      website: submission.website,
      contact_email: submission.submitter_email,
      verified: false,
      status: 'approved',
    };

    const { error: insertError } = await supabase
      .from('clubs')
      .insert([clubData]);

    if (insertError) {
      console.error('Error creating club:', insertError);
      return NextResponse.redirect(`${appUrl}/submission-result?status=error&message=Failed%20to%20create%20club`);
    }

    // Create session entries for multi-session support
    if (sessions.length > 0) {
      const sessionEntries = sessions.map((session: { day: string; time: string; distance?: string; type?: string }) => ({
        club_name: submission.name,
        day: session.day,
        time: session.time,
        distance: session.distance || null,
        meeting_point: submission.meeting_point,
        session_type: session.type || null,
      }));

      const { error: sessionError } = await supabase
        .from('sessions')
        .insert(sessionEntries);

      if (sessionError) {
        console.error('Error creating sessions:', sessionError);
        // Don't fail the approval if sessions fail - club is already created
      }
    }

    // Update submission status
    await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('id', id);

    // Send approval notification to submitter
    try {
      await sendApprovalNotification(submission.submitter_email, submission.name);
    } catch (emailError) {
      console.error('Failed to send approval notification:', emailError);
      // Don't fail the approval if notification fails
    }

    return NextResponse.redirect(
      `${appUrl}/submission-result?status=success&action=approved&club=${encodeURIComponent(submission.name)}`
    );
  } catch (error) {
    console.error('Error approving submission:', error);
    return NextResponse.redirect(`${appUrl}/submission-result?status=error&message=An%20error%20occurred`);
  }
}
