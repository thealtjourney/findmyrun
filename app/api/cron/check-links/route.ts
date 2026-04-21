import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { seedClubs } from '@/lib/seed-data';
import { sendBrokenLinksReport } from '@/lib/email';

// Route config — give the cron room to run.
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ----- Types ---------------------------------------------------------------

export interface LinkStatus {
  ok: boolean;
  url: string;
  reason?: string;
}

export interface ClubLinkCheck {
  name: string;
  city: string;
  instagram: LinkStatus | null;
  website: LinkStatus | null;
}

// ----- HTTP helper ---------------------------------------------------------

const FETCH_TIMEOUT_MS = 6000;
const CONCURRENCY = 10;
const USER_AGENT =
  'Mozilla/5.0 (compatible; FindMyRunBot/1.0; +https://findmyrun.club/bot)';

async function checkUrl(rawUrl: string): Promise<LinkStatus> {
  // Normalise — handle URLs without protocol.
  let url = rawUrl.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const tryFetch = async (method: 'HEAD' | 'GET') =>
    fetch(url, {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
    });

  try {
    let res = await tryFetch('HEAD');
    // Some hosts reject HEAD — retry with GET.
    if (res.status === 405 || res.status === 403 || res.status === 501) {
      res = await tryFetch('GET');
    }
    clearTimeout(timer);
    if (res.status >= 200 && res.status < 400) return { ok: true, url };
    return { ok: false, url, reason: `HTTP ${res.status}` };
  } catch (err: unknown) {
    clearTimeout(timer);
    const name = (err as { name?: string })?.name;
    const message = (err as { message?: string })?.message ?? 'unknown';
    const reason = name === 'AbortError' ? 'Timeout' : `Network: ${message}`;
    return { ok: false, url, reason };
  }
}

function instagramUrl(handle: string): string {
  const clean = handle.replace(/^@/, '').trim();
  return `https://www.instagram.com/${clean}/`;
}

// Simple worker-pool concurrency.
async function runPool<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  concurrency: number
): Promise<void> {
  let i = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (i < items.length) {
      const idx = i++;
      try {
        await worker(items[idx]);
      } catch (err) {
        console.error('Worker error:', err);
      }
    }
  });
  await Promise.all(workers);
}

// ----- Route ---------------------------------------------------------------

type ClubRow = {
  name: string;
  city: string;
  instagram: string | null;
  website: string | null;
};

async function loadClubs(): Promise<ClubRow[]> {
  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('name, city, instagram, website')
      .eq('status', 'approved');
    if (error) throw error;
    if (data && data.length > 0) return data as ClubRow[];
  } catch (e) {
    console.warn('Supabase unavailable, falling back to seed data:', e);
  }
  return seedClubs.map((c) => ({
    name: c.name,
    city: c.city,
    instagram: c.instagram ?? null,
    website: c.website ?? null,
  }));
}

export async function GET(req: Request) {
  // Auth — Vercel Cron passes Authorization: Bearer <CRON_SECRET>.
  // Skipped if CRON_SECRET isn't set (local dev), enforced in prod.
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const clubs = await loadClubs();
  const results: ClubLinkCheck[] = [];

  await runPool(
    clubs,
    async (club) => {
      const instagram = club.instagram ? await checkUrl(instagramUrl(club.instagram)) : null;
      const website = club.website ? await checkUrl(club.website) : null;
      results.push({ name: club.name, city: club.city, instagram, website });
    },
    CONCURRENCY
  );

  const broken = results.filter(
    (r) => (r.instagram && !r.instagram.ok) || (r.website && !r.website.ok)
  );

  if (broken.length > 0) {
    try {
      await sendBrokenLinksReport(broken);
    } catch (e) {
      console.error('Failed to send broken-links report:', e);
    }
  }

  return NextResponse.json({
    totalChecked: clubs.length,
    totalBroken: broken.length,
    broken: broken.map((b) => ({
      name: b.name,
      city: b.city,
      instagram: b.instagram && !b.instagram.ok ? b.instagram : null,
      website: b.website && !b.website.ok ? b.website : null,
    })),
    checkedAt: new Date().toISOString(),
  });
}
