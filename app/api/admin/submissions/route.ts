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

// GET - List all submissions
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    return NextResponse.json({ submissions: submissions || [] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE - Remove a submission
export async function DELETE(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting submission:', error);
      return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
