"use client";

import React, { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Percent,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Copy,
  Check,
  Clock,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { UniversalLoader } from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/dashboard/PageHeader";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New coupon form state
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(50);
  const [maxUses, setMaxUses] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function loadCoupons() {
    try {
      setLoading(true);
      const data = await api.getAdminCoupons();
      setCoupons(data || []);
    } catch (err) {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setNotice({ type: "error", text: "Please provide a coupon code." });
      return;
    }

    setIsSubmitting(true);
    setNotice(null);

    try {
      await api.createAdminCoupon(code.trim().toUpperCase(), Number(discountPercent), Number(maxUses));
      setNotice({
        type: "success",
        text: `Coupon code '${code.trim().toUpperCase()}' created successfully!`,
      });
      setCode("");
      await loadCoupons();
    } catch (err: any) {
      setNotice({
        type: "error",
        text: err.message || "Failed to create coupon code.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const copyCode = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopiedCode(c);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  if (loading) {
    return <UniversalLoader fullScreen label="Loading Real Coupons from Database..." />;
  }

  return (
    <div className="space-y-8">
      {/* Unified PageHeader */}
      <PageHeader
        title="Coupons & Promos"
        description="Create promotional coupon codes and track usage statistics."
        icon={<Tag className="w-5 h-5 text-zinc-950" />}
        iconVariant="amber"
        actions={
          <button
            onClick={loadCoupons}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh Coupons</span>
          </button>
        }
      />

      {/* Create New Coupon Form */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-zinc-100">Create New Promo Code</h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Instant Database Write</span>
        </div>

        {notice && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              notice.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
        )}

        <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-zinc-300">Coupon Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. VIRAL50 or LAUNCH2026"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2.5 text-xs font-mono font-bold text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-hidden uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Discount (%)</label>
            <input
              type="number"
              min={1}
              max={100}
              required
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2.5 text-xs font-mono text-zinc-100 focus:border-amber-400 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Max Redemptions</label>
            <input
              type="number"
              min={1}
              required
              value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2.5 text-xs font-mono text-zinc-100 focus:border-amber-400 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-semibold px-5 py-2.5 text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? (
                <UniversalLoader size="xs" label="Saving..." />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Promotional Code</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-100">Active Coupons ({coupons.length})</h2>
          <span className="text-xs font-mono text-zinc-500">PostgreSQL Live Data</span>
        </div>

        {coupons.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 font-mono">
            No active promotional coupons found in database. Create one using the form above.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800 text-xs">
            {coupons.map((c) => {
              const remaining = Math.max(0, (c.max_uses || 0) - (c.times_used || 0));

              return (
                <div
                  key={c.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/40 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-zinc-100 tracking-wider">
                          {c.code}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-400 border border-amber-400/30">
                          {c.discount_percent}% OFF
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                        Created: {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Active"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <span className="text-xs text-zinc-300 block font-bold">
                        {c.times_used} / {c.max_uses} used
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {remaining} redemptions left
                      </span>
                    </div>

                    <button
                      onClick={() => copyCode(c.code)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 hover:border-amber-400 bg-zinc-800 text-[11px] font-mono text-zinc-200 transition cursor-pointer"
                    >
                      {copiedCode === c.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                      <span>{copiedCode === c.code ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
