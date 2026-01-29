'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

const errorMessages: Record<string, string> = {
  missing_token: 'The verification link is missing or invalid.',
  invalid_token: 'The verification link is invalid.',
  claim_not_found: 'This claim was not found.',
  already_verified: 'This claim has already been verified.',
  already_rejected: 'This claim has been rejected.',
  update_failed: 'Something went wrong. Please try again.',
  Token_expired: 'This verification link has expired. Please submit a new claim.',
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'unknown';

  const message = errorMessages[reason] || 'Something went wrong with your verification.';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-orange-400 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black mb-2">Verification Failed</h1>
          </div>

          <div className="p-6 text-center">
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full py-3 bg-[#FF6B5B] text-white rounded-xl font-bold hover:bg-[#E55A4A] transition-colors"
              >
                Back to Home
              </Link>

              <p className="text-sm text-gray-500">
                Need help? Contact us at{' '}
                <a href="mailto:hello@findmyrun.club" className="text-[#FF6B5B]">
                  hello@findmyrun.club
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
