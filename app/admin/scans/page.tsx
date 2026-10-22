"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Activity,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Code2,
  X,
  ExternalLink,
  Music2,
  Film,
} from "lucide-react";
import { api } from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";

interface ScanJobRunItem {
  id: string;
  campaign_id?: string | null;
  campaign_name?: string | null;
  tracked_audio_id?: string | null;
  audio_title?: string;
  instagram_audio_id?: string;
  artist_name?: string;
  tenant_id?: string | null;
  tenant_name?: string;
  status: string;
  started_at?: string | null;
  completed_at?: string | null;
  total_reels_scraped: number;
  new_reels_added: number;
  error_message?: string | null;
  execution_metadata?: Record<string, any>;
}

export default function AdminScansPage() {
  const [runs, setRuns] = useState<ScanJobRunItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRun, setSelectedRun] = useState<ScanJobRunItem | null>(null);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminJobRuns(statusFilter);
      setRuns(data || []);
    } catch (err) {
      console.error("Failed to load scan job runs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [statusFilter]);

  const filteredRuns = useMemo(() => {
    return runs.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (r.audio_title && r.audio_title.toLowerCase().includes(q)) ||
        (r.instagram_audio_id && r.instagram_audio_id.includes(q)) ||
        (r.tenant_name && r.tenant_name.toLowerCase().includes(q)) ||
        (r.campaign_name && r.campaign_name.toLowerCase().includes(q)) ||
        (r.status && r.status.toLowerCase().includes(q))
      );
    });
  }, [runs, searchQuery]);

  const stats = useMemo(() => {
    const total = runs.length;
    const completed = runs.filter((r) => r.status === "completed").length;
    const running = runs.filter((r) => r.status === "running" || r.status === "pending").length;
    const failed = runs.filter((r) => r.status === "failed").length;
    const totalReels = runs.reduce((acc, r) => acc + (r.total_reels_scraped || 0), 0);
    return { total, completed, running, failed, totalReels };
  }, [runs]);

  const formatDuration = (start?: string | null, end?: string | null) => {
    if (!start) return "-";
    const s = new Date(start).getTime();
    const e = end ? new Date(end).getTime() : Date.now();
    const diffSec = Math.max(0, Math.round((e - s) / 1000));
    if (diffSec < 60) return `${diffSec}s`;
    const min = Math.floor(diffSec / 60);
    const sec = diffSec % 60;
    return `${min}m ${sec}s`;
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto overflow-y-auto h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
            <Activity className="h-3.5 w-3.5" />
            <span>Stoki Engine &bull; scan_job_runs</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Scan Job Runs
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Real-time execution telemetry and batch scraping histories across all tenants.
          </p>
        </div>

        <button
          onClick={fetchRuns}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Fleet
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4">
          <p className="text-[11px] font-mono uppercase text-zinc-500 font-medium">Total Job Runs</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-[11px] font-mono uppercase text-emerald-400 font-medium">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.completed}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-[11px] font-mono uppercase text-amber-400 font-medium">Running / Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.running}</p>
        </div>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
          <p className="text-[11px] font-mono uppercase text-rose-400 font-medium">Failed</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{stats.failed}</p>
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <p className="text-[11px] font-mono uppercase text-cyan-400 font-medium">Reels Scraped</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{stats.totalReels.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by audio title, audio ID, or workspace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["all", "running", "completed", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? "bg-cyan-500 text-zinc-950 shadow-sm"
                  : "bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/60 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Audio & Campaign</th>
                <th className="py-3.5 px-4 font-semibold">Workspace</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Reels Scraped</th>
                <th className="py-3.5 px-4 font-semibold">Started At</th>
                <th className="py-3.5 px-4 font-semibold">Duration</th>
                <th className="py-3.5 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading && runs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <RotateCw className="h-5 w-5 animate-spin mx-auto mb-2 text-cyan-400" />
                    Fetching scan job runs from database...
                  </td>
                </tr>
              ) : filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No scan job runs found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRuns.map((r) => {
                  const isRunning = r.status === "running" || r.status === "pending";
                  const isCompleted = r.status === "completed";
                  const isFailed = r.status === "failed";

                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-zinc-900/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedRun(r)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                            <Music2 className="h-4 w-4 text-cyan-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-100 truncate max-w-xs">
                              {r.audio_title || "Untitled Audio"}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                              <span>ID: {r.instagram_audio_id || "N/A"}</span>
                              {r.campaign_name && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-zinc-400">{r.campaign_name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-zinc-300">
                        {r.tenant_name || "Workspace"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                            isRunning
                              ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                              : isCompleted
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isRunning
                                ? "bg-amber-400 animate-ping"
                                : isCompleted
                                ? "bg-emerald-400"
                                : "bg-rose-400"
                            }`}
                          />
                          {r.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-1.5 text-zinc-200 font-bold">
                          <Film className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{r.total_reels_scraped.toLocaleString()}</span>
                          {r.new_reels_added > 0 && (
                            <span className="text-[10px] text-emerald-400 font-normal">
                              (+{r.new_reels_added})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                        {r.started_at ? new Date(r.started_at).toLocaleString() : "-"}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px]">
                        {formatDuration(r.started_at, r.completed_at)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRun(r);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <Code2 className="h-3.5 w-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Drawer / Modal */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span>Scan Job Run Inspection</span>
                </h3>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">UUID: {selectedRun.id}</p>
              </div>
              <button
                onClick={() => setSelectedRun(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Audio Title</span>
                  <p className="font-semibold text-zinc-100 mt-0.5">{selectedRun.audio_title || "Direct Audio"}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Instagram Audio ID</span>
                  <p className="font-mono font-semibold text-cyan-400 mt-0.5">
                    {selectedRun.instagram_audio_id || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Workspace</span>
                  <p className="font-semibold text-zinc-100 mt-0.5">{selectedRun.tenant_name}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Total Scraped</span>
                  <p className="font-bold text-zinc-100 mt-0.5">{selectedRun.total_reels_scraped} reels</p>
                </div>
              </div>

              {selectedRun.error_message && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  <span className="font-bold block mb-1">Execution Failure Error:</span>
                  <p className="font-mono text-[11px] leading-relaxed break-words">{selectedRun.error_message}</p>
                </div>
              )}

              <div>
                <span className="text-xs font-mono uppercase text-zinc-400 font-semibold mb-1.5 block">
                  Execution Metadata (JSON)
                </span>
                <pre className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto max-h-60">
                  {JSON.stringify(selectedRun.execution_metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
              <button
                onClick={() => setSelectedRun(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
