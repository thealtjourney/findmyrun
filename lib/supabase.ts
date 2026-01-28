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
  beginner_friendly: boolean;
  dog_friendly: boolean;
  post_run: string | null;
  instagram: string | null;
  strava_url: string | null;
  website: string | null;
  verified: boolean;
  created_at: string;
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
  beginner_friendly: boolean;
  dog_friendly: boolean;
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
