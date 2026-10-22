"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  RotateCw,
  Search,
  Filter,
  Code2,
  X,
  FileText,
  AlertOctagon,
  Music2,
  Bug,
  Terminal,
} from "lucide-react";
import { api } from "@/lib/api";

interface FailureLogItem {
  id: string;
  job_run_id?: string | null;
  tracked_audio_id?: string | null;
  audio_title?: string | null;
  artist_name?: string | null;
  instagram_audio_id?: string | null;
  stage?: string | null;
  error_type: string;
  error_message: string;
  stack_trace?: string | null;
  payload?: Record<string, any>;
  status: string;
  failed_at?: string | null;
  created_at?: string | null;
}

export default function AdminFailureLogsPage() {
  const [logs, setLogs] = useState<FailureLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<FailureLogItem | null>(null);
  const [errorTypeFilter, setErrorTypeFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminFailureLogs();
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to load failure logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const errorTypes = useMemo(() => {
    const types = new Set<string>();
    logs.forEach((l) => {
      if (l.error_type) types.add(l.error_type);
    });
    return ["all", ...Array.from(types)];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (l.instagram_audio_id && l.instagram_audio_id.includes(q)) ||
        (l.audio_title && l.audio_title.toLowerCase().includes(q)) ||
        (l.error_type && l.error_type.toLowerCase().includes(q)) ||
        (l.error_message && l.error_message.toLowerCase().includes(q)) ||
        (l.stage && l.stage.toLowerCase().includes(q));

      const matchesType =
        errorTypeFilter === "all" || l.error_type === errorTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [logs, searchQuery, errorTypeFilter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const uniqueAudios = new Set(logs.map((l) => l.instagram_audio_id).filter(Boolean)).size;
    const rateLimits = logs.filter((l) => l.error_type.toLowerCase().includes("rate")).length;
    return { total, uniqueAudios, rateLimits };
  }, [logs]);

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto overflow-y-auto h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-2">
            <Bug className="h-3.5 w-3.5" />
            <span>Telemetry &bull; scraper_failure_logs</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Scraper Failure Logs
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Diagnostic incident traces, exceptions, and payloads captured across worker executions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Incident Log
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
          <p className="text-[11px] font-mono uppercase text-rose-400 font-medium">Total Failure Incidents</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-5">
          <p className="text-[11px] font-mono uppercase text-zinc-400 font-medium">Affected Audios</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{stats.uniqueAudios}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="text-[11px] font-mono uppercase text-amber-400 font-medium">Rate Limits / Throttles</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.rateLimits}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search errors, audio IDs, or exception messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        {errorTypes.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {errorTypes.map((t) => (
              <button
                key={t}
                onClick={() => setErrorTypeFilter(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-colors ${
                  errorTypeFilter === t
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Failure Logs Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/60 text-zinc-400 font-mono text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Incident Time</th>
                <th className="py-3.5 px-4 font-semibold">Target Audio</th>
                <th className="py-3.5 px-4 font-semibold">Stage</th>
                <th className="py-3.5 px-4 font-semibold">Error Type</th>
                <th className="py-3.5 px-4 font-semibold">Error Message</th>
                <th className="py-3.5 px-4 font-semibold text-right">Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <RotateCw className="h-5 w-5 animate-spin mx-auto mb-2 text-rose-400" />
                    Fetching incident failure logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <AlertOctagon className="h-6 w-6 text-zinc-600 mx-auto mb-2" />
                    No scraper failure logs reported. Worker cluster is operating cleanly!
                  </td>
                </tr>
              ) : (
                filteredLogs.map((lg) => (
                  <tr
                    key={lg.id}
                    className="hover:bg-zinc-900/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedLog(lg)}
                  >
                    <td className="py-3.5 px-4 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
                      {new Date(lg.failed_at || lg.created_at || Date.now()).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Music2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <div>
                          <p className="font-semibold text-zinc-200">
                            {lg.audio_title || "Direct Scrape"}
                          </p>
                          <span className="font-mono text-[11px] text-zinc-500">
                            {lg.instagram_audio_id || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[11px]">
                        {lg.stage || "stream_reels"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-[11px] font-semibold">
                        {lg.error_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-300 font-mono text-[11px] max-w-sm truncate">
                      {lg.error_message}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(lg);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        <Terminal className="h-3.5 w-3.5" />
                        <span>Inspect Stack</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Diagnostics Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <span>Failure Incident Diagnosis</span>
                </h3>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">Log ID: {selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Audio ID</span>
                  <p className="font-mono font-semibold text-zinc-100 mt-0.5">
                    {selectedLog.instagram_audio_id || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Error Type</span>
                  <p className="font-mono font-semibold text-rose-400 mt-0.5">
                    {selectedLog.error_type}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Job Run ID</span>
                  <p className="font-mono text-zinc-400 mt-0.5 truncate">
                    {selectedLog.job_run_id || "Direct"}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-mono uppercase text-zinc-400 font-semibold mb-1.5 block">
                  Error Message
                </span>
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-xs break-words">
                  {selectedLog.error_message}
                </div>
              </div>

              {selectedLog.stack_trace && (
                <div>
                  <span className="text-xs font-mono uppercase text-zinc-400 font-semibold mb-1.5 block">
                    Python Stack Trace
                  </span>
                  <pre className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-[11px] leading-relaxed text-zinc-300 overflow-x-auto max-h-64 whitespace-pre">
                    {selectedLog.stack_trace}
                  </pre>
                </div>
              )}

              {selectedLog.payload && Object.keys(selectedLog.payload).length > 0 && (
                <div>
                  <span className="text-xs font-mono uppercase text-zinc-400 font-semibold mb-1.5 block">
                    Job Payload Dispatched
                  </span>
                  <pre className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto max-h-40">
                    {JSON.stringify(selectedLog.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
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
