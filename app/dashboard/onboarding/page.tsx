"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Music2, Radio, CheckCircle2, ArrowRight, UserCheck, RotateCw } from "lucide-react";
import { api } from "@/lib/api";
import { extractAudioId } from "@/lib/utils";

export default function OnboardingWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [artistName, setArtistName] = useState("");
  const [igHandle, setIgHandle] = useState("");
  const [fanbase, setFanbase] = useState("10K-100K");
  const [genre, setGenre] = useState("Hip-Hop/Rap");

  const [audioUrl, setAudioUrl] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [loading, setLoading] = useState(false);

  

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const audioId = extractAudioId(audioUrl);
      if (audioId && songTitle) {
        await api.addTrack({
          audio_id: audioId,
          track_name: songTitle,
          artist_name: artistName,
          original_url: audioUrl.startsWith("http") ? audioUrl : undefined,
        }).catch(() => null);
      }
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-lg">
        {/* Progress header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 flex items-center justify-center bg-transparent shrink-0">
              <Image
                src="/reels.png"
                alt="ReelsPulse Logo"
                width={32}
                height={32}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
              RhythmSync Setup
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
            <span>Step {step} of 3</span>
          </div>
        </div>

        {/* Step indicator bar */}
        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-amber-400 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step 1: Artist Profile */}
        {step === 1 && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm space-y-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-500 font-semibold">
                Step 1: Creator Profile
              </span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
                Tell us about your artist identity
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                We calibrate tracking filters based on your genre and audience scale.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Primary Artist / Stage Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luna Beats"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Instagram Handle *
                </label>
                <input
                  type="text"
                  placeholder="@lunabeats"
                  value={igHandle}
                  onChange={(e) => setIgHandle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Audience Size
                  </label>
                  <select
                    value={fanbase}
                    onChange={(e) => setFanbase(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-amber-400 focus:outline-hidden"
                  >
                    <option value="<10K">&lt; 10K Followers</option>
                    <option value="10K-100K">10K - 100K Followers</option>
                    <option value="100K-1M">100K - 1M Followers</option>
                    <option value="1M+">1M+ Followers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Primary Genre
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-amber-400 focus:outline-hidden"
                  >
                    <option value="Hip-Hop/Rap">Hip-Hop / Rap</option>
                    <option value="Pop">Pop</option>
                    <option value="Electronic/Dance">Electronic / Dance</option>
                    <option value="Indie/Alternative">Indie / Alternative</option>
                    <option value="R&B/Soul">R&B / Soul</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold py-2.5 text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              Continue to First Song
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Step 2: First Song Track */}
        {step === 2 && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm space-y-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-500 font-semibold">
                Step 2: Free Song Tracking
              </span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
                Add your debut Instagram Audio stem
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Free account includes 1 active tracked song with 24-hour automated scraping.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Instagram Audio Link or ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://www.instagram.com/reels/audio/1805963283917482/ or 1805963283917482"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Song Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midnight Waves (Original Mix)"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 rounded-full border border-zinc-300 dark:border-zinc-700 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-2/3 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold py-2.5 text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                Review & Activate
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Quota Confirmation */}
        {step === 3 && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm space-y-6 text-center">
            <div className="h-12 w-12 rounded-full bg-amber-400/10 text-amber-500 border border-amber-400/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-500 font-semibold">
                Setup Complete
              </span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
                Your Free Workspace is Ready
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                1 audio track slot activated under the <strong>Free Starter</strong> tier. The background scraper will immediately begin indexing your song&apos;s reels.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Artist Name:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{artistName || "Artist"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">First Monitored Song:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{songTitle || "Debut Single"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Scraping Cadence:</span>
                <span className="font-mono text-amber-500 font-semibold">Every 24 Hours</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold py-2.5 text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {loading && <RotateCw className="h-3.5 w-3.5 animate-spin" />}
              Launch Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
