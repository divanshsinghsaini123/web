"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant?: "default" | "success" | "warning" | "amber";
  };
  trend?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
}: StatCardProps) {
  const badgeColors = {
    default: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    amber: "bg-amber-400/15 text-amber-600 dark:text-amber-400 border-amber-400/30",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 shadow-2xs backdrop-blur-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 p-2 text-zinc-700 dark:text-zinc-300">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
          {value}
        </span>
        {badge && (
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
              badgeColors[badge.variant || "default"]
            )}
          >
            {badge.text}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      )}
    </div>
  );
}
