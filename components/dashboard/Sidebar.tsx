"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Video,
  Users,
  CreditCard,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Award,
  BellRing,
  FileSpreadsheet,
  Headset,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api, User } from "@/lib/api";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";

interface SidebarProps {
  user: User | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface ItemColor {
  icon: string;
  bg: string;
  border: string;
  activeBorder: string;
  activeBg: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  color: ItemColor;
}

interface NavSection {
  title: string;
  badge?: {
    label: string;
    className: string;
    isLive?: boolean;
  };
  items: NavItem[];
}

export function Sidebar({
  user,
  collapsed: controlledCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
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
      localStorage.clear();
      sessionStorage.clear();
    }
    router.replace("/login");
  };

  const userRole = (user?.role || "OWNER").toUpperCase();
  const isViewer = userRole === "VIEWER" || userRole === "COLLABORATOR" || userRole === "SPONSOR";
  const isAdminOrOwner = userRole === "ADMIN" || userRole === "OWNER";

  const workspaceItems: NavItem[] = [];
  if (!isViewer) {
    workspaceItems.push({
      name: "Team & Access",
      href: "/dashboard/team",
      icon: Users,
      color: {
        icon: "text-blue-500 dark:text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        activeBorder: "border-blue-500/40",
        activeBg: "bg-blue-500/15",
      },
    });
  }
  if (isAdminOrOwner) {
    workspaceItems.push({
      name: "Billing & Plans",
      href: "/dashboard/billing",
      icon: CreditCard,
      color: {
        icon: "text-amber-500 dark:text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        activeBorder: "border-amber-500/40",
        activeBg: "bg-amber-500/15",
      },
    });
  }
  if (!isViewer) {
    workspaceItems.push({
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      color: {
        icon: "text-zinc-400 dark:text-zinc-400",
        bg: "bg-zinc-500/10",
        border: "border-zinc-500/20",
        activeBorder: "border-zinc-500/40",
        activeBg: "bg-zinc-500/15",
      },
    });
  }
  workspaceItems.push({
    name: "Support Hub",
    href: "/dashboard/support",
    icon: Headset,
    color: {
      icon: "text-teal-500 dark:text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20",
      activeBorder: "border-teal-500/40",
      activeBg: "bg-teal-500/15",
    },
  });

  const sections: NavSection[] = [
    {
      title: "INSIGHTS",
      badge: {
        label: "ANALYTICS",
        className: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
      },
      items: [
        {
          name: "Overview",
          href: "/dashboard",
          icon: Activity,
          exact: true,
          color: {
            icon: "text-amber-500 dark:text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            activeBorder: "border-amber-500/40",
            activeBg: "bg-amber-500/15",
          },
        },
        {
          name: "Reels Explorer",
          href: "/dashboard/reels",
          icon: Video,
          color: {
            icon: "text-rose-500 dark:text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
            activeBorder: "border-rose-500/40",
            activeBg: "bg-rose-500/15",
          },
        },
        {
          name: "Historical Velocity",
          href: "/dashboard/historical",
          icon: TrendingUp,
          color: {
            icon: "text-indigo-500 dark:text-indigo-400",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20",
            activeBorder: "border-indigo-500/40",
            activeBg: "bg-indigo-500/15",
          },
        },
        {
          name: "Top Creators Radar",
          href: "/dashboard/creators",
          icon: Award,
          color: {
            icon: "text-cyan-500 dark:text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20",
            activeBorder: "border-cyan-500/40",
            activeBg: "bg-cyan-500/15",
          },
        },
      ],
    },
    {
      title: "SCAN AUTOMATION",
      badge: {
        label: "LIVE",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        isLive: true,
      },
      items: [
        {
          name: "Tracks & Schedules",
          href: "/dashboard/schedules",
          icon: Clock,
          color: {
            icon: "text-sky-500 dark:text-sky-400",
            bg: "bg-sky-500/10",
            border: "border-sky-500/20",
            activeBorder: "border-sky-500/40",
            activeBg: "bg-sky-500/15",
          },
        },
      ],
    },
    {
      title: "REPORTS & AUTOMATION",
      badge: {
        label: "EXPORTS",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      },
      items: [
        {
          name: "Report Generator",
          href: "/dashboard/reports",
          icon: FileSpreadsheet,
          color: {
            icon: "text-emerald-500 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            activeBorder: "border-emerald-500/40",
            activeBg: "bg-emerald-500/15",
          },
        },
        {
          name: "Automation & Alerts",
          href: "/dashboard/alerts",
          icon: BellRing,
          color: {
            icon: "text-fuchsia-500 dark:text-fuchsia-400",
            bg: "bg-fuchsia-500/10",
            border: "border-fuchsia-500/20",
            activeBorder: "border-fuchsia-500/40",
            activeBg: "bg-fuchsia-500/15",
          },
        },
      ],
    },
    {
      title: "WORKSPACE",
      badge: {
        label: "ACCOUNT",
        className: "bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20",
      },
      items: workspaceItems,
    },
  ];

  if (user?.is_superadmin) {
    sections.push({
      title: "SUPER ADMIN",
      badge: {
        label: "PORTAL",
        className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      },
      items: [
        {
          name: "Admin Portal",
          href: "/admin",
          icon: ShieldAlert,
          color: {
            icon: "text-rose-500 dark:text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
            activeBorder: "border-rose-500/40",
            activeBg: "bg-rose-500/15",
          },
        },
      ],
    });
  }

  const userInitial = (user?.full_name || user?.email || "U")[0].toUpperCase();
  const userName = user?.full_name || user?.email?.split("@")[0] || "Account";

  const renderContent = (isMobileDrawer = false) => {
    const isCollapsed = isMobileDrawer ? false : collapsed;

    return (
      <div className="flex flex-col h-full select-none bg-zinc-50/50 dark:bg-[#09090b]">
        {/* 1. Header: Monogram + Workspace Meta + Collapse/Close */}
        <div className="shrink-0 p-3 pb-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/dashboard"
              onClick={() => isMobileDrawer && onCloseMobile?.()}
              className={cn(
                "flex items-center gap-2.5 min-w-0 p-1.5 rounded-xl transition-all group",
                isCollapsed
                  ? "justify-center w-full p-0"
                  : "flex-1 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/60"
              )}
            >
              {/* Premium Monogram Icon */}
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-zinc-950 flex items-center justify-center shrink-0 font-mono font-black text-sm shadow-md shadow-amber-500/25 ring-2 ring-amber-400/20 transition-transform group-hover:scale-105">
                R
              </div>

              {!isCollapsed && (
                <div className="flex flex-col min-w-0 pr-1">
                  <span
                    className="text-xs font-bold text-zinc-950 dark:text-zinc-50 truncate tracking-tight font-sans leading-tight"
                    title={workspaceName}
                  >
                    {workspaceName}
                  </span>
                  <div className="inline-flex items-center gap-1 mt-0.5">
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 text-[9px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider leading-none">
                      <Sparkles className="w-2.5 h-2.5 fill-current shrink-0" />
                      <span>{planName.toUpperCase().replace(" PASS", "")} PASS</span>
                    </span>
                  </div>
                </div>
              )}
            </Link>

            {/* Collapse toggle / Mobile close */}
            {isMobileDrawer ? (
              <button
                onClick={onCloseMobile}
                aria-label="Close drawer"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : !isCollapsed ? (
              <button
                onClick={toggleCollapse}
                aria-label="Collapse sidebar"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {!isMobileDrawer && isCollapsed && (
            <div className="flex justify-center pt-2">
              <button
                onClick={toggleCollapse}
                aria-label="Expand sidebar"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 2. Categorized Scrollable Navigation */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none p-3 space-y-4">
          {sections.map((section, idx) => (
            <div
              key={section.title}
              className={cn(
                "space-y-1",
                idx !== 0 && "pt-3 border-t border-zinc-200/70 dark:border-zinc-800/60"
              )}
            >
              {!isCollapsed ? (
                <div className="px-2 mb-1.5 flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                    {section.title}
                  </h4>
                  {section.badge && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border tracking-wider uppercase",
                        section.badge.className
                      )}
                    >
                      {section.badge.isLive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                      <span>{section.badge.label}</span>
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-px bg-zinc-200 dark:border-zinc-800 my-2 mx-1" />
              )}

              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname?.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => isMobileDrawer && onCloseMobile?.()}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer",
                      isCollapsed
                        ? "justify-center h-10 w-10 mx-auto p-0"
                        : "px-2.5 py-2 w-full",
                      isActive
                        ? "bg-zinc-200/70 dark:bg-zinc-800/80 text-zinc-950 dark:text-white font-bold border border-zinc-300/80 dark:border-zinc-700/80 shadow-xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-200/40 dark:hover:bg-zinc-900/60 border border-transparent font-medium"
                    )}
                  >
                    {/* Active Left Indicator Bar */}
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    )}

                    {/* Rich Chromatic Icon Box */}
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-200",
                        isActive
                          ? cn(item.color.activeBg, item.color.activeBorder, "shadow-xs scale-105")
                          : cn(
                              item.color.bg,
                              item.color.border,
                              "group-hover:scale-105 group-hover:brightness-110"
                            )
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 transition-transform duration-200 group-hover:scale-110",
                          item.color.icon
                        )}
                      />
                    </div>

                    {!isCollapsed && (
                      <span className="truncate font-sans font-semibold text-sm tracking-tight">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* 3. Footer: User profile + Theme Toggle + Logout */}
        <div className="shrink-0 p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/70 dark:bg-zinc-950/60 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            {!isCollapsed ? (
              <>
                <div className="flex items-center gap-2.5 min-w-0 pr-1 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 via-amber-400/15 to-violet-500/15 border border-amber-500/35 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono text-xs font-black shrink-0 shadow-2xs">
                    {userInitial}
                  </div>
                  <div className="truncate min-w-0">
                    <p
                      className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate leading-tight font-sans"
                      title={userName}
                    >
                      {userName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">
                        CONNECTED
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <ThemeToggle className="w-7 h-7" />
                  <button
                    onClick={handleLogout}
                    title="Logout from workspace"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shrink-0 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 w-full">
                <div
                  className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 via-amber-400/15 to-violet-500/15 border border-amber-500/35 text-amber-600 dark:text-amber-400 flex items-center justify-center font-mono text-xs font-black shadow-2xs"
                  title={userName}
                >
                  {userInitial}
                </div>
                <ThemeToggle className="w-7 h-7" />
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:flex relative flex-col shrink-0 bg-zinc-50/80 border-r border-zinc-200/80 dark:bg-[#09090b] dark:border-zinc-800/80 transition-all duration-200 z-30 h-screen",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-out Off-canvas Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Drawer container */}
          <div className="relative w-72 max-w-[85vw] bg-zinc-50 dark:bg-[#09090b] border-r border-zinc-200 dark:border-zinc-800 shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-left duration-200">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
