import { NextRequest, NextResponse } from 'next/server';
import { sendClubReportEmail } from '@/lib/email';

// Kinds of issue users can flag. Keep in sync with the client component.
export const REPORT_REASONS = [
  'club_inactive',
  'wrong_meeting_info',
  'wrong_location',
  'broken_link',
  'inappropriate',
  'other',
] as const;

type ReportReason = (typeof REPORT_REASONS)[number];

function isReason(x: unknown): x is ReportReason {
  return typeof x === 'string' && (REPORT_REASONS as readonly string[]).includes(x);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Honeypot — matches the convention used in /api/submissions.
    if (body.website_url) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const clubName = typeof body.clubName === 'string' ? body.clubName.trim() : '';
    const clubCity = typeof body.clubCity === 'string' ? body.clubCity.trim() : '';
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 2000) : '';
    const reason = body.reason;

    if (!clubName || !clubCity) {
      return NextResponse.json(
        { error: 'Missing clubName or clubCity' },
        { status: 400 }
      );
    }
    if (!isReason(reason)) {
      return NextResponse.json(
        { error: 'Invalid reason' },
        { status: 400 }
      );
    }

    try {
      await sendClubReportEmail({ clubName, clubCity, reason, note });
    } catch (err) {
      console.error('Failed to send club-report email:', err);
      // Still return success to the user — we'll re-process/retry via logs.
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Report endpoint error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
