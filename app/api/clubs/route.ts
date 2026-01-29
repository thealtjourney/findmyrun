import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { seedClubs } from '@/lib/seed-data';

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
    const id = searchParams.get('id');

    // If fetching a single club by ID
    if (id) {
      const { data: club, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !club) {
        return NextResponse.json(
          { error: 'Club not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(club);
    }

    // Try to fetch from Supabase first
    let query = supabase
      .from('clubs')
      .select('*')
      .eq('status', 'approved');

    if (city) {
      query = query.ilike('city', city);
    }

    const { data: dbClubs, error } = await query;

    // If we have database clubs, use those
    if (!error && dbClubs && dbClubs.length > 0) {
      return NextResponse.json(dbClubs);
    }

    // Fall back to seed data if database is empty or has an error
    if (error) {
      console.log('Database error, falling back to seed data:', error.message);
    }

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
