"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";

export type HeaderIconVariant = "emerald" | "amber" | "indigo" | "sky" | "violet" | "rose" | "zinc";

export function HeaderSolidIcon({
  icon,
  variant = "amber",
  className,
}: {
  icon: React.ReactNode;
  variant?: HeaderIconVariant;
  className?: string;
}) {
  const variantStyles: Record<HeaderIconVariant, string> = {
    amber: "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50",
    emerald: "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-500/50",
    indigo: "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-500/50",
    sky: "bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-1 ring-sky-500/50",
    violet: "bg-violet-600 text-white shadow-md shadow-violet-600/30 ring-1 ring-violet-500/50",
    rose: "bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-1 ring-rose-500/50",
    zinc: "bg-zinc-800 text-white shadow-md shadow-zinc-900/30 ring-1 ring-zinc-700",
  };

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform select-none",
        variantStyles[variant] || variantStyles.amber,
        className
      )}
    >
      {icon}
    </div>
  );
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  iconVariant?: HeaderIconVariant;
  hideThemeToggle?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  badge,
  icon,
  iconVariant = "amber",
  hideThemeToggle = false,
  className,
}: PageHeaderProps) {
  const renderedIcon = icon ? (
    <HeaderSolidIcon icon={icon} variant={iconVariant} />
  ) : null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5",
        className
      )}
    >
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-3">
          {renderedIcon}
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
            {title}
          </h1>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
        {actions}
        {!hideThemeToggle && <ThemeToggle />}
      </div>
    </div>
  );
}

export default PageHeader;
