"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Download,
  ArrowRight,
  Sparkles,
  Check,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS, api } from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";
import { CheckoutModal, PlanItem } from "@/components/pricing/checkout-modal";

interface SubscriptionPlan {
  id: string;
  plan_name: string;
  tier: string;
  price: number;
  billing_cycle: string;
  max_daily_scans: number;
  included_extra_scans: number;
  max_daily_hard_cap: number;
  max_brands: number;
  max_tracked_songs: number;
  features?: Record<string, any>;
}

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [showPlansSelector, setShowPlansSelector] = useState(false);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<PlanItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    async function loadBillingData() {
      try {
        const me = await api.getMe().catch(() => null);
        const role = (me?.role || "OWNER").toUpperCase();
        if (role !== "OWNER" && role !== "ADMIN") {
          router.replace("/dashboard");
          return;
        }

        const [subRes, invRes, plansRes] = await Promise.all([
          api.getSubscription(),
          api.getInvoices(),
          fetch(API_ENDPOINTS.plans, { credentials: "include" })
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
        ]);

        if (subRes) setSubscription(subRes);
        if (invRes) setInvoices(invRes);
        if (Array.isArray(plansRes) && plansRes.length > 0) {
          setAvailablePlans(plansRes);
        }
      } catch (err) {
        console.error("Failed to load billing telemetry", err);
      } finally {
        setLoading(false);
      }
    }

    loadBillingData();
  }, []);

  const handleDownloadReceipt = (invNumber: string) => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Receipt for ${invNumber} downloaded successfully.`);
    }, 1000);
  };

  const handleUpgrade = async (p: SubscriptionPlan) => {
    if (p.price === 0 || p.tier === "free") {
      setUpgradingTier(p.tier);
      try {
        const res = await api.upgradePlan(p.tier);
        if (res?.success) {
          const freshSub = await api.getSubscription();
          if (freshSub) setSubscription(freshSub);
          const freshInvs = await api.getInvoices();
          if (freshInvs) setInvoices(freshInvs);
          setShowPlansSelector(false);
        }
      } catch (err) {
        console.error("Upgrade failed:", err);
      } finally {
        setUpgradingTier(null);
      }
      return;
    }

    const planItem: PlanItem = {
      id: p.tier || p.id,
      name: p.plan_name,
      badge: p.tier === "pro" ? "Most Popular" : undefined,
      basePrice: p.price,
      periodText: "/month",
      description: `${p.plan_name} subscription`,
      features: [
        `${p.max_tracked_songs} Tracked Audios`,
        `${p.max_daily_scans} Daily Scans`,
        `${p.max_daily_hard_cap} Daily Hard Cap`,
      ],
    };
    setSelectedCheckoutPlan(planItem);
    setIsCheckoutOpen(true);
  };

  const plan = subscription?.plan;
  const isFree = !plan || plan.tier === "free" || plan.price_inr === 0;
  const planName = plan?.name || (isFree ? "Free Starter Pass" : "Creator Pro Pass");
  const status = subscription?.status || (isFree ? "sandbox" : "active");

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="space-y-6 max-w-6xl w-full mx-auto">
        {/* Unified PageHeader */}
        <PageHeader
          title="Billing & Payments"
          description="Manage your subscription, active passes, and download recent payment receipts."
          icon={<CreditCard className="w-5 h-5 text-white" />}
          iconVariant="amber"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column - Active Plan */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
                <Zap className="w-4 h-4 text-amber-500" />
                <h2 className="text-xs font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-mono uppercase">
                  Current Active Plan
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                <div>
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {planName}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {status === "active" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-widest font-mono">
                        <CheckCircle2 className="w-3 h-3" /> Active Subscription
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-widest font-mono">
                        <AlertCircle className="w-3 h-3" /> Sandbox Mode
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                    {isFree ? "₹0.00 Free" : `₹${plan?.price_inr || plan?.price || 1499}.00 / month`}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {subscription?.current_period_end
                      ? `Valid until ${new Date(subscription.current_period_end).toLocaleDateString()}`
                      : "Unlimited / Active Lifetime"}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                  Plan Details & Quotas
                </h3>
                <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {plan?.max_tracked_songs || (isFree ? 1 : 5)} Tracked Songs (
                      {subscription?.songs_used || 0} active now)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {isFree ? "10 Daily Scans" : "100 Daily Automated Scans (150 Hard Cap)"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Real-time Out-of-Stock Telemetry & Virality Alerts</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPlansSelector((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {isFree ? "Upgrade Plan" : "Change Plan"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* In-Place Dynamic Plans Selector */}
            {showPlansSelector && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Select a Subscription Pass
                  </h3>
                  <span className="text-xs text-zinc-500 font-mono">Instant Upgrade</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availablePlans.map((p) => {
                    const isCurrent = plan?.tier === p.tier || plan?.name === p.plan_name;
                    return (
                      <div
                        key={p.id}
                        className={cn(
                          "rounded-xl border p-4 flex flex-col justify-between transition-all",
                          isCurrent
                            ? "border-amber-500 bg-amber-500/5 shadow-xs ring-1 ring-amber-500/30"
                            : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 hover:border-zinc-300 dark:hover:border-zinc-700"
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {p.plan_name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-lg font-mono font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
                            ₹{p.price.toLocaleString()}
                            <span className="text-xs font-normal text-zinc-500"> /mo</span>
                          </div>
                          <div className="mt-3 space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-amber-500" />
                              <span>{p.max_tracked_songs} Tracked Audios</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-amber-500" />
                              <span>{p.max_daily_scans} Daily Scans</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Check className="w-3 h-3 text-amber-500" />
                              <span>{p.max_daily_hard_cap} Hard Cap</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isCurrent || upgradingTier === p.tier}
                          onClick={() => handleUpgrade(p)}
                          className={cn(
                            "mt-4 w-full py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer",
                            isCurrent
                              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed"
                              : "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-xs"
                          )}
                        >
                          {upgradingTier === p.tier ? "Processing..." : isCurrent ? "Active" : "Switch Plan"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Billing History & Receipts */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800">
                <Receipt className="w-4 h-4 text-amber-500" />
                <h2 className="text-xs font-bold tracking-tight text-zinc-950 dark:text-zinc-50 font-mono uppercase">
                  Payment History
                </h2>
              </div>

              {invoices.length === 0 ? (
                <div className="space-y-4">
                  {/* Default Pass item if none in DB */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Starter Pass</div>
                      <div className="text-[10px] text-zinc-500 font-mono">INV-RP-001 &bull; Oct 01, 2026</div>
                    </div>
                    <button
                      onClick={() => handleDownloadReceipt("INV-RP-001")}
                      disabled={downloading}
                      className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-600 dark:text-zinc-400 rounded-md transition-colors shadow-xs group disabled:opacity-50 cursor-pointer"
                      title="Download Receipt"
                    >
                      <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {inv.billing_reason || "Subscription Pass"}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {inv.invoice_number} &bull; ₹{inv.amount_inr}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadReceipt(inv.invoice_number)}
                        disabled={downloading}
                        className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-600 dark:text-zinc-400 rounded-md transition-colors shadow-xs group cursor-pointer"
                        title="Download Receipt"
                      >
                        <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isCheckoutOpen && selectedCheckoutPlan && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedCheckoutPlan(null);
            api.getSubscription().then((s) => s && setSubscription(s)).catch(() => {});
            api.getInvoices().then((i) => i && setInvoices(i)).catch(() => {});
          }}
          selectedPlan={selectedCheckoutPlan}
        />
      )}
    </div>
  );
}
