"use client";

import React, { useState, useEffect } from "react";

// Animated waveform bars & ambient music-themed SVG background
export function MusicWaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Deep subtle gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-[#09090b] to-black" />

      {/* Ambient glowing audio orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[130px] animate-pulse-slow" />
      <div
        className="absolute bottom-1/4 -right-32 w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[120px] animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-2/3 left-1/3 w-[350px] h-[350px] rounded-full bg-fuchsia-600/10 blur-[100px] animate-pulse-slow"
        style={{ animationDelay: "3.5s" }}
      />

      {/* Audio Wave SVG Line */}
      <svg
        className="absolute bottom-0 left-0 w-full opacity-20"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <path
          d="M0,120 C120,70 240,160 360,110 C480,60 600,150 720,105 C840,60 960,150 1080,105 C1200,60 1320,140 1440,110 L1440,220 L0,220 Z"
          fill="url(#waveGrad)"
        />
      </svg>

      {/* Animated Equalizer bars along the base */}
      <EqBars />

      {/* Floating Animated Music Note SVGs */}
      <FloatingNotes />

      {/* Tech Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(245,158,11,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

function EqBars() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const barCount = 36;
  const bars = Array.from({ length: barCount });

  return (
    <div
      suppressHydrationWarning
      className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1.5 h-36 px-6 opacity-25"
    >
      {bars.map((_, i) => {
        const baseH = Math.round(18 + Math.sin(i * 0.45) * 35 + ((i * 7) % 25));
        const duration = (0.7 + ((i * 3) % 7) * 0.15).toFixed(2);
        const delay = (((i * 11) % 15) * 0.08).toFixed(2);
        return (
          <div
            key={i}
            className="w-1.5 rounded-t-full origin-bottom"
            style={{
              height: `${baseH}px`,
              background: `linear-gradient(to top, #8b5cf6, #f59e0b)`,
              animation: `eqBar ${duration}s ease-in-out ${delay}s infinite alternate`,
            }}
          />
        );
      })}
    </div>
  );
}

function FloatingNotes() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const noteTypes = [
    // Treble clef
    <path
      key="0"
      d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
      fill="currentColor"
    />,
    // Double note
    <path
      key="1"
      d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
      fill="currentColor"
    />,
    // Beamed notes
    <path
      key="2"
      d="M21 3H9v10.18C8.36 12.45 7.24 12 6 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5v-6h8v4.18c-.64-.73-1.76-1.18-3-1.18-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5V3z"
      fill="currentColor"
    />,
  ];

  const items = Array.from({ length: 10 }, (_, i) => ({
    noteIndex: i % noteTypes.length,
    left: `${Math.round(8 + ((i * 9.5) % 86))}%`,
    delay: `${(i * 1.2).toFixed(1)}s`,
    duration: `${Math.round(9 + (i % 3) * 2.5)}s`,
    size: Math.round(16 + (i % 3) * 6),
    opacity: Number((0.12 + (i % 3) * 0.06).toFixed(2)),
  }));

  return (
    <div suppressHydrationWarning>
      {items.map((item, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute text-amber-400 select-none pointer-events-none"
          style={{
            left: item.left,
            bottom: "-40px",
            width: `${item.size}px`,
            height: `${item.size}px`,
            opacity: item.opacity,
            animation: `floatNote ${item.duration} linear ${item.delay} infinite`,
          }}
        >
          {noteTypes[item.noteIndex]}
        </svg>
      ))}
    </div>
  );
}

// Spinning Vinyl Record SVG with high-detail grooves & reflection
export function VinylRecord({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`animate-spin-slow ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="discGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="35%" stopColor="#09090b" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <radialGradient id="centerLabel" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>
      </defs>

      {/* Main black vinyl disk */}
      <circle cx="100" cy="100" r="96" fill="url(#discGrad)" stroke="#27272a" strokeWidth="2" />

      {/* Micro-grooves */}
      {[88, 80, 72, 64, 56, 48, 40].map((r) => (
        <circle
          key={r}
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="0.75"
        />
      ))}

      {/* Dynamic light reflection wedge */}
      <circle cx="100" cy="100" r="96" fill="url(#shine)" />

      {/* Center Record Label */}
      <circle cx="100" cy="100" r="32" fill="url(#centerLabel)" stroke="#fef3c7" strokeWidth="1" />
      <circle cx="100" cy="100" r="28" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />

      {/* Center Spindle Hole */}
      <circle cx="100" cy="100" r="6" fill="#09090b" stroke="#78350f" strokeWidth="1" />

      {/* Label Text */}
      <text
        x="100"
        y="94"
        textAnchor="middle"
        fill="#000000"
        fontWeight="bold"
        fontSize="5.5"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        REELS PULSE
      </text>
      <text
        x="100"
        y="110"
        textAnchor="middle"
        fill="#451a03"
        fontSize="4"
        fontFamily="monospace"
      >
        33 ⅓ RPM
      </text>
    </svg>
  );
}

// Sound wave mini visualizer SVG
export function SoundWaveSVG({ className = "" }: { className?: string }) {
  const bars = [10, 18, 28, 38, 26, 16, 34, 42, 32, 20, 30, 36, 24, 14, 8];
  return (
    <svg viewBox="0 0 120 44" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waveBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {bars.map((h, i) => (
        <rect
          key={i}
          x={4 + i * 7.6}
          y={(44 - h) / 2}
          width="4.5"
          height={h}
          rx="2.25"
          fill="url(#waveBarGrad)"
          style={{
            animation: `eqBar ${0.65 + (i % 5) * 0.12}s ease-in-out ${(i * 0.07) % 0.8}s infinite alternate`,
            transformOrigin: "center",
          }}
        />
      ))}
    </svg>
  );
}
