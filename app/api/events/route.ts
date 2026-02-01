import { NextResponse } from 'next/server';
import { getEvents, submitEvent } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || undefined;
  const eventType = searchParams.get('type') || undefined;

  try {
    const events = await getEvents(city, eventType);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = await submitEvent(body);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Failed to submit event:', error);
    return NextResponse.json({ error: 'Failed to submit event' }, { status: 500 });
  }
}
