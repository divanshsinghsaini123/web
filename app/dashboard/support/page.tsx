"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Headset,
  MessageSquare,
  Bug,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Send,
  UploadCloud,
  FileText,
  X,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";

type ActiveFormType = "contact" | "bug" | "feature" | null;

interface ToastNotification {
  message: string;
  type: "success" | "error";
}

export default function SupportHubPage() {
  const [activeForm, setActiveForm] = useState<ActiveFormType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Form State: Contact
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  // Form State: Bug Report
  const [bugTitle, setBugTitle] = useState("");
  const [bugUrl, setBugUrl] = useState("");
  const [bugSteps, setBugSteps] = useState("");
  const [bugFile, setBugFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form State: Feature Suggestion
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureProblem, setFeatureProblem] = useState("");

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Handle file attachment for bug report
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setToast({
          type: "error",
          message: "Attachment must be under 10MB in size.",
        });
        return;
      }
      setBugFile(file);
    }
  };

  const handleRemoveFile = () => {
    setBugFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeForm === "contact") {
      if (!contactSubject.trim() || !contactMessage.trim()) {
        setToast({
          type: "error",
          message: "Please fill in both the subject and message fields.",
        });
        return;
      }
    } else if (activeForm === "bug") {
      if (!bugTitle.trim() || !bugSteps.trim()) {
        setToast({
          type: "error",
          message: "Please provide an issue title and steps to reproduce.",
        });
        return;
      }
    } else if (activeForm === "feature") {
      if (!featureTitle.trim() || !featureProblem.trim()) {
        setToast({
          type: "error",
          message: "Please fill in the feature title and the problem it solves.",
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const title =
        activeForm === "contact"
          ? contactSubject.trim()
          : activeForm === "bug"
          ? bugTitle.trim()
          : featureTitle.trim();

      const description =
        activeForm === "contact"
          ? contactMessage.trim()
          : activeForm === "bug"
          ? bugSteps.trim()
          : featureProblem.trim();

      const pageUrl =
        activeForm === "bug"
          ? bugUrl.trim() || (typeof window !== "undefined" ? window.location.pathname : "/dashboard")
          : typeof window !== "undefined"
          ? window.location.pathname
          : "/dashboard";

      const payload = {
        category: activeForm || "contact",
        title,
        description,
        page_url: pageUrl,
        attachment_name: bugFile ? bugFile.name : undefined,
      };

      const res = await api.createSupportTicket(payload);
      const ticketRef = res?.ticket_id ? `#${String(res.ticket_id).slice(0, 8)}` : "";

      let successMsg = `Thank you! Your request ${ticketRef} has been saved and our team has been notified.`;
      if (activeForm === "contact") {
        successMsg = `Message sent successfully ${ticketRef}. A confirmation has been logged.`;
        setContactSubject("");
        setContactMessage("");
      } else if (activeForm === "bug") {
        successMsg = `Bug report ${ticketRef} saved. Our engineering team has been notified with your issue details.`;
        setBugTitle("");
        setBugUrl("");
        setBugSteps("");
        setBugFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else if (activeForm === "feature") {
        successMsg = `Feature suggestion ${ticketRef} logged. Thank you for helping us shape RhythmSync!`;
        setFeatureTitle("");
        setFeatureProblem("");
      }

      setToast({
        type: "success",
        message: successMsg,
      });

      setActiveForm(null);
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Failed to submit request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0c0c0e]">
      <div className="p-4 sm:p-6 space-y-5 max-w-5xl w-full mx-auto">
        {/* Page Header */}
        <PageHeader
          title="Support & Feedback Hub"
          description="We are here to help. Choose an option below to reach out to our team."
          icon={<Headset className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />}
          iconVariant="amber"
        />

        {/* Floating Toast Notification */}
        {toast && (
          <div
            className={cn(
              "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-sans font-medium shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2",
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300 shadow-emerald-500/10"
                : "bg-rose-950/90 border-rose-500/30 text-rose-300 shadow-rose-500/10"
            )}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 1. ENTRY VIEW: 3 Large 3D Cards */}
        {activeForm === null ? (
          <div className="space-y-4">
            <div className="text-left">
              <h2 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                How can we assist you today?
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Select a category below to get started. No technical knowledge required.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Contact Support */}
              <button
                type="button"
                onClick={() => setActiveForm("contact")}
                className="group relative flex flex-col justify-between text-left p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/20 transition-all duration-200 shadow-xs hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-all">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Contact Support
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    Ask a question or get general help with your audio stem tracking, reels discovery, or quotas.
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Send a message</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Card 2: Report a Bug */}
              <button
                type="button"
                onClick={() => setActiveForm("bug")}
                className="group relative flex flex-col justify-between text-left p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] hover:border-rose-500/60 dark:hover:border-rose-500/60 hover:bg-rose-50/10 dark:hover:bg-rose-950/20 transition-all duration-200 shadow-xs hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 group-hover:scale-110 transition-all">
                    <Bug className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    Report a Bug
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    Something broken or not working right? Let us know so our team can resolve it immediately.
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
                  <span>Report issue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Card 3: Suggest Feature */}
              <button
                type="button"
                onClick={() => setActiveForm("feature")}
                className="group relative flex flex-col justify-between text-left p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] hover:border-amber-500/60 dark:hover:border-amber-500/60 hover:bg-amber-50/10 dark:hover:bg-amber-950/20 transition-all duration-200 shadow-xs hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 transition-all">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Suggest a Feature
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
                    Have an idea to make RhythmSync better? We build analytics features based directly on artist feedback.
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Share idea</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* 2. CONDITIONAL FORM VIEWS */
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setActiveForm(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Options</span>
            </button>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs">
              {activeForm === "contact" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                        Contact Support Team
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Ask any question about your audio stem scans, virality analytics, or quotas.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-900 dark:text-zinc-200 mb-1">
                        Subject <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="e.g. Assistance setting up Instagram audio stems"
                        className="w-full h-10 px-3.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-900 dark:text-zinc-200 mb-1">
                        How can we help? <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={5}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Write your question or request in detail..."
                        className="w-full p-3.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setActiveForm(null)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {activeForm === "bug" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <Bug className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                        Report an Issue or Bug
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Tell us what happened so we can inspect and resolve it promptly.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-900 dark:text-zinc-200 mb-1">
                        Issue Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bugTitle}
                        onChange={(e) => setBugTitle(e.target.value)}
                        placeholder="e.g. Scraped reel play count discrepancy"
                        className="w-full h-10 px-3.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-900 dark:text-zinc-200 mb-1">
                        Page / URL where it happened
                      </label>
                      <input
                        type="text"
                        value={bugUrl}
                        onChange={(e) => setBugUrl(e.target.value)}
                        placeholder="e.g. /dashboard/reels or /dashboard/historical"
                        className="w-full h-10 px-3.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-900 dark:text-zinc-200 mb-1">
                        Steps to Reproduce <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={bugSteps}
                        onChange={(e) => setBugSteps(e.target.value)}
                        placeholder="1. Opened Reels Explorer&#10;2. Filtered by minimum 10k plays..."
                        className="w-full p-3.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-900 dark:text-zinc-200 mb-1">
                        Upload Screenshot (Optional)
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className="hidden"
                      />

                      {bugFile ? (
                        <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/10 text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="font-medium text-zinc-200 truncate">{bugFile.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-1 rounded text-zinc-400 hover:text-rose-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/20 text-center cursor-pointer"
                        >
                          <UploadCloud className="w-6 h-6 text-zinc-400 mb-1.5" />
                          <span className="text-xs font-semibold text-zinc-300">Click to upload screenshot</span>
                          <span className="text-[10px] text-zinc-500">PNG, JPG or PDF up to 10MB</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setActiveForm(null)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Bug Report"}
                    </button>
                  </div>
                </form>
              )}

              {activeForm === "feature" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                        Suggest a Feature
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Have an idea to make RhythmSync better? We build analytics based directly on artist feedback.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-900 dark:text-zinc-200 mb-1">
                        Feature Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={featureTitle}
                        onChange={(e) => setFeatureTitle(e.target.value)}
                        placeholder="e.g. Automated Spotify audio link generator"
                        className="w-full h-10 px-3.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-900 dark:text-zinc-200 mb-1">
                        What problem does this solve for your team? <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={5}
                        value={featureProblem}
                        onChange={(e) => setFeatureProblem(e.target.value)}
                        placeholder="Explain how this feature would streamline your music marketing workflow..."
                        className="w-full p-3.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setActiveForm(null)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 text-white cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Feature Request"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
