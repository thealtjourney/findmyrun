import { NextRequest, NextResponse } from 'next/server';
// In production, uncomment and use Supabase:
// import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['name', 'city', 'area', 'day', 'time', 'meeting_point', 'submitter_email'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // In production, save to Supabase:
    // const { data, error } = await supabase
    //   .from('submissions')
    //   .insert([body])
    //   .select()
    //   .single();
    //
    // if (error) throw error;

    // For now, just log and return success
    console.log('New club submission:', body);

    return NextResponse.json(
      { success: true, message: 'Club submitted for review' },
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    // In production, fetch from Supabase:
    // let query = supabase
    //   .from('clubs')
    //   .select('*')
    //   .eq('status', 'approved');
    //
    // if (city) {
    //   query = query.ilike('city', city);
    // }
    //
    // const { data, error } = await query;
    // if (error) throw error;

    // For now, return seed data
    const { seedClubs } = await import('@/lib/seed-data');
    let clubs = seedClubs;

    if (city) {
      clubs = clubs.filter(c => c.city.toLowerCase() === city.toLowerCase());
    }

    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    );
  }
}
