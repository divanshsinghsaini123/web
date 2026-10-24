"use client";

import React from "react";
import Link from "next/link";
import { Plus, Radio } from "lucide-react";
import { User } from "@/lib/api";

interface HeaderProps {
  user: User | null;
  onOpenTrackModal?: () => void;
}

export function Header({ onOpenTrackModal }: HeaderProps) {
  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-800 dark:text-zinc-200 font-semibold">Scraper Engine</span>
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <span>Redis Queue Active</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onOpenTrackModal ? (
          <button
            onClick={onOpenTrackModal}
            className="flex items-center gap-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Track New Audio
          </button>
        ) : (
          <Link
            href="/dashboard/tracks"
            className="flex items-center gap-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3.5 py-1.5 text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Track New Audio
          </Link>
        )}
      </div>
    </header>
  );
}
