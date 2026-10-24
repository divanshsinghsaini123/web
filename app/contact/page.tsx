"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    catalogSize: "1-5 songs",
    message: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-500 font-semibold">
            Direct Inquiries & Custom Deployments
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
            Contact the RhythmSync Team
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">
            Need custom Instagram scraping cadences, label catalog indexing, or team onboarding? We reply within 24 hours.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-3" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Inquiry Received
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Thank you for reaching out. A platform engineer will review your catalog request and contact you at <strong>{formData.email}</strong>.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-5 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-300"
            >
              Back to Home
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-8 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Maya Lin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Work / Artist Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="maya@recordlabel.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Artist / Record Label Name
              </label>
              <input
                type="text"
                placeholder="Neon Wave Records"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Active Catalog Volume
              </label>
              <select
                value={formData.catalogSize}
                onChange={(e) => setFormData({ ...formData, catalogSize: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-amber-400 focus:outline-hidden"
              >
                <option value="1-5 songs">1 - 5 Tracked Audios (Starter / Creator)</option>
                <option value="5-25 songs">5 - 25 Tracked Audios (Label Pro)</option>
                <option value="25+ songs">25+ Tracked Audios (Enterprise Fleet)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Message / Requirements
              </label>
              <textarea
                rows={4}
                required
                placeholder="Tell us about your upcoming single or catalog tracking goals..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold py-2.5 text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Mail className="h-4 w-4" />
              Submit Inquiry
            </button>
          </form>
        )}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 px-6 text-center text-xs text-zinc-500">
        <p>&copy; {new Date().getFullYear()} RhythmSync. High-fidelity Instagram audio telemetry.</p>
      </footer>
    </div>
  );
}
