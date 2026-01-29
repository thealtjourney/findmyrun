import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get attendance counts for all clubs this week
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubName = searchParams.get('club');

    const today = new Date();
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);

    if (clubName) {
      // Get count for specific club
      const { count, error } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('club_name', clubName)
        .gte('session_date', today.toISOString().split('T')[0])
        .lt('session_date', weekFromNow.toISOString().split('T')[0]);

      if (error) throw error;
      return NextResponse.json({ club: clubName, count: count || 0 });
    }

    // Get all attendance for this week
    const { data, error } = await supabase
      .from('attendance')
      .select('club_name')
      .gte('session_date', today.toISOString().split('T')[0])
      .lt('session_date', weekFromNow.toISOString().split('T')[0]);

    if (error) throw error;

    // Count by club name
    const counts: Record<string, number> = {};
    data?.forEach(row => {
      counts[row.club_name] = (counts[row.club_name] || 0) + 1;
    });

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

// Record attendance ("I'm going!")
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clubName, sessionDate, visitorId } = body;

    if (!clubName || !sessionDate) {
      return NextResponse.json(
        { error: 'clubName and sessionDate are required' },
        { status: 400 }
      );
    }

    // Check if this visitor already marked attendance for this club/date
    if (visitorId) {
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('club_name', clubName)
        .eq('session_date', sessionDate)
        .eq('visitor_id', visitorId)
        .single();

      if (existing) {
        return NextResponse.json({
          success: true,
          message: 'Already marked as going!',
          alreadyGoing: true
        });
      }
    }

    // Insert attendance record
    const { error } = await supabase
      .from('attendance')
      .insert([{
        club_name: clubName,
        session_date: sessionDate,
        visitor_id: visitorId || null,
      }]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to record attendance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `You're going! 🏃`
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { error: 'Failed to record attendance' },
      { status: 500 }
    );
  }
}
