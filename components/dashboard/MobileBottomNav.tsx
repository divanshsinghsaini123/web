"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Video, FileSpreadsheet, Bell, Menu } from "lucide-react";

interface MobileBottomNavProps {
  onOpenMenu: () => void;
  isMenuOpen: boolean;
}

export function MobileBottomNav({ onOpenMenu, isMenuOpen }: MobileBottomNavProps) {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: "/dashboard", icon: LayoutGrid, exact: true },
    { name: "Reels", href: "/dashboard/reels", icon: Video },
    { name: "Reports", href: "/dashboard/reports", icon: FileSpreadsheet },
    { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="md:hidden fixed bottom-3 inset-x-3 z-40 max-w-md mx-auto bg-white/80 dark:bg-zinc-950/85 backdrop-blur-3xl border border-zinc-200/80 dark:border-white/10 rounded-2xl px-2 py-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.2),0_1px_1px_rgba(255,255,255,0.06)] transition-all"
    >
      <div className="grid grid-cols-5 items-center justify-items-center">
        {tabs.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname?.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 w-full py-1 rounded-xl transition-all select-none active:scale-95 ${
                isActive
                  ? "text-zinc-950 dark:text-white font-bold"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium"
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                  isActive
                    ? "bg-zinc-900/10 dark:bg-white/15 text-zinc-950 dark:text-white shadow-2xs"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] font-sans tracking-tight leading-none">
                {tab.name}
              </span>
            </Link>
          );
        })}

        {/* More / Menu Drawer Toggle */}
        <button
          onClick={onOpenMenu}
          className={`flex flex-col items-center justify-center gap-1 w-full py-1 rounded-xl transition-all select-none active:scale-95 cursor-pointer ${
            isMenuOpen
              ? "text-zinc-950 dark:text-white font-bold"
              : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium"
          }`}
        >
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
              isMenuOpen
                ? "bg-zinc-900/10 dark:bg-white/15 text-zinc-950 dark:text-white shadow-2xs"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            <Menu className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-sans tracking-tight leading-none">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
