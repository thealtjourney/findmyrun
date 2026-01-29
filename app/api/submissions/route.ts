import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendSubmissionEmail, SubmissionEmailData } from '@/lib/email';
import { generateToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot check
    if (body.website_url) {
      // Bot detected - silently accept but don't process
      return NextResponse.json(
        { success: true, message: 'Club submitted for review' },
        { status: 201 }
      );
    }

    // Validate required fields
    const required = ['club_name', 'city', 'area', 'day', 'time', 'meeting_point', 'contact_email'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Prepare submission data
    const submissionData = {
      name: body.club_name,
      city: body.city,
      area: body.area,
      day: body.day,
      time: body.time,
      distance: body.distance || null,
      meeting_point: body.meeting_point,
      description: body.description || null,
      pace: body.pace || 'mixed',
      terrain: body.terrain || null,
      beginner_friendly: body.beginner_friendly === 'yes' || body.beginner_friendly === true,
      dog_friendly: body.dog_friendly === 'yes' || body.dog_friendly === true,
      female_only: body.female_only === 'yes' || body.female_only === true,
      post_run: body.post_run || null,
      instagram: body.instagram || null,
      website: body.website || null,
      submitter_email: body.contact_email,
      submitter_name: body.submitter_name || null,
      status: 'pending',
      sessions: body.sessions || [], // Store all sessions as JSONB
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('submissions')
      .insert([submissionData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    // Generate magic link tokens
    const approveToken = generateToken(data.id, 'approve');
    const rejectToken = generateToken(data.id, 'reject');

    // Send notification email to admin
    try {
      await sendSubmissionEmail(
        {
          id: data.id,
          ...submissionData,
        } as SubmissionEmailData,
        approveToken,
        rejectToken
      );
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the submission if email fails - it's still saved
    }

    return NextResponse.json(
      { success: true, message: 'Club submitted for review', id: data.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting club:', error);
    return NextResponse.json(
      { error: 'Failed to submit club' },
      { status: 500 }
    );
  }
}
