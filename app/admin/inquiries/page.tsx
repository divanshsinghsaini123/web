"use client";

import React, { useEffect, useState } from "react";
import {
  Inbox,
  RotateCw,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { API_ENDPOINTS, getAuthHeaders } from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";

interface InquiryItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at?: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.adminInquiries, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (err) {
      console.error("Failed to load inquiries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.adminInquiries}/${id}/status`, {
        method: "PATCH",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
        );
      }
    } catch (err) {
      console.error("Failed to update inquiry status", err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Public Inquiries"
        description="Prospective enterprise inquiries, API access requests, and demo leads."
        icon={<Inbox className="w-5 h-5 text-zinc-950" />}
        iconVariant="amber"
        actions={
          <button
            onClick={fetchInquiries}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 transition cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
            Refresh
          </button>
        }
      />

      {inquiries.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-zinc-800 bg-zinc-950/60">
          <Mail className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-xs text-zinc-400">No public inquiries submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/80 flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-100">{inq.name}</span>
                  <span className="text-[11px] font-mono text-zinc-500">&lt;{inq.email}&gt;</span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      inq.status === "RESOLVED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {inq.status}
                  </span>
                </div>
                {inq.subject && (
                  <h4 className="text-xs font-semibold text-zinc-200">{inq.subject}</h4>
                )}
                <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {inq.message}
                </p>
                {inq.created_at && (
                  <span className="text-[10px] font-mono text-zinc-600 block pt-1">
                    Received {new Date(inq.created_at).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {inq.status !== "RESOLVED" ? (
                  <button
                    onClick={() => handleUpdateStatus(inq.id, "RESOLVED")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Resolved
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(inq.id, "NEW")}
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
