import { Suspense } from "react";
import type { Metadata } from "next";
import { PricingView } from "@/components/pricing/pricing-view";

export const metadata: Metadata = {
  title: "Pricing & Intelligence Passes — RhythmSync",
  description:
    "Zero lock-in 30-day and multi-song intelligence passes for artists and labels to track real-time Instagram Reels audio virality and tastemaker creators.",
};

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <PricingView />
    </Suspense>
  );
}
