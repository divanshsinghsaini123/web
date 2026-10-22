"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldAlert,
  Building2,
  Tag,
  CreditCard,
  Layers,
  ArrowLeft,
  RotateCw,
  LogOut,
  Sparkles,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { api, User } from "@/lib/api";
import { UniversalLoader } from "@/components/ui/LoadingSpinner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySuperAdmin() {
      try {
        setLoading(true);
        const user = await api.getMe();
        if (!user) {
          router.replace("/login?redirect=" + encodeURIComponent(pathname));
          return;
        }

        const isSuperAdmin = Boolean(user.is_superadmin || user.role === "superadmin");
        if (!isSuperAdmin) {
          alert("Access Denied: Superadmin privileges required.");
          router.replace("/dashboard");
          return;
        }

        setCurrentUser(user);
      } catch (err) {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    verifySuperAdmin();
  }, [router, pathname]);

  if (loading) {
    return <UniversalLoader fullScreen label="Authenticating Superadmin Console..." />;
  }

  const navItems = [
    {
      label: "Tenants & Users",
      href: "/admin",
      icon: Building2,
      exact: true,
    },
    {
      label: "Plans Manager",
      href: "/admin/plans",
      icon: CreditCard,
      exact: false,
    },
    {
      label: "Coupons & Promos",
      href: "/admin/coupons",
      icon: Tag,
      exact: false,
    },
    {
      label: "Landing FAQs",
      href: "/admin/faqs",
      icon: Sparkles,
      exact: false,
    },
    {
      label: "Public Inquiries",
      href: "/admin/inquiries",
      icon: Layers,
      exact: false,
    },
    {
      label: "Support Tickets",
      href: "/admin/tickets",
      icon: ShieldAlert,
      exact: false,
    },
    {
      label: "Scan Job Runs",
      href: "/admin/scans",
      icon: Activity,
      exact: false,
    },
    {
      label: "Scraper Failure Logs",
      href: "/admin/logs",
      icon: AlertTriangle,
      exact: false,
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#09090b] text-zinc-100 flex flex-col md:flex-row font-sans">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 h-screen border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950/80 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Logo & Superadmin Badge */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="relative h-8 w-8">
                <Image src="/reels.png" alt="RhythmSync" width={32} height={32} className="object-contain" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-zinc-100">RhythmSync</span>
            </Link>
            <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-sm bg-rose-500/20 text-rose-400 border border-rose-500/40">
              Admin
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Superadmin Console</span>
            </div>
            <p className="text-[11px] font-semibold text-zinc-200 truncate">
              {currentUser?.email}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition ${
                    isActive
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-zinc-800 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Studio</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto h-screen overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
