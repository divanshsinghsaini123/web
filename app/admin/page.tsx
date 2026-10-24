"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Building2,
  Users,
  Music2,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  Tag,
  FileText,
  Clock,
  PlayCircle,
  Check
} from "lucide-react";
import { api, User } from "@/lib/api";
import { UniversalLoader } from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/dashboard/PageHeader";

export default function AdminControlPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs: "tenants" | "plans" | "coupons" | "invoices" | "rhythmsync" | "logs"
  const [activeTab, setActiveTab] = useState<"tenants" | "plans" | "coupons" | "invoices" | "rhythmsync" | "logs">("tenants");
  const [search, setSearch] = useState("");

  // Drawer / Override state
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [overrideTier, setOverrideTier] = useState("Creator Pro");
  const [overrideLoading, setOverrideLoading] = useState(false);

  // Coupon Creation state
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newDiscount, setNewDiscount] = useState(50);
  const [newMaxUses, setNewMaxUses] = useState(100);
  const [couponActionLoading, setCouponActionLoading] = useState(false);
  const [couponNotice, setCouponNotice] = useState("");

  // RhythmSync trigger state
  const [syncTriggerLoading, setSyncTriggerLoading] = useState(false);
  const [syncTriggerNotice, setSyncTriggerNotice] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      const user = await api.getMe();
      if (!user?.is_superadmin) {
        alert("Access Denied: Superadmin privileges required.");
        router.replace("/dashboard");
        return;
      }
      setCurrentUser(user);

      const [over, ten, pl, lg, cp, inv] = await Promise.all([
        api.getAdminOverview().catch(() => null),
        api.getAdminTenants().catch(() => []),
        api.getAdminPlans().catch(() => []),
        api.getAdminLogs().catch(() => []),
        api.getAdminCoupons().catch(() => []),
        api.getAdminInvoices().catch(() => []),
      ]);

      setOverview(over);
      setTenants(ten || []);
      setPlans(pl || []);
      setLogs(lg || []);
      setCoupons(cp || []);
      setInvoices(inv || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleOverridePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTenant) return;
    setOverrideLoading(true);
    try {
      await api.overrideTenantPlan(selectedTenant.id, overrideTier);
      setSelectedTenant(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update tenant plan");
    } finally {
      setOverrideLoading(false);
    }
  }

  async function handleToggleStatus(tenantId: string) {
    try {
      await api.toggleTenantStatus(tenantId);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  }

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    setCouponActionLoading(true);
    setCouponNotice("");
    try {
      await api.createAdminCoupon(newCouponCode, newDiscount, newMaxUses);
      setCouponNotice(`Coupon ${newCouponCode.toUpperCase()} created successfully!`);
      setNewCouponCode("");
      const updatedCoupons = await api.getAdminCoupons();
      setCoupons(updatedCoupons);
    } catch (err: any) {
      setCouponNotice(err.message || "Failed to create coupon");
    } finally {
      setCouponActionLoading(false);
    }
  }

  async function handleTriggerAllSync() {
    setSyncTriggerLoading(true);
    setSyncTriggerNotice("");
    try {
      const res = await api.triggerAdminSync();
      setSyncTriggerNotice(res.message || "Sync jobs successfully pushed to Redis queue!");
      await loadData();
    } catch (err: any) {
      setSyncTriggerNotice(err.message || "Trigger failed");
    } finally {
      setSyncTriggerLoading(false);
    }
  }

  if (loading) {
    return <UniversalLoader fullScreen label="Loading Real-Time Fleet Telemetry..." />;
  }

  const filteredTenants = tenants.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      (t.tier && t.tier.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Unified PageHeader */}
      <PageHeader
        title="Tenants & Users Directory"
        description="Active workspace tenants, member roles, and quota allocations."
        icon={<Building2 className="w-5 h-5 text-zinc-950" />}
        iconVariant="amber"
        badge={
          <span className="rounded-md bg-amber-400 text-zinc-950 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
            FLEET LIVE
          </span>
        }
        actions={
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
            <span>Refresh Fleet</span>
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Tenants</span>
            <Building2 className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-2">
            {overview?.total_tenants ?? 0}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Active workspaces</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Total Users</span>
            <Users className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-2">
            {overview?.total_users ?? 0}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Artists & managers</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Tracked Audios</span>
            <Music2 className="h-4 w-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-2">
            {overview?.total_tracks ?? 0}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Audio stems in database</p>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider">Scraper Errors</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-500 mt-2">
            {overview?.total_scraper_errors ?? 0}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Instagram fail logs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-6">
        <button
          onClick={() => setActiveTab("tenants")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "tenants"
              ? "bg-amber-400 text-zinc-950 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Tenant Fleet ({tenants.length})
        </button>
        <button
          onClick={() => setActiveTab("coupons")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "coupons"
              ? "bg-amber-400 text-zinc-950 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Coupons & Discounts ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "invoices"
              ? "bg-amber-400 text-zinc-950 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Platform Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab("rhythmsync")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "rhythmsync"
              ? "bg-amber-400 text-zinc-950 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          RhythmSync Engine
        </button>
        <button
          onClick={() => setActiveTab("plans")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "plans"
              ? "bg-amber-400 text-zinc-950 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Subscription Tiers ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "logs"
              ? "bg-amber-400 text-zinc-950 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          Scraper Failure Logs ({logs.length})
        </button>
      </div>

      {/* Tab 1: Tenants */}
      {activeTab === "tenants" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search workspace name, slug, or tier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4 font-medium">Tenant</th>
                  <th className="py-3 px-4 font-medium">Slug</th>
                  <th className="py-3 px-4 font-medium">Active Tier</th>
                  <th className="py-3 px-4 font-medium">Tracks Active</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {t.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-500">{t.slug}</td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20 px-2 py-0.5 text-[10px] font-bold">
                        {t.tier || "Free Starter"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{t.tracks_count ?? 0}</td>
                    <td className="py-3 px-4">
                      {t.is_active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-[11px]">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 font-semibold text-[11px]">
                          <XCircle className="h-3 w-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedTenant(t)}
                        className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-amber-400 hover:text-zinc-950 font-medium transition-colors"
                      >
                        Override Plan
                      </button>
                      <button
                        onClick={() => handleToggleStatus(t.id)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                          t.is_active
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                            : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                        }`}
                      >
                        {t.is_active ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Coupons */}
      {activeTab === "coupons" && (
        <div className="space-y-6">
          {/* Create Coupon Card */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] p-6 shadow-2xs">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-1">
              <Tag className="h-4 w-4 text-amber-500" />
              Generate Marketing Promo Coupon
            </h2>
            <p className="text-xs text-zinc-500 mb-4">
              Create discount promo codes for artist campaigns and distribution partnerships
            </p>

            <form onSubmit={handleCreateCoupon} className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIPARTIST"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2 text-xs font-mono uppercase focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Discount %</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  required
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(parseInt(e.target.value) || 0)}
                  className="w-24 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Max Redemptions</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newMaxUses}
                  onChange={(e) => setNewMaxUses(parseInt(e.target.value) || 1)}
                  className="w-28 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={couponActionLoading}
                className="rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-4 py-2 text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                {couponActionLoading && <RotateCw className="h-3.5 w-3.5 animate-spin" />}
                Create Coupon
              </button>
            </form>

            {couponNotice && (
              <p className="mt-3 text-xs font-medium text-emerald-500">{couponNotice}</p>
            )}
          </div>

          {/* Coupons Table */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4 font-medium">Code</th>
                  <th className="py-3 px-4 font-medium">Discount</th>
                  <th className="py-3 px-4 font-medium">Usage</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    <td className="py-3 px-4 font-mono font-bold text-amber-500">{c.code}</td>
                    <td className="py-3 px-4 font-semibold">{c.discount_percent}% OFF</td>
                    <td className="py-3 px-4 font-mono text-zinc-500">
                      {c.times_used} / {c.max_uses}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 text-[10px] font-bold">
                        {c.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Invoices */}
      {activeTab === "invoices" && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-medium">Invoice #</th>
                <th className="py-3 px-4 font-medium">Tenant ID</th>
                <th className="py-3 px-4 font-medium">Amount (INR)</th>
                <th className="py-3 px-4 font-medium">Reason</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    No platform invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    <td className="py-3 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400 truncate max-w-[150px]">
                      {inv.tenant_id}
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      ₹{inv.amount_inr?.toLocaleString() || "0"}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      {inv.billing_reason || "Subscription"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 text-[10px] font-bold">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {inv.created_at ? new Date(inv.created_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: RhythmSync Control */}
      {activeTab === "rhythmsync" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    RhythmSync Automated Cadence Engine
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 mt-1 max-w-xl">
                  Background scraper loops continuously query due audio tracks according to their plan tier:
                  Free Starter (24h loop), Creator Pro (12h loop), Label Enterprise (2h loop).
                </p>
              </div>

              <button
                onClick={handleTriggerAllSync}
                disabled={syncTriggerLoading}
                className="rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-5 py-2.5 text-xs shadow-xs transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                {syncTriggerLoading ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
                Trigger Full Fleet Sync Now
              </button>
            </div>

            {syncTriggerNotice && (
              <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs font-semibold text-amber-600 dark:text-amber-400">
                {syncTriggerNotice}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] p-5">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">Tier 1: Free Starter</span>
              <p className="text-xl font-bold mt-1 text-zinc-800 dark:text-zinc-200">24-Hour Cycle</p>
              <p className="text-xs text-zinc-500 mt-1">1 Track per artist &bull; Standard scrape queue</p>
            </div>
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-500">Tier 2: Creator Pro</span>
              <p className="text-xl font-bold mt-1 text-amber-500">12-Hour Cycle</p>
              <p className="text-xs text-zinc-500 mt-1">5 Tracks per artist &bull; 2x cadence acceleration</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] p-5">
              <span className="text-[10px] font-mono uppercase font-bold text-zinc-400">Tier 3: Label Enterprise</span>
              <p className="text-xl font-bold mt-1 text-zinc-800 dark:text-zinc-200">2-Hour Cycle</p>
              <p className="text-xs text-zinc-500 mt-1">25 Tracks catalogue &bull; Real-time virality detection</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Plans */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] p-6 shadow-2xs"
            >
              <span className="text-xs font-mono font-bold uppercase text-amber-500">
                {p.tier}
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                {p.name}
              </h3>
              <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 my-2">
                ₹{p.price_inr.toLocaleString()}
                <span className="text-xs text-zinc-500 font-normal ml-1">/ month</span>
              </div>
              <ul className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400 mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <li>• Max Tracked Songs: <strong>{p.max_tracked_songs}</strong></li>
                <li>• RhythmSync Interval: <strong>{p.sync_interval_hours} Hours</strong></li>
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6: Logs */}
      {activeTab === "logs" && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">Audio ID</th>
                <th className="py-3 px-4 font-medium">Error Code</th>
                <th className="py-3 px-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-500">
                    No scraper failure logs reported. Clean operation!
                  </td>
                </tr>
              ) : (
                logs.map((lg) => (
                  <tr key={lg.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    <td className="py-3 px-4 font-mono text-zinc-400">
                      {new Date(lg.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {lg.audio_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-500">{lg.error_code}</td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 max-w-md truncate">
                      {lg.error_message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer: Override Plan */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xl">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Override Subscription Tier
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Manually upgrade or downgrade <strong>{selectedTenant.name}</strong> without billing gateway friction.
            </p>

            <form onSubmit={handleOverridePlan} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Select Target Tier
                </label>
                <select
                  value={overrideTier}
                  onChange={(e) => setOverrideTier(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="Free Starter">Free Starter (1 Song / 24h sync)</option>
                  <option value="Creator Pro">Creator Pro (5 Songs / 12h sync)</option>
                  <option value="Label Enterprise">Label Enterprise (25 Songs / 2h sync)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTenant(null)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={overrideLoading}
                  className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {overrideLoading && <RotateCw className="h-3.5 w-3.5 animate-spin" />}
                  Confirm Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
