'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Edit2, MapPin, Calendar, LogOut, Key, ExternalLink } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  city: string;
  area: string;
  day: string;
  time: string;
  status: string;
  claimed_at: string;
}

interface DashboardData {
  ownerEmail: string;
  clubs: Club[];
}

export default function OwnerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/owner/clubs');

        if (res.status === 401) {
          // Not logged in, redirect to login
          router.push('/owner/login');
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to load dashboard');
        }

        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/owner/auth', { method: 'POST' });
      router.push('/owner/login');
    } catch {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF6B5B] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/owner/login" className="text-[#FF6B5B] font-medium">
            Try logging in again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF6B5B] rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Owner Dashboard</h1>
                <p className="text-xs text-gray-500">{data?.ownerEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                View site
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4" />
                {loggingOut ? 'Logging out...' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-2">Your Clubs</h2>
          <p className="text-gray-500 text-sm">
            Manage your club listings. Changes are saved immediately.
          </p>
        </div>

        {data?.clubs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No clubs yet</h3>
            <p className="text-gray-500 mb-6">
              You haven&apos;t claimed any clubs yet. Find your club on the site and claim ownership.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#FF6B5B] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#E55A4A] transition-colors"
            >
              Find Your Club
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.clubs.map((club) => (
              <div
                key={club.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{club.name}</h3>
                      {club.status === 'approved' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Live
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {club.area}, {club.city}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {club.day}s at {club.time}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/owner/edit/${club.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-[#FF6B5B] text-white rounded-xl font-medium hover:bg-[#E55A4A] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Link>
                    <Link
                      href={`/?club=${club.id}`}
                      className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      title="View on site"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </Link>
                  </div>
                </div>

                {club.claimed_at && (
                  <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                    Claimed on {new Date(club.claimed_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
