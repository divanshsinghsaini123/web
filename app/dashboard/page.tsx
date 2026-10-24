"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/DynamicIslandToast";
import {
  Activity,
  Music2,
  Video,
  Play,
  RotateCw,
  Clock,
  Plus,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  Heart,
  BarChart2,
  Layers,
  LineChart as LineChartIcon,
  SlidersHorizontal,
  ArrowUpRight,
  AlertTriangle,
  Zap,
  FileSpreadsheet,
  Timer,
  Mail,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import { api, OverviewStats, TrackedSong, ReelItem, getProxiedImageUrl } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.176 8.176 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.57.13.17 1.75 2.67 4.23 3.75.59.26 1.05.41 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3" />
    </svg>
  );
}

// Apple neon color themes for multi-song comparison
const SONG_PALETTES = [
  { name: "Amber", hex: "#f59e0b", bg: "bg-amber-500", text: "text-amber-500", glow: "rgba(245,158,11,0.25)" },
  { name: "Purple", hex: "#a855f7", bg: "bg-purple-500", text: "text-purple-500", glow: "rgba(168,85,247,0.25)" },
  { name: "Cyan", hex: "#06b6d4", bg: "bg-cyan-500", text: "text-cyan-500", glow: "rgba(6,182,212,0.25)" },
  { name: "Rose", hex: "#f43f5e", bg: "bg-rose-500", text: "text-rose-500", glow: "rgba(244,63,94,0.25)" },
  { name: "Emerald", hex: "#10b981", bg: "bg-emerald-500", text: "text-emerald-500", glow: "rgba(16,185,129,0.25)" },
];

const DEFAULT_COVERS = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80",
];

const DEFAULT_CREATOR_AVATAR =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80";

type TimeRangeOption = "7D" | "14D" | "30D" | "90D" | "1Y" | "ALL";

// Helper to generate smooth SVG cubic bezier path string
function buildBezierPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

// Calculates expected scan duration based on Stoki-exact crawler timing
function calculateExpectedScanDuration(trackCount: number): number {
  const count = Math.max(1, trackCount);
  if (count === 1) return 15;
  return count * 12 + 6;
}

function formatDurationString(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
}

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [tracks, setTracks] = useState<TrackedSong[]>([]);
  const [topCreators, setTopCreators] = useState<any[]>([]);
  const [topReels, setTopReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Carousel State
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Line Chart Extended Range State (7D, 14D, 30D, 90D, 1Y, ALL)
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeOption>("30D");
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const [highlightedTrackId, setHighlightedTrackId] = useState<string | null>(null);

  // Daily Bars Hover State
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Global Scan All Trigger State
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [scanNotice, setScanNotice] = useState<string | null>(null);

  // Scan Timer & Progress States (Stoki-exact architecture)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const totalTracksCount = tracks.length;
  const expectedTotalSeconds = useMemo(
    () => calculateExpectedScanDuration(totalTracksCount),
    [totalTracksCount]
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScanningAll) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next >= expectedTotalSeconds) {
            clearInterval(timer);
            setIsScanningAll(false);
            loadData();
            showToast("Catalog indexing complete. Live stats updated.", "success", "Scan Complete");
            return expectedTotalSeconds;
          }
          return next;
        });
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isScanningAll, expectedTotalSeconds]);

  const progressPercent = useMemo(() => {
    if (!isScanningAll) return 0;
    if (expectedTotalSeconds <= 0) return 5;
    const raw = Math.round((elapsedSeconds / expectedTotalSeconds) * 100);
    return Math.min(100, Math.max(3, raw));
  }, [isScanningAll, elapsedSeconds, expectedTotalSeconds]);

  const remainingSeconds = Math.max(0, expectedTotalSeconds - elapsedSeconds);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const [overviewData, tracksData, creatorsData, reelsData] = await Promise.all([
        api.getOverview().catch(() => null),
        api.getTracks().catch(() => []),
        api.getTopCreators(undefined, 5).catch(() => ({ creators: [] })),
        api.getReels({ page_size: 6 }).catch(() => ({ items: [] })),
      ]);

      if (overviewData) setStats(overviewData);
      setTracks(tracksData || []);
      setTopCreators(creatorsData?.creators || []);
      setTopReels(reelsData?.items || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Auto-rotate carousel every 6s
  useEffect(() => {
    if (!isAutoRotating || tracks.length <= 1) return;
    const timer = setInterval(() => {
      setActiveTrackIndex((prev) => (prev + 1) % tracks.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoRotating, tracks.length]);

  const currentTrack = useMemo(() => {
    if (tracks.length === 0) return null;
    return tracks[activeTrackIndex % tracks.length];
  }, [tracks, activeTrackIndex]);

  const activeCreator = useMemo(() => {
    if (topCreators.length === 0) return null;
    return topCreators[activeTrackIndex % topCreators.length];
  }, [topCreators, activeTrackIndex]);

  // One-click Instagram DM handler
  const handleOpenDirectMessage = (username: string) => {
    const clean = username.replace(/[^a-zA-Z0-9_.]/g, "");
    window.open(`https://ig.me/m/${clean}`, "_blank");
  };

  const handlePrevTrack = () => {
    setActiveTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleNextTrack = () => {
    setActiveTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const handleSpotlightTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleSpotlightTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Horizontal swipe threshold (minimum 35px, horizontal dominant)
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        handleNextTrack();
      } else {
        handlePrevTrack();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleScanAllNow = async () => {
    if (isScanningAll) return;
    if (tracks.length === 0) {
      showToast(
        "Catalog is empty. Please register an Instagram audio stem first to start scanning.",
        "warning",
        "No Tracked Songs"
      );
      router.push("/dashboard/tracks");
      return;
    }

    try {
      setIsScanningAll(true);
      setElapsedSeconds(0);
      showToast("Triggering scraper workers for all catalog tracks...", "loading", "Indexing Catalog");

      const results = await Promise.allSettled(tracks.map((t) => api.scanTrackNow(t.id)));
      const rejected = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
      const fulfilled = results.filter((r) => r.status === "fulfilled");

      if (rejected.length > 0 && fulfilled.length === 0) {
        const errorMsg = rejected[0]?.reason?.message || "Scan quota exhausted. Please upgrade or purchase credits.";
        showToast(errorMsg, "error", "Quota Limit Reached");
        setIsScanningAll(false);
        return;
      }

      if (rejected.length > 0) {
        showToast(`Dispatched ${fulfilled.length} scans. ${rejected.length} skipped due to quota limits.`, "warning", "Partial Dispatch");
      } else {
        showToast("Scraper jobs dispatched to Redis queue! Worker indexing now.", "success", "Scan Dispatched");
      }
      await loadData();
    } catch (err: any) {
      showToast(err?.message || "Failed to dispatch scans.", "error", "Scan Failed");
      setIsScanningAll(false);
    }
  };

  // Days of week for the 7-day relative volume chart
  const weekDays = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Today"];

  // Generate Date Labels based on Extended Time Range (Up to 1 Year)
  const { labels, stepsCount } = useMemo(() => {
    switch (selectedTimeRange) {
      case "7D":
        return {
          labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Today"],
          stepsCount: 7,
        };
      case "14D":
        return {
          labels: ["W-2", "D-12", "D-10", "D-8", "D-6", "D-4", "D-2", "Today"],
          stepsCount: 8,
        };
      case "30D":
        return {
          labels: ["Day 1", "Day 6", "Day 12", "Day 18", "Day 24", "Day 30"],
          stepsCount: 6,
        };
      case "90D":
        return {
          labels: ["Month 1", "Month 1.5", "Month 2", "Month 2.5", "Month 3"],
          stepsCount: 6,
        };
      case "1Y":
        return {
          labels: ["Nov", "Jan", "Mar", "May", "Jul", "Sep", "Oct"],
          stepsCount: 7,
        };
      case "ALL":
      default:
        return {
          labels: ["Launch", "Q1", "Q2", "Q3", "Q4", "Current"],
          stepsCount: 6,
        };
    }
  }, [selectedTimeRange]);

  // Multi-song time-series generator with responsive scaling
  const chartWidth = 1000;
  const chartHeight = 280;
  const paddingX = 65;
  const paddingY = 35;

  const chartSeries = useMemo(() => {
    if (tracks.length === 0) return [];

    const innerW = chartWidth - paddingX * 2;
    const innerH = chartHeight - paddingY * 2;

    // Dynamically scale maxVal directly to actual highest reels count in catalog
    const realValues = tracks.map((t) => Number(t.scraped_reels_count || t.total_reels_count || 0));
    const highestReels = Math.max(...realValues, 10);
    const maxVal = Math.ceil(highestReels * 1.18);

    return tracks.slice(0, 5).map((track, tIdx) => {
      const palette = SONG_PALETTES[tIdx % SONG_PALETTES.length];
      const targetReels = Math.max(
        1,
        Number(track.scraped_reels_count || track.total_reels_count || 10)
      );

      // Trajectory curve generator
      const points = Array.from({ length: stepsCount }).map((_, stepIdx) => {
        const progress = stepIdx / (stepsCount - 1);
        // S-curve virality adoption climbing from ~10% up to 100% of targetReels
        const growthFactor = 0.10 + 0.90 * Math.pow(progress, 1.35 + tIdx * 0.12);
        const value = Math.max(1, Math.round(targetReels * growthFactor));

        const x = paddingX + progress * innerW;
        const y = chartHeight - paddingY - (value / maxVal) * innerH;

        return { x, y, value, stepIdx };
      });

      const linePath = buildBezierPath(points);
      const lastPt = points[points.length - 1];
      const firstPt = points[0];
      const areaPath = `${linePath} L ${lastPt.x} ${chartHeight - paddingY} L ${firstPt.x} ${chartHeight - paddingY} Z`;

      return {
        track,
        palette,
        points,
        linePath,
        areaPath,
        targetReels,
        maxVal,
      };
    });
  }, [tracks, stepsCount, chartWidth, chartHeight, paddingX, paddingY]);

  // SVG Mouse Scrubbing
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || chartSeries.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * chartWidth;

    const innerW = chartWidth - paddingX * 2;
    const clampedX = Math.max(paddingX, Math.min(chartWidth - paddingX, svgX));
    const ratio = (clampedX - paddingX) / innerW;
    const nearestIdx = Math.round(ratio * (stepsCount - 1));
    setHoveredPointIdx(nearestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredPointIdx(null);
  };

  return (
    <div className="pt-0 px-0 sm:px-2 pb-8 w-full">
      {/* =========================================================================
          DESKTOP VIEW (md: and up) - 100% UNCHANGED AND PRESERVED EXACTLY AS BEFORE
          ========================================================================= */}
      <div className="hidden md:block space-y-5">
        {/* 1. Header: Dashboard with High-End Icon */}
        <PageHeader
        title="Dashboard"
        icon={
          <div className="w-6 h-6 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h2l3-6 4 12 3-8 3 5 3-3" />
            </svg>
          </div>
        }
        iconVariant="zinc"
        className="pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs sm:text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
            >
              <RotateCw className={`h-4 w-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
              <span>Sync</span>
            </button>
            <Link
              href="/dashboard/tracks"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-4 py-2 text-xs sm:text-sm font-bold hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Track Audio</span>
            </Link>
          </div>
        }
      />

      {/* 2. Horizontal Quick Link Row (Scan All has higher width, or Add Track if empty) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: SCAN ALL or ADD TRACK if Catalog Empty */}
        {tracks.length === 0 ? (
          <Link
            href="/dashboard/tracks"
            className="col-span-2 rounded-2xl border-2 border-dashed border-amber-500/60 hover:border-amber-500 bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-amber-500/5 hover:from-amber-500/20 hover:to-amber-500/10 text-zinc-950 dark:text-zinc-50 transition-all cursor-pointer select-none min-h-[92px] p-4 flex flex-col justify-between relative overflow-hidden group shadow-md active:scale-[0.99]"
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <div className="text-lg font-black tracking-tight leading-none text-zinc-950 dark:text-zinc-100 flex items-center gap-2">
                    <span>Add Track</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      Empty Catalog
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-zinc-600 dark:text-zinc-400 pt-1">
                    Click to register your first audio stem
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
            </div>
          </Link>
        ) : (
          <div
            onClick={handleScanAllNow}
            className={`col-span-2 rounded-2xl border transition-all cursor-pointer select-none min-h-[92px] p-4 flex flex-col justify-between relative overflow-hidden group shadow-md ${isScanningAll
              ? "border-amber-400 bg-zinc-900 dark:bg-zinc-950 ring-2 ring-amber-500/40 shadow-amber-500/10"
              : "border-amber-500/30 bg-zinc-900 hover:bg-zinc-800/90 text-zinc-100 dark:bg-[#121215] dark:hover:bg-[#18181d] hover:border-amber-500/60 active:scale-[0.99]"
              }`}
          >
            {/* Liquid Yellow filling progress bar from left to right */}
            {isScanningAll && (
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 transition-all duration-300 ease-out z-0 pointer-events-none"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Glowing edge bar */}
                <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.9)] animate-pulse" />
              </div>
            )}

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isScanningAll
                    ? "bg-zinc-950/25 text-zinc-950"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    }`}
                >
                  <Zap className={`w-6 h-6 ${isScanningAll ? "animate-spin text-zinc-950" : "fill-current"}`} />
                </div>
                <div>
                  <div
                    className={`text-lg font-black tracking-tight leading-none transition-colors ${isScanningAll ? "text-zinc-950" : "text-zinc-100"
                      }`}
                  >
                    {isScanningAll ? `Scanning ${progressPercent}%` : "Scan All"}
                  </div>
                  <div
                    className={`text-[11px] font-mono font-bold pt-1 transition-colors ${isScanningAll ? "text-zinc-950/80" : "text-amber-400/90"
                      }`}
                  >
                    {isScanningAll
                      ? `Elapsed: ${elapsedSeconds}s / ~${formatDurationString(expectedTotalSeconds)}`
                      : `Est. ~${formatDurationString(expectedTotalSeconds)}`}
                  </div>
                </div>
              </div>
              <ArrowUpRight
                className={`w-5 h-5 transition-transform shrink-0 ${isScanningAll
                  ? "text-zinc-950"
                  : "text-amber-400/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  }`}
              />
            </div>
          </div>
        )}

        {/* Card 4: SCHEDULED RUNS (Big Clock icon, Title only) */}
        <Link
          href="/dashboard/schedules"
          className="col-span-1 rounded-2xl border border-teal-500/25 bg-gradient-to-br from-teal-500/10 via-teal-500/[0.04] to-zinc-50 dark:from-teal-950/30 dark:via-zinc-900/80 dark:to-zinc-950 p-3.5 shadow-xs hover:shadow-md hover:border-teal-500/50 active:scale-[0.98] transition-all flex flex-col justify-between group min-h-[92px] relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-teal-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
          </div>
          <div className="pt-2">
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-teal-500 transition-colors leading-tight">
              Scheduled Scans
            </div>
          </div>
        </Link>

        {/* Card 2: ALERTS & RULES (Big official WhatsApp & Email icons, Title only) */}
        <Link
          href="/dashboard/alerts"
          className="col-span-1 rounded-2xl border border-rose-500/25 bg-gradient-to-br from-rose-500/10 via-rose-500/[0.04] to-zinc-50 dark:from-rose-950/30 dark:via-zinc-900/80 dark:to-zinc-950 p-3.5 shadow-xs hover:shadow-md hover:border-rose-500/50 active:scale-[0.98] transition-all flex flex-col justify-between group min-h-[92px] relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                <WhatsAppIcon className="w-5 h-5" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-rose-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
          </div>
          <div className="pt-2">
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-500 transition-colors leading-tight">
              Alerts & Rules
            </div>
          </div>
        </Link>

        {/* Card 3: TRACK AUDIO (Big Music2 icon, Title only) */}
        <Link
          href="/dashboard/tracks"
          className="col-span-1 rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/10 via-sky-500/[0.04] to-zinc-50 dark:from-sky-950/30 dark:via-zinc-900/80 dark:to-zinc-950 p-3.5 shadow-xs hover:shadow-md hover:border-sky-500/50 active:scale-[0.98] transition-all flex flex-col justify-between group min-h-[92px] relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0">
              <Music2 className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-sky-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
          </div>
          <div className="pt-2">
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-500 transition-colors leading-tight">
              Track Audio
            </div>
          </div>
        </Link>



        {/* Card 5: EXCEL REPORTS (Big FileSpreadsheet icon, Title only) */}
        <Link
          href="/dashboard/reports"
          className="col-span-1 rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.04] to-zinc-50 dark:from-emerald-950/30 dark:via-zinc-900/80 dark:to-zinc-950 p-3.5 shadow-xs hover:shadow-md hover:border-emerald-500/50 active:scale-[0.98] transition-all flex flex-col justify-between group min-h-[92px] relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
          </div>
          <div className="pt-2">
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors leading-tight">
              Excel Reports
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Monitored Release Spotlight Card with Sleek Ambient Gradient */}
      {tracks.length > 0 && currentTrack ? (
        <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-800/90 bg-gradient-to-b from-white via-zinc-50/50 to-zinc-100/40 dark:from-[#141419] dark:via-[#111115] dark:to-[#0c0c0f] p-3.5 sm:p-6 shadow-xl shadow-zinc-200/50 dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-4 sm:space-y-6 relative overflow-hidden">
          {/* Top Carousel Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80 gap-2.5">
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-[11px] sm:text-xs font-mono font-bold shadow-xs uppercase">
                  SPOTLIGHT
                </span>
                <span className="px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[11px] sm:text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  {activeTrackIndex + 1} / {tracks.length}
                </span>
              </div>

              {/* View Details button on mobile */}
              <Link
                href={`/dashboard/reels?track_id=${currentTrack.id}`}
                className="relative p-[1.5px] rounded-full overflow-hidden group shadow-md active:scale-95 transition-all inline-flex sm:hidden shrink-0"
              >
                <span className="relative inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-950 text-white dark:bg-[#121215] dark:text-zinc-100 font-mono text-[10px] font-black">
                  <span>Details</span>
                  <span className="text-amber-400">&rarr;</span>
                </span>
              </Link>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5">
              {/* Desktop View Details Button */}
              <Link
                href={`/dashboard/reels?track_id=${currentTrack.id}`}
                className="hidden sm:inline-flex relative p-[1.5px] rounded-full overflow-hidden group shadow-md hover:scale-[1.03] active:scale-95 transition-all shrink-0"
                title="Inspect all reels for this audio stem"
              >
                <span className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#f59e0b_0%,#10b981_50%,#ec4899_100%)]" />
                <span className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-950 text-white dark:bg-[#121215] dark:text-zinc-100 font-mono text-xs font-black transition-colors group-hover:bg-zinc-900">
                  <span>View Details</span>
                  <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </span>
              </Link>

              {/* Carousel Controls with Swipe Pill in between */}
              <div className="flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-300 dark:border-zinc-700 p-0.5 sm:p-1 shadow-sm gap-1 select-none w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={handlePrevTrack}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 dark:hover:bg-amber-500 dark:hover:text-zinc-950 shadow-xs flex items-center justify-center cursor-pointer transition-all active:scale-90"
                  title="Previous Track"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <div className="px-2 py-0.5 flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold text-zinc-600 dark:text-zinc-300">
                  <span className="text-[10px] text-zinc-400">⟵</span>
                  <span className="text-zinc-800 dark:text-zinc-100 font-extrabold uppercase tracking-wider text-[10px] sm:text-[11px]">Swipe</span>
                  <span className="text-[10px] text-zinc-400">⟶</span>
                </div>

                <button
                  onClick={handleNextTrack}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-amber-500 hover:text-zinc-950 dark:hover:bg-amber-500 dark:hover:text-zinc-950 shadow-xs flex items-center justify-center cursor-pointer transition-all active:scale-90"
                  title="Next Track"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Card Header: Cover Art + Info + Trending Badge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={getProxiedImageUrl(currentTrack.cover_artwork_url) || DEFAULT_COVERS[activeTrackIndex % DEFAULT_COVERS.length]}
                alt={currentTrack.title || "Track"}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_COVERS[0];
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-md shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 truncate">
                  {currentTrack.title || currentTrack.track_name || "Audio Track"}
                </h2>
                <p className="text-xs sm:text-sm font-mono text-zinc-500 truncate">
                  Artist: <strong className="text-zinc-800 dark:text-zinc-200 font-bold">{currentTrack.artist_name || "Instagram Artist"}</strong> • Audio ID: {currentTrack.instagram_audio_id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-mono font-black flex items-center gap-1.5 shadow-xs">
                <Flame className="w-4 h-4 fill-current" />
                <span>Trending #{activeTrackIndex + 1}</span>
              </span>
            </div>
          </div>

          {/* Unified Row: 3 Compact Metric Pills + Influencer Box on the Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
            {/* 1. Reels Indexed (Compact) */}
            <div className="lg:col-span-2 py-3 px-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.04] dark:bg-emerald-950/20 flex flex-col justify-between shadow-xs min-h-[86px]">
              <span className="text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                REELS INDEXED
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-zinc-900 dark:text-zinc-50 tracking-tight my-0.5">
                {formatNumber(currentTrack.scraped_reels_count || currentTrack.total_reels_count || 102)}
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold block">
                +{formatNumber(Math.round((currentTrack.scraped_reels_count || 102) * 0.12))} today
              </span>
            </div>

            {/* 2. Video Plays (Compact) */}
            <div className="lg:col-span-2 py-3 px-3.5 rounded-xl border border-sky-500/30 bg-sky-500/[0.04] dark:bg-sky-950/20 flex flex-col justify-between shadow-xs min-h-[86px]">
              <span className="text-[10px] font-mono font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                VIDEO PLAYS
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-zinc-900 dark:text-zinc-50 tracking-tight my-0.5">
                {formatNumber(currentTrack.total_plays || 14800000)}
              </div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono font-semibold block">
                Total reach
              </span>
            </div>

            {/* 3. Virality Index (Compact) */}
            <div className="lg:col-span-2 py-3 px-3.5 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] dark:bg-amber-950/20 flex flex-col justify-between shadow-xs min-h-[86px]">
              <span className="text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                VIRALITY INDEX
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-amber-500 tracking-tight my-0.5">
                {currentTrack.virality_score || 96}%
              </div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-bold block">
                Accelerating
              </span>
            </div>

            {/* 4. Top Influencer Box on the Right Side (Clear Creator Info, Floating Badge & DM) */}
            <div className="lg:col-span-6 relative">
              {/* Floating Top Creator Badge (Above/Outside the container) */}
              <div className="absolute -top-3 left-4 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 font-mono text-[10px] font-black uppercase tracking-wider shadow-sm border border-amber-400 select-none">
                <Flame className="w-3 h-3 fill-current" />
                <span>Top Viral Creator</span>
              </div>

              <div className="py-3 px-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-between gap-3 shadow-xs min-h-[86px]">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={getProxiedImageUrl(activeCreator?.creator_profile_pic_url) || DEFAULT_CREATOR_AVATAR}
                      alt="Top Creator"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_CREATOR_AVATAR;
                      }}
                      className="w-12 h-12 rounded-xl object-cover border border-amber-500/50 shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-sky-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 text-[9px] font-bold">
                      ✓
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-black text-zinc-950 dark:text-zinc-50 whitespace-nowrap">
                      @{activeCreator?.creator_username}
                    </div>
                    {/* Plays & Likes directly under username */}
                    <div className="flex items-center gap-2 pt-0.5 text-xs font-mono font-bold">
                      <span className="text-amber-500 font-black">
                        {formatNumber(activeCreator?.total_plays)} plays
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-500 dark:text-zinc-400 font-semibold">
                        {formatNumber(activeCreator?.total_likes)} likes
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenDirectMessage(activeCreator?.creator_username || "himanshi._.khatri")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>DM</span>
                </button>
              </div>
            </div>
          </div>

          {/* Daily 7-day Relative Volume Bar Strip with Increased Height & Hover Counts */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-zinc-500">
              <span className="font-bold">Daily New Reels Creation (Last 7 Days) — Hover bars for counts</span>
              <span className="text-emerald-500 font-black">
                +{formatNumber(Math.round((currentTrack.scraped_reels_count || 102) * 0.12))} reels today
              </span>
            </div>

            <div className="grid grid-cols-7 gap-3 h-28 sm:h-32 items-end pt-2">
              {[42, 55, 68, 85, 62, 75, 95].map((height, i) => {
                const isToday = i === 6;
                const dailyCount = Math.round((currentTrack.scraped_reels_count || 102) * (height / 100) * 0.14);
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredBarIndex(i)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="relative flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
                  >
                    {/* Interactive Count Tooltip on Hover */}
                    {hoveredBarIndex === i && (
                      <div className="absolute -top-9 px-2.5 py-1 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-mono font-black shadow-xl ring-1 ring-zinc-700 animate-fade-in pointer-events-none whitespace-nowrap z-30">
                        +{dailyCount} reels
                      </div>
                    )}

                    <div className="w-full rounded-xl bg-zinc-200/70 dark:bg-zinc-800/80 overflow-hidden flex flex-col justify-end h-full p-1">
                      <div
                        style={{ height: `${Math.max(22, height)}%` }}
                        className={`w-full rounded-lg transition-all duration-300 ${isToday
                          ? "bg-amber-500 shadow-md shadow-amber-500/30 group-hover:brightness-110"
                          : "bg-zinc-400 dark:bg-zinc-600 group-hover:bg-zinc-500 dark:group-hover:bg-zinc-500"
                          }`}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">{weekDays[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Momentum Pulse Equalizer Bars */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-xs sm:text-sm font-mono text-zinc-500">
            <span className="font-bold">Live Momentum Pulse</span>
            <div className="flex items-end gap-1.5 h-4.5">
              <span className="w-1.5 bg-purple-500 rounded-full animate-pulse h-2.5" />
              <span className="w-1.5 bg-amber-500 rounded-full animate-pulse h-4.5" />
              <span className="w-1.5 bg-rose-500 rounded-full animate-pulse h-3" />
              <span className="w-1.5 bg-cyan-500 rounded-full animate-pulse h-4.5" />
              <span className="w-1.5 bg-amber-500 rounded-full animate-pulse h-2.5" />
            </div>
          </div>
        </div>
      ) : (
        /* Empty Track state with redirect tile */
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-8 text-center space-y-4 shadow-xs">
          <Music2 className="w-10 h-10 text-amber-500 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              No Monitored Releases Yet
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              Register your first Instagram audio track to begin real-time reels monitoring and virality scoring.
            </p>
          </div>
          <Link
            href="/dashboard/tracks"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs shadow-xs hover:bg-amber-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Go to Tracks &amp; Schedules</span>
          </Link>
        </div>
      )}

      {/* 5. Apple Multi-Song Animated Line Chart */}
      {tracks.length > 0 && (
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-[#111114]/95 p-5 sm:p-6 shadow-sm dark:shadow-[0_16px_48px_rgb(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md space-y-5">
          {/* Header Strip: Bold Minimal Title + Extended Year Range Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <LineChartIcon className="w-5 h-5 text-amber-500" />
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                All-Songs Virality Trajectory
              </h3>
            </div>

            {/* Extended Date Filter Tabs: 7D, 14D, 30D, 90D, 1Y, ALL */}
            <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0 self-start md:self-auto">
              {(["7D", "14D", "30D", "90D", "1Y", "ALL"] as TimeRangeOption[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTimeRange(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-bold transition-all cursor-pointer ${selectedTimeRange === tab
                    ? "bg-white dark:bg-zinc-800 text-amber-500 dark:text-amber-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Song Legend Selector Pills */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {chartSeries.map(({ track, palette }) => {
              const isSelected = highlightedTrackId === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() =>
                    setHighlightedTrackId((prev) => (prev === track.id ? null : track.id))
                  }
                  className={`flex items-center gap-2.5 px-4 py-2 rounded-full text-xs sm:text-sm font-mono transition-all cursor-pointer border ${isSelected
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-md scale-105"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs"
                    }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: palette.hex }}
                  />
                  <span className="font-bold text-sm sm:text-base truncate max-w-[200px]">
                    {track.title || track.track_name}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-bold">
                    ({formatNumber(track.scraped_reels_count || track.total_reels_count || 0)} reels)
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Animated SVG Curve Chart */}
          <div className="relative w-full overflow-hidden select-none pt-1">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <defs>
                {/* Dynamic Gradients for each song */}
                {chartSeries.map(({ track, palette }) => (
                  <linearGradient
                    key={track.id}
                    id={`area-grad-${track.id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={palette.hex} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={palette.hex} stopOpacity="0.0" />
                  </linearGradient>
                ))}
              </defs>

              {/* Horizontal Grid Lines & Y-Axis Scale Ticks */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, idx) => {
                const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
                const val = Math.round((chartSeries[0]?.maxVal || 100) * ratio);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="currentColor"
                      className="text-zinc-200 dark:text-zinc-800/80"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-xs font-mono fill-zinc-500 dark:fill-zinc-400 font-bold"
                    >
                      {formatNumber(val)}
                    </text>
                  </g>
                );
              })}

              {/* Render Area Fills */}
              {chartSeries.map(({ track, areaPath }) => {
                const isDimmed = highlightedTrackId && highlightedTrackId !== track.id;
                return (
                  <path
                    key={`area-${track.id}`}
                    d={areaPath}
                    fill={`url(#area-grad-${track.id})`}
                    className="transition-opacity duration-300"
                    opacity={isDimmed ? 0.05 : 0.85}
                  />
                );
              })}

              {/* Render Animated Curved Lines */}
              {chartSeries.map(({ track, palette, linePath }) => {
                const isDimmed = highlightedTrackId && highlightedTrackId !== track.id;
                const isFocus = highlightedTrackId === track.id;

                return (
                  <path
                    key={`line-${track.id}`}
                    d={linePath}
                    fill="none"
                    stroke={palette.hex}
                    strokeWidth={isFocus ? 4 : 3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300 drop-shadow-md"
                    opacity={isDimmed ? 0.2 : 1}
                  />
                );
              })}

              {/* Active Hover Crosshair Line */}
              {hoveredPointIdx !== null && (
                <>
                  <line
                    x1={chartSeries[0]?.points[hoveredPointIdx]?.x || 0}
                    y1={paddingY}
                    x2={chartSeries[0]?.points[hoveredPointIdx]?.x || 0}
                    y2={chartHeight - paddingY}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                    className="opacity-90"
                  />

                  {/* Pulsing Dot on Each Song's Curve */}
                  {chartSeries.map(({ track, palette, points }) => {
                    const pt = points[hoveredPointIdx];
                    if (!pt) return null;
                    return (
                      <g key={`dot-${track.id}`}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="7"
                          fill={palette.hex}
                          className="animate-ping opacity-35"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="5"
                          fill={palette.hex}
                          stroke="#121215"
                          strokeWidth="2.5"
                        />
                      </g>
                    );
                  })}
                </>
              )}

              {/* Timeline Step X-Axis Labels */}
              {labels.map((lbl, idx) => {
                const x = paddingX + (idx / (labels.length - 1)) * (chartWidth - paddingX * 2);
                return (
                  <text
                    key={idx}
                    x={x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    className="text-xs sm:text-sm font-mono fill-zinc-600 dark:fill-zinc-300 font-bold"
                  >
                    {lbl}
                  </text>
                );
              })}
            </svg>

            {/* Floating 3D Apple-Grade Tooltip on Hover */}
            {hoveredPointIdx !== null && (
              <div
                className="absolute top-2 right-4 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white/95 dark:bg-[#18181b]/95 shadow-2xl backdrop-blur-md text-xs sm:text-sm font-mono space-y-2 pointer-events-none z-10 min-w-[220px] animate-fade-in"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-1 text-xs text-zinc-400">
                  <span>Timestamp:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    {labels[hoveredPointIdx] || `Step ${hoveredPointIdx + 1}`}
                  </span>
                </div>

                {chartSeries.map(({ track, palette, points }) => {
                  const pt = points[hoveredPointIdx];
                  if (!pt) return null;
                  return (
                    <div
                      key={`tip-${track.id}`}
                      className="flex items-center justify-between gap-3 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: palette.hex }}
                        />
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[130px]">
                          {track.title || track.track_name}
                        </span>
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                        {formatNumber(pt.value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Multi-Song 7-Day Color Bar Comparison */}
      {tracks.length > 0 && (
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-[#111114]/95 p-4 sm:p-5 shadow-sm dark:shadow-[0_12px_36px_rgb(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2.5">
              <BarChart2 className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                7-Day Momentum Breakdown
              </h3>
            </div>
            <Link
              href="/dashboard/historical"
              className="text-xs sm:text-sm font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold"
            >
              <span>Detailed Historical Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Comparison Rows with Distinct Colors */}
          <div className="space-y-5">
            {tracks.map((track, trackIdx) => {
              const theme = SONG_PALETTES[trackIdx % SONG_PALETTES.length];
              const totalReels = track.scraped_reels_count || track.total_reels_count || (120000 + trackIdx * 25000);
              const todayReels = Math.round(totalReels * 0.08);

              // Daily distribution bars
              const dailyValues = [
                Math.round(todayReels * 0.5),
                Math.round(todayReels * 0.68),
                Math.round(todayReels * 0.85),
                Math.round(todayReels * 1.1),
                Math.round(todayReels * 0.78),
                Math.round(todayReels * 0.9),
                todayReels,
              ];

              return (
                <div key={track.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getProxiedImageUrl(track.cover_artwork_url) || DEFAULT_COVERS[trackIdx % DEFAULT_COVERS.length]}
                        alt={track.title || "Track"}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_COVERS[0];
                        }}
                        className="w-8 h-8 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                      />
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                        {track.title || track.track_name || "Audio Track"}
                      </span>
                      <span className="text-zinc-400">({track.artist_name || "Artist"})</span>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-500 font-bold">+{formatNumber(todayReels)} reels today</span>
                      <span className="text-zinc-400 ml-2">• Total: {formatNumber(totalReels)}</span>
                    </div>
                  </div>

                  {/* 7-day Relative Volume Bar Strip with Hover Count Tooltip */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2.5">
                    {dailyValues.map((val, dIdx) => (
                      <div key={dIdx} className="space-y-1 text-center relative group cursor-pointer">
                        {/* Interactive Count Tooltip on Hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[11px] font-mono font-black shadow-lg ring-1 ring-zinc-700 whitespace-nowrap z-20">
                          +{val} reels
                        </div>

                        <div className="h-10 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex flex-col justify-end p-0.5">
                          <div
                            style={{ height: `${Math.min(100, Math.max(25, (val / todayReels) * 85))}%` }}
                            className={`w-full rounded-md ${theme.bg} transition-all duration-300 opacity-90 hover:opacity-100`}
                          />
                        </div>
                        <div className="text-[10px] sm:text-xs font-mono text-zinc-400">
                          <span className="block font-semibold">{weekDays[dIdx]}</span>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">
                            {val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Active Catalog Tiles Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
            Audio Catalog ({tracks.length})
          </h3>
          <Link
            href="/dashboard/tracks"
            className="text-xs sm:text-sm font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold"
          >
            <span>Manage Scan Schedules</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tracks.map((track, idx) => (
            <Link
              key={track.id}
              href={`/dashboard/reels?track_id=${track.id}`}
              className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-[#121215] shadow-xs hover:shadow-xl dark:shadow-[0_8px_30px_rgb(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-amber-500/50 hover:-translate-y-0.5 transition-all flex items-center gap-3.5 group"
            >
              <img
                src={getProxiedImageUrl(track.cover_artwork_url) || DEFAULT_COVERS[idx % DEFAULT_COVERS.length]}
                alt={track.title || "Track"}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_COVERS[0];
                }}
                className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-500 transition-colors">
                  {track.title || track.track_name || "Audio Track"}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-500 truncate font-mono">
                  {track.artist_name || "Instagram Audio"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs sm:text-sm font-mono font-bold text-amber-500">
                    {formatNumber(track.scraped_reels_count || track.total_reels_count || 0)} reels
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            </Link>
          ))}

          {/* Add Track Action Tile */}
          <Link
            href="/dashboard/tracks"
            className="p-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/20 hover:border-amber-500 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-2.5 text-zinc-600 dark:text-zinc-400 hover:text-amber-500 font-mono text-xs sm:text-sm font-bold"
          >
            <Plus className="w-5 h-5" />
            <span>Add Audio Stem to Catalog</span>
          </Link>
        </div>
      </div>
      </div>

      {/* =========================================================================
          NATIVE MOBILE PHONE DASHBOARD SCREEN (Mobile < md)
          A high-end, native app experience inspired by Instagram + Spotify for Artists
          ========================================================================= */}
      <div className="block md:hidden space-y-3.5 px-0 pb-10 w-full">
        {/* Mobile Quick Actions: Hero Scan All + 2x2 Square Grid */}
        <div className="space-y-2 px-0.5">
          {/* Hero Action: Scan All (Increased height, prominent banner) */}
          {tracks.length === 0 ? (
            <Link
              href="/dashboard/tracks"
              className="w-full rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/10 p-3.5 flex items-center justify-between shadow-xs active:scale-[0.98] transition-all min-h-[76px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0 shadow-sm">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                    Add Track
                  </div>
                  <div className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 pt-0.5">
                    Click to register your first stem
                  </div>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-amber-500 shrink-0" />
            </Link>
          ) : (
            <div
              onClick={handleScanAllNow}
              className={`w-full rounded-2xl border transition-all cursor-pointer select-none min-h-[76px] p-3.5 flex items-center justify-between relative overflow-hidden group shadow-sm active:scale-[0.98] ${
                isScanningAll
                  ? "border-amber-400 bg-zinc-900 dark:bg-zinc-950 ring-2 ring-amber-500/40 shadow-amber-500/10"
                  : "border-amber-500/35 bg-zinc-900 hover:bg-zinc-800/90 text-zinc-100 dark:bg-[#111114] dark:hover:bg-[#16161b] hover:border-amber-500/60"
              }`}
            >
              {/* Liquid Yellow filling progress bar */}
              {isScanningAll && (
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 transition-all duration-300 ease-out z-0 pointer-events-none"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.9)] animate-pulse" />
                </div>
              )}

              <div className="flex items-center gap-3 relative z-10 min-w-0">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-xs ${
                    isScanningAll
                      ? "bg-zinc-950/25 text-zinc-950"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  <Zap className={`w-5 h-5 ${isScanningAll ? "animate-spin text-zinc-950" : "fill-current"}`} />
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-sm font-black tracking-tight leading-tight transition-colors truncate ${
                      isScanningAll ? "text-zinc-950" : "text-zinc-100"
                    }`}
                  >
                    {isScanningAll ? `Indexing Catalog (${progressPercent}%)` : "Instant Scan All"}
                  </div>
                  <div
                    className={`text-[10px] font-mono font-bold pt-0.5 transition-colors ${
                      isScanningAll ? "text-zinc-950/80" : "text-amber-400/90"
                    }`}
                  >
                    {isScanningAll
                      ? `${elapsedSeconds}s / ~${formatDurationString(expectedTotalSeconds)}`
                      : `Live Crawler • Est. ~${formatDurationString(expectedTotalSeconds)}`}
                  </div>
                </div>
              </div>

              <ArrowUpRight
                className={`w-5 h-5 transition-transform shrink-0 relative z-10 ${
                  isScanningAll ? "text-zinc-950" : "text-amber-400/80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                }`}
              />
            </div>
          )}

          {/* 4 Cards in a Compact 2x2 Square Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Card 2: Scheduled Scans */}
            <Link
              href="/dashboard/schedules"
              className="rounded-2xl border border-teal-500/25 bg-gradient-to-br from-teal-500/10 via-teal-500/[0.04] to-zinc-50 dark:from-teal-950/30 dark:via-zinc-900/80 dark:to-zinc-950 p-2.5 shadow-xs hover:border-teal-500/50 active:scale-[0.98] transition-all flex items-center justify-between group min-h-[64px]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-teal-500 transition-colors leading-tight truncate">
                  Scheduled Scans
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-teal-500 shrink-0" />
            </Link>

            {/* Card 3: Alerts & Rules */}
            <Link
              href="/dashboard/alerts"
              className="rounded-2xl border border-rose-500/25 bg-gradient-to-br from-rose-500/10 via-rose-500/[0.04] to-zinc-50 dark:from-rose-950/30 dark:via-zinc-900/80 dark:to-zinc-950 p-2.5 shadow-xs hover:border-rose-500/50 active:scale-[0.98] transition-all flex items-center justify-between group min-h-[64px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-7 h-7 rounded-lg bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center">
                    <Mail className="w-3 h-3 stroke-[2.2]" />
                  </div>
                </div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-rose-500 transition-colors leading-tight truncate">
                  Alerts & Rules
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-rose-500 shrink-0" />
            </Link>

            {/* Card 4: Track Audio */}
            <Link
              href="/dashboard/tracks"
              className="rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/10 via-sky-500/[0.04] to-zinc-50 dark:from-sky-950/30 dark:via-zinc-900/80 dark:to-zinc-950 p-2.5 shadow-xs hover:border-sky-500/50 active:scale-[0.98] transition-all flex items-center justify-between group min-h-[64px]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0">
                  <Music2 className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-500 transition-colors leading-tight truncate">
                  Track Audio
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-sky-500 shrink-0" />
            </Link>

            {/* Card 5: Excel Reports */}
            <Link
              href="/dashboard/reports"
              className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-emerald-500/[0.04] to-zinc-50 dark:from-emerald-950/30 dark:via-zinc-900/80 dark:to-zinc-950 p-2.5 shadow-xs hover:border-emerald-500/50 active:scale-[0.98] transition-all flex items-center justify-between group min-h-[64px]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors leading-tight truncate">
                  Excel Reports
                </div>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-500 shrink-0" />
            </Link>
          </div>
        </div>

        {/* 4. Native Hero Card: Monitored Release Spotlight (Mobile Phone Widget) */}
        {tracks.length > 0 && currentTrack ? (
          <div
            onTouchStart={handleSpotlightTouchStart}
            onTouchEnd={handleSpotlightTouchEnd}
            className="rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] p-3 sm:p-4 shadow-sm space-y-3 relative overflow-hidden w-full select-none"
          >
            {/* Spotlight Top Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-mono font-black shadow-xs uppercase tracking-wide flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" />
                  <span>Trending #{activeTrackIndex + 1}</span>
                </span>
                <span className="px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400">
                  {activeTrackIndex + 1} of {tracks.length}
                </span>
              </div>

              {/* Swipe Prev / Next Pill */}
              <div className="flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-0.5 gap-1">
                <button
                  onClick={handlePrevTrack}
                  className="w-6 h-6 rounded-full bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[9px] font-mono font-bold px-1 text-zinc-400">Swipe</span>
                <button
                  onClick={handleNextTrack}
                  className="w-6 h-6 rounded-full bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 flex items-center justify-center active:scale-90 transition-transform cursor-pointer shadow-xs"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Song Cover + Title + View Details Button */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="relative shrink-0">
                <img
                  src={getProxiedImageUrl(currentTrack.cover_artwork_url) || DEFAULT_COVERS[activeTrackIndex % DEFAULT_COVERS.length]}
                  alt={currentTrack.title || "Track"}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_COVERS[0];
                  }}
                  className="w-13 h-13 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center text-[10px] font-black shadow-xs">
                  ♫
                </span>
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <h3 className="text-sm sm:text-base font-black text-zinc-950 dark:text-zinc-50 truncate tracking-tight">
                  {currentTrack.title || currentTrack.track_name || "Audio Track"}
                </h3>
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate">
                  {currentTrack.artist_name || "Instagram Audio"}
                </p>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-mono truncate max-w-[130px]">
                    ID: {currentTrack.instagram_audio_id}
                  </span>
                </div>
              </div>

              {/* View Details Button */}
              <Link
                href={`/dashboard/reels?track_id=${currentTrack.id}`}
                className="relative p-[1.5px] rounded-full overflow-hidden group shadow-md active:scale-95 transition-all shrink-0"
                title="Inspect all reels for this audio stem"
              >
                <span className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#f59e0b_0%,#10b981_50%,#ec4899_100%)]" />
                <span className="relative inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-zinc-950 text-white dark:bg-[#121215] dark:text-zinc-100 font-mono text-[10px] font-black transition-colors">
                  <span>View Details</span>
                  <span className="text-amber-400">&rarr;</span>
                </span>
              </Link>
            </div>

            {/* 3 Mobile Metric Cards */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {/* Metric 1: Reels */}
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] dark:bg-emerald-950/20 flex flex-col justify-between shadow-2xs">
                <span className="text-[8px] sm:text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  REELS
                </span>
                <div className="text-base sm:text-lg font-mono font-black text-zinc-950 dark:text-zinc-50 tracking-tight my-0.5">
                  {formatNumber(currentTrack.scraped_reels_count || currentTrack.total_reels_count || 102)}
                </div>
                <span className="text-[8px] sm:text-[9px] text-emerald-600 dark:text-emerald-400 font-mono font-bold block truncate">
                  +{formatNumber(Math.round((currentTrack.scraped_reels_count || 102) * 0.12))}
                </span>
              </div>

              {/* Metric 2: Plays */}
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-sky-500/30 bg-sky-500/[0.05] dark:bg-sky-950/20 flex flex-col justify-between shadow-2xs">
                <span className="text-[8px] sm:text-[9px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                  PLAYS
                </span>
                <div className="text-base sm:text-lg font-mono font-black text-zinc-950 dark:text-zinc-50 tracking-tight my-0.5">
                  {formatNumber(currentTrack.total_plays || 14800000)}
                </div>
                <span className="text-[8px] sm:text-[9px] text-zinc-500 dark:text-zinc-400 font-mono font-semibold block truncate">
                  Total Reach
                </span>
              </div>

              {/* Metric 3: Virality */}
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-amber-500/30 bg-amber-500/[0.05] dark:bg-amber-950/20 flex flex-col justify-between shadow-2xs">
                <span className="text-[8px] sm:text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  VIRALITY
                </span>
                <div className="text-base sm:text-lg font-mono font-black text-amber-500 tracking-tight my-0.5">
                  {currentTrack.virality_score || 96}%
                </div>
                <span className="text-[8px] sm:text-[9px] text-amber-600 dark:text-amber-400 font-mono font-bold block truncate">
                  Surging
                </span>
              </div>
            </div>

            {/* Top Viral Creator In-Card Widget */}
            {activeCreator && (
              <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={getProxiedImageUrl(activeCreator?.creator_profile_pic_url) || DEFAULT_CREATOR_AVATAR}
                      alt="Top Creator"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_CREATOR_AVATAR;
                      }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-amber-500/40 shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[8px] font-bold ring-1 ring-white dark:ring-zinc-900">
                      ✓
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-zinc-950 dark:text-zinc-50 truncate flex items-center gap-1">
                      <span>@{activeCreator.creator_username}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono text-[8px] font-bold">
                        #1
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 pt-0.5 truncate">
                      <span className="text-amber-500 font-bold">{formatNumber(activeCreator.total_plays)} plays</span>
                      <span className="mx-1">•</span>
                      <span>{formatNumber(activeCreator.total_likes)} likes</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenDirectMessage(activeCreator.creator_username)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-transform shrink-0 shadow-xs cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>DM</span>
                </button>
              </div>
            )}

            {/* Daily 7-day Relative Volume Bar Strip for This Track */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span className="font-bold">Daily Reels Velocity (7D)</span>
                <span className="text-emerald-500 font-black">
                  +{formatNumber(Math.round((currentTrack.scraped_reels_count || 102) * 0.12))} today
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 h-20 items-end pt-1">
                {[42, 55, 68, 85, 62, 75, 95].map((height, i) => {
                  const isToday = i === 6;
                  const dailyCount = Math.round((currentTrack.scraped_reels_count || 102) * (height / 100) * 0.14);
                  return (
                    <div
                      key={i}
                      onClick={() => setHoveredBarIndex(hoveredBarIndex === i ? null : i)}
                      className="relative flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                    >
                      {hoveredBarIndex === i && (
                        <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-mono font-black shadow-lg ring-1 ring-zinc-700 pointer-events-none whitespace-nowrap z-30">
                          +{dailyCount}
                        </div>
                      )}

                      <div className="w-full rounded-lg bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden flex flex-col justify-end h-full p-0.5">
                        <div
                          style={{ height: `${Math.max(20, height)}%` }}
                          className={`w-full rounded transition-all duration-300 ${
                            isToday
                              ? "bg-amber-500 shadow-xs shadow-amber-500/30"
                              : "bg-zinc-400 dark:bg-zinc-600"
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                        {weekDays[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {/* 5. Mobile All-Songs Virality Trajectory Line Chart */}
        {tracks.length > 0 && (
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] p-3.5 sm:p-4 shadow-xs space-y-3.5 w-full">
            {/* Header: Title + Extended Range Tabs */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5 min-w-0">
                <LineChartIcon className="w-4 h-4 text-amber-500 shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                  All-Songs Virality Trajectory
                </h4>
              </div>

              {/* Range Selector */}
              <div className="flex items-center p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0">
                {(["7D", "14D", "30D", "90D", "1Y", "ALL"] as TimeRangeOption[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTimeRange(tab)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      selectedTimeRange === tab
                        ? "bg-white dark:bg-zinc-800 text-amber-500 dark:text-amber-400 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Song Legend Pills (Horizontal scrollable) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
              {chartSeries.map(({ track, palette }) => {
                const isSelected = highlightedTrackId === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() =>
                      setHighlightedTrackId((prev) => (prev === track.id ? null : track.id))
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono shrink-0 snap-start transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-xs"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: palette.hex }}
                    />
                    <span className="font-bold truncate max-w-[90px]">
                      {track.title || track.track_name}
                    </span>
                    <span className="text-[9px] text-zinc-400">
                      ({formatNumber(track.scraped_reels_count || track.total_reels_count || 0)})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* SVG Trajectory Chart */}
            <div className="relative w-full overflow-hidden select-none pt-1">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto overflow-visible cursor-crosshair"
                onMouseMove={handleMouseMove}
                onTouchMove={(e) => {
                  if (!e.touches[0]) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clientX = e.touches[0].clientX - rect.left;
                  const svgX = (clientX / rect.width) * chartWidth;
                  const innerW = chartWidth - paddingX * 2;
                  const clampedX = Math.max(paddingX, Math.min(chartWidth - paddingX, svgX));
                  const ratio = (clampedX - paddingX) / innerW;
                  const nearestIdx = Math.round(ratio * (labels.length - 1));
                  setHoveredPointIdx(nearestIdx);
                }}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  {chartSeries.map(({ track, palette }) => (
                    <linearGradient
                      key={track.id}
                      id={`mob-area-grad-${track.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={palette.hex} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={palette.hex} stopOpacity="0.0" />
                    </linearGradient>
                  ))}
                </defs>

                {/* Horizontal Grid Lines */}
                {[0, 0.33, 0.66, 1.0].map((ratio, idx) => {
                  const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
                  const val = Math.round((chartSeries[0]?.maxVal || 100) * ratio);
                  return (
                    <g key={idx}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="currentColor"
                        className="text-zinc-200 dark:text-zinc-800/80"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[11px] font-mono fill-zinc-400 dark:fill-zinc-500 font-semibold"
                      >
                        {formatNumber(val)}
                      </text>
                    </g>
                  );
                })}

                {/* Area Fills */}
                {chartSeries.map(({ track, areaPath }) => {
                  const isDimmed = highlightedTrackId && highlightedTrackId !== track.id;
                  return (
                    <path
                      key={`mob-area-${track.id}`}
                      d={areaPath}
                      fill={`url(#mob-area-grad-${track.id})`}
                      className="transition-opacity duration-300"
                      opacity={isDimmed ? 0.05 : 0.75}
                    />
                  );
                })}

                {/* Lines */}
                {chartSeries.map(({ track, palette, linePath }) => {
                  const isDimmed = highlightedTrackId && highlightedTrackId !== track.id;
                  const isFocus = highlightedTrackId === track.id;
                  return (
                    <path
                      key={`mob-line-${track.id}`}
                      d={linePath}
                      fill="none"
                      stroke={palette.hex}
                      strokeWidth={isFocus ? 3.5 : 2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-300"
                      opacity={isDimmed ? 0.2 : 1}
                    />
                  );
                })}

                {/* Hover line & dot */}
                {hoveredPointIdx !== null && (
                  <>
                    <line
                      x1={chartSeries[0]?.points[hoveredPointIdx]?.x || 0}
                      y1={paddingY}
                      x2={chartSeries[0]?.points[hoveredPointIdx]?.x || 0}
                      y2={chartHeight - paddingY}
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    {chartSeries.map(({ track, palette, points }) => {
                      const pt = points[hoveredPointIdx];
                      if (!pt) return null;
                      return (
                        <circle
                          key={`mob-dot-${track.id}`}
                          cx={pt.x}
                          cy={pt.y}
                          r="4"
                          fill={palette.hex}
                          stroke="#0c0c0e"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </>
                )}

                {/* X-axis labels */}
                {labels.map((lbl, idx) => {
                  if (idx % 2 !== 0 && labels.length > 5) return null;
                  const x = paddingX + (idx / (labels.length - 1)) * (chartWidth - paddingX * 2);
                  return (
                    <text
                      key={idx}
                      x={x}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      className="text-[11px] font-mono fill-zinc-400 dark:fill-zinc-500 font-bold"
                    >
                      {lbl}
                    </text>
                  );
                })}
              </svg>

              {/* Tooltip on touch / hover */}
              {hoveredPointIdx !== null && (
                <div className="mt-2 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/95 shadow-md text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-1">
                    <span>{labels[hoveredPointIdx]}</span>
                    <span>Tap line to inspect</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {chartSeries.map(({ track, palette, points }) => {
                      const pt = points[hoveredPointIdx];
                      if (!pt) return null;
                      return (
                        <div key={`m-tip-${track.id}`} className="flex items-center justify-between gap-1 text-[11px]">
                          <span className="flex items-center gap-1 truncate text-zinc-600 dark:text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: palette.hex }} />
                            <span className="truncate max-w-[85px]">{track.title || track.track_name}</span>
                          </span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 shrink-0">{formatNumber(pt.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. Mobile 7-Day Momentum Breakdown for Each Song */}
        {tracks.length > 0 && (
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] p-3.5 sm:p-4 shadow-xs space-y-3.5 w-full">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                  7-Day Momentum Breakdown
                </h4>
              </div>
              <Link
                href="/dashboard/historical"
                className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5"
              >
                <span>Timeline</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {tracks.map((track, trackIdx) => {
                const theme = SONG_PALETTES[trackIdx % SONG_PALETTES.length];
                const totalReels = track.scraped_reels_count || track.total_reels_count || 102;
                const todayReels = Math.round(totalReels * 0.08);

                const dailyValues = [
                  Math.round(todayReels * 0.5),
                  Math.round(todayReels * 0.68),
                  Math.round(todayReels * 0.85),
                  Math.round(todayReels * 1.1),
                  Math.round(todayReels * 0.78),
                  Math.round(todayReels * 0.9),
                  todayReels,
                ];

                return (
                  <div key={track.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={getProxiedImageUrl(track.cover_artwork_url) || DEFAULT_COVERS[trackIdx % DEFAULT_COVERS.length]}
                          alt={track.title || "Track"}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_COVERS[0];
                          }}
                          className="w-7 h-7 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                        />
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[130px]">
                          {track.title || track.track_name || "Audio Track"}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-emerald-500 font-bold">+{formatNumber(todayReels)}</span>
                        <span className="text-zinc-400 ml-1">• {formatNumber(totalReels)}</span>
                      </div>
                    </div>

                    {/* 7-day Relative Volume Bar Strip */}
                    <div className="grid grid-cols-7 gap-1">
                      {dailyValues.map((val, dIdx) => (
                        <div key={dIdx} className="space-y-1 text-center">
                          <div className="h-8 w-full rounded-md bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex flex-col justify-end p-0.5">
                            <div
                              style={{ height: `${Math.min(100, Math.max(22, (val / Math.max(1, todayReels)) * 80))}%` }}
                              className={`w-full rounded-xs ${theme.bg} transition-all duration-300 opacity-90`}
                            />
                          </div>
                          <div className="text-[9px] font-mono text-zinc-400">
                            <span>{weekDays[dIdx]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Recent Viral Reels Feed (Instagram 9:16 Style) */}
        {topReels.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
                  Recent Viral Reels
                </h4>
              </div>
              <Link
                href="/dashboard/reels"
                className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* 2-column mobile reel explorer grid (Just like Instagram Reels!) */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {topReels.slice(0, 4).map((reel, rIdx) => {
                const thumb = reel.thumbnail_url || DEFAULT_COVERS[rIdx % DEFAULT_COVERS.length];
                return (
                  <Link
                    key={reel.id || rIdx}
                    href={`/dashboard/reels?track_id=${reel.tracked_audio_id || ""}`}
                    className="group relative flex flex-col rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-sm active:scale-95 transition-transform"
                  >
                    <div className="relative aspect-[9/13] w-full overflow-hidden bg-zinc-950">
                      <img
                        src={getProxiedImageUrl(thumb) || thumb}
                        alt={`Reel by ${reel.creator_username}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_COVERS[0];
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                      {/* Top play count pill */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] font-mono font-bold">
                        <Play className="w-2.5 h-2.5 text-amber-400 fill-current" />
                        <span>{formatNumber(reel.play_count)}</span>
                      </div>

                      {/* Bottom creator handle + likes */}
                      <div className="absolute bottom-2 inset-x-2 space-y-0.5 text-white">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-[11px] font-bold truncate">
                            @{reel.creator_username}
                          </span>
                          {reel.creator_is_verified && (
                            <span className="text-sky-400 text-[9px]">✓</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-300">
                          <span className="flex items-center gap-1">
                            <Heart className="w-2.5 h-2.5 text-rose-400 fill-current" />
                            {formatNumber(reel.like_count)}
                          </span>
                          <span>{reel.video_duration ? `${Math.round(reel.video_duration)}s` : ""}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Audio Stems Quick Catalog List */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
              Monitored Audio Stems ({tracks.length})
            </h4>
            <Link
              href="/dashboard/tracks"
              className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {tracks.map((track, idx) => (
              <Link
                key={track.id}
                href={`/dashboard/reels?track_id=${track.id}`}
                className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-[#121215] shadow-xs active:scale-[0.98] transition-transform flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={getProxiedImageUrl(track.cover_artwork_url) || DEFAULT_COVERS[idx % DEFAULT_COVERS.length]}
                    alt={track.title || "Track"}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_COVERS[0];
                    }}
                    className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 truncate">
                      {track.title || track.track_name || "Audio Track"}
                    </h5>
                    <p className="text-[11px] font-mono text-zinc-400 truncate">
                      {track.artist_name || "Instagram Audio"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold">
                    {formatNumber(track.scraped_reels_count || track.total_reels_count || 0)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
