"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Music2,
  RotateCw,
  Zap,
  BarChart3,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { api, TrackedSong } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import PageHeader from "@/components/dashboard/PageHeader";

interface DayData {
  date: string;
  display_date: string;
  new_reels: number;
  daily_plays: number;
  daily_likes: number;
  cumulative_reels: number;
}

export default function HistoricalVelocityPage() {
  const [tracks, setTracks] = useState<TrackedSong[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [daysRange, setDaysRange] = useState<number>(14);
  const [timeline, setTimeline] = useState<DayData[]>([]);
  const [growthPct, setGrowthPct] = useState<number>(0);
  const [totalReels, setTotalReels] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);
      const [tracksRes, histRes] = await Promise.all([
        api.getTracks().catch(() => []),
        api.getHistoricalVelocity(selectedTrackId || undefined, daysRange).catch(() => ({
          timeline: [],
          growth_rate_pct: 0,
          total_reels: 0,
          days: daysRange,
        })),
      ]);

      setTracks(tracksRes || []);
      setTimeline(histRes?.timeline || []);
      setGrowthPct(histRes?.growth_rate_pct || 0);
      setTotalReels(histRes?.total_reels || 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedTrackId, daysRange]);

  const maxDailyReels = useMemo(() => {
    return Math.max(...timeline.map((d) => d.new_reels), 1);
  }, [timeline]);

  const todayReels = timeline.length > 0 ? timeline[timeline.length - 1].new_reels : 0;
  const yesterdayReels = timeline.length > 1 ? timeline[timeline.length - 2].new_reels : 0;
  const isPositiveGrowth = growthPct >= 0;

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1440px] w-full mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Historical Reels Velocity"
        description="Inspect daily reels publication rates, virality acceleration, and day-over-day adoption curves."
        icon={<TrendingUp className="w-5 h-5 text-zinc-950" />}
        iconVariant="amber"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100 dark:bg-zinc-900 text-xs font-mono">
              {[7, 14, 30].map((r) => (
                <button
                  key={r}
                  onClick={() => setDaysRange(r)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    daysRange === r
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  }`}
                >
                  {r}D
                </button>
              ))}
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {/* 1. Horizontal Song Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedTrackId("")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${
            !selectedTrackId
              ? "bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-300 shadow-xs"
              : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}
        >
          <div className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center shrink-0">
            <Music2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          </div>
          <span>All Monitored Catalog</span>
        </button>

        {tracks.map((track) => {
          const isSelected = selectedTrackId === track.id;
          return (
            <button
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${
                isSelected
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-300 shadow-xs"
                  : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              {track.cover_artwork_url ? (
                <img
                  src={track.cover_artwork_url}
                  alt={track.title || "Track"}
                  className="w-5 h-5 rounded-md object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <Music2 className="w-3 h-3 text-zinc-500" />
                </div>
              )}
              <span className="truncate max-w-[130px] font-semibold text-zinc-900 dark:text-zinc-100">
                {track.title || track.track_name || "Audio Track"}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Key Velocity Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#121215] p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
            Indexed Catalog Reels
          </span>
          <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {formatNumber(totalReels)}
          </div>
          <span className="text-xs text-zinc-400 font-mono">Total indexed posts</span>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#121215] p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
            24h Reels Published
          </span>
          <div className="text-2xl font-mono font-bold text-amber-500 tabular-nums">
            +{formatNumber(todayReels)}
          </div>
          <span className="text-xs text-zinc-400 font-mono">Yesterday: {yesterdayReels} reels</span>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#121215] p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
            Virality Growth Rate
          </span>
          <div className={`text-2xl font-mono font-bold flex items-center gap-1 tabular-nums ${
            isPositiveGrowth ? "text-emerald-500" : "text-rose-500"
          }`}>
            {isPositiveGrowth ? (
              <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <ArrowDownRight className="w-6 h-6 stroke-[2.5]" />
            )}
            <span>{isPositiveGrowth ? "+" : ""}{growthPct}%</span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Day-over-day delta</span>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#121215] p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
            Peak Day Velocity
          </span>
          <div className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {formatNumber(maxDailyReels)}
          </div>
          <span className="text-xs text-emerald-500 font-mono font-semibold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" /> High organic wave
          </span>
        </div>
      </div>

      {/* 3. Daily Velocity Bar Chart (Visual Clean Presentation) */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#121215] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
              Daily Reels Adoption Curve ({daysRange} Days)
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Hover column for daily volume
          </span>
        </div>

        {timeline.length > 0 ? (
          <div className="h-56 w-full flex items-end gap-2 sm:gap-3 pt-6 pb-2 px-2">
            {timeline.map((day, idx) => {
              const heightPct = Math.max(8, Math.round((day.new_reels / maxDailyReels) * 100));
              const isToday = idx === timeline.length - 1;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-12 bg-zinc-900 text-white text-[11px] font-mono px-2 py-1 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-20 border border-zinc-700">
                    <p className="font-bold">{day.display_date}</p>
                    <p>{day.new_reels} new reels</p>
                    <p className="text-zinc-400">{formatNumber(day.daily_plays)} plays</p>
                  </div>

                  {/* Number Badge above bar */}
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 font-semibold transition-colors">
                    {day.new_reels > 0 ? day.new_reels : "-"}
                  </span>

                  {/* Bar */}
                  <div className="w-full max-w-[40px] rounded-t-lg bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden flex flex-col justify-end transition-all group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isToday
                          ? "bg-amber-500 shadow-md shadow-amber-500/20"
                          : "bg-zinc-700 dark:bg-zinc-300 group-hover:bg-amber-500/80"
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[45px]">
                    {day.display_date}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs font-mono text-zinc-500">
            No historical daily data available yet for this interval.
          </div>
        )}
      </div>

      {/* 4. Daily Breakdown Table */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#121215] overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
            Daily Breakdown Audit
          </h4>
          <span className="text-xs font-mono text-zinc-500">{timeline.length} Recorded Snapshots</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">New Reels Published</th>
                <th className="px-5 py-3 font-medium">Daily Plays Generated</th>
                <th className="px-5 py-3 font-medium">Daily Likes</th>
                <th className="px-5 py-3 font-medium">Cumulative Catalog Reels</th>
                <th className="px-5 py-3 font-medium text-right">Trend Direction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {[...timeline].reverse().map((day, idx) => {
                const prev = timeline[timeline.length - 1 - idx - 1];
                const dayDiff = prev ? day.new_reels - prev.new_reels : 0;

                return (
                  <tr key={day.date} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {day.display_date} ({day.date})
                    </td>
                    <td className="px-5 py-3 font-bold text-amber-600 dark:text-amber-400 text-sm">
                      +{day.new_reels}
                    </td>
                    <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">
                      {formatNumber(day.daily_plays)}
                    </td>
                    <td className="px-5 py-3 text-zinc-500">
                      {formatNumber(day.daily_likes)}
                    </td>
                    <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatNumber(day.cumulative_reels)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {dayDiff > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-xs">
                          <TrendingUp className="w-3.5 h-3.5" /> +{dayDiff} vs prev
                        </span>
                      ) : dayDiff < 0 ? (
                        <span className="inline-flex items-center gap-1 text-zinc-400 font-medium text-xs">
                          <TrendingDown className="w-3.5 h-3.5" /> {dayDiff} vs prev
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs">Steady</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
