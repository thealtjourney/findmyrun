'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle, Instagram, Globe, Mail } from 'lucide-react';
import { ukCities } from '@/lib/uk-cities';

// Logo component (same as main page)
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

const cities = ukCities; // 140+ UK cities and major towns

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SubmitClub() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Build JSON payload from form data
    const payload: Record<string, string | boolean> = {};
    formData.forEach((value, key) => {
      payload[key] = value.toString();
    });

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }

    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-gray-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Thanks for submitting!</h1>
          <p className="text-gray-600 mb-6">
            We'll review your club and add it to the site within 24-48 hours.
            We may reach out if we need any extra details.
          </p>
          <Link
            href="/"
            className="inline-block bg-[#FF6B5B] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#E55A4A] transition-colors"
          >
            Back to Find My Run
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
            <Link href="/" className="flex items-center gap-3 group">
              <Logo />
              <div>
                <h1 className="text-lg font-black text-gray-900">findmyrun</h1>
                <p className="text-xs text-gray-400">Run clubs near you</p>
              </div>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 pb-16">
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 mb-2">Add your run club</h1>
            <p className="text-gray-600">
              Get your club listed for free. We'll review submissions and add them within 24-48 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot field - hidden from users, catches bots */}
            <input
              type="text"
              name="website_url"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Club Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Club name *
              </label>
              <input
                type="text"
                name="club_name"
                required
                placeholder="e.g. Manchester Road Runners"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
              />
            </div>

            {/* City & Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <select
                  name="city"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
                >
                  <option value="">Select city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Area/Neighbourhood *
                </label>
                <input
                  type="text"
                  name="area"
                  required
                  placeholder="e.g. Castlefield, Hackney"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
                />
              </div>
            </div>

            {/* Day & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Main run day *
                </label>
                <select
                  name="day"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
                >
                  <option value="">Select day</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start time *
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
                />
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Typical distance *
              </label>
              <input
                type="text"
                name="distance"
                required
                placeholder="e.g. 5km, 5-10km, 8km"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
              />
            </div>

            {/* Meeting Point */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meeting point *
              </label>
              <input
                type="text"
                name="meeting_point"
                required
                placeholder="e.g. Outside Pret on Deansgate, Clapham Common Bandstand"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                placeholder="Tell people about your club - what's the vibe? What makes it special? Who's it for?"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent resize-none"
              />
            </div>

            {/* Pace & Terrain */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pace *
                </label>
                <select
                  name="pace"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
                >
                  <option value="">Select pace</option>
                  <option value="slow">Relaxed / Social pace</option>
                  <option value="mixed">Mixed abilities</option>
                  <option value="fast">Fast / Training pace</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Terrain *
                </label>
                <select
                  name="terrain"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B]"
                >
                  <option value="">Select terrain</option>
                  <option value="road">Road</option>
                  <option value="trail">Trail / Off-road</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Club features
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="beginner_friendly"
                    value="yes"
                    className="w-5 h-5 rounded border-gray-300 text-[#FF6B5B] focus:ring-[#FF6B5B]"
                  />
                  <span className="text-gray-700">Beginner friendly</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="dog_friendly"
                    value="yes"
                    className="w-5 h-5 rounded border-gray-300 text-[#FF6B5B] focus:ring-[#FF6B5B]"
                  />
                  <span className="text-gray-700">Dog friendly</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="female_only"
                    value="yes"
                    className="w-5 h-5 rounded border-gray-300 text-[#FF6B5B] focus:ring-[#FF6B5B]"
                  />
                  <span className="text-gray-700">Women only</span>
                </label>
              </div>
            </div>

            {/* Post-run */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Post-run activity
              </label>
              <input
                type="text"
                name="post_run"
                placeholder="e.g. Pub, Coffee, Brunch (optional)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
              />
            </div>

            {/* Social / Website */}
            <div className="bg-[#FFF5F3] rounded-xl p-4 border border-[#FFAB9F]">
              <p className="text-sm font-semibold text-[#FF6B5B] mb-3 flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Social links (at least one required for verification)
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">@</span>
                  <input
                    type="text"
                    name="instagram"
                    placeholder="Instagram handle"
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <input
                    type="url"
                    name="website"
                    placeholder="Website URL (optional)"
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your name *
                </label>
                <input
                  type="text"
                  name="submitter_name"
                  required
                  placeholder="Your full name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your email *
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  We&apos;ll only use this to contact you about your listing. Not published.
                </p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="contact_email"
                    required
                    placeholder="your@email.com"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B5B] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FF6B5B] text-white py-4 rounded-xl font-bold hover:bg-[#E55A4A] transition-colors shadow-lg shadow-[#FF6B5B]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit your club
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By submitting, you confirm this is a legitimate run club and the information is accurate.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
