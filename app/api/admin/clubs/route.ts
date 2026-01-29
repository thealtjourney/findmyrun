import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Verify admin secret
function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || !authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  return token === adminSecret;
}

// GET - List all clubs from database
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: clubs, error } = await supabase
      .from('clubs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clubs:', error);
      return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
    }

    return NextResponse.json({ clubs: clubs || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Remove a club by ID or name
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, name } = await request.json();

    if (!id && !name) {
      return NextResponse.json({ error: 'Club ID or name required' }, { status: 400 });
    }

    // Delete from clubs table
    let query = supabase.from('clubs').delete();
    if (id) {
      query = query.eq('id', id);
    } else {
      query = query.eq('name', name);
    }

    const { error: clubError } = await query;

    if (clubError) {
      console.error('Error deleting club:', clubError);
      return NextResponse.json({ error: 'Failed to delete club' }, { status: 500 });
    }

    // Also delete associated sessions
    if (name) {
      await supabase.from('sessions').delete().eq('club_name', name);
    }

    // Also delete associated attendance records
    if (name) {
      await supabase.from('attendance').delete().eq('club_name', name);
    }

    return NextResponse.json({ success: true, message: 'Club deleted' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
