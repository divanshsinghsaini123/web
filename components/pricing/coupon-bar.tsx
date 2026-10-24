"use client";

import { useState } from "react";
import { Tag, Sparkles, X, Loader2, ArrowRight } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { cn } from "@/lib/utils";

export interface CouponData {
  valid: boolean;
  code: string;
  discount_type?: "PERCENTAGE" | "FLAT";
  discount_value?: number;
  discount_percent?: number;
  discount_amount: number;
  original_amount: number;
  final_amount: number;
  message?: string;
}

interface CouponBarProps {
  planId: string;
  appliedCoupon: CouponData | null;
  onApplySuccess: (data: CouponData) => void;
  onRemove: () => void;
  authToken?: string | null;
}

export function CouponBar({
  planId,
  appliedCoupon,
  onApplySuccess,
  onRemove,
  authToken,
}: CouponBarProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch(API_ENDPOINTS.applyCoupon, {
        method: "POST",
        headers,
        body: JSON.stringify({
          plan_id: planId,
          code: cleanCode,
          coupon_code: cleanCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.detail || data.message || "Invalid coupon code.");
      }

      onApplySuccess(data);
      setCouponCode("");
    } catch (err: any) {
      setError(err.message || "Failed to validate coupon.");
    } finally {
      setIsLoading(false);
    }
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
              {appliedCoupon.code}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400 ml-1.5">
              applied (-₹{(appliedCoupon.discount_amount || 0).toLocaleString("en-IN")})
            </span>
          </div>
        </div>
        <button
          onClick={onRemove}
          type="button"
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-amber-500/20 transition-colors cursor-pointer"
          title="Remove coupon"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            placeholder="PROMO CODE (e.g. LAUNCH50)"
            className="w-full pl-8 pr-3 py-2 text-xs font-mono uppercase rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 placeholder:normal-case placeholder:font-sans focus:outline-hidden focus:ring-1 focus:ring-amber-500 tracking-wider text-zinc-900 dark:text-zinc-100"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !couponCode.trim()}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer",
            couponCode.trim()
              ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-xs"
              : "bg-slate-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              Apply
              <ArrowRight className="w-3 h-3" />
            </>
          )}
        </button>
      </form>
      {error && (
        <p className="text-[11px] text-rose-500 dark:text-rose-400 pl-1">{error}</p>
      )}
    </div>
  );
}
