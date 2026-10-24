"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { CheckoutModal, PlanItem } from "@/components/pricing/checkout-modal";
import { FAQSection } from "@/components/sections/faq";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

const DEFAULT_PLANS: PlanItem[] = [
  {
    id: "free",
    name: "Free Starter",
    badge: "Emerging Artist",
    basePrice: 0,
    periodText: "Free forever",
    description: "Essential reel volume tracking for independent creators & emerging artists.",
    features: [
      "1 Tracked Song",
      "24-Hour Scan Heartbeat",
      "Total Reels & Play Counts",
      "Top 10 Tastemaker Creators",
      "Standard Priority Scraper Queue",
      "Email Milestone Alerts",
    ],
  },
  {
    id: "pro",
    name: "Creator Pro",
    badge: "Most Popular",
    basePrice: 1499,
    periodText: "for 30 days access",
    description: "High-frequency tracking and virality velocity alerts for rising artists and creators.",
    features: [
      "Up to 5 Tracked Songs",
      "12-Hour Scan Heartbeat",
      "24h Reels & Plays Velocity Radar",
      "Unlimited Creator Profile Inspector",
      "Instant WhatsApp & Email Alerts",
      "Priority Queue Dispatch Tier 1",
      "Boardroom Excel (.xlsx) Exports",
    ],
  },
  {
    id: "enterprise",
    name: "Label Enterprise",
    badge: "Maximum Quota",
    basePrice: 4999,
    periodText: "for 30 days access",
    description: "Maximum tracking throughput, dedicated workers, and boardroom dumps for labels.",
    features: [
      "Up to 25 Tracked Songs",
      "6-Hour High-Precision Heartbeat",
      "Dedicated Scraping Worker Capacity",
      "Multi-Track Comparative Velocity",
      "Influencer Outreach Message Generator",
      "Sponsor & Artist Portal Access",
      "VIP Dedicated Support SLA",
    ],
  },
];

export function PricingView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [plans, setPlans] = useState<PlanItem[]>(DEFAULT_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(DEFAULT_PLANS[1]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // User auth state: guest | sandbox | expired | active
  const [authStatus, setAuthStatus] = useState<"guest" | "sandbox" | "expired" | "active">("guest");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Check auth and subscription state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token =
      localStorage.getItem("rp_auth_token") ||
      localStorage.getItem("reelspulse_token");

    if (!token) {
      setAuthStatus("guest");
      return;
    }

    fetch(API_ENDPOINTS.me, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((userData) => {
        setCurrentUser(userData);
        const statusRaw = (userData.subscription_status || userData.status || "").toLowerCase();
        const planName = (userData.plan?.name || userData.plan_name || "").toLowerCase();

        const isExpired =
          statusRaw === "expired" ||
          statusRaw === "past_due" ||
          statusRaw === "canceled" ||
          (userData.current_period_end && new Date(userData.current_period_end).getTime() < Date.now());

        if (isExpired) {
          setAuthStatus("expired");
        } else if (statusRaw === "active" && !planName.includes("free") && planName !== "") {
          setAuthStatus("active");
        } else {
          setAuthStatus("sandbox");
        }
      })
      .catch(() => {
        setAuthStatus("guest");
      });
  }, []);

  // Listen for redirected checkout params (e.g. from signup/login)
  useEffect(() => {
    const planParam = searchParams.get("plan");
    const checkoutParam = searchParams.get("checkout");

    if (planParam && plans.length > 0) {
      const target = plans.find(
        (p) =>
          p.id.toLowerCase() === planParam.toLowerCase() ||
          p.name.toLowerCase().includes(planParam.toLowerCase())
      );
      if (target) {
        setSelectedPlan(target);
        const hasToken =
          typeof window !== "undefined" &&
          Boolean(localStorage.getItem("rp_auth_token") || localStorage.getItem("reelspulse_token"));
        if (checkoutParam === "true" || hasToken) {
          setIsModalOpen(true);
        }
      }
    }
  }, [searchParams, plans]);

  // Load public plans from API
  useEffect(() => {
    let isMounted = true;
    fetch(API_ENDPOINTS.publicPlans)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load plans");
        return res.json();
      })
      .then((data: any[]) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: PlanItem[] = data.map((p) => {
            const upper = (p.plan_name || "").toUpperCase();
            const badge =
              typeof p.features?.badge === "string"
                ? p.features.badge
                : upper.includes("PRO")
                ? "Most Popular"
                : upper.includes("ENTERPRISE")
                ? "Maximum Quota"
                : "Emerging Artist";

            const periodText =
              p.billing_cycle === "yearly"
                ? "billed annually (365 days)"
                : p.price === 0
                ? "Free forever"
                : "for 30 days access";

            const songFeature = `Up to ${p.max_tracked_songs || 1} Tracked Song${(p.max_tracked_songs || 1) > 1 ? "s" : ""}`;
            const syncFeature = `${p.sync_interval_hours || 24}-Hour Scan Heartbeat`;

            return {
              id: p.id || p.tier || p.plan_name,
              name: p.plan_name,
              badge,
              basePrice: p.price || p.price_inr || 0,
              periodText,
              description:
                typeof p.features?.description === "string"
                  ? p.features.description
                  : upper.includes("PRO")
                  ? "High-frequency tracking and virality velocity alerts for rising artists and creators."
                  : upper.includes("ENTERPRISE")
                  ? "Maximum tracking throughput, dedicated workers, and boardroom dumps for labels."
                  : "Essential reel volume tracking for independent creators & emerging artists.",
              features: Array.isArray(p.features?.list)
                ? (p.features.list as string[])
                : [
                    songFeature,
                    syncFeature,
                    "Total Reels & Play Counts",
                    upper.includes("PRO") || upper.includes("ENTERPRISE")
                      ? "24h Reels & Plays Velocity Radar"
                      : "Top 10 Tastemaker Creators",
                    upper.includes("ENTERPRISE")
                      ? "Dedicated Scraping Worker Capacity"
                      : "Priority Queue Dispatch",
                    upper.includes("PRO") || upper.includes("ENTERPRISE")
                      ? "Boardroom Excel (.xlsx) Exports"
                      : "Email Milestone Alerts",
                  ],
            };
          });
          setPlans(mapped);
          setSelectedPlan(mapped.find((p) => p.name.toLowerCase().includes("pro")) || mapped[1] || mapped[0]);
        }
      })
      .catch(() => {
        // Fallback silently to DEFAULT_PLANS
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePlanAction = (plan: PlanItem) => {
    setSelectedPlan(plan);
    const hasToken =
      typeof window !== "undefined" &&
      Boolean(localStorage.getItem("rp_auth_token") || localStorage.getItem("reelspulse_token"));

    // If user is guest/new user, redirect directly to register with return checkout URL
    if (!hasToken || authStatus === "guest") {
      const returnUrl = `/pricing?plan=${encodeURIComponent(plan.id)}&checkout=true`;
      router.push(`/signup?plan=${encodeURIComponent(plan.id)}&redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // If user is already authenticated (sandbox, expired, or active upgrade), open modal directly
    setIsModalOpen(true);
  };

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen pt-12 pb-24 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 opacity-[0.07] blur-[120px] pointer-events-none" />
        <div className="absolute top-80 right-1/4 w-80 h-80 rounded-full bg-rose-500/10 opacity-[0.05] blur-[100px] pointer-events-none" />

        {/* Status banner for logged-in users */}
        {authStatus === "expired" && (
          <div className="max-w-3xl mx-auto mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4 text-xs sm:text-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-medium">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Your subscription pass has expired. Activate a 30-day pass below to resume live telemetry scraping.</span>
            </div>
            <button
              onClick={() => handlePlanAction(plans[1] || plans[0])}
              className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shrink-0 cursor-pointer"
            >
              Renew Pass
            </button>
          </div>
        )}

        {authStatus === "active" && (
          <div className="max-w-3xl mx-auto mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 text-xs sm:text-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>
                Your workspace is currently active on{" "}
                <strong className="text-emerald-700 dark:text-emerald-300">
                  {currentUser?.plan?.name || "Active Tier"}
                </strong>
                . You can upgrade or add tracks below.
              </span>
            </div>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shrink-0 cursor-pointer"
            >
              Dashboard →
            </Link>
          </div>
        )}

        {/* Hero Header */}
        <div className="relative text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Zero Lock-In Passes
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-zinc-950 dark:text-zinc-50">
            Zero Lock-In.{" "}
            <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-rose-500 bg-clip-text text-transparent">
              Pure Music Intelligence.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            30-day and multi-song passes for artists, managers, and labels to track real-time Instagram Reels virality, velocity spikes, and tastemaker creators. Zero auto-debit surprises.
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan) => {
            const isPro = plan.name.toLowerCase().includes("pro");
            const isEnterprise = plan.name.toLowerCase().includes("enterprise");

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300",
                  "border bg-white dark:bg-zinc-900/80 backdrop-blur-xl shadow-xl",
                  isPro
                    ? "border-amber-500 ring-2 ring-amber-500/30 shadow-amber-500/10 md:-translate-y-2 z-10"
                    : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className={cn(
                        "px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase font-mono shadow-md",
                        isPro
                          ? "bg-gradient-to-r from-amber-500 to-amber-400 text-zinc-950"
                          : "bg-zinc-800 text-zinc-200 border border-zinc-700"
                      )}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Plan Name & Desc */}
                  <div className="mb-6">
                    <h3 className="text-xl font-extrabold text-zinc-950 dark:text-zinc-50">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 min-h-[34px] leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8 pb-6 border-b border-slate-100 dark:border-zinc-800/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-zinc-50">
                        {plan.basePrice === 0 ? "₹0" : `₹${plan.basePrice.toLocaleString("en-IN")}`}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        / {plan.periodText}
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mb-8">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                      Included Capabilities
                    </span>
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                            isPro
                              ? "bg-amber-500/20 text-amber-500"
                              : "bg-slate-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                          )}
                        >
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to action button */}
                <button
                  onClick={() => handlePlanAction(plan)}
                  className={cn(
                    "w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md",
                    isPro
                      ? "bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-400/25 active:scale-[0.98]"
                      : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white active:scale-[0.98]"
                  )}
                >
                  <span>
                    {authStatus === "guest"
                      ? plan.basePrice === 0
                        ? "Get Started Free"
                        : `Activate ${plan.name}`
                      : plan.basePrice === 0
                      ? "Switch to Free"
                      : `Upgrade to ${plan.name}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Pricing FAQs Section */}
        <div className="mt-24 pt-12 border-t border-slate-200 dark:border-zinc-800">
          <FAQSection
            category="pricing"
            eyebrow="PRICING & PASS FAQ"
            title="Everything You Need to Know About Billing."
            subtitle={
              <span>
                Zero hidden fees or surprise auto-renewals. Need a custom song catalog quote?{" "}
                <a href="/contact" className="text-amber-500 hover:underline font-semibold">
                  Talk to enterprise sales →
                </a>
              </span>
            }
          />
        </div>
      </main>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedPlan={selectedPlan}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 px-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 flex items-center justify-center bg-transparent shrink-0">
              <Image
                src="/reels.png"
                alt="ReelsPulse Logo"
                width={32}
                height={32}
                className="object-contain w-full h-full"
              />
            </div>
            <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">RhythmSync</span>
            <span>&bull; Real-time Instagram Reels audio intelligence</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-200">Home</Link>
            <Link href="/pricing" className="text-amber-500">Pricing</Link>
            <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-200">Contact</Link>
            <Link href="/login" className="hover:text-zinc-900 dark:hover:text-zinc-200">Sign in</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
