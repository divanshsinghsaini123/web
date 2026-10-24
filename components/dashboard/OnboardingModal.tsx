"use client";

import React, { useState } from "react";
import {
  Building2,
  Globe,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Bell,
  Layers,
  Users,
  Briefcase,
  ArrowRight,
  Loader2,
  Music2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS, getAuthHeaders } from "@/lib/api";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (tenantData: any) => void;
  initialTenant?: {
    id?: string;
    name?: string;
    company_name?: string;
    is_onboarded?: boolean;
    industry_category?: string;
  };
}

const GENRE_OPTIONS = [
  "Hip-Hop / Rap",
  "Pop / Commercial",
  "Electronic / EDM",
  "Indie / Alternative",
  "Bollywood / Indian Regional",
  "R&B / Soul",
  "Other",
];

const CATALOG_SIZES = [
  { value: "1-5", label: "1-5 Songs", sub: "Emerging Artist" },
  { value: "6-20", label: "6-20 Songs", sub: "Active Creator" },
  { value: "21-100", label: "21-100 Songs", sub: "Independent Label" },
  { value: "100+", label: "100+ Songs", sub: "Commercial Catalog" },
];

const TEAM_SIZES = [
  { value: "Solo", label: "Solo Artist", sub: "Independent Creator" },
  { value: "2-5", label: "2-5 Squad", sub: "Management & Prod" },
  { value: "6-15", label: "6-15 Team", sub: "Music Label" },
  { value: "15+", label: "15+ Enterprise", sub: "Media Publisher" },
];

export function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  initialTenant,
}: OnboardingModalProps) {
  const [step, setStep] = useState<number>(1);
  const [workspaceName, setWorkspaceName] = useState(
    initialTenant?.company_name || initialTenant?.name || ""
  );
  const [genre, setGenre] = useState<string>("Hip-Hop / Rap");
  const [catalogSize, setCatalogSize] = useState<string>("1-5");
  const [teamSize, setTeamSize] = useState<string>("Solo");
  const [platforms, setPlatforms] = useState<string[]>(["instagram"]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!workspaceName.trim()) {
      setErrorMsg("Please provide a name for your workspace.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      company_name: workspaceName.trim(),
      industry_category: genre,
      organization_size: catalogSize,
      team_size: teamSize,
      target_platforms: platforms,
      mark_completed: true,
    };

    try {
      const res = await fetch(API_ENDPOINTS.tenantsOnboarding, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to save workspace setup.");
      }

      onComplete(data.tenant);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#0c0d0e] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Workspace Setup Wizard
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Step {step} of 3 &bull; Configure your artist telemetry workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Workspace / Label Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Star Records / Arjun's Studio"
                  className="w-full h-10 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Primary Music Genre
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GENRE_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenre(g)}
                      className={cn(
                        "p-2.5 rounded-lg border text-xs text-left font-medium transition-all cursor-pointer",
                        genre === g
                          ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-semibold shadow-xs"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Estimated Active Catalog Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATALOG_SIZES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCatalogSize(c.value)}
                      className={cn(
                        "p-2.5 rounded-lg border text-left transition-all cursor-pointer",
                        catalogSize === c.value
                          ? "border-amber-500 bg-amber-500/10 shadow-xs"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}
                    >
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {c.label}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {c.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Organization & Team Scale
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TEAM_SIZES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTeamSize(t.value)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-all cursor-pointer",
                        teamSize === t.value
                          ? "border-amber-500 bg-amber-500/10 shadow-xs"
                          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}
                    >
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {t.label}
                      </div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {t.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Target Virality Platforms
                </label>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-600 font-bold text-xs">
                        IG
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          Instagram Reels
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Primary Live Scraper Engine Enabled (24h automated telemetry)
                        </div>
                      </div>
                    </div>
                    <Check className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                  <Bell className="w-4 h-4 text-amber-500" />
                  Telemetry Alert Preferences
                </div>
                <div className="flex items-center justify-between py-2 border-t border-zinc-200 dark:border-zinc-800">
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                      Audio Velocity Spike Alerts
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Notify immediately when an audio surges &gt; 50 reels in 12 hours
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={alertsEnabled}
                    onChange={(e) => setAlertsEnabled(e.target.checked)}
                    className="h-4 w-4 rounded accent-amber-500"
                  />
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                  Setup Review
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div>Workspace: <strong className="text-zinc-900 dark:text-zinc-200">{workspaceName}</strong></div>
                  <div>Genre: <strong className="text-zinc-900 dark:text-zinc-200">{genre}</strong></div>
                  <div>Catalog Size: <strong className="text-zinc-900 dark:text-zinc-200">{catalogSize}</strong></div>
                  <div>Scale: <strong className="text-zinc-900 dark:text-zinc-200">{teamSize}</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (!workspaceName.trim()) {
                  setErrorMsg("Please provide a name for your workspace.");
                  return;
                }
                setErrorMsg(null);
                setStep((s) => s + 1);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Next Step
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving Setup...
                </>
              ) : (
                <>
                  Complete Setup
                  <Check className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;
