import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { seedClubs } from '@/lib/seed-data';

// Verify admin secret
function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || !authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  return token === adminSecret;
}

// POST - Migrate all seed data to Supabase
export async function POST(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Prepare clubs for insertion (add required fields)
    const clubsToInsert = seedClubs.map((club, index) => ({
      name: club.name,
      city: club.city,
      area: club.area,
      lat: club.lat,
      lng: club.lng,
      day: club.day,
      time: club.time,
      distance: club.distance,
      meeting_point: club.meeting_point,
      description: club.description,
      pace: club.pace,
      terrain: club.terrain,
      beginner_friendly: club.beginner_friendly,
      dog_friendly: club.dog_friendly,
      female_only: club.female_only,
      post_run: club.post_run,
      instagram: club.instagram,
      website: club.website,
      verified: club.verified,
      status: 'approved',
      // Additional fields from seed data
      influencer_led: club.influencer_led,
      pace_5k: club.pace_5k || null,
      pace_10k: club.pace_10k || null,
    }));

    // Check how many clubs already exist
    const { data: existingClubs } = await supabase
      .from('clubs')
      .select('name');

    const existingNames = new Set((existingClubs || []).map(c => c.name));

    // Filter out clubs that already exist
    const newClubs = clubsToInsert.filter(c => !existingNames.has(c.name));

    if (newClubs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All seed clubs already exist in database',
        migrated: 0,
        total: seedClubs.length,
      });
    }

    // Insert in batches of 20 to avoid issues
    const batchSize = 20;
    let totalInserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < newClubs.length; i += batchSize) {
      const batch = newClubs.slice(i, i + batchSize);
      const { error } = await supabase
        .from('clubs')
        .insert(batch);

      if (error) {
        errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
      } else {
        totalInserted += batch.length;
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Migrated ${totalInserted} clubs to database`,
      migrated: totalInserted,
      skipped: existingNames.size,
      total: seedClubs.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
