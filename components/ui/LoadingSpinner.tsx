"use client";

import React from "react";
import { VinylRecord, SoundWaveSVG, MusicWaveBackground } from "@/components/auth/music-visuals";

interface UniversalLoaderProps {
  label?: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function UniversalLoader({
  label = "Loading telemetry...",
  className = "",
  size = "md",
  fullScreen = false,
}: UniversalLoaderProps) {
  const sizeMap = {
    xs: "w-6 h-6",
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  if (size === "xs") {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <VinylRecord className={sizeMap.xs} />
        {label && <span className="text-xs font-mono text-zinc-400">{label}</span>}
      </div>
    );
  }

  // Exact Black Screen Audio Visualizer Loader
  if (fullScreen) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b] text-zinc-100 overflow-hidden select-none ${className}`}>
        <MusicWaveBackground />
        
        {/* Corner Ambient Vinyl */}
        <div className="hidden lg:block absolute -bottom-16 -left-16 w-64 h-64 opacity-20 pointer-events-none z-10">
          <VinylRecord className="w-full h-full" />
        </div>

        {/* Center Visualizer & Label */}
        <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
          <div className="absolute w-40 h-40 rounded-full bg-violet-600/25 blur-3xl animate-pulse pointer-events-none" />
          <div className="relative z-10 drop-shadow-2xl">
            <VinylRecord className={sizeMap[size] || "w-20 h-20"} />
          </div>
          <div className="relative z-10 mt-3 flex items-center justify-center">
            <SoundWaveSVG className="w-20 h-6 opacity-80" />
          </div>
          {label && (
            <div className="relative z-10 mt-3">
              <span className="text-xs font-mono font-medium tracking-wider uppercase text-amber-400/90 animate-pulse">
                {label}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center justify-center p-8 select-none text-center ${className}`}>
      {/* Ambient glowing orb backdrop */}
      <div className="absolute w-32 h-32 rounded-full bg-violet-600/20 blur-2xl animate-pulse pointer-events-none" />

      {/* Spinning Vinyl Record */}
      <div className="relative z-10 drop-shadow-2xl">
        <VinylRecord className={sizeMap[size]} />
      </div>

      {/* Mini equalizer sound wave */}
      <div className="relative z-10 mt-3 flex items-center justify-center">
        <SoundWaveSVG className="w-20 h-6 opacity-80" />
      </div>

      {/* Animated Label */}
      {label && (
        <div className="relative z-10 mt-2">
          <span className="text-xs font-mono font-medium tracking-wider uppercase text-amber-400/90 animate-pulse">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

// Compact inline button vinyl loader
export function ButtonLoader({ className = "w-4 h-4" }: { className?: string }) {
  return <VinylRecord className={`shrink-0 ${className}`} />;
}
