'use client';

import { useState, useCallback } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

type Reason =
  | 'club_inactive'
  | 'wrong_meeting_info'
  | 'wrong_location'
  | 'broken_link'
  | 'inappropriate'
  | 'other';

const REASONS: Array<{ value: Reason; label: string }> = [
  { value: 'club_inactive', label: 'Club is no longer active' },
  { value: 'wrong_meeting_info', label: 'Wrong meeting day / time' },
  { value: 'wrong_location', label: 'Wrong location or meeting point' },
  { value: 'broken_link', label: 'Broken link (Instagram / website)' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
];

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function ReportIssueButton({
  clubName,
  clubCity,
  variant = 'link',
}: {
  clubName: string;
  clubCity: string;
  /** `link` is a subtle inline text button; `button` is a full outlined button. */
  variant?: 'link' | 'button';
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason | ''>('');
  const [note, setNote] = useState('');
  // Honeypot — bots will fill this; humans won't see it.
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reset = useCallback(() => {
    setReason('');
    setNote('');
    setWebsite('');
    setState('idle');
    setErrorMsg(null);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // Delay reset so the modal fade doesn't flash the empty state.
    setTimeout(reset, 300);
  }, [reset]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!reason) return;
      setState('submitting');
      setErrorMsg(null);
      try {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clubName,
            clubCity,
            reason,
            note,
            website_url: website, // honeypot
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Something went wrong.');
        }
        setState('success');
        setTimeout(close, 2200);
      } catch (err) {
        setState('error');
        setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      }
    },
    [clubName, clubCity, reason, note, website, close]
  );

  const trigger =
    variant === 'button' ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#FF6B5B] border border-gray-200 hover:border-[#FFAB9F] bg-white rounded-xl px-4 py-2 transition-colors"
      >
        <AlertTriangle className="w-4 h-4" />
        Report an issue
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#FF6B5B] transition-colors"
      >
        <AlertTriangle className="w-3 h-3" />
        Report an issue
      </button>
    );

  return (
    <>
      {trigger}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={close}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#FF6B5B] to-[#FFAB9F] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Report an issue</h2>
                <p className="text-xs text-white/80 mt-0.5">
                  {clubName} · {clubCity}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-white/80 hover:text-white"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {state === 'success' ? (
              <div className="px-5 py-10 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 text-teal-600 mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <p className="font-bold text-gray-900 mb-1">Thanks for the report</p>
                <p className="text-sm text-gray-500">
                  We'll take a look and update the listing.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                <div>
                  <label
                    htmlFor="report-reason"
                    className="block text-sm font-semibold text-gray-900 mb-1.5"
                  >
                    What's wrong?
                  </label>
                  <select
                    id="report-reason"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value as Reason | '')}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
                  >
                    <option value="" disabled>
                      Choose an issue…
                    </option>
                    {REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="report-note"
                    className="block text-sm font-semibold text-gray-900 mb-1.5"
                  >
                    Tell us more{' '}
                    <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    id="report-note"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={2000}
                    placeholder="Any extra detail that would help us fix this…"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent resize-none"
                  />
                </div>

                {/* Honeypot — hidden from users. */}
                <input
                  type="text"
                  name="website_url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />

                {state === 'error' && errorMsg && (
                  <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                    {errorMsg}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={close}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={state === 'submitting' || !reason}
                    className="bg-[#FF6B5B] hover:bg-[#E55A4A] text-white font-bold text-sm rounded-xl px-4 py-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {state === 'submitting' ? 'Sending…' : 'Send report'}
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center pt-1">
                  Reports are anonymous.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
