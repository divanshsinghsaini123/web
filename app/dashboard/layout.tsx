"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { OnboardingModal } from "@/components/dashboard/OnboardingModal";
import { api, User } from "@/lib/api";
import { UniversalLoader } from "@/components/ui/LoadingSpinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadUser() {
      // 1. Immediately hydrate from stored user to prevent blank screen
      const stored = typeof window !== "undefined" ? localStorage.getItem("reelspulse_user") : null;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && !isCancelled) {
            setUser(parsed);
            setLoading(false);
          }
        } catch {
          // ignore
        }
      }

      // 2. Fetch fresh user context from FastAPI backend (via cookie or header)
      try {
        const fresh = await api.getMe();
        if (isCancelled) return;

        if (!fresh) {
          // If neither stored user nor fresh user exists, clear and redirect to login
          if (!stored) {
            localStorage.clear();
            document.cookie = "rp_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "rp_is_superadmin=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            window.location.replace("/login");
            return;
          }
        } else {
          setUser(fresh);
          localStorage.setItem("reelspulse_user", JSON.stringify(fresh));
          if (fresh.tenant && fresh.tenant.is_onboarded === false) {
            setIsOnboardingOpen(true);
          }
        }
      } catch (err) {
        console.error("Dashboard user load error:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  const handleOnboardingComplete = (updatedTenant: any) => {
    setIsOnboardingOpen(false);
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        tenant_name: updatedTenant.name || updatedTenant.company_name,
        tenant: {
          ...prev.tenant,
          ...updatedTenant,
          is_onboarded: true,
        },
      };
    });
  };

  if (loading && !user) {
    return <UniversalLoader fullScreen label="Authenticating workspace..." />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#fdfdfd] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-y-auto min-w-0">
        <main className="flex-1 p-3 sm:p-5 w-full min-w-0">
          {children}
        </main>
      </div>

      {/* Workspace Setup Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
        initialTenant={user?.tenant}
      />
    </div>
  );
}
