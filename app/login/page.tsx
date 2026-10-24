"use client";

import React, { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { MusicWaveBackground, VinylRecord } from "@/components/auth/music-visuals";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UniversalLoader } from "@/components/ui/LoadingSpinner";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center px-4 py-12 overflow-hidden selection:bg-amber-400/30">
      {/* Background Music Waveform & Floating SVG Notes */}
      <MusicWaveBackground />

      {/* Top Controls */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient Vinyl Accent in Corner */}
      <div className="hidden lg:block absolute -bottom-16 -left-16 w-64 h-64 opacity-20 pointer-events-none z-10">
        <VinylRecord className="w-full h-full" />
      </div>

      {/* Main Auth Container */}
      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={<UniversalLoader size="sm" label="Loading studio..." />}>
          <AuthCard initialMode="signin" />
        </Suspense>
      </div>
    </div>
  );
}
