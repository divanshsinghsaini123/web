"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center opacity-60",
          className
        )}
      />
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to daylight mode" : "Switch to obsidian dark mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={cn(
        "group relative flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-150 active:scale-95 shadow-xs shrink-0 cursor-pointer",
        "border-zinc-200 bg-white text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 hover:border-zinc-300",
        "dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800 dark:hover:border-zinc-700",
        className
      )}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-amber-600 group-hover:-rotate-12 transition-transform duration-200" />
      )}
    </button>
  );
}

export default ThemeToggle;
