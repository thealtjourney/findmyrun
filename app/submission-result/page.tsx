'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, AlertCircle, Home } from 'lucide-react';
import { Suspense } from 'react';

function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="60" rx="14" fill="#FFF5F3" />
      <path d="M15 40 Q25 15 35 32 Q45 48 50 25" stroke="#FF6B5B" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="15" cy="40" r="4" fill="#FF6B5B" />
      <circle cx="50" cy="25" r="4" fill="#2D2D2D" />
    </svg>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const action = searchParams.get('action');
  const club = searchParams.get('club');
  const message = searchParams.get('message');

  const isSuccess = status === 'success';
  const isInfo = status === 'info';
  const isError = status === 'error';
  const isApproved = action === 'approved';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-gray-200">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isSuccess && isApproved ? 'bg-green-100' :
          isSuccess && !isApproved ? 'bg-red-100' :
          isInfo ? 'bg-blue-100' :
          'bg-red-100'
        }`}>
          {isSuccess && isApproved && <CheckCircle className="w-8 h-8 text-green-600" />}
          {isSuccess && !isApproved && <XCircle className="w-8 h-8 text-red-600" />}
          {isInfo && <AlertCircle className="w-8 h-8 text-blue-600" />}
          {isError && <XCircle className="w-8 h-8 text-red-600" />}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-gray-900 mb-3">
          {isSuccess && isApproved && 'Club Approved! 🎉'}
          {isSuccess && !isApproved && 'Club Rejected'}
          {isInfo && 'Already Processed'}
          {isError && 'Something went wrong'}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {isSuccess && isApproved && (
            <>
              <span className="font-semibold text-gray-900">{club}</span> has been approved and is now live on Find My Run. The submitter has been notified.
            </>
          )}
          {isSuccess && !isApproved && (
            <>
              <span className="font-semibold text-gray-900">{club}</span> has been rejected and won&apos;t appear on the site.
            </>
          )}
          {isInfo && message}
          {isError && (message || 'An unexpected error occurred. Please try again.')}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-[#FF6B5B] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#E55A4A] transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Find My Run
          </Link>
        </div>

        {/* Logo Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-400">
          <Logo className="w-6 h-6" />
          <span className="text-sm font-medium">findmyrun</span>
        </div>
      </div>
    </div>
  );
}

export default function SubmissionResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FF6B5B] border-t-transparent"></div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
