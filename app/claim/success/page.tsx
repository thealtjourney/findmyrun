'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const clubName = searchParams.get('club');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-400 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black mb-2">You&apos;re Verified!</h1>
            {clubName && <p className="text-white/90">{clubName}</p>}
          </div>

          <div className="p-6 text-center">
            <p className="text-gray-600 mb-6">
              Congratulations! You now have owner access to your club listing. You can edit your club details anytime from the owner dashboard.
            </p>

            <div className="space-y-3">
              <Link
                href="/owner"
                className="w-full py-3 bg-[#FF6B5B] text-white rounded-xl font-bold hover:bg-[#E55A4A] transition-colors flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/"
                className="block text-gray-500 hover:text-gray-700 text-sm"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
