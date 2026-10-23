"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  BellRing,
  Plus,
  RotateCw,
  Search,
  Trash2,
  Mail,
  MessageSquare,
  Webhook,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
  Sparkles,
  Send,
  X,
  Phone,
  Radio,
  SlidersHorizontal,
  Check,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Flame,
  Power,
  Bell,
} from "lucide-react";
import { api, TrackedSong } from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";

interface CustomRule {
  id: string;
  name: string;
  tab_type: "alert" | "digest";
  tracked_audio_id?: string;
  trigger_condition: "EVERY_SCAN" | "START_OF_DAY" | "END_OF_DAY" | "THRESHOLD";
  metric?: string;
  operator?: string;
  threshold_value?: number;
  channels: {
    whatsapp: boolean;
    email: boolean;
    webhook: boolean;
  };
  whatsapp_number?: string;
  email_address?: string;
  webhook_url?: string;
  is_active: boolean;
  last_triggered?: string;
}

const DEFAULT_RULES: CustomRule[] = [
  {
    id: "default-rule-1",
    name: "Post-Scan Instant Pulse Digest",
    tab_type: "digest",
    trigger_condition: "EVERY_SCAN",
    channels: { whatsapp: true, email: true, webhook: false },
    whatsapp_number: "+91 98765 43210",
    email_address: "analytics@label.com",
    is_active: true,
    last_triggered: "Today, 18:24 PM",
  },
  {
    id: "default-rule-2",
    name: "Daily Evening Virality Wrapup",
    tab_type: "digest",
    trigger_condition: "END_OF_DAY",
    channels: { whatsapp: false, email: true, webhook: false },
    email_address: "reports@label.com",
    is_active: true,
    last_triggered: "Yesterday, 21:00 PM",
  },
  {
    id: "default-rule-3",
    name: "Morning Trend Briefing (09:00 AM)",
    tab_type: "digest",
    trigger_condition: "START_OF_DAY",
    channels: { whatsapp: true, email: true, webhook: false },
    whatsapp_number: "+91 98765 43210",
    email_address: "team@label.com",
    is_active: true,
    last_triggered: "Today, 09:00 AM",
  },
  {
    id: "default-rule-4",
    name: "50,000 Reels Viral Milestone Surge",
    tab_type: "alert",
    trigger_condition: "THRESHOLD",
    metric: "total_reels",
    operator: ">",
    threshold_value: 50000,
    channels: { whatsapp: true, email: true, webhook: false },
    whatsapp_number: "+91 98765 43210",
    email_address: "growth@label.com",
    is_active: true,
    last_triggered: "3 days ago",
  },
  {
    id: "default-rule-5",
    name: "24h Velocity Spike Warning (+35%)",
    tab_type: "alert",
    trigger_condition: "THRESHOLD",
    metric: "growth_rate",
    operator: ">",
    threshold_value: 35,
    channels: { whatsapp: true, email: false, webhook: true },
    whatsapp_number: "+91 98765 43210",
    webhook_url: "https://hooks.slack.com/services/...",
    is_active: true,
    last_triggered: "Yesterday, 14:15 PM",
  },
];

export default function AlertsAndAutomationPage() {
  const [activeTab, setActiveTab] = useState<"alerts" | "automation">("alerts");
  const [rules, setRules] = useState<CustomRule[]>(DEFAULT_RULES);
  const [tracks, setTracks] = useState<TrackedSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{
    id: number;
    title: string;
    description?: string;
    type: "active" | "inactive" | "delete" | "info";
  } | null>(null);

  const showToast = useCallback(
    (title: string, description?: string, type: "active" | "inactive" | "delete" | "info" = "info") => {
      const id = Date.now();
      setToast({ id, title, description, type });
      setTimeout(() => {
        setToast((curr) => (curr?.id === id ? null : curr));
      }, 2800);
    },
    []
  );

  // Stoki-styled Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Form State matching Screenshot 4
  const [ruleName, setRuleName] = useState("");
  const [triggerConditionType, setTriggerConditionType] = useState<"EVERY_SCAN" | "THRESHOLD">("EVERY_SCAN");
  const [digestTiming, setDigestTiming] = useState<"EVERY_SCAN" | "START_OF_DAY" | "END_OF_DAY">("EVERY_SCAN");
  const [selectedTrackId, setSelectedTrackId] = useState(""); // "" = All Songs
  const [thresholdMetric, setThresholdMetric] = useState("total_reels");
  const [thresholdValue, setThresholdValue] = useState<number>(25000);

  // Delivery Channels
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("+91 98123 45678");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailAddress, setEmailAddress] = useState("supply-chain@brand.com");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.slack.com/services/reels/...");

  const fetchBackendData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [apiRulesRes, tracksRes] = await Promise.all([
        api.getAlertRules().catch(() => ({ rules: [] })),
        api.getTracks().catch(() => []),
      ]);

      setTracks(tracksRes || []);

      if (apiRulesRes?.rules && apiRulesRes.rules.length > 0) {
        // Map backend rules to our CustomRule interface
        const mappedBackend: CustomRule[] = apiRulesRes.rules.map((r: any) => ({
          id: r.id,
          name: r.name,
          tab_type: r.trigger_type === "MILESTONE_BREACH" || r.metric ? "alert" : "digest",
          tracked_audio_id: r.tracked_audio_id,
          trigger_condition: r.trigger_type === "MILESTONE_BREACH" ? "THRESHOLD" : "EVERY_SCAN",
          metric: r.metric || "total_reels",
          operator: r.operator || ">",
          threshold_value: r.threshold_value || 10000,
          channels: r.channels || { whatsapp: true, email: true, webhook: false },
          whatsapp_number: r.whatsapp_number,
          email_address: r.email_address,
          webhook_url: r.webhook_url,
          is_active: r.is_active ?? true,
          last_triggered: r.last_triggered ? new Date(r.last_triggered).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Pending trigger",
        }));

        // Merge backend rules with default templates if not duplicate
        const merged = [...mappedBackend];
        for (const def of DEFAULT_RULES) {
          if (!merged.some((m) => m.name === def.name)) {
            merged.push(def);
          }
        }
        setRules(merged);
      } else {
        setRules(DEFAULT_RULES);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBackendData();
  }, [fetchBackendData]);

  const handleToggleActive = async (ruleId: string) => {
    const target = rules.find((r) => r.id === ruleId);
    const willBeActive = target ? !target.is_active : true;

    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, is_active: !r.is_active } : r))
    );

    showToast(
      willBeActive ? "Rule Armed & Active" : "Rule Paused / Disarmed",
      target?.name,
      willBeActive ? "active" : "inactive"
    );

    try {
      if (!ruleId.startsWith("default-")) {
        await api.toggleAlertRule(ruleId);
      }
    } catch {
      // Keep optimistic update
    }
  };

  const handleToggleChannel = (ruleId: string, channel: "whatsapp" | "email") => {
    const target = rules.find((r) => r.id === ruleId);
    const willBeEnabled = target ? !target.channels[channel] : true;

    setRules((prev) =>
      prev.map((r) => {
        if (r.id !== ruleId) return r;
        return {
          ...r,
          channels: {
            ...r.channels,
            [channel]: !r.channels[channel],
          },
        };
      })
    );

    showToast(
      `${channel === "whatsapp" ? "WhatsApp" : "Email"} ${willBeEnabled ? "Enabled" : "Disabled"}`,
      target?.name,
      willBeEnabled ? "active" : "inactive"
    );
  };

  const handleDeleteRule = async (ruleId: string) => {
    const target = rules.find((r) => r.id === ruleId);
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    showToast("Rule Removed", target?.name, "delete");

    if (!ruleId.startsWith("default-")) {
      try {
        await api.deleteAlertRule(ruleId);
      } catch {
        // Ignored
      }
    }
  };

  const handleCreateRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    try {
      setIsSubmitting(true);
      const isDigest = triggerConditionType === "EVERY_SCAN";
      const newRule: CustomRule = {
        id: `rule-${Date.now()}`,
        name: ruleName.trim(),
        tab_type: isDigest ? "digest" : "alert",
        tracked_audio_id: selectedTrackId || undefined,
        trigger_condition: isDigest ? digestTiming : "THRESHOLD",
        metric: isDigest ? undefined : thresholdMetric,
        operator: ">",
        threshold_value: isDigest ? undefined : Number(thresholdValue),
        channels: {
          whatsapp: whatsappEnabled,
          email: emailEnabled,
          webhook: webhookEnabled,
        },
        whatsapp_number: whatsappEnabled ? whatsappNumber : undefined,
        email_address: emailEnabled ? emailAddress : undefined,
        webhook_url: webhookEnabled ? webhookUrl : undefined,
        is_active: true,
        last_triggered: "Pending trigger",
      };

      // Call backend if threshold
      try {
        await api.createAlertRule({
          name: ruleName.trim(),
          tracked_audio_id: selectedTrackId || undefined,
          trigger_type: isDigest ? "DAILY_DIGEST" : "MILESTONE_BREACH",
          metric: thresholdMetric,
          operator: ">",
          threshold_value: Number(thresholdValue),
          channels: {
            email: emailEnabled,
            whatsapp: whatsappEnabled,
            webhook: webhookEnabled,
          },
          email_address: emailEnabled ? emailAddress : undefined,
          whatsapp_number: whatsappEnabled ? whatsappNumber : undefined,
          webhook_url: webhookEnabled ? webhookUrl : undefined,
          message_template: "Automated trigger notification for monitored audio.",
        });
      } catch {
        // Fallback optimistic
      }

      setRules((prev) => [newRule, ...prev]);
      setIsModalOpen(false);
      setRuleName("");
      showToast("New Rule Armed & Active", newRule.name, "active");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRules = useMemo(() => {
    const targetTabType = activeTab === "alerts" ? "alert" : "digest";
    let list = rules.filter((r) => r.tab_type === targetTabType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    return list;
  }, [rules, activeTab, searchQuery]);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1440px] w-full mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Automation &amp; Alerts
            </h1>
            <p className="text-xs text-zinc-500 font-mono">
              Configure scheduled scan digests, milestone breach webhooks, and multi-channel notifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBackendData}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-amber-500" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      {/* Wide Apple-Grade Segmented Control Switch */}
      <div className="w-full max-w-2xl mx-auto p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 grid grid-cols-2 gap-2 shadow-inner">
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-sans font-bold transition-all duration-200 cursor-pointer ${
            activeTab === "alerts"
              ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-md shadow-black/10 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/10 scale-[1.01]"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40"
          }`}
        >
          <Flame className={`w-4 h-4 ${activeTab === "alerts" ? "text-amber-500 fill-amber-500/20" : "text-zinc-400"}`} />
          <span>Threshold Alert Rules</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
            activeTab === "alerts"
              ? "bg-amber-500 text-zinc-950 shadow-xs"
              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          }`}>
            {rules.filter((r) => r.tab_type === "alert").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("automation")}
          className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-sans font-bold transition-all duration-200 cursor-pointer ${
            activeTab === "automation"
              ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-md shadow-black/10 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/10 scale-[1.01]"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40"
          }`}
        >
          <Clock className={`w-4 h-4 ${activeTab === "automation" ? "text-emerald-500" : "text-zinc-400"}`} />
          <span>Automated Scan Digests</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
            activeTab === "automation"
              ? "bg-emerald-500 text-zinc-950 shadow-xs"
              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          }`}>
            {rules.filter((r) => r.tab_type === "digest").length}
          </span>
        </button>
      </div>

      {/* Telemetry Strip - Apple 3D Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-3.5 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
            Active Rules
          </span>
          <div className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {rules.filter((r) => r.is_active).length} <span className="text-xs text-zinc-400 font-normal">/ {rules.length} armed</span>
          </div>
        </div>

        <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-3.5 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
            Dispatch Targets
          </span>
          <div className="text-xl font-mono font-bold text-emerald-500 flex items-center gap-1.5">
            <span>WhatsApp &amp; Email</span>
          </div>
        </div>

        <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-3.5 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
            Scan Triggers
          </span>
          <div className="text-xl font-mono font-bold text-amber-500">
            Every Scan + EOD
          </div>
        </div>

        <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-[#121215] p-3.5 shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
            Monitored Scope
          </span>
          <div className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {tracks.length > 0 ? `${tracks.length} Songs` : "Catalog-Wide"}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          {activeTab === "alerts" ? "Configured Threshold Alert Rules" : "Automated Delivery & Digest Schedules"} ({filteredRules.length})
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredRules.map((rule) => {
          const matchedTrack = tracks.find((t) => t.id === rule.tracked_audio_id);

          return (
            <div
              key={rule.id}
              className={`rounded-2xl border p-4.5 transition-all duration-200 space-y-3 flex flex-col justify-between ${
                rule.is_active
                  ? "border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121215] shadow-sm hover:shadow-xl dark:shadow-[0_12px_36px_rgb(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5"
                  : "border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30 opacity-60 shadow-xs"
              }`}
            >
              <div className="space-y-2.5">
                {/* Header & Toggle */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 font-sans">
                        {rule.name}
                      </h3>
                    </div>

                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {rule.trigger_condition === "EVERY_SCAN" && "Dispatches Post-Scan"}
                      {rule.trigger_condition === "START_OF_DAY" && "Start of Day (09:00 AM)"}
                      {rule.trigger_condition === "END_OF_DAY" && "End of Day (09:00 PM)"}
                      {rule.trigger_condition === "THRESHOLD" && `Breach: ${rule.metric} ${rule.operator} ${rule.threshold_value?.toLocaleString()}`}
                    </span>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(rule.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        rule.is_active ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          rule.is_active ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Target Scope */}
                <div className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 text-[11px] font-mono flex items-center justify-between">
                  <span className="text-zinc-500">Target Song:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">
                    {matchedTrack ? matchedTrack.title || matchedTrack.track_name : "All Catalog Songs (Default)"}
                  </span>
                </div>

                {/* Delivery Channels with Direct Click-to-Toggle */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider font-semibold">
                    Delivery Targets (Click to toggle)
                  </span>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleToggleChannel(rule.id, "whatsapp")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-colors cursor-pointer ${
                        rule.channels.whatsapp
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 line-through"
                      }`}
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleToggleChannel(rule.id, "email")}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium border transition-colors cursor-pointer ${
                        rule.channels.email
                          ? "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400"
                          : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 line-through"
                      }`}
                    >
                      <Mail className="w-3 h-3" />
                      <span>Email Digest</span>
                    </button>

                    {rule.channels.webhook && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        <Webhook className="w-2.5 h-2.5" />
                        <span>Slack</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Last Dispatched:</span>
                <span className="text-zinc-600 dark:text-zinc-300 font-semibold">{rule.last_triggered || "Pending"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stoki Exact Modal Dialog (Matching Screenshot 4) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden border border-zinc-800 bg-[#0e0e11] shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-800/80">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-zinc-100 font-sans tracking-tight">
                  Create New Alert Rule
                </h2>
                <p className="text-xs text-zinc-400 font-mono">
                  Configure automated trigger logic, delivery targets, and dynamic message templates.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="flex items-center gap-1 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-mono font-medium hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Close</span>
              </button>
            </div>

            <form onSubmit={handleCreateRuleSubmit} className="space-y-5 text-xs font-mono">
              {/* Rule Name Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-semibold text-xs">Rule Name</label>
                  <span className="text-[10px] text-zinc-500 font-normal">Required</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g., High OOS in Delhi NCR or Daily Morning Scan Digest"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              {/* Target Audio Stem Selection */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold text-xs">Target Song Scope</label>
                <select
                  value={selectedTrackId}
                  onChange={(e) => setSelectedTrackId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">All Catalog Songs (Default: Monitored Catalog-Wide)</option>
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title || t.track_name} ({t.artist_name || "Official Audio"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Trigger Condition Cards (Screenshot 4) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Trigger Condition</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Card 1: Send after every scan */}
                  <div
                    onClick={() => setTriggerConditionType("EVERY_SCAN")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                      triggerConditionType === "EVERY_SCAN"
                        ? "border-emerald-500/80 bg-emerald-950/20 shadow-xs"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          triggerConditionType === "EVERY_SCAN"
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-zinc-600 bg-transparent"
                        }`}
                      >
                        {triggerConditionType === "EVERY_SCAN" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-black" />
                        )}
                      </div>
                      <span className="font-bold text-zinc-100 text-xs">Send after every scan</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono pl-6 leading-relaxed">
                      Dispatches digest immediately after any scheduled campaign completes.
                    </p>
                  </div>

                  {/* Card 2: Only when threshold is met */}
                  <div
                    onClick={() => setTriggerConditionType("THRESHOLD")}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                      triggerConditionType === "THRESHOLD"
                        ? "border-emerald-500/80 bg-emerald-950/20 shadow-xs"
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          triggerConditionType === "THRESHOLD"
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-zinc-600 bg-transparent"
                        }`}
                      >
                        {triggerConditionType === "THRESHOLD" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-black" />
                        )}
                      </div>
                      <span className="font-bold text-zinc-100 text-xs">Only when threshold is met</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono pl-6 leading-relaxed">
                      Only fires if reels creation velocity or milestone breaches exceed rules.
                    </p>
                  </div>
                </div>

                {/* Conditional sub-options */}
                {triggerConditionType === "EVERY_SCAN" ? (
                  <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 space-y-2">
                    <span className="text-zinc-400 text-[11px] block font-semibold">
                      Digest Dispatch Timing:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "EVERY_SCAN", label: "Every Scan" },
                        { id: "START_OF_DAY", label: "Start of Day (9 AM)" },
                        { id: "END_OF_DAY", label: "End of Day (9 PM)" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setDigestTiming(t.id as any)}
                          className={`py-1.5 px-2 rounded-lg border text-center transition-colors text-[11px] cursor-pointer ${
                            digestTiming === t.id
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold"
                              : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-zinc-400 text-[11px] block font-semibold mb-1">
                        Trigger Metric
                      </span>
                      <select
                        value={thresholdMetric}
                        onChange={(e) => setThresholdMetric(e.target.value)}
                        className="w-full h-8 px-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 focus:outline-none"
                      >
                        <option value="total_reels">Total Reels Indexed (&gt;)</option>
                        <option value="growth_rate">24h Growth Velocity % (&gt;)</option>
                        <option value="play_count">Total Video Plays (&gt;)</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-zinc-400 text-[11px] block font-semibold mb-1">
                        Threshold Level
                      </span>
                      <input
                        type="number"
                        value={thresholdValue}
                        onChange={(e) => setThresholdValue(Number(e.target.value))}
                        className="w-full h-8 px-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Channels & Targets (Screenshot 4) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Delivery Channels &amp; Targets</span>
                </div>

                <div className="space-y-3">
                  {/* WhatsApp */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={whatsappEnabled}
                        onChange={(e) => setWhatsappEnabled(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 accent-emerald-500 bg-zinc-900 cursor-pointer"
                      />
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-zinc-200 font-bold">WhatsApp Notification</span>
                    </label>

                    <div className="pl-6 space-y-1">
                      <input
                        type="text"
                        disabled={!whatsappEnabled}
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="+91 98123 45678"
                        className="w-full h-9 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-zinc-500 block">
                        Include country code (+91 for India).
                      </span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={emailEnabled}
                        onChange={(e) => setEmailEnabled(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 accent-emerald-500 bg-zinc-900 cursor-pointer"
                      />
                      <Mail className="w-3.5 h-3.5 text-sky-400" />
                      <span className="text-zinc-200 font-bold">Email Digest</span>
                    </label>

                    <div className="pl-6 space-y-1">
                      <input
                        type="email"
                        disabled={!emailEnabled}
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="supply-chain@brand.com"
                        className="w-full h-9 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-zinc-500 block">
                        Delivered directly to designated inbox or distribution list.
                      </span>
                    </div>
                  </div>

                  {/* Slack / Webhook */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={webhookEnabled}
                        onChange={(e) => setWebhookEnabled(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 accent-emerald-500 bg-zinc-900 cursor-pointer"
                      />
                      <Webhook className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-zinc-200 font-bold">Slack / Webhook URL</span>
                    </label>

                    {webhookEnabled && (
                      <div className="pl-6 pt-1">
                        <input
                          type="url"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://hooks.slack.com/services/..."
                          className="w-full h-9 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Arming Trigger..." : "Arm Alert Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Dynamic Status Toast (Zero Layout Shift) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-950/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 text-white shadow-2xl shadow-black/70 ring-1 ring-white/10 transition-all duration-200"
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              toast.type === "active"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 ring-2 ring-emerald-500/10"
                : toast.type === "inactive"
                ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                : toast.type === "delete"
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
          >
            {toast.type === "active" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : toast.type === "inactive" ? (
              <Power className="w-4 h-4" />
            ) : toast.type === "delete" ? (
              <Trash2 className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </div>
          <div className="flex flex-col pr-2">
            <span className="text-xs font-semibold text-zinc-100 font-sans tracking-tight">
              {toast.title}
            </span>
            {toast.description && (
              <span className="text-[11px] text-zinc-400 font-mono line-clamp-1 max-w-[240px]">
                {toast.description}
              </span>
            )}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
