"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from "next/image";
import {
  ArrowRight,
  ChevronDown,
  BarChart2,
  Users,
  FileSpreadsheet,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

export function Navbar() {
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFeaturesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <nav className="h-16 sm:h-17 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-6 sm:px-8 max-w-7xl w-full mx-auto flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Brand (Prominent & Bold) */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative h-10 w-10 sm:h-11 sm:w-11 flex items-center justify-center bg-transparent shrink-0">
          <Image
            src="/reels.png"
            alt="ReelsPulse Logo"
            width={48}
            height={48}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform drop-shadow-sm"
            priority
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-zinc-950 dark:text-zinc-50 leading-none">
              RhythmSync
            </span>
            <span className="rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950 text-[10px] font-black px-1.5 py-0.5 tracking-wider uppercase shadow-xs">
              AI
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold mt-0.5">
            Reels Pulse
          </span>
        </div>
      </Link>

      {/* Nav Links (Enlarged, Minimal with Features Dropdown) */}
      <div className="hidden md:flex items-center gap-8 lg:gap-10 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
        {/* Features Dropdown */}
        <div
          ref={dropdownRef}
          className="relative"
          onMouseEnter={() => setFeaturesOpen(true)}
          onMouseLeave={() => setFeaturesOpen(false)}
        >
          <button
            type="button"
            onClick={() => setFeaturesOpen(!featuresOpen)}
            className="flex items-center gap-1.5 hover:text-amber-500 dark:hover:text-amber-400 transition-colors py-2 cursor-pointer focus:outline-hidden"
          >
            <span>Features</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                featuresOpen ? "rotate-180 text-amber-500" : ""
              }`}
            />
          </button>

          {featuresOpen && (
            <div className="absolute top-full left-0 w-80 pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 shadow-2xl backdrop-blur-xl">
                <Link
                  href="/#roles"
                  onClick={() => setFeaturesOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                      Sponsor &amp; Manager Portal
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                      Share live telemetry &amp; schedule scans
                    </span>
                  </div>
                </Link>

                <Link
                  href="/#compare"
                  onClick={() => setFeaturesOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                    <BarChart2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                      Track Velocity Comparison
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                      Benchmark multi-track reels creation speed
                    </span>
                  </div>
                </Link>

                <Link
                  href="/#creators"
                  onClick={() => setFeaturesOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                      Sound Tastemakers
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                      Top influencers driving audio trends
                    </span>
                  </div>
                </Link>

                <Link
                  href="/#outreach"
                  onClick={() => setFeaturesOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <MessageCircle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                      1-Click Influencer Outreach
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                      Instant DM & WhatsApp collaboration pitch
                    </span>
                  </div>
                </Link>

                <Link
                  href="/#reports"
                  onClick={() => setFeaturesOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                    <FileSpreadsheet className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                      Automated Reports
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                      WhatsApp VIP alerts &amp; Excel dumps
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>

        <Link href="/pricing" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
          Pricing
        </Link>
        <Link href="/contact" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
          Contact
        </Link>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link
          href="/login"
          className="text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:text-amber-500 dark:hover:text-amber-400 px-3.5 py-2 transition-colors cursor-pointer"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="flex items-center gap-2 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-zinc-950 px-5 sm:px-6 py-2.5 text-sm font-bold shadow-md shadow-amber-400/20 transition-all cursor-pointer"
        >
          <span>Track 1 Song Free</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </nav>
  );
}
