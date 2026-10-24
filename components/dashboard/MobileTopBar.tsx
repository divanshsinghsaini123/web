"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { User } from "@/lib/api";
import { Zap, Menu } from "lucide-react";

interface MobileTopBarProps {
  user: User | null;
  onOpenMenu: () => void;
}

export function MobileTopBar({ user, onOpenMenu }: MobileTopBarProps) {
  const workspaceName = user?.tenant_name || user?.tenant?.name || "RhythmSync";
  const planName = user?.plan?.tier || user?.tenant?.plan_name || "Free Starter";

  return (
    <header className="md:hidden sticky top-0 z-30 shrink-0 w-full min-h-14 bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-2xl border-b border-zinc-200/80 dark:border-zinc-800/80 px-3.5 h-14 flex items-center justify-between transition-colors shadow-xs">
      <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0 group py-1">
        <div className="flex items-center justify-center shrink-0">
          <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-xs group-active:scale-95 transition-transform">
            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">R</span>
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-zinc-950 dark:text-zinc-50 truncate font-sans tracking-tight">
              {workspaceName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-mono font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase truncate">
              {planName.toUpperCase().includes("PASS") ? planName.toUpperCase() : `${planName.toUpperCase()} PASS`}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex items-center gap-1.5 shrink-0">
        <ThemeToggle className="w-8 h-8 rounded-xl" />
        <button
          onClick={onOpenMenu}
          aria-label="Open navigation drawer"
          className="w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-2xs"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
