import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Club {
  id: string;
  name: string;
  city: string;
  area: string | null;
  lat: number;
  lng: number;
  day: string;
  time: string;
  distance: string | null;
  meeting_point: string;
  description: string | null;
  pace: 'slow' | 'mixed' | 'fast';
  terrain: 'road' | 'trail' | 'mixed' | null;
  beginner_friendly: boolean;
  dog_friendly: boolean;
  female_only: boolean;
  post_run: string | null;
  instagram: string | null;
  strava_url: string | null;
  website: string | null;
  contact_email: string | null;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ClubSubmission {
  name: string;
  city: string;
  area: string;
  day: string;
  time: string;
  distance: string;
  meeting_point: string;
  description: string;
  pace: 'slow' | 'mixed' | 'fast';
  terrain: 'road' | 'trail' | 'mixed' | null;
  beginner_friendly: boolean;
  dog_friendly: boolean;
  female_only: boolean;
  post_run: string;
  instagram: string;
  website: string;
  submitter_email: string;
  submitter_name: string;
}

// Database functions
export async function getClubs(city?: string) {
  let query = supabase
    .from('clubs')
    .select('*')
    .eq('status', 'approved')
    .order('name');

  if (city && city !== 'all') {
    query = query.ilike('city', city);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching clubs:', error);
    return [];
  }

  return data as Club[];
}

export async function getClubById(id: string) {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .single();

  if (error) {
    console.error('Error fetching club:', error);
    return null;
  }

  return data as Club;
}

export async function getClubsByCity(city: string) {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .ilike('city', city)
    .eq('status', 'approved')
    .order('day');

  if (error) {
    console.error('Error fetching clubs:', error);
    return [];
  }

  return data as Club[];
}

export async function submitClub(submission: ClubSubmission) {
  const { data, error } = await supabase
    .from('submissions')
    .insert([submission])
    .select()
    .single();

  if (error) {
    console.error('Error submitting club:', error);
    throw error;
  }

  return data;
}

export async function markAttendance(clubId: string, sessionDate: string, email?: string) {
  const { error } = await supabase
    .from('attendance')
    .insert([{ club_id: clubId, session_date: sessionDate, email }]);

  if (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
}

export async function subscribeNewsletter(email: string, city?: string) {
  const { error } = await supabase
    .from('subscribers')
    .insert([{ email, city }]);

  if (error) {
    if (error.code === '23505') {
      // Already subscribed - not an error
      return;
    }
    console.error('Error subscribing:', error);
    throw error;
  }
}

// ============================================
// CHARITY RUNS
// ============================================

export interface CharityRun {
  id: string;
  name: string;
  charity_name: string;
  description: string | null;
  city: string;
  area: string | null;
  event_date: string;
  start_time: string;
  distance: string | null;
  meeting_point: string;
  fundraising_url: string | null;
  fundraising_target: number | null;
  fundraising_current: number | null;
  registration_url: string | null;
  contact_email: string | null;
  organizer_name: string | null;
  instagram: string | null;
  website: string | null;
  status: 'pending' | 'approved' | 'rejected';
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export async function getCharityRuns(city?: string) {
  let query = supabase
    .from('charity_runs')
    .select('*')
    .eq('status', 'approved')
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date');

  if (city && city !== 'all') {
    query = query.ilike('city', city);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching charity runs:', error);
    return [];
  }

  return data as CharityRun[];
}

export async function submitCharityRun(charityRun: Omit<CharityRun, 'id' | 'status' | 'verified' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('charity_runs')
    .insert([charityRun])
    .select()
    .single();

  if (error) {
    console.error('Error submitting charity run:', error);
    throw error;
  }

  return data;
}

// ============================================
// EVENTS
// ============================================

export interface Event {
  id: string;
  name: string;
  description: string | null;
  city: string;
  area: string | null;
  event_date: string;
  start_time: string;
  distance: string | null;
  meeting_point: string;
  event_type: 'race' | 'fun_run' | 'special_session' | 'parkrun' | 'social' | 'other';
  is_free: boolean;
  price: number | null;
  price_currency: string;
  registration_url: string | null;
  registration_deadline: string | null;
  max_participants: number | null;
  contact_email: string | null;
  organizer_name: string | null;
  club_id: string | null;
  club_name?: string;
  instagram: string | null;
  website: string | null;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export async function getEvents(city?: string, eventType?: string) {
  let query = supabase
    .from('events')
    .select(`
      *,
      clubs:club_id (name)
    `)
    .eq('status', 'approved')
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date');

  if (city && city !== 'all') {
    query = query.ilike('city', city);
  }

  if (eventType && eventType !== 'all') {
    query = query.eq('event_type', eventType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  // Transform the joined data
  return (data || []).map(event => ({
    ...event,
    club_name: event.clubs?.name || null,
    clubs: undefined
  })) as Event[];
}

export async function getEventById(id: string) {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      clubs:club_id (name)
    `)
    .eq('id', id)
    .eq('status', 'approved')
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  return {
    ...data,
    club_name: data.clubs?.name || null,
    clubs: undefined
  } as Event;
}

export async function submitEvent(event: Omit<Event, 'id' | 'status' | 'featured' | 'created_at' | 'updated_at' | 'club_name'>) {
  const { data, error } = await supabase
    .from('events')
    .insert([event])
    .select()
    .single();

  if (error) {
    console.error('Error submitting event:', error);
    throw error;
  }

  return data;
}
