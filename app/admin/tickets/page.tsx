"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
} from "lucide-react";
import { API_ENDPOINTS, getAuthHeaders } from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";

interface TicketItem {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at?: string;
  tenant_name: string;
  user_email: string;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.adminTickets, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.adminTickets}/${id}/status`, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error("Failed to update ticket status", err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        description="Technical bug reports, scraper timeout issues, and customer support tickets."
        icon={<ShieldAlert className="w-5 h-5 text-zinc-950" />}
        iconVariant="amber"
        actions={
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 transition cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
            Refresh
          </button>
        }
      />

      {tickets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-zinc-800 bg-zinc-950/60">
          <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-xs text-zinc-400">No support tickets opened by tenants.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/80 flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-zinc-100">{t.subject}</span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    [{t.tenant_name} &bull; {t.user_email}]
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      t.status === "CLOSED" || t.status === "RESOLVED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {t.status}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full text-zinc-400 bg-zinc-900 border border-zinc-800 uppercase">
                    Priority: {t.priority}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">
                  {t.description}
                </p>
                {t.created_at && (
                  <span className="text-[10px] font-mono text-zinc-600 block pt-1">
                    Created {new Date(t.created_at).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {t.status !== "RESOLVED" ? (
                  <button
                    onClick={() => handleUpdateStatus(t.id, "RESOLVED")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolve Ticket
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(t.id, "OPEN")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 text-xs font-medium transition cursor-pointer"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
