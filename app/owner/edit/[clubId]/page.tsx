'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Check, AlertCircle, Save } from 'lucide-react';

interface Club {
  id: string;
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
  contact_email: string;
}

export default function EditClubPage() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.clubId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [club, setClub] = useState<Club | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    area: '',
    day: '',
    time: '',
    distance: '',
    meeting_point: '',
    description: '',
    pace: 'mixed' as 'slow' | 'mixed' | 'fast',
    terrain: '' as 'road' | 'trail' | 'mixed' | '',
    beginner_friendly: false,
    dog_friendly: false,
    female_only: false,
    post_run: '',
    instagram: '',
    website: '',
    contact_email: '',
  });

  useEffect(() => {
    async function fetchClub() {
      try {
        const res = await fetch(`/api/owner/clubs/${clubId}`);

        if (res.status === 401) {
          router.push('/owner/login');
          return;
        }

        if (res.status === 404) {
          setError('Club not found or you do not have permission to edit it');
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to load club');
        }

        const data = await res.json();
        setClub(data);
        setForm({
          name: data.name || '',
          area: data.area || '',
          day: data.day || '',
          time: data.time || '',
          distance: data.distance || '',
          meeting_point: data.meeting_point || '',
          description: data.description || '',
          pace: data.pace || 'mixed',
          terrain: data.terrain || '',
          beginner_friendly: data.beginner_friendly || false,
          dog_friendly: data.dog_friendly || false,
          female_only: data.female_only || false,
          post_run: data.post_run || '',
          instagram: data.instagram || '',
          website: data.website || '',
          contact_email: data.contact_email || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchClub();
  }, [clubId, router]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/owner/clubs/${clubId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        router.push('/owner/login');
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save changes');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF6B5B] animate-spin" />
      </div>
    );
  }

  if (error && !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Error</p>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/owner" className="text-[#FF6B5B] font-medium">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/owner"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to dashboard
            </Link>

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6B5B] text-white rounded-xl font-medium hover:bg-[#E55A4A] transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Edit {club?.name}</h1>
          <p className="text-gray-500 text-sm">{club?.city}</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Basic Info</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Club name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area / Neighbourhood
                </label>
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Session Details</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day
                </label>
                <select
                  value={form.day}
                  onChange={(e) => handleChange('day', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance
                </label>
                <input
                  type="text"
                  value={form.distance}
                  onChange={(e) => handleChange('distance', e.target.value)}
                  placeholder="e.g. 5-10km"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pace
                </label>
                <select
                  value={form.pace}
                  onChange={(e) => handleChange('pace', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
                >
                  <option value="slow">Relaxed / Social</option>
                  <option value="mixed">Mixed abilities</option>
                  <option value="fast">Fast / Training</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terrain
              </label>
              <select
                value={form.terrain}
                onChange={(e) => handleChange('terrain', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
              >
                <option value="">Not specified</option>
                <option value="road">Road</option>
                <option value="trail">Trail / Off-road</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting point
              </label>
              <input
                type="text"
                value={form.meeting_point}
                onChange={(e) => handleChange('meeting_point', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
              />
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Features</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.beginner_friendly}
                  onChange={(e) => handleChange('beginner_friendly', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#FF6B5B] focus:ring-[#FF6B5B]"
                />
                <span className="text-gray-700">Beginner friendly</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.dog_friendly}
                  onChange={(e) => handleChange('dog_friendly', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#FF6B5B] focus:ring-[#FF6B5B]"
                />
                <span className="text-gray-700">Dog friendly</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.female_only}
                  onChange={(e) => handleChange('female_only', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-[#FF6B5B] focus:ring-[#FF6B5B]"
                />
                <span className="text-gray-700">Women only</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Post-run activity
              </label>
              <input
                type="text"
                value={form.post_run}
                onChange={(e) => handleChange('post_run', e.target.value)}
                placeholder="e.g. Coffee at local cafe"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
              />
            </div>
          </div>

          {/* Contact & Social */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Contact & Social</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram handle
                </label>
                <div className="flex">
                  <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500">@</span>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={(e) => handleChange('instagram', e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact email
                </label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
                />
              </div>
            </div>
          </div>

          {/* Save button (mobile) */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-[#FF6B5B] text-white rounded-xl font-bold hover:bg-[#E55A4A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 md:hidden"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-5 h-5" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
