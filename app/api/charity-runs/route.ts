import { NextResponse } from 'next/server';
import { getCharityRuns, submitCharityRun } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || undefined;

  try {
    const charityRuns = await getCharityRuns(city);
    return NextResponse.json(charityRuns);
  } catch (error) {
    console.error('Failed to fetch charity runs:', error);
    return NextResponse.json({ error: 'Failed to fetch charity runs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const charityRun = await submitCharityRun(body);
    return NextResponse.json(charityRun, { status: 201 });
  } catch (error) {
    console.error('Failed to submit charity run:', error);
    return NextResponse.json({ error: 'Failed to submit charity run' }, { status: 500 });
  }
}
