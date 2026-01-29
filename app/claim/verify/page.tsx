'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Instagram, ArrowLeft, Copy, Check } from 'lucide-react';
import { useState } from 'react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const method = searchParams.get('method');
  const clubName = searchParams.get('club');
  const instagramCode = searchParams.get('code');

  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (instagramCode) {
      navigator.clipboard.writeText(instagramCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
            Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {method === 'email' ? (
            <>
              {/* Email verification */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-8 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black mb-2">Check Your Email</h1>
                <p className="text-white/90">for {clubName}</p>
              </div>

              <div className="p-6 text-center">
                <p className="text-gray-600 mb-6">
                  We&apos;ve sent a verification link to the club&apos;s contact email address.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Next step:</strong> The club owner needs to click the link in the email to verify ownership.
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  The link expires in 7 days. If you don&apos;t receive the email, check your spam folder.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Instagram verification */}
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-8 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Instagram className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black mb-2">Instagram Verification</h1>
                <p className="text-white/90">for {clubName}</p>
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-2">
                    Your verification code
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-4xl font-black text-gray-900 tracking-widest">
                      {instagramCode}
                    </code>
                    <button
                      onClick={copyCode}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FF6B5B] text-white flex items-center justify-center text-sm font-bold shrink-0">
                      1
                    </div>
                    <p className="text-gray-600">
                      Open Instagram and go to your club&apos;s account
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FF6B5B] text-white flex items-center justify-center text-sm font-bold shrink-0">
                      2
                    </div>
                    <p className="text-gray-600">
                      Send a DM to <a href="https://instagram.com/findmyrun" target="_blank" rel="noopener noreferrer" className="text-[#FF6B5B] font-medium">@findmyrun</a> with the code above
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FF6B5B] text-white flex items-center justify-center text-sm font-bold shrink-0">
                      3
                    </div>
                    <p className="text-gray-600">
                      We&apos;ll verify and email you once approved (usually within 24 hours)
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-purple-800">
                    <strong>Important:</strong> You must send the DM from the club&apos;s Instagram account to prove ownership.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
