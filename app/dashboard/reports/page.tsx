"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  Filter,
  Sparkles,
  RotateCw,
  Trash2,
  Check,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  FileText,
  Database,
  Mail,
  Zap,
  SlidersHorizontal,
  Table,
  CheckSquare,
  Square,
  Search,
  MessageSquare,
  ShieldCheck,
  Music2,
  Clock,
  Radio,
} from "lucide-react";
import { api, TrackedSong } from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";

const PLATFORM_THEMES = [
  { border: "border-amber-500/40 bg-amber-500/10 text-amber-500", dot: "bg-amber-500" },
  { border: "border-purple-500/40 bg-purple-500/10 text-purple-500", dot: "bg-purple-500" },
  { border: "border-rose-500/40 bg-rose-500/10 text-rose-500", dot: "bg-rose-500" },
  { border: "border-cyan-500/40 bg-cyan-500/10 text-cyan-500", dot: "bg-cyan-500" },
  { border: "border-lime-500/40 bg-lime-500/10 text-lime-500", dot: "bg-lime-500" },
];

import { useSearchParams } from "next/navigation";

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const trackIdParam = searchParams.get("track_id");

  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  const [tracks, setTracks] = useState<TrackedSong[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [reportType, setReportType] = useState<"MASTER_DATE_RANGE" | "SPECIFIC_SCAN">("MASTER_DATE_RANGE");
  const [scanRuns, setScanRuns] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [dateRangePreset, setDateRangePreset] = useState<"24h" | "7d" | "30d" | "90d" | "1y" | "all">("7d");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [reportTitle, setReportTitle] = useState("");
  const [fileFormat, setFileFormat] = useState<"XLSX" | "CSV">("XLSX");
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadData() {
    try {
      setIsLoading(true);
      const [tracksRes, repRes, runsRes] = await Promise.all([
        api.getTracks().catch(() => []),
        api.getReports().catch(() => ({ reports: [] })),
        api.getTrackJobRuns().catch(() => []),
      ]);
      const loadedTracks = tracksRes || [];
      setTracks(loadedTracks);
      // Pre-select track from URL param if passed, otherwise select all
      if (trackIdParam && loadedTracks.some((t) => t.id === trackIdParam)) {
        setSelectedTracks([trackIdParam]);
      } else {
        setSelectedTracks(loadedTracks.map((t) => t.id));
      }
      setReportHistory(repRes?.reports || []);
      const loadedRuns = runsRes || [];
      setScanRuns(loadedRuns);
      if (loadedRuns.length > 0) {
        setSelectedRunId(loadedRuns[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [trackIdParam]);

  const handleDatePreset = (preset: "24h" | "7d" | "30d" | "90d" | "1y" | "all") => {
    setDateRangePreset(preset);
    const now = new Date();
    const past = new Date();
    if (preset === "24h") past.setDate(now.getDate() - 1);
    else if (preset === "7d") past.setDate(now.getDate() - 7);
    else if (preset === "30d") past.setDate(now.getDate() - 30);
    else if (preset === "90d") past.setDate(now.getDate() - 90);
    else if (preset === "1y") past.setFullYear(now.getFullYear() - 1);
    else if (preset === "all") past.setFullYear(now.getFullYear() - 3);

    setFromDate(past.toISOString().split("T")[0]);
    setToDate(now.toISOString().split("T")[0]);
  };

  const toggleTrack = (id: string) => {
    setSelectedTracks((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      setNotice("Generating report dataset and compiling export stream...");

      const name = reportTitle.trim() || `RhythmSync_${dateRangePreset.toUpperCase()}_Export`;
      const primaryTrackId = selectedTracks.length === 1 ? selectedTracks[0] : undefined;

      const res = await api.generateReport({
        report_name: name,
        report_type: reportType,
        file_format: fileFormat,
        track_id: primaryTrackId,
      });

      // Trigger instant direct download
      const downloadUrl = `/api/v1/reports/export-csv${primaryTrackId ? `?track_id=${primaryTrackId}` : ""}`;
      window.open(downloadUrl, "_blank");

      setNotice(`Report "${name}" generated with ${res.row_count} rows! Download initiated.`);
      setTimeout(() => setNotice(null), 5000);
      await loadData();
    } catch {
      setNotice("Failed to generate report export.");
      setTimeout(() => setNotice(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1440px] w-full mx-auto">
      {/* Stoki Header */}
      <PageHeader
        title="Report Generator"
        description="Generate on-demand Excel spreadsheets and CSV exports from your monitored audio pulse scans."
        icon={<FileSpreadsheet className="w-5 h-5 text-zinc-950" />}
        iconVariant="amber"
        badge={
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>Auto-emailed to registered tenant inbox</span>
          </span>
        }
        actions={
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-amber-500" : ""}`} />
            <span>Refresh</span>
          </button>
        }
      />

      {/* Notice Banner */}
      {notice && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Tabs Header (Matching Stoki Screenshot) */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "create"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Create Report</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Generated Reports</span>
          <span className="px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono">
            {reportHistory.length}
          </span>
        </button>
      </div>

      {activeTab === "create" ? (
        /* Stoki 2-Column Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Columns: Query Scope & Track Selector */}
          <div className="lg:col-span-2 space-y-5">
            {/* 1. Report Type & Query Scope */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-500 flex items-center justify-center font-mono text-xs font-bold">
                    1
                  </span>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Report Type &amp; Query Scope
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">Query Mode</span>
              </div>

              {/* Radio Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setReportType("MASTER_DATE_RANGE")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                    reportType === "MASTER_DATE_RANGE"
                      ? "border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/40"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      reportType === "MASTER_DATE_RANGE" ? "border-emerald-500" : "border-zinc-400"
                    }`}>
                      {reportType === "MASTER_DATE_RANGE" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Master Date Range
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed pl-6">
                    Aggregate multiple scans across all audio stems over a custom date window.
                  </p>
                </div>

                <div
                  onClick={() => setReportType("SPECIFIC_SCAN")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1.5 ${
                    reportType === "SPECIFIC_SCAN"
                      ? "border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/40"
                      : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      reportType === "SPECIFIC_SCAN" ? "border-emerald-500" : "border-zinc-400"
                    }`}>
                      {reportType === "SPECIFIC_SCAN" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Specific Scan Instance
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed pl-6">
                    Download reel and creator records captured during a specific scan run.
                  </p>
                </div>
              </div>

              {/* Conditional: Master Date Range vs Specific Scan Runs Selector */}
              {reportType === "MASTER_DATE_RANGE" ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-zinc-500">
                      Select Date Range
                    </span>
                    <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900 text-xs font-mono flex-wrap">
                      {(
                        [
                          { id: "24h", label: "24h" },
                          { id: "7d", label: "7D" },
                          { id: "30d", label: "30D" },
                          { id: "90d", label: "90D" },
                          { id: "1y", label: "1Y" },
                          { id: "all", label: "ALL" },
                        ] as const
                      ).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleDatePreset(p.id)}
                          className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                            dateRangePreset === p.id
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold"
                              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                        FROM DATE
                      </span>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none font-bold"
                      />
                    </div>

                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                        TO DATE
                      </span>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Specific Scan Instance Selector */
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-zinc-500">
                      Select Scan Instance ({scanRuns.length} Available)
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Showing latest recorded runs
                    </span>
                  </div>

                  {scanRuns.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {scanRuns.map((run) => {
                        const isSelected = selectedRunId === run.id;
                        return (
                          <div
                            key={run.id}
                            onClick={() => setSelectedRunId(run.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${
                              isSelected
                                ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/40"
                                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected ? "border-emerald-500" : "border-zinc-400"
                                }`}
                              >
                                {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                    {run.track_title || "Audio Track"}
                                  </span>
                                  {run.artist_name && (
                                    <span className="text-[10px] text-zinc-400 font-sans">
                                      by {run.artist_name}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-zinc-400">
                                  {run.started_at
                                    ? new Date(run.started_at).toLocaleString()
                                    : "Recent Run"}{" "}
                                  • Run ID: {run.id.slice(0, 8)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                  run.status === "completed"
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : run.status === "failed"
                                    ? "bg-rose-500/15 text-rose-500"
                                    : "bg-amber-500/15 text-amber-500"
                                }`}
                              >
                                {run.status}
                              </span>
                              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                                {run.total_reels_scraped ?? 0} reels
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 text-center space-y-1.5">
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        No scan run snapshots recorded yet
                      </p>
                      <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                        Trigger an on-demand scan or wait for the cron cycle in Tracks &amp; Schedules to create point-in-time run snapshots.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Tracked Songs (Platforms Tile Equivalent in Stoki) */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-500 flex items-center justify-center font-mono text-xs font-bold">
                    2
                  </span>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Monitored Audio Catalog
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  {selectedTracks.length} of {tracks.length} selected
                </span>
              </div>

              {/* Song Selector Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tracks.map((track, idx) => {
                  const isSelected = selectedTracks.includes(track.id);
                  const theme = PLATFORM_THEMES[idx % PLATFORM_THEMES.length];

                  return (
                    <div
                      key={track.id}
                      onClick={() => toggleTrack(track.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2.5 ${
                        isSelected
                          ? "border-emerald-500/60 bg-emerald-500/5 ring-1 ring-emerald-500/30"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[90px]">
                            {track.title || track.track_name || "Audio Stem"}
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-400"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-zinc-400 truncate max-w-[80px]">
                          {track.artist_name || "Instagram"}
                        </span>
                        <span className={`font-semibold ${isSelected ? "text-emerald-500" : "text-zinc-400"}`}>
                          {isSelected ? "Included" : "Excluded"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Report Configuration & Instant Delivery */}
          <div className="space-y-5">
            {/* Report Configuration Card */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-5 shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Report Configuration
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Configure export format and custom filename.
                </p>
              </div>

              {/* Title / Tag input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-zinc-500 font-semibold">
                  Report Title / Tag (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q4_Audio_Virality_Audit"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full h-9 px-3 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <span className="text-[10px] font-mono text-zinc-400 block">
                  Auto-generated timestamp will be used if left blank.
                </span>
              </div>

              {/* Target File Format Cards */}
              <div className="space-y-1.5 pt-1">
                <span className="block text-[11px] font-mono text-zinc-500 font-semibold">
                  Target File Format
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setFileFormat("XLSX")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 text-center ${
                      fileFormat === "XLSX"
                        ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <FileSpreadsheet className="w-5 h-5 mx-auto" />
                    <span className="text-xs font-bold block">Excel (.xlsx)</span>
                    <span className="text-[10px] font-mono text-emerald-500 font-semibold">Recommended</span>
                  </div>

                  <div
                    onClick={() => setFileFormat("CSV")}
                    className={`p-3 rounded-xl border cursor-pointer transition-all space-y-1 text-center ${
                      fileFormat === "CSV"
                        ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <FileText className="w-5 h-5 mx-auto" />
                    <span className="text-xs font-bold block">CSV (.csv)</span>
                    <span className="text-[10px] font-mono text-zinc-400">Raw UTF-8</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Local & Email Delivery Notice */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Instant Local &amp; Email Delivery</span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                This report will be generated live and downloaded directly to your local device. A copy is also archived and sent to your registered account email.
              </p>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || selectedTracks.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-amber-500" />
                  <span>Compiling Dataset...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generate &amp; Export Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Tab 2: Generated Reports History (Matching Stoki) */
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#121215] overflow-hidden shadow-xs">
          <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 font-mono">
              Generated Reports Audit Log ({reportHistory.length})
            </h4>
            <span className="text-xs font-mono text-zinc-500">Auto-persisted</span>
          </div>

          {reportHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-5 py-3 font-medium">Report Name</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Format</th>
                    <th className="px-5 py-3 font-medium">Row Count</th>
                    <th className="px-5 py-3 font-medium">Generated At</th>
                    <th className="px-5 py-3 font-medium text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {reportHistory.map((rep) => (
                    <tr key={rep.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="px-5 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                        {rep.report_name}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {rep.report_type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-500">
                        {rep.file_format}
                      </td>
                      <td className="px-5 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                        {rep.row_count} rows
                      </td>
                      <td className="px-5 py-3 text-zinc-400">
                        {rep.created_at ? new Date(rep.created_at).toLocaleString() : "Recent"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <a
                          href={rep.download_url || `/api/v1/reports/export-csv`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-zinc-400 mx-auto" />
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                No reports generated yet
              </p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-mono">
                Click "Generate &amp; Export Report" on the Create Report tab to export boardroom files.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
