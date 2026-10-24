"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Music2,
  Video,
  Radio,
  Users,
  CreditCard,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Network,
  Clock,
  TrendingUp,
  Award,
  BellRing,
  FileSpreadsheet,
  Headset,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api, User } from "@/lib/api";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";

interface SidebarProps {
  user: User | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

interface NavSection {
  title: string;
  badge?: string;
  items: NavItem[];
}

export function Sidebar({ user, collapsed: controlledCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed((prev) => !prev));

  const workspaceName = user?.tenant_name || user?.tenant?.name || "RhythmSync Workspace";
  const planName = user?.plan?.tier || user?.tenant?.plan_name || "Free Starter";

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Fallback local cleanup
      localStorage.clear();
      sessionStorage.clear();
    }
    router.replace("/login");
  };

  const userRole = (user?.role || "OWNER").toUpperCase();
  const isViewer = userRole === "VIEWER" || userRole === "COLLABORATOR" || userRole === "SPONSOR";
  const isManager = userRole === "MANAGER";
  const isAdminOrOwner = userRole === "ADMIN" || userRole === "OWNER";

  const workspaceItems: NavItem[] = [];
  if (!isViewer) {
    workspaceItems.push({ name: "Team & Access", href: "/dashboard/team", icon: Users });
  }
  if (isAdminOrOwner) {
    workspaceItems.push({ name: "Billing & Plans", href: "/dashboard/billing", icon: CreditCard });
  }
  if (!isViewer) {
    workspaceItems.push({ name: "Settings", href: "/dashboard/settings", icon: Settings });
  }
  workspaceItems.push({ name: "Support Hub", href: "/dashboard/support", icon: Headset });

  const sections: NavSection[] = [
    {
      title: "INSIGHTS",
      badge: "ANALYTICS",
      items: [
        { name: "Overview", href: "/dashboard", icon: Activity, exact: true },
        { name: "Reels Explorer", href: "/dashboard/reels", icon: Video },
        { name: "Historical Velocity", href: "/dashboard/historical", icon: TrendingUp },
        { name: "Top Creators Radar", href: "/dashboard/creators", icon: Award },
      ],
    },
    {
      title: "SCAN AUTOMATION",
      badge: "LIVE",
      items: [
        { name: "Tracks & Schedules", href: "/dashboard/tracks", icon: Clock },
      ],
    },
    {
      title: "REPORTS & AUTOMATION",
      badge: "EXPORTS",
      items: [
        { name: "Report Generator", href: "/dashboard/reports", icon: FileSpreadsheet },
        { name: "Automation & Alerts", href: "/dashboard/alerts", icon: BellRing },
      ],
    },
  ];

  if (workspaceItems.length > 0) {
    sections.push({
      title: "WORKSPACE",
      badge: isViewer ? "VIEWER" : isManager ? "MANAGER" : "ACCOUNT",
      items: workspaceItems,
    });
  }

  if (user?.is_superadmin) {
    sections.push({
      title: "SUPER ADMIN",
      badge: "PORTAL",
      items: [
        { name: "Admin Portal", href: "/admin", icon: ShieldAlert },
      ],
    });
  }

  const userInitial = (user?.full_name || user?.email || "U")[0].toUpperCase();
  const userName = user?.full_name || user?.email?.split("@")[0] || "Account";

  return (
    <aside
      className={cn(
        "relative flex flex-col shrink-0 bg-zinc-50 border-r border-zinc-200 dark:bg-[#09090b] dark:border-zinc-800 transition-all duration-200 z-30 select-none h-screen",
        collapsed ? "w-16" : "w-68"
      )}
    >
      {/* 1. Header: Monogram + Workspace Meta + Collapse Toggle (TOP OF SIDEBAR) */}
      <div className="shrink-0">
        <div className="h-15 flex items-center justify-between px-3.5 border-b border-zinc-200 dark:border-zinc-800/80">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 overflow-hidden transition-opacity hover:opacity-85",
              collapsed && "justify-center w-full"
            )}
          >
            {/* Hex-Square Monogram */}
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">R</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 max-w-[150px]">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate font-sans tracking-tight" title={workspaceName}>
                  {workspaceName}
                </span>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-medium tracking-wider uppercase truncate">
                  {planName.toUpperCase().includes("PASS") ? planName.toUpperCase() : `${planName.toUpperCase()} PASS`}
                </span>
              </div>
            )}
          </Link>

          {!collapsed && (
            <button
              onClick={toggleCollapse}
              aria-label="Collapse sidebar"
              className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-900 border border-transparent dark:hover:border-zinc-800 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center py-2 border-b border-zinc-200 dark:border-zinc-800/80">
            <button
              onClick={toggleCollapse}
              aria-label="Expand sidebar"
              className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Categorized Scrollable Navigation */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none py-3 px-3 space-y-4">
        {sections.map((section, idx) => (
          <div
            key={section.title}
            className={cn(
              "space-y-1",
              idx !== 0 && "pt-3 border-t border-zinc-200 dark:border-zinc-800/60"
            )}
          >
            {/* Category Header */}
            {!collapsed ? (
              <div className="px-2 mb-2 flex items-center justify-between">
                <h4 className="text-[10px] font-mono font-semibold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
                  {section.title}
                </h4>
                {section.badge && (
                  <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 font-medium px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-900/80 border border-zinc-300/80 dark:border-zinc-800">
                    {section.badge}
                  </span>
                )}
              </div>
            ) : (
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2 mx-1" />
            )}

            {/* Navigation Items */}
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "group relative flex items-center rounded-lg transition-all",
                      collapsed
                        ? "justify-center px-0 py-2.5 mx-auto"
                        : "gap-2.5 px-2.5 py-2 text-[13px] font-sans",
                      isActive
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-white dark:bg-amber-500/[0.12] dark:border-amber-500/35 font-semibold shadow-xs"
                        : "border border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/70 hover:border-zinc-300/50 dark:hover:border-zinc-800/60 font-medium"
                    )}
                  >
                    {isActive && !collapsed && (
                      <span className="w-1.5 h-3.5 rounded-full bg-amber-500 dark:bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    )}

                    <Icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200"
                      )}
                    />

                    {!collapsed && (
                      <span className="truncate leading-none tracking-tight">
                        {item.name}
                      </span>
                    )}

                    {isActive && !collapsed && (
                      <span className="ml-auto relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* 3. Footer: User Avatar / Status + ThemeToggle + Logout (BOTTOM OF SIDEBAR) */}
      <div className="shrink-0 p-3 pb-6 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/80 dark:bg-[#09090b]/90 backdrop-blur-sm">
        <div
          className={cn(
            "rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 p-2 flex items-center shadow-xs",
            collapsed ? "justify-center p-1.5" : "justify-between"
          )}
        >
          {!collapsed ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0 pr-1 flex-1 max-w-[130px]">
                <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                  {userInitial}
                </div>
                <div className="truncate min-w-0">
                  <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200 truncate leading-tight font-sans" title={userName}>
                    {userName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Connected
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <ThemeToggle className="w-7 h-7" />
                <button
                  onClick={handleLogout}
                  title="Logout from workspace"
                  className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono text-xs font-bold" title={userName}>
                {userInitial}
              </div>
              <ThemeToggle className="w-7 h-7" />
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-1 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
