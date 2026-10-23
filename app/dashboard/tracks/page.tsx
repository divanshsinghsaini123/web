"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Gauge,
  Plus,
  RotateCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Zap,
  Music2,
  Bell,
  Search,
  X,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { api, TrackedSong, User, getProxiedImageUrl } from "@/lib/api";
import { extractAudioId, cn } from "@/lib/utils";
import PageHeader from "@/components/dashboard/PageHeader";
import { useToast } from "@/components/ui/DynamicIslandToast";

const ALARM_SLOTS = [
  {
    key: "morning" as const,
    time: "09:00 AM",
    label: "Morning Pulse",
    badgeBg: "bg-sky-500/10 dark:bg-sky-500/15",
    badgeBorder: "border-sky-500/30",
    badgeText: "text-sky-700 dark:text-sky-300",
    iconColor: "text-sky-500 dark:text-sky-400",
    dotColor: "bg-sky-500",
    switchBg: "bg-sky-500",
  },
  {
    key: "afternoon" as const,
    time: "02:00 PM",
    label: "Afternoon Wave",
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/15",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-700 dark:text-amber-300",
    iconColor: "text-amber-500 dark:text-amber-400",
    dotColor: "bg-amber-500",
    switchBg: "bg-amber-500",
  },
  {
    key: "evening" as const,
    time: "06:00 PM",
    label: "Evening Peak",
    badgeBg: "bg-orange-500/10 dark:bg-orange-500/15",
    badgeBorder: "border-orange-500/30",
    badgeText: "text-orange-700 dark:text-orange-300",
    iconColor: "text-orange-500 dark:text-orange-400",
    dotColor: "bg-orange-500",
    switchBg: "bg-orange-500",
  },
  {
    key: "night" as const,
    time: "10:00 PM",
    label: "Night Trend",
    badgeBg: "bg-purple-500/10 dark:bg-purple-500/15",
    badgeBorder: "border-purple-500/30",
    badgeText: "text-purple-700 dark:text-purple-300",
    iconColor: "text-purple-500 dark:text-purple-400",
    dotColor: "bg-purple-500",
    switchBg: "bg-purple-500",
  },
];

interface TrackScheduleState {
  [trackId: string]: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
    customAlarms?: string[];
  };
}

export default function UnifiedTracksSchedulesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const setNotice = (msg: string | null) => {
    if (msg) showToast(msg, "success");
  };
  const setErrorNotice = (msg: string | null) => {
    if (msg) showToast(msg, "error");
  };
  const [tracks, setTracks] = useState<TrackedSong[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [syncingTrackId, setSyncingTrackId] = useState<string | null>(null);

  // Alarm toggles state per track
  const [schedules, setSchedules] = useState<TrackScheduleState>({});

  // Stoki Radial Clock Modal State
  const [schedulingTrack, setSchedulingTrack] = useState<TrackedSong | null>(null);
  const [pickerActiveTab, setPickerActiveTab] = useState<"hours" | "minutes">("hours");
  const [pickerHour, setPickerHour] = useState<number>(9);
  const [pickerMinute, setPickerMinute] = useState<number>(0);
  const [pickerPeriod, setPickerPeriod] = useState<"AM" | "PM">("AM");

  const incrementHour = () => setPickerHour((prev) => (prev >= 12 ? 1 : prev + 1));
  const decrementHour = () => setPickerHour((prev) => (prev <= 1 ? 12 : prev - 1));
  const updatePickerMinute = (val: number) => setPickerMinute(Math.max(0, Math.min(59, val)));
  const incrementMinute = (step = 1) => setPickerMinute((prev) => (prev + step) % 60);
  const decrementMinute = (step = 1) => setPickerMinute((prev) => (prev - step < 0 ? 59 : prev - step));
  const formattedPickerTime = `${pickerHour.toString().padStart(2, "0")}:${pickerMinute.toString().padStart(2, "0")} ${pickerPeriod}`;

  const handleOpenScheduleModal = (track: TrackedSong) => {
    setSchedulingTrack(track);
    setPickerActiveTab("hours");
    setPickerHour(9);
    setPickerMinute(0);
    setPickerPeriod("AM");
  };

  const handleSaveCustomAlarm = () => {
    if (!schedulingTrack) return;
    const timeStr = formattedPickerTime;
    setSchedules((prev) => {
      const current = prev[schedulingTrack.id] || { morning: false, afternoon: false, evening: false, night: false, customAlarms: [] };
      const currentCustom = current.customAlarms || [];
      if (currentCustom.includes(timeStr)) {
        setNotice(`Alarm for ${timeStr} is already scheduled.`);
        setTimeout(() => setNotice(null), 3000);
        setSchedulingTrack(null);
        return prev;
      }
      return {
        ...prev,
        [schedulingTrack.id]: {
          ...current,
          customAlarms: [...currentCustom, timeStr],
        },
      };
    });
    setNotice(`New scraper alarm armed for ${timeStr} on "${schedulingTrack.title || "Track"}".`);
    setTimeout(() => setNotice(null), 4000);
    setSchedulingTrack(null);
  };

  const handleRemoveCustomAlarm = (trackId: string, timeStr: string) => {
    setSchedules((prev) => {
      const current = prev[trackId];
      if (!current) return prev;
      return {
        ...prev,
        [trackId]: {
          ...current,
          customAlarms: (current.customAlarms || []).filter((t) => t !== timeStr),
        },
      };
    });
    setNotice(`Removed alarm for ${timeStr}.`);
    setTimeout(() => setNotice(null), 3000);
  };

  // Add Track Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audioInput, setAudioInput] = useState("");
  const [trackName, setTrackName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      const [trackList, me, sub] = await Promise.all([
        api.getTracks().catch(() => []),
        api.getMe().catch(() => null),
        api.getSubscription().catch(() => null),
      ]);

      const items = Array.isArray(trackList) ? trackList : [];
      setTracks(items);
      setUser(me);
      if (sub) setSubscription(sub);

      // Initialize schedule state
      const initialSchedules: TrackScheduleState = {};
      items.forEach((t) => {
        initialSchedules[t.id] = {
          morning: false,
          afternoon: false,
          evening: false,
          night: false,
        };
      });
      setSchedules((prev) => (Object.keys(prev).length > 0 ? prev : initialSchedules));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // User Role & Permissions
  const userRole = (user?.role || "OWNER").toUpperCase();
  const isViewer = userRole === "VIEWER" || userRole === "COLLABORATOR" || userRole === "SPONSOR";

  // Plan Details from Live Subscription (PostgreSQL)
  const planInfo = subscription?.plan || user?.plan;
  const planTier = planInfo?.name || user?.tenant?.plan_name || "Free Starter";
  const isFreePlan = planTier.toLowerCase().includes("free");

  // Real quotas from PostgreSQL
  const maxAllowedTracks = Number(planInfo?.max_tracked_songs ?? (isFreePlan ? 1 : 5));
  const currentTracksCount = tracks.length;
  const openTrackSlots = Math.max(0, maxAllowedTracks - currentTracksCount);

  // Daily Scan Cap & Telemetry
  const standardCap = Number(subscription?.max_daily_scans ?? planInfo?.max_daily_scans ?? 0);
  const executedToday = Number(subscription?.scans_used_today ?? 0);
  const extraReserveCredits = Number(subscription?.extra_scan_credits ?? 0);
  const maxHardCap = Math.max(
    standardCap,
    Number(subscription?.max_daily_hard_cap ?? planInfo?.max_daily_hard_cap ?? 0)
  );
  const remainingToday = Math.max(0, standardCap - executedToday);
  const usagePercentage = Math.min(100, Math.round((executedToday / Math.max(1, standardCap)) * 100));

  // Schedule alarm capacity based directly on the account's plan daily scans
  const maxScheduleAlarmsAllowed = standardCap;

  const currentActiveAlarms = Object.values(schedules).reduce((acc, curr) => {
    return (
      acc +
      (curr?.morning ? 1 : 0) +
      (curr?.afternoon ? 1 : 0) +
      (curr?.evening ? 1 : 0) +
      (curr?.night ? 1 : 0) +
      (curr?.customAlarms ? curr.customAlarms.length : 0)
    );
  }, 0);

  const toggleAlarm = (trackId: string, slot: "morning" | "afternoon" | "evening" | "night") => {
    setErrorNotice(null);
    setNotice(null);

    if (isViewer) {
      setErrorNotice("Collaborators have view-only access and cannot edit scan schedules.");
      setTimeout(() => setErrorNotice(null), 4000);
      return;
    }

    if (standardCap <= 0) {
      setErrorNotice(
        "Automated alarm pulses require daily scan quota (0 available). Use 'Scan Now' to run on-demand scans with your extra scan pool."
      );
      setTimeout(() => setErrorNotice(null), 5000);
      return;
    }

    const currentTrackSched = schedules[trackId] || {
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
    };
    const isCurrentlyActive = currentTrackSched[slot];

    if (!isCurrentlyActive && currentActiveAlarms >= maxScheduleAlarmsAllowed) {
      setErrorNotice(
        `Daily schedule limit (${maxScheduleAlarmsAllowed}/${maxScheduleAlarmsAllowed}) reached for ${planTier}.`
      );
      setTimeout(() => setErrorNotice(null), 5000);
      return;
    }

    setSchedules((prev) => ({
      ...prev,
      [trackId]: {
        ...(prev[trackId] || {
          morning: false,
          afternoon: false,
          evening: false,
          night: false,
        }),
        [slot]: !isCurrentlyActive,
      },
    }));

    setNotice(
      !isCurrentlyActive
        ? `Alarm activated (${slot.toUpperCase()}). Next pulse will trigger automatically.`
        : `Alarm deactivated for this time slot.`
    );
    setTimeout(() => setNotice(null), 3000);
  };

  async function handleRunNow(trackId: string, trackTitle: string) {
    if (isViewer) {
      setErrorNotice("Collaborators have view-only access and cannot trigger manual scans.");
      setTimeout(() => setErrorNotice(null), 4000);
      return;
    }

    // If both daily scans and extra scans are zero, redirect to pricing for free or expired accounts
    if (remainingToday <= 0 && extraReserveCredits <= 0) {
      if (isFreePlan || subscription?.status === "expired" || subscription?.status === "past_due") {
        router.push("/pricing");
        return;
      }
      setErrorNotice(`Daily scan quota and extra scan pool exhausted. Resets at 00:00 UTC.`);
      setTimeout(() => setErrorNotice(null), 5000);
      return;
    }

    if (executedToday >= maxHardCap) {
      setErrorNotice(`Daily safety ceiling (${maxHardCap}) reached. Resets at 00:00 UTC.`);
      setTimeout(() => setErrorNotice(null), 5000);
      return;
    }

    try {
      setSyncingTrackId(trackId);
      setErrorNotice(null);
      setNotice(null);

      const res = await api.scanTrackNow(trackId);
      setNotice(res.message || `Pulse scan queued for "${trackTitle}". Telemetry updating.`);
      setTimeout(() => setNotice(null), 4000);

      // Refresh subscription & quota telemetry
      const sub = await api.getSubscription().catch(() => null);
      if (sub) setSubscription(sub);
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to trigger scan.");
      setTimeout(() => setErrorNotice(null), 4000);
    } finally {
      setSyncingTrackId(null);
    }
  }

  async function handleAddTrack(e: React.FormEvent) {
    e.preventDefault();
    if (isViewer) return;

    setModalError("");
    const parsedId = extractAudioId(audioInput.trim());
    if (!parsedId) {
      setModalError("Please enter a valid Instagram Audio URL or Audio Asset ID.");
      return;
    }

    try {
      setModalLoading(true);
      const res = await api.createTrack({
        instagram_audio_id: parsedId,
        title: trackName.trim() || undefined,
        artist_name: artistName.trim() || undefined,
      });

      setIsModalOpen(false);
      setAudioInput("");
      setTrackName("");
      setArtistName("");
      setNotice((res as any)?.message || "New Instagram audio stem registered successfully.");
      setTimeout(() => setNotice(null), 4000);
      await loadData();
    } catch (err: any) {
      const errMsg = String(err?.message || "");
      if (
        errMsg.toLowerCase().includes("plan") ||
        errMsg.toLowerCase().includes("limit") ||
        errMsg.toLowerCase().includes("upgrade")
      ) {
        setIsModalOpen(false);
        router.push("/pricing");
        return;
      }
      setModalError(errMsg || "Failed to add track. Please verify URL or ID.");
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDeleteTrack(trackId: string, title: string) {
    if (isViewer) {
      setErrorNotice("Collaborators have view-only access and cannot remove tracks.");
      setTimeout(() => setErrorNotice(null), 4000);
      return;
    }
    if (!confirm(`Are you sure you want to stop tracking "${title}"?`)) return;
    try {
      await api.deleteTrack(trackId);
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
      setNotice(`Removed ${title} from workspace.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to delete track");
      setTimeout(() => setErrorNotice(null), 3000);
    }
  }

  async function handleToggleTrackStatus(trackId: string, currentStatus?: boolean) {
    if (isViewer) {
      setErrorNotice("Collaborators have view-only access and cannot pause tracks.");
      setTimeout(() => setErrorNotice(null), 4000);
      return;
    }
    try {
      const res = await api.toggleTrackStatus(trackId);
      setTracks((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, is_active: res.is_active } : t))
      );
      setNotice(res.message || `Track ${res.is_active ? "activated" : "paused"}.`);
      setTimeout(() => setNotice(null), 3000);
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to update track status.");
      setTimeout(() => setErrorNotice(null), 4000);
    }
  }

  const filteredTracks = tracks.filter((t) => {
    const q = search.toLowerCase();
    return (
      (t.title || t.track_name || "").toLowerCase().includes(q) ||
      (t.artist_name || "").toLowerCase().includes(q) ||
      (t.instagram_audio_id || "").includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#121214]">
      <div className="p-4 sm:p-6 space-y-4 max-w-[1440px] w-full mx-auto">
        {/* Unified PageHeader */}
        <PageHeader
          title="Tracks & Scan Schedules"
          description="Register audio stems, manage automated scan schedules, and inspect daily quota capacity."
          icon={<Clock className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />}
          iconVariant="indigo"
          badge={
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
              {planTier}
            </span>
          }
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 transition-colors shadow-xs cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
                <span>Sync Status</span>
              </button>

              {!isViewer && (
                <button
                  onClick={() => {
                    if (openTrackSlots <= 0) {
                      router.push("/pricing");
                      return;
                    }
                    setIsModalOpen(true);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors shadow-xs cursor-pointer ${
                    openTrackSlots > 0
                      ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
                      : "bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold"
                  }`}
                >
                  {openTrackSlots > 0 ? (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Track</span>
                      <span className="ml-1 px-1.5 py-0.2 rounded bg-zinc-700 dark:bg-zinc-300 text-zinc-100 dark:text-zinc-950 text-[10px] font-mono">
                        {currentTracksCount}/{maxAllowedTracks}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Upgrade Plan ({currentTracksCount}/{maxAllowedTracks})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          }
        />


        {/* COMPACT SLEEK HORIZONTAL TELEMETRY STRIP (Saves vertical space) */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#121215] px-4 py-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Progress bar with quota percent */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-500">
              <Gauge className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-[140px] max-w-sm space-y-1">
              <div className="flex items-center justify-between text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Daily Quota</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    {planTier}
                  </span>
                </span>
                <span className="text-zinc-500">{usagePercentage}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
                <div
                  style={{ width: `${Math.min(100, usagePercentage)}%` }}
                  className="bg-amber-500 h-full transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Right: Inline Telemetry Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs font-mono">
              <span className="text-zinc-500">Executed:</span>
              <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{executedToday}/{standardCap}</strong>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs font-mono">
              <span className="text-zinc-500">Alarms:</span>
              <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{currentActiveAlarms}/{maxScheduleAlarmsAllowed}</strong>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs font-mono">
              <span className="text-amber-600 dark:text-amber-400">Extra Pool:</span>
              <strong className="text-amber-600 dark:text-amber-400 font-bold">{extraReserveCredits}</strong>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs font-mono">
              <span className="text-zinc-500">Safety Cap:</span>
              <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{maxHardCap}/day</strong>
            </div>
          </div>
        </div>

        {/* Search & Slot Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200 shadow-xs">
              <Layers className="w-3.5 h-3.5 text-zinc-500" />
              <span>Monitored Tracks</span>
              <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold">
                {currentTracksCount}/{maxAllowedTracks}
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
              {openTrackSlots > 0 ? `${openTrackSlots} track slots available` : "Plan capacity reached"}
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audio stem or artist..."
              className="w-full h-8 pl-8 pr-3 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
        </div>

        {/* ACTIVE TRACK ALARMS GRID */}
        {filteredTracks.length === 0 ? (
          <div className="py-16 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/10 space-y-3">
            <Music2 className="w-8 h-8 text-zinc-400 mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                No Instagram audio stems registered
              </p>
              <p className="text-[11px] text-zinc-500 font-mono">
                Add an Instagram audio stem URL or ID to start tracking reels engagement.
              </p>
            </div>
            {!isViewer && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Your First Track</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTracks.map((track) => {
              const monogram = (track.title || "T")[0].toUpperCase();
              const sched = schedules[track.id] || {
                morning: false,
                afternoon: false,
                evening: false,
                night: false,
              };
              const isSyncing = syncingTrackId === track.id;
              const activeAlarmsCount =
                (sched.morning ? 1 : 0) +
                (sched.afternoon ? 1 : 0) +
                (sched.evening ? 1 : 0) +
                (sched.night ? 1 : 0) +
                (sched.customAlarms ? sched.customAlarms.length : 0);
              const isTrackActive = track.is_active !== false;
              const customAlarmsList = sched.customAlarms || [];

              return (
                <div
                  key={track.id}
                  className={cn(
                    "p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs",
                    isTrackActive
                      ? "border-zinc-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md"
                      : "border-zinc-200/60 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-950/40 opacity-75"
                  )}
                >
                  {/* Card Header: Identity, Artist, IG Link, Active/Paused Switch */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Monogram / Artwork */}
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500/10 via-zinc-100 to-zinc-200 dark:from-amber-500/15 dark:via-zinc-900 dark:to-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner">
                        {track.cover_artwork_url ? (
                          <img
                            src={getProxiedImageUrl(track.cover_artwork_url)}
                            alt={track.title || "Audio"}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : null}
                        <span className="font-extrabold font-mono text-zinc-800 dark:text-zinc-100 text-sm absolute">
                          {monogram}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                            {track.title || "Untitled Audio Stem"}
                          </h4>
                          <a
                            href={`https://www.instagram.com/reels/audio/${track.instagram_audio_id}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-400 hover:text-amber-500 transition-colors"
                            title="Open in Instagram"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                            IG Audio
                          </span>
                          <span>•</span>
                          <span className="truncate">{track.artist_name || "Audio Stem"}</span>
                          <span>•</span>
                          <span className="font-mono tabular-nums">{track.total_reels_count || 1} Reels</span>
                        </div>
                      </div>
                    </div>

                    {/* Enable / Disable Switch Toggle + Delete */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 shadow-2xs">
                        <button
                          type="button"
                          role="switch"
                          disabled={isViewer}
                          aria-checked={isTrackActive}
                          onClick={() => handleToggleTrackStatus(track.id, isTrackActive)}
                          className={cn(
                            "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none",
                            isTrackActive ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400"
                          )}
                          title={
                            isTrackActive
                              ? "Active: Click to pause audio & suspend scan alarms"
                              : "Paused: Click to activate audio & resume scan alarms"
                          }
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5",
                              isTrackActive ? "translate-x-3.5" : "translate-x-0.5"
                            )}
                          />
                        </button>
                        <span
                          className={cn(
                            "text-[10px] font-mono font-bold tracking-wider uppercase select-none",
                            isTrackActive ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"
                          )}
                        >
                          {isTrackActive ? "Active" : "Paused"}
                        </span>
                      </div>

                      {!isViewer && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTrack(track.id, track.title || "Track")}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Track"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scraper Alarm Schedules Section with + Add Schedule Button */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Daily Scraper Alarm Schedules:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {standardCap <= 0 ? (
                          <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-500" />
                            <span>Requires Daily Quota</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                            {activeAlarmsCount}/{maxScheduleAlarmsAllowed} Active
                          </span>
                        )}
                        {!isViewer && (
                          <button
                            type="button"
                            onClick={() => handleOpenScheduleModal(track)}
                            disabled={standardCap <= 0 || !isTrackActive}
                            className={cn(
                              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all shadow-xs cursor-pointer active:scale-95",
                              standardCap <= 0 || !isTrackActive
                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black"
                            )}
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Schedule</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Custom Alarms Pills if any */}
                    {customAlarmsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pb-1">
                        {customAlarmsList.map((timeSlot) => (
                          <span
                            key={timeSlot}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold"
                          >
                            <Clock className="w-3 h-3" />
                            <span>{timeSlot}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            {!isViewer && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomAlarm(track.id, timeSlot)}
                                className="text-zinc-400 hover:text-rose-500 ml-0.5"
                                title="Remove alarm"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 4 Alarm Clocks in 2x2 Grid with Color Badges and Interactive Switch */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {ALARM_SLOTS.map((slot) => {
                        const isSelected = sched[slot.key];
                        const isDisabled = standardCap <= 0 || !isTrackActive;

                        return (
                          <div
                            key={slot.key}
                            onClick={() => !isDisabled && toggleAlarm(track.id, slot.key)}
                            className={cn(
                              "flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 select-none shadow-xs",
                              isDisabled
                                ? "border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/30 dark:bg-zinc-900/10 opacity-50 cursor-not-allowed"
                                : isSelected
                                ? cn(slot.badgeBg, slot.badgeBorder, slot.badgeText, "cursor-pointer")
                                : "bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800/80 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                            )}
                            title={`Click to ${isSelected ? "deactivate" : "activate"} ${slot.time} scan alarm`}
                          >
                            <div className="min-w-0 pr-1">
                              <div className="flex items-center gap-1.5">
                                <Clock
                                  className={cn(
                                    "w-3.5 h-3.5 shrink-0",
                                    isSelected ? slot.iconColor : "text-zinc-400"
                                  )}
                                />
                                <span
                                  className={cn(
                                    "text-xs font-bold font-mono",
                                    isSelected ? slot.badgeText : "text-zinc-500 dark:text-zinc-400"
                                  )}
                                >
                                  {slot.time}
                                </span>
                                {isSelected && (
                                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", slot.dotColor)} />
                                )}
                              </div>
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate font-medium pt-0.5">
                                {slot.label}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <div
                                className={cn(
                                  "relative inline-flex h-4 w-7 shrink-0 rounded-full transition-colors duration-200 ease-in-out",
                                  isSelected && !isDisabled ? slot.switchBg : "bg-zinc-300 dark:bg-zinc-700"
                                )}
                              >
                                <span
                                  className={cn(
                                    "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out mt-0.5",
                                    isSelected && !isDisabled ? "translate-x-3.5" : "translate-x-0.5"
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Bar: Alarms summary & Scan Now button */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px] font-mono">
                      {!isTrackActive ? (
                        <span className="text-zinc-400 italic">Tracking paused</span>
                      ) : activeAlarmsCount > 0 ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{activeAlarmsCount} alarm{activeAlarmsCount > 1 ? "s" : ""} armed</span>
                        </>
                      ) : (
                        <span>Manual scan ready</span>
                      )}
                    </div>

                    {!isViewer ? (
                      <button
                        type="button"
                        onClick={() => handleRunNow(track.id, track.title || "Track")}
                        disabled={isSyncing || !isTrackActive}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all shadow-xs cursor-pointer",
                          !isTrackActive
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border border-transparent"
                            : remainingToday <= 0 && extraReserveCredits <= 0 && (isFreePlan || subscription?.status === "expired" || subscription?.status === "past_due")
                            ? "border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                            : "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:scale-[1.02] active:scale-[0.98]"
                        )}
                        title="Trigger immediate scan right now"
                      >
                        <Zap className={cn("w-3.5 h-3.5 text-amber-500 fill-amber-500/30", isSyncing && "animate-spin")} />
                        <span>
                          {isSyncing
                            ? "Scanning..."
                            : remainingToday <= 0 && extraReserveCredits <= 0 && (isFreePlan || subscription?.status === "expired" || subscription?.status === "past_due")
                            ? "Upgrade for Scans"
                            : "Scan Now"}
                        </span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500">
                        View-Only Access
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Track Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
                    Register Instagram Audio Stem
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleAddTrack} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-700 dark:text-zinc-300">
                    Instagram Audio URL or ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={audioInput}
                    onChange={(e) => setAudioInput(e.target.value)}
                    placeholder="https://www.instagram.com/reels/audio/1234567890/ or 1234567890"
                    className="w-full h-8 px-3 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-700 dark:text-zinc-300">
                    Song Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    placeholder="e.g. Midnight City Pulse"
                    className="w-full h-8 px-3 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-700 dark:text-zinc-300">
                    Artist / Label Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    placeholder="e.g. M83"
                    className="w-full h-8 px-3 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-xs font-mono rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white transition-colors"
                  >
                    {modalLoading ? "Registering..." : "Register Track"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stoki Radial Analog Clock Modal */}
        {schedulingTrack && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div
              onClick={() => setSchedulingTrack(null)}
              className="fixed inset-0"
            />
            <div className="relative w-full max-w-sm rounded-2xl bg-zinc-950 border border-zinc-800 p-5 shadow-2xl text-zinc-100 space-y-4 animate-in zoom-in-95 duration-200 z-10">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100 font-mono">
                      Add Scraper Alarm
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono truncate max-w-[200px]">
                      {schedulingTrack.title || "Track"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSchedulingTrack(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Split-Flap Digital & AM/PM Readout */}
              <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-inner flex flex-col items-center gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3 select-none">
                  {/* Hours Flip Card */}
                  <div
                    onClick={() => setPickerActiveTab("hours")}
                    className={cn(
                      "relative w-16 h-18 sm:w-18 sm:h-20 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 transition-all flex flex-col items-center justify-center cursor-pointer group shadow-lg",
                      pickerActiveTab === "hours"
                        ? "border-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.3)] scale-102"
                        : "border-zinc-800/80 hover:border-zinc-700"
                    )}
                  >
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 shadow-[0_1px_0_rgba(255,255,255,0.08)] pointer-events-none" />

                    <span className="font-mono text-3xl font-black text-white tabular-nums tracking-wider drop-shadow z-10">
                      {pickerHour.toString().padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "text-[8px] font-mono uppercase font-bold tracking-wider transition-colors z-10",
                        pickerActiveTab === "hours" ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-300"
                      )}
                    >
                      Hours
                    </span>

                    {/* Steppers */}
                    <div className="absolute -top-2.5 flex gap-1 z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          incrementHour();
                        }}
                        className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-amber-500 text-zinc-300 hover:text-zinc-950 flex items-center justify-center shadow cursor-pointer"
                        title="Hour Up"
                      >
                        <ChevronUp className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="absolute -bottom-2.5 flex gap-1 z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          decrementHour();
                        }}
                        className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-amber-500 text-zinc-300 hover:text-zinc-950 flex items-center justify-center shadow cursor-pointer"
                        title="Hour Down"
                      >
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* Pulsing Colon */}
                  <span className="text-2xl font-mono font-black text-amber-500/80 animate-pulse">:</span>

                  {/* Minutes Flip Card */}
                  <div
                    onClick={() => setPickerActiveTab("minutes")}
                    className={cn(
                      "relative w-16 h-18 sm:w-18 sm:h-20 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 transition-all flex flex-col items-center justify-center cursor-pointer group shadow-lg",
                      pickerActiveTab === "minutes"
                        ? "border-sky-500 shadow-[0_0_16px_rgba(14,165,233,0.3)] scale-102"
                        : "border-zinc-800/80 hover:border-zinc-700"
                    )}
                  >
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 shadow-[0_1px_0_rgba(255,255,255,0.08)] pointer-events-none" />

                    <span className="font-mono text-3xl font-black text-white tabular-nums tracking-wider drop-shadow z-10">
                      {pickerMinute.toString().padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "text-[8px] font-mono uppercase font-bold tracking-wider transition-colors z-10",
                        pickerActiveTab === "minutes" ? "text-sky-400" : "text-zinc-500 group-hover:text-zinc-300"
                      )}
                    >
                      Minutes
                    </span>

                    {/* Steppers */}
                    <div className="absolute -top-2.5 flex gap-1 z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          incrementMinute(1);
                        }}
                        className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-sky-500 text-zinc-300 hover:text-zinc-950 flex items-center justify-center shadow cursor-pointer"
                        title="Minute Up (+1m)"
                      >
                        <ChevronUp className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="absolute -bottom-2.5 flex gap-1 z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          decrementMinute(1);
                        }}
                        className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-sky-500 text-zinc-300 hover:text-zinc-950 flex items-center justify-center shadow cursor-pointer"
                        title="Minute Down (-1m)"
                      >
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* AM / PM Capsule Toggle */}
                  <div className="flex flex-col gap-1 p-0.5 rounded-xl bg-zinc-950 border border-zinc-800/90 shadow-inner">
                    <button
                      type="button"
                      onClick={() => setPickerPeriod("AM")}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer",
                        pickerPeriod === "AM"
                          ? "bg-amber-500 text-zinc-950 font-black shadow-xs scale-102"
                          : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      <Sun className="w-3 h-3" />
                      <span>AM</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerPeriod("PM")}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer",
                        pickerPeriod === "PM"
                          ? "bg-indigo-600 text-white font-black shadow-xs scale-102"
                          : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      <Moon className="w-3 h-3" />
                      <span>PM</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Interactive Circular Dial (160px analog clock) */}
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-zinc-400">
                    {pickerActiveTab === "hours" ? "Select Hour (1 - 12):" : `Minute Tuner (${pickerMinute.toString().padStart(2, "0")}m):`}
                  </span>
                  <div className="flex items-center p-0.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setPickerActiveTab("hours")}
                      className={cn(
                        "px-2 py-0.5 rounded transition-all font-semibold cursor-pointer",
                        pickerActiveTab === "hours" ? "bg-amber-500 text-zinc-950 font-bold shadow-xs" : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      Hours
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerActiveTab("minutes")}
                      className={cn(
                        "px-2 py-0.5 rounded transition-all font-semibold cursor-pointer",
                        pickerActiveTab === "minutes" ? "bg-sky-500 text-zinc-950 font-bold shadow-xs" : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      Minutes
                    </button>
                  </div>
                </div>

                {/* Circular Clock Dial */}
                <div className="relative w-40 h-40 mx-auto rounded-full bg-zinc-950 border border-zinc-800 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] flex items-center justify-center select-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-zinc-900 z-30" />

                  {/* Analog Pointer Needle */}
                  <div
                    className="absolute w-0.5 top-4 bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom transition-transform duration-200 z-10 pointer-events-none"
                    style={{
                      transform: `translateX(-50%) rotate(${
                        pickerActiveTab === "hours"
                          ? (pickerHour % 12) * 30
                          : pickerMinute * 6
                      }deg)`,
                    }}
                  >
                    <div
                      className={cn(
                        "w-full h-full rounded-t-full",
                        pickerActiveTab === "hours" ? "bg-amber-500/80" : "bg-sky-400/80"
                      )}
                    />
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full -top-1 -left-1 absolute shadow",
                        pickerActiveTab === "hours" ? "bg-amber-500 shadow-amber-500/50" : "bg-sky-400 shadow-sky-400/50"
                      )}
                    />
                  </div>

                  {/* Radial Nodes */}
                  {pickerActiveTab === "hours"
                    ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
                        const angleDeg = h * 30 - 90;
                        const angleRad = (angleDeg * Math.PI) / 180;
                        const radius = 60;
                        const cx = 80;
                        const cy = 80;
                        const x = cx + radius * Math.cos(angleRad);
                        const y = cy + radius * Math.sin(angleRad);
                        const isSelected = pickerHour === h;

                        return (
                          <button
                            key={h}
                            type="button"
                            style={{ left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)" }}
                            onClick={() => {
                              setPickerHour(h);
                              setPickerActiveTab("minutes");
                            }}
                            className={cn(
                              "absolute w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold transition-all z-20 cursor-pointer",
                              isSelected
                                ? "bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/60 scale-110"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                            )}
                          >
                            {h}
                          </button>
                        );
                      })
                    : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => {
                        const angleDeg = m * 6 - 90;
                        const angleRad = (angleDeg * Math.PI) / 180;
                        const radius = 60;
                        const cx = 80;
                        const cy = 80;
                        const x = cx + radius * Math.cos(angleRad);
                        const y = cy + radius * Math.sin(angleRad);
                        const isSelected = Math.round(pickerMinute / 5) * 5 === m;

                        return (
                          <button
                            key={m}
                            type="button"
                            style={{ left: `${x}px`, top: `${y}px`, transform: "translate(-50%, -50%)" }}
                            onClick={() => updatePickerMinute(m)}
                            className={cn(
                              "absolute w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold transition-all z-20 cursor-pointer",
                              isSelected
                                ? "bg-sky-500 text-zinc-950 shadow-md shadow-sky-500/60 scale-110"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                            )}
                          >
                            :{m.toString().padStart(2, "0")}
                          </button>
                        );
                      })}
                </div>

                {/* Fine Minute Slider & Quick Steps */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>Precision Slider:</span>
                    <div className="flex items-center gap-1">
                      {[-5, -1, 1, 5].map((step) => (
                        <button
                          key={step}
                          type="button"
                          onClick={() => (step > 0 ? incrementMinute(step) : decrementMinute(Math.abs(step)))}
                          className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[9px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          {step > 0 ? `+${step}m` : `${step}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={59}
                    value={pickerMinute}
                    onChange={(e) => updatePickerMinute(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSchedulingTrack(null)}
                  className="px-3 py-1.5 text-xs font-mono rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomAlarm}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold font-mono rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 transition-all shadow-md cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 fill-zinc-950" />
                  <span>Arm Alarm ({formattedPickerTime})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
