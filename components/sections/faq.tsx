"use client";

import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

export interface FAQItemType {
  q: string;
  a: string;
}

export const FALLBACK_HOME_FAQS: FAQItemType[] = [
  {
    q: "What is RhythmSync / ReelsPulse?",
    a: "RhythmSync is an enterprise Instagram Reels audio intelligence platform that automatically tracks reel volume, engagement telemetry, tastemaker creators, and virality velocity every 12 to 24 hours.",
  },
  {
    q: "How quickly can I start tracking an audio track?",
    a: "Instantly! Simply paste any Instagram Audio URL or 16-digit Audio ID into the dashboard, and our distributed worker crawler pool immediately fetches historical metrics, 24h delta, and top creator posts.",
  },
  {
    q: "Do you require my Instagram login or account credentials?",
    a: "Never. ReelsPulse operates entirely via public reel audio scraping and intelligence heuristics. You never need to link or share your personal or brand Instagram credentials.",
  },
  {
    q: "Can I export data to Excel or share with sponsors & artists?",
    a: "Yes. You can generate one-click Boardroom Excel (.xlsx) dumps or create view-only telemetry links to share real-time analytics with artists, sponsors, and label executives.",
  },
  {
    q: "What is included in the Free Starter plan?",
    a: "The Free Starter plan includes 1 tracked song, 24-hour sync heartbeat, full creator discovery, and daily telemetry reports with zero credit card required.",
  },
];

export const FALLBACK_PRICING_FAQS: FAQItemType[] = [
  {
    q: "How does the 30-Day Intelligence Pass work?",
    a: "Your pass unlocks high-velocity scans, multiple song slots, and boardroom exports for 30 full days. There are no lock-ins or automatic recurring deductions — you renew only when you need it.",
  },
  {
    q: "What payment methods are supported via Razorpay?",
    a: "We support all major Indian & International UPI apps (Google Pay, PhonePe, Paytm, CRED), Credit/Debit Cards (Visa, Mastercard, RuPay, Amex), Net Banking, and Corporate Cards with 256-bit bank encryption.",
  },
  {
    q: "Can I upgrade or switch my plan at any time?",
    a: "Yes! Upgrading between Creator Pro and Label Enterprise adjusts your song limits and scan frequency immediately, calculating any pro-rata balance.",
  },
  {
    q: "How do promo coupons work?",
    a: "Enter any valid promo code (e.g., LAUNCH50 for 50% off) during checkout in the coupon bar to instantly apply discounts to your invoice.",
  },
  {
    q: "Can I receive GST tax invoices for business expenses?",
    a: "Yes! Every subscription purchase generates a downloadable GST-compliant tax invoice with input tax credit (ITC) details.",
  },
  {
    q: "What happens when my subscription pass expires?",
    a: "Your existing track data and analytics history remain completely safe. Scheduled automatic scraping pauses until you renew or switch back to the Free Starter tier.",
  },
];

function FAQItem({ faq }: { faq: FAQItemType }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "border rounded-2xl overflow-hidden transition-all duration-200",
        open
          ? "border-amber-500/40 bg-amber-500/[0.04] dark:bg-amber-500/[0.06] shadow-sm"
          : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-slate-300 dark:hover:border-zinc-700"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors cursor-pointer select-none"
        aria-expanded={open}
      >
        <span className="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {faq.q}
        </span>
        <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 transition-colors">
          {open ? (
            <Minus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 transition-transform duration-200" />
          ) : (
            <Plus className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 transition-transform duration-200" />
          )}
        </span>
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  );
}

interface FAQSectionProps {
  category?: "home" | "pricing";
  items?: FAQItemType[];
  eyebrow?: string;
  title?: string;
  subtitle?: React.ReactNode;
  className?: string;
}

export function FAQSection({
  category = "home",
  items,
  eyebrow = "FAQ",
  title = "Frequently Asked Questions",
  subtitle,
  className,
}: FAQSectionProps) {
  const [liveFaqs, setLiveFaqs] = useState<FAQItemType[]>([]);

  useEffect(() => {
    if (items && items.length > 0) return;

    let isMounted = true;
    const url = `${API_BASE_URL}/api/v1/faqs?category=${category}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load FAQs");
        return res.json();
      })
      .then((data: any[]) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setLiveFaqs(
            data.map((f) => ({
              q: f.question,
              a: f.answer,
            }))
          );
        }
      })
      .catch(() => {
        // Fallback silently
      });

    return () => {
      isMounted = false;
    };
  }, [category, items]);

  const fallbackData = category === "pricing" ? FALLBACK_PRICING_FAQS : FALLBACK_HOME_FAQS;
  const faqs = (items && items.length > 0) ? items : (liveFaqs.length > 0 ? liveFaqs : fallbackData);

  return (
    <section className={cn("relative max-w-4xl mx-auto px-6 py-16 sm:py-20", className)}>
      <div className="flex flex-col gap-3 mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400 font-mono">
          {eyebrow}
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
          {title}
        </h2>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {subtitle || (
            <>
              Have a question not listed here?{" "}
              <a href="/contact" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
                Talk to our engineering team →
              </a>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {faqs.map((faq, i) => (
          <FAQItem key={i} faq={faq} />
        ))}
      </div>
    </section>
  );
}
