"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loadRazorpayScript, RazorpayOptions } from "@/lib/razorpay";
import { API_ENDPOINTS } from "@/lib/api";
import { CouponBar, CouponData } from "./coupon-bar";

export interface PlanItem {
  id: string; // e.g. "free", "pro", "enterprise" or UUID
  name: string;
  badge?: string;
  basePrice: number;
  periodText: string;
  description: string;
  features: string[];
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: PlanItem;
}

export function CheckoutModal({ isOpen, onClose, selectedPlan }: CheckoutModalProps) {
  const router = useRouter();

  // User billing prefill state
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Checkout calculation state
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"checkout" | "verifying" | "success">("checkout");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setAppliedCoupon(null);
    setErrorMessage(null);
    setCheckoutStep("checkout");

    if (typeof window !== "undefined") {
      const storedToken =
        localStorage.getItem("rp_auth_token") ||
        localStorage.getItem("reelspulse_token");
      setAuthToken(storedToken || null);
      
      const storedEmail =
        localStorage.getItem("rp_user_email") ||
        localStorage.getItem("reelspulse_email");
      if (storedEmail) setUserEmail(storedEmail);

      const storedName =
        localStorage.getItem("rp_user_name") ||
        localStorage.getItem("reelspulse_name");
      if (storedName) setUserName(storedName);

      const storedTenant =
        localStorage.getItem("rp_tenant_name") ||
        localStorage.getItem("reelspulse_tenant");
      if (storedTenant) setCompanyName(storedTenant);
    }
  }, [isOpen, selectedPlan.id]);

  if (!isOpen) return null;

  const basePrice = selectedPlan.basePrice;
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const finalAmount = appliedCoupon ? appliedCoupon.final_amount : basePrice;

  const handleActivatePass = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (!authToken) {
        setErrorMessage("Please sign in or create an account to activate your subscription pass.");
        setIsProcessing(false);
        router.push(`/login?redirect=${encodeURIComponent(`/pricing?plan=${selectedPlan.id}&checkout=true`)}`);
        return;
      }

      // If free plan, upgrade directly without payment gateway
      if (finalAmount <= 0) {
        const upgradeRes = await fetch(API_ENDPOINTS.upgrade, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            plan_id: selectedPlan.id,
            tier: selectedPlan.name.toLowerCase().includes("pro") ? "pro" : "free",
            coupon_code: appliedCoupon ? appliedCoupon.code : null,
          }),
        });
        const upgradeData = await upgradeRes.json();
        if (!upgradeRes.ok) {
          throw new Error(upgradeData.detail || "Failed to activate plan.");
        }
        setCheckoutStep("success");
        setTimeout(() => {
          onClose();
          router.push("/dashboard?payment=success");
        }, 1500);
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };

      // 1. Call billing create-order
      const orderRes = await fetch(API_ENDPOINTS.createOrder, {
        method: "POST",
        headers,
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          coupon_code: appliedCoupon ? appliedCoupon.code : null,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order_id) {
        throw new Error(orderData.detail || "Failed to initialize payment gateway order.");
      }

      // 2. Ensure Razorpay script is loaded
      const scriptReady = await loadRazorpayScript();

      // If Razorpay SDK loaded and valid key, open modal
      if (scriptReady && window.Razorpay) {
        const options: RazorpayOptions = {
          key: orderData.key_id,
          amount: orderData.amount, // in paise
          currency: orderData.currency || "INR",
          name: "RhythmSync Intelligence",
          description: `${selectedPlan.name} · ${selectedPlan.periodText}`,
          order_id: orderData.order_id,
          theme: {
            color: "#f59e0b", // Amber Accent
          },
          prefill: {
            name: userName.trim() || "Creator",
            email: userEmail.trim(),
          },
          notes: {
            plan_id: selectedPlan.id,
            coupon_used: appliedCoupon?.code || "",
          },
          handler: async (response) => {
            setCheckoutStep("verifying");
            try {
              const verifyRes = await fetch(API_ENDPOINTS.verifyPayment, {
                method: "POST",
                headers,
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  plan_id: selectedPlan.id,
                  coupon_code: appliedCoupon?.code || null,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.success) {
                throw new Error(verifyData.detail || "Payment verification failed.");
              }

              setCheckoutStep("success");
              setTimeout(() => {
                onClose();
                router.push("/dashboard?payment=success");
              }, 1800);
            } catch (verifyErr: any) {
              setErrorMessage(verifyErr.message || "Payment verification failed.");
              setCheckoutStep("checkout");
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setIsProcessing(false);
      } else {
        throw new Error("Unable to load Razorpay secure checkout. Please check your internet connection or disable ad-blockers.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong initiating checkout.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative w-full max-w-lg rounded-2xl z-10 overflow-hidden shadow-2xl",
          "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800",
          "text-zinc-900 dark:text-zinc-100",
          "animate-in zoom-in-95 duration-200"
        )}
      >
        {/* Amber accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4 fill-amber-500/20" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                Activate Intelligence Pass
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                30-Day Zero Lock-In Access
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {checkoutStep === "verifying" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              <h3 className="text-base font-bold">Verifying Payment...</h3>
              <p className="text-xs text-zinc-500 max-w-xs">
                Confirming authorization with Razorpay and updating your workspace quota.
              </p>
            </div>
          )}

          {checkoutStep === "success" && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                  Subscription Active!
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm">
                  Your workspace has been upgraded to{" "}
                  <strong className="text-zinc-900 dark:text-zinc-100">{selectedPlan.name}</strong>.
                  Redirecting to your dashboard...
                </p>
              </div>
            </div>
          )}

          {checkoutStep === "checkout" && (
            <>
              {/* Selected Plan Summary Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                      Selected Tier
                    </span>
                    <h3 className="text-base font-extrabold text-zinc-950 dark:text-zinc-50">
                      {selectedPlan.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-zinc-950 dark:text-zinc-50">
                      ₹{finalAmount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-zinc-400 block -mt-0.5">
                      {selectedPlan.periodText}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/50 dark:border-zinc-800/60 grid grid-cols-2 gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {selectedPlan.features.slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Bar */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  Promo / Referral Coupon
                </label>
                <CouponBar
                  planId={selectedPlan.id}
                  appliedCoupon={appliedCoupon}
                  onApplySuccess={(data) => setAppliedCoupon(data)}
                  onRemove={() => setAppliedCoupon(null)}
                  authToken={authToken}
                />
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2 py-3 border-y border-slate-100 dark:border-zinc-800 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Pass Base Price</span>
                  <span>₹{basePrice.toLocaleString("en-IN")}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span>GST / Tax</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Inclusive (18% ITC)</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-zinc-800/60 font-bold text-sm text-zinc-950 dark:text-zinc-50">
                  <span>Total Amount Payable</span>
                  <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                    ₹{finalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleActivatePass}
                disabled={isProcessing}
                className={cn(
                  "w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200",
                  "flex items-center justify-center gap-2 shadow-lg cursor-pointer",
                  "bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-amber-400/20",
                  "disabled:opacity-60 disabled:cursor-not-allowed"
                )}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Secure Gateway...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>
                      {finalAmount <= 0
                        ? "Activate Free Starter"
                        : `Pay ₹${finalAmount.toLocaleString("en-IN")} & Activate`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>256-bit Bank Grade Encryption via Razorpay · Instant Activation</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
