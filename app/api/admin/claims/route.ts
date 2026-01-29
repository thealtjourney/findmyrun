import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  return token === ADMIN_SECRET;
}

// GET - list all claims
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: claims, error } = await supabase
    .from('club_claims')
    .select(`
      *,
      clubs (
        id,
        name,
        city,
        area,
        instagram
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch claims:', error);
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 });
  }

  return NextResponse.json({ claims: claims || [] });
}

// DELETE - delete a claim
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Claim ID required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('club_claims')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete claim:', error);
    return NextResponse.json({ error: 'Failed to delete claim' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
