'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, RefreshCw, Shield, AlertTriangle, Upload } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  city: string;
  area: string;
  day: string;
  time: string;
  created_at: string;
  status?: string;
}

interface Submission {
  id: string;
  name: string;
  city: string;
  area: string;
  day: string;
  time: string;
  created_at: string;
  status: string;
  submitter_email: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'clubs' | 'submissions'>('clubs');
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

  const authenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminSecret.trim()) {
      setIsAuthenticated(true);
      fetchData(adminSecret);
    }
  };

  const fetchData = async (secret: string) => {
    setLoading(true);
    setError('');

    try {
      // Fetch clubs and submissions in parallel
      const [clubsRes, subsRes] = await Promise.all([
        fetch('/api/admin/clubs', {
          headers: { 'Authorization': `Bearer ${secret}` },
        }),
        fetch('/api/admin/submissions', {
          headers: { 'Authorization': `Bearer ${secret}` },
        }),
      ]);

      if (clubsRes.status === 401 || subsRes.status === 401) {
        setError('Invalid admin secret');
        setIsAuthenticated(false);
        return;
      }

      const clubsData = await clubsRes.json();
      const subsData = await subsRes.json();

      if (clubsData.clubs) setClubs(clubsData.clubs);
      if (subsData.submissions) setSubmissions(subsData.submissions);
    } catch {
      setError('Failed to fetch data');
    }

    setLoading(false);
  };

  const deleteClub = async (club: Club) => {
    if (deleteConfirm !== club.id) {
      setDeleteConfirm(club.id);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/clubs', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: club.id, name: club.name }),
      });

      if (response.ok) {
        setClubs(clubs.filter(c => c.id !== club.id));
        setDeleteConfirm(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete club');
      }
    } catch {
      setError('Failed to delete club');
    }

    setLoading(false);
  };

  const deleteSubmission = async (submission: Submission) => {
    if (deleteConfirm !== submission.id) {
      setDeleteConfirm(submission.id);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: submission.id }),
      });

      if (response.ok) {
        setSubmissions(submissions.filter(s => s.id !== submission.id));
        setDeleteConfirm(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete submission');
      }
    } catch {
      setError('Failed to delete submission');
    }

    setLoading(false);
  };

  const migrateSeedData = async () => {
    setLoading(true);
    setMigrationStatus(null);
    setError('');

    try {
      const response = await fetch('/api/admin/migrate-seed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        const debugInfo = data.debug ? ` [seed:${data.debug.seedClubsLoaded}, new:${data.debug.newToInsert}]` : '';
        setMigrationStatus(`✓ Migrated ${data.migrated} clubs (${data.skipped} already existed)${debugInfo}`);
        // Refresh the clubs list
        fetchData(adminSecret);
      } else {
        setError(data.error || 'Migration failed');
      }
    } catch {
      setError('Migration failed');
    }

    setLoading(false);
  };

  // Cancel delete confirmation after 5 seconds
  useEffect(() => {
    if (deleteConfirm) {
      const timer = setTimeout(() => setDeleteConfirm(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [deleteConfirm]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#FFF5F3] rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#FF6B5B]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">Admin Access</h1>
              <p className="text-sm text-gray-500">Enter your admin secret to continue</p>
            </div>
          </div>

          <form onSubmit={authenticate} className="space-y-4">
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Admin secret"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
            />
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-[#FF6B5B] text-white py-3 rounded-xl font-bold hover:bg-[#E55A4A] transition-colors"
            >
              Access Admin
            </button>
          </form>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium mt-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFF5F3] rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#FF6B5B]" />
              </div>
              <div>
                <h1 className="text-lg font-black text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-400">Manage clubs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={migrateSeedData}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                Import Seed Data
              </button>
              <button
                onClick={() => fetchData(adminSecret)}
                disabled={loading}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {migrationStatus && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm mb-6">
            {migrationStatus}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('clubs')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'clubs'
                ? 'bg-[#FF6B5B] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Clubs ({clubs.length})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'submissions'
                ? 'bg-[#FF6B5B] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Submissions ({submissions.length})
          </button>
        </div>

        {/* Clubs Tab */}
        {activeTab === 'clubs' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-bold text-gray-900">Database Clubs ({clubs.length})</h2>
              <p className="text-sm text-gray-500">Clubs approved through submissions</p>
            </div>

            {clubs.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No clubs in database yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {clubs.map((club) => (
                  <div
                    key={club.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">{club.name}</h3>
                      <p className="text-sm text-gray-500">
                        {club.area}, {club.city} • {club.day}s at {club.time}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Added: {new Date(club.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteClub(club)}
                      disabled={loading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        deleteConfirm === club.id
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {deleteConfirm === club.id ? (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          Confirm Delete
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-bold text-gray-900">All Submissions ({submissions.length})</h2>
              <p className="text-sm text-gray-500">Pending, approved, and rejected submissions</p>
            </div>

            {submissions.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No submissions yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{submission.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          submission.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : submission.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {submission.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {submission.area}, {submission.city} • {submission.day}s at {submission.time}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {submission.submitter_email} • {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteSubmission(submission)}
                      disabled={loading}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        deleteConfirm === submission.id
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {deleteConfirm === submission.id ? (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          Confirm Delete
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Click &quot;Import Seed Data&quot; to migrate all 48 seed clubs to the database.
            Once migrated, you can delete any clubs from this page.
          </p>
        </div>
      </main>
    </div>
  );
}
