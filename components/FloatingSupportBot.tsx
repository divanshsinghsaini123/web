"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headset, ArrowUpRight } from "lucide-react";

export function FloatingSupportBot() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("rp_auth_token") ||
        localStorage.getItem("reelspulse_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("reelspulse_user");
      setIsLoggedIn(Boolean(token));
    }
  }, [pathname]);

  const targetHref = isLoggedIn ? "/dashboard/support" : "/contact";
  const isActive = isLoggedIn
    ? pathname === "/dashboard/support"
    : pathname === "/contact";

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden md:flex items-center gap-3">
      {/* Tooltip on hover */}
      <div
        className={`pointer-events-none hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-950/90 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-800 text-xs font-medium text-zinc-200 shadow-xl transition-all duration-200 transform select-none ${
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        }`}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
        <span>{isLoggedIn ? "Support & Helpdesk" : "Contact Us"}</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
      </div>

      {/* Floating Support Button */}
      <Link
        href={targetHref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={isLoggedIn ? "Support Hub" : "Contact Us"}
        className={`group relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-2xl shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700/80 dark:border-zinc-700/80 ${
          isActive ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-background" : ""
        }`}
      >
        {/* Headset Icon */}
        <Headset className="w-6 h-6 text-zinc-200 transition-transform duration-200 group-hover:scale-110" />

        {/* Clean Static Status Dot */}
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 dark:border-zinc-900" />
      </Link>
    </div>
  );
}
