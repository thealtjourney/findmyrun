'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Instagram, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  city: string;
  area: string;
  contact_email: string | null;
  instagram: string | null;
  owner_email: string | null;
}

export default function ClaimClubPage() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.clubId as string;

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [claimantEmail, setClaimantEmail] = useState('');
  const [claimantName, setClaimantName] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'instagram'>('email');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch club details
  useEffect(() => {
    async function fetchClub() {
      try {
        const res = await fetch(`/api/clubs?id=${clubId}`);
        if (!res.ok) throw new Error('Club not found');
        const data = await res.json();
        setClub(data);

        // If club has no contact email, default to Instagram
        if (!data.contact_email) {
          setVerificationMethod('instagram');
        }
      } catch {
        setError('Club not found');
      } finally {
        setLoading(false);
      }
    }
    fetchClub();
  }, [clubId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId,
          claimantEmail,
          claimantName,
          verificationMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit claim');
      }

      // Redirect to verify page with claim details
      const verifyUrl = new URL('/claim/verify', window.location.origin);
      verifyUrl.searchParams.set('method', verificationMethod);
      verifyUrl.searchParams.set('club', data.clubName);
      if (data.instagramCode) {
        verifyUrl.searchParams.set('code', data.instagramCode);
      }
      router.push(verifyUrl.toString());

    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF6B5B] animate-spin" />
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Club Not Found</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link href="/" className="text-[#FF6B5B] font-medium hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (club.owner_email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Already Claimed</h1>
          <p className="text-gray-500 mb-6">
            This club has already been claimed by its owner.
          </p>
          <Link href="/" className="text-[#FF6B5B] font-medium hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Club info header */}
          <div className="bg-gradient-to-r from-[#FF6B5B] to-[#FFAB9F] p-6 text-white">
            <h1 className="text-2xl font-black mb-1">Claim Your Club</h1>
            <p className="text-white/90">{club.name}</p>
            <p className="text-white/70 text-sm">{club.area}, {club.city}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                {submitError}
              </div>
            )}

            {/* Your details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your name
              </label>
              <input
                type="text"
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={claimantEmail}
                onChange={(e) => setClaimantEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                We&apos;ll send you a link to manage your club once verified
              </p>
            </div>

            {/* Verification method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Verification method
              </label>
              <div className="space-y-3">
                {club.contact_email && (
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      verificationMethod === 'email'
                        ? 'border-[#FF6B5B] bg-[#FFF5F3]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="verification"
                      value="email"
                      checked={verificationMethod === 'email'}
                      onChange={() => setVerificationMethod('email')}
                      className="sr-only"
                    />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      verificationMethod === 'email' ? 'bg-[#FF6B5B]' : 'bg-gray-100'
                    }`}>
                      <Mail className={`w-5 h-5 ${
                        verificationMethod === 'email' ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Email verification</p>
                      <p className="text-sm text-gray-500">
                        We&apos;ll send a verification link to the club&apos;s email on file
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {club.contact_email}
                      </p>
                    </div>
                  </label>
                )}

                {club.instagram && (
                  <label
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      verificationMethod === 'instagram'
                        ? 'border-[#FF6B5B] bg-[#FFF5F3]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="verification"
                      value="instagram"
                      checked={verificationMethod === 'instagram'}
                      onChange={() => setVerificationMethod('instagram')}
                      className="sr-only"
                    />
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      verificationMethod === 'instagram' ? 'bg-[#FF6B5B]' : 'bg-gray-100'
                    }`}>
                      <Instagram className={`w-5 h-5 ${
                        verificationMethod === 'instagram' ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Instagram verification</p>
                      <p className="text-sm text-gray-500">
                        DM a code from your club&apos;s Instagram to @findmyrun
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        @{club.instagram}
                      </p>
                    </div>
                  </label>
                )}

                {!club.contact_email && !club.instagram && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No verification methods available for this club. Please contact us.
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || (!club.contact_email && !club.instagram)}
              className="w-full py-4 bg-[#FF6B5B] text-white rounded-xl font-bold hover:bg-[#E55A4A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Claim'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
