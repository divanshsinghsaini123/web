"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Plus,
  RotateCw,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Edit2,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Zap,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS, getAuthHeaders } from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";

export interface PlanItem {
  id: string;
  plan_name: string;
  tier: string;
  price: number;
  billing_cycle: string;
  max_daily_scans: number;
  included_extra_scans: number;
  max_daily_hard_cap: number;
  max_tracked_songs: number;
  scan_queue_priority: number;
  allowed_platforms: string[];
  is_active: boolean;
  created_at?: string;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [planName, setPlanName] = useState("");
  const [price, setPrice] = useState<number>(1499);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [maxDailyScans, setMaxDailyScans] = useState<number>(100);
  const [includedExtraScans, setIncludedExtraScans] = useState<number>(25);
  const [maxDailyHardCap, setMaxDailyHardCap] = useState<number>(150);
  const [maxTrackedSongs, setMaxTrackedSongs] = useState<number>(5);
  const [scanQueuePriority, setScanQueuePriority] = useState<number>(2);
  const [isActive, setIsActive] = useState<boolean>(true);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.adminPlans, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error("Failed to load plans", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlanId(null);
    setPlanName("");
    setPrice(1499);
    setBillingCycle("monthly");
    setMaxDailyScans(100);
    setIncludedExtraScans(25);
    setMaxDailyHardCap(150);
    setMaxTrackedSongs(5);
    setScanQueuePriority(2);
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: PlanItem) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.plan_name);
    setPrice(plan.price);
    setBillingCycle(plan.billing_cycle || "monthly");
    setMaxDailyScans(plan.max_daily_scans ?? 0);
    setIncludedExtraScans(plan.included_extra_scans ?? 0);
    setMaxDailyHardCap(plan.max_daily_hard_cap ?? 0);
    setMaxTrackedSongs(plan.max_tracked_songs ?? 1);
    setScanQueuePriority(plan.scan_queue_priority || 1);
    setIsActive(plan.is_active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) {
      setFormError("Plan name is required");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      plan_name: planName.trim(),
      price: Number(price),
      billing_cycle: billingCycle,
      max_daily_scans: Number(maxDailyScans),
      included_extra_scans: Number(includedExtraScans),
      max_daily_hard_cap: Number(maxDailyHardCap),
      max_tracks: Number(maxTrackedSongs),
      max_tracked_songs: Number(maxTrackedSongs),
      scan_queue_priority: Number(scanQueuePriority),
      allowed_platforms: ["instagram"],
      is_active: isActive,
    };

    try {
      const url = editingPlanId
        ? `${API_ENDPOINTS.adminPlans}/${editingPlanId}`
        : API_ENDPOINTS.adminPlans;
      const method = editingPlanId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to save subscription plan.");
      }

      await fetchPlans();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save plan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (planId: string) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.adminPlans}/${planId}/toggle`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        setPlans((prev) =>
          prev.map((p) => (p.id === planId ? { ...p, is_active: !p.is_active } : p))
        );
      }
    } catch (err) {
      console.error("Failed to toggle plan status", err);
    }
  };

  const filteredPlans = plans.filter((p) =>
    p.plan_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans Manager"
        description="Configure subscription quotas: daily automated scans, extra bonus scans, and safety hard caps."
        icon={<CreditCard className="w-5 h-5 text-zinc-950" />}
        iconVariant="amber"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPlans}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 transition cursor-pointer"
            >
              <RotateCw className={cn("w-3.5 h-3.5", loading && "animate-spin text-amber-500")} />
              Refresh
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Plan
            </button>
          </div>
        }
      />

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plans by name..."
            className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div className="text-xs font-mono text-zinc-400">
          Total Plans: <strong className="text-zinc-100">{plans.length}</strong>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredPlans.map((p) => (
          <div
            key={p.id}
            className={cn(
              "rounded-2xl border bg-zinc-950/80 p-5 flex flex-col justify-between transition-all",
              p.is_active
                ? "border-zinc-800 hover:border-zinc-700"
                : "border-zinc-900 opacity-60"
            )}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                <span className="text-sm font-bold text-zinc-100 tracking-tight">
                  {p.plan_name}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleActive(p.id)}
                  title={p.is_active ? "Deactivate plan" : "Activate plan"}
                  className="cursor-pointer"
                >
                  {p.is_active ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                      <XCircle className="w-3 h-3" /> INACTIVE
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-mono font-extrabold text-zinc-100">
                  ₹{Number(p.price).toLocaleString()}
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  /{p.billing_cycle === "yearly" ? "yr" : p.billing_cycle === "half_yearly" ? "6mo" : p.billing_cycle === "quarterly" ? "quarterly" : p.billing_cycle === "unlimited" ? "unlimited" : "monthly"}
                </span>
              </div>

              {/* Quota Telemetry Specifications */}
              <div className="mt-4 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Duration:</span>
                  <span className="text-amber-400 font-bold capitalize">
                    {p.billing_cycle === "yearly"
                      ? "Yearly (365d)"
                      : p.billing_cycle === "half_yearly"
                      ? "Half-Yearly (180d)"
                      : p.billing_cycle === "quarterly"
                      ? "Quarterly (90d)"
                      : p.billing_cycle === "unlimited"
                      ? "Unlimited (No Expiry)"
                      : "Monthly (30d)"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Daily Scans:</span>
                  <span className="text-amber-400 font-bold">{p.max_daily_scans} / day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Extra Bonus Scans:</span>
                  <span className="text-emerald-400 font-bold">+{p.included_extra_scans} pool</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Daily Hard Cap:</span>
                  <span className="text-rose-400 font-bold">{p.max_daily_hard_cap} max</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Tracked Songs:</span>
                  <span className="text-zinc-200 font-bold">{p.max_tracked_songs} tracks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Redis Priority:</span>
                  <span className="text-zinc-200 font-bold">Tier {p.scan_queue_priority}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-zinc-900 flex justify-end">
              <button
                onClick={() => openEditModal(p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-xs text-zinc-300 hover:text-zinc-100 transition cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-amber-500" />
                Edit Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0c0d0e] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100">
                  {editingPlanId ? "Edit Subscription Plan" : "Create New Subscription Plan"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g. Creator Pro"
                    className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Price (INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Duration / Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="monthly">Monthly (30 Days)</option>
                    <option value="quarterly">Quarterly (90 Days)</option>
                    <option value="half_yearly">Half-Yearly (180 Days)</option>
                    <option value="yearly">Yearly (365 Days)</option>
                    <option value="unlimited">Unlimited (Lifetime)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Daily Scans
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={maxDailyScans}
                    onChange={(e) => setMaxDailyScans(Number(e.target.value))}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Extra Bonus Scans
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={includedExtraScans}
                    onChange={(e) => setIncludedExtraScans(Number(e.target.value))}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Daily Hard Cap
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={maxDailyHardCap}
                    onChange={(e) => setMaxDailyHardCap(Number(e.target.value))}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Tracked Audio Stems
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={maxTrackedSongs}
                    onChange={(e) => setMaxTrackedSongs(Number(e.target.value))}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Redis Queue Priority
                  </label>
                  <select
                    value={scanQueuePriority}
                    onChange={(e) => setScanQueuePriority(Number(e.target.value))}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value={1}>Tier 1 (Normal)</option>
                    <option value={2}>Tier 2 (High / Creator)</option>
                    <option value={3}>Tier 3 (Urgent / Enterprise)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded accent-amber-500 h-4 w-4"
                />
                <label htmlFor="isActiveToggle" className="text-xs text-zinc-300 font-medium">
                  Plan is Active and Purchasable
                </label>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
