"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Plus,
  RotateCw,
  Trash2,
  CheckCircle2,
  HelpCircle,
  X,
  Loader2,
} from "lucide-react";
import { API_ENDPOINTS, getAuthHeaders } from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
}

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [sortOrder, setSortOrder] = useState<number>(1);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.adminFaqs, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      }
    } catch (err) {
      console.error("Failed to load FAQs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch(API_ENDPOINTS.adminFaqs, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
          category,
          sort_order: Number(sortOrder),
          is_published: true,
        }),
      });

      if (res.ok) {
        setQuestion("");
        setAnswer("");
        setIsModalOpen(false);
        await fetchFaqs();
      }
    } catch (err) {
      console.error("Error creating FAQ", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.adminFaqs}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error("Error deleting FAQ", err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Landing FAQs"
        description="Manage frequently asked questions displayed on the landing page and pricing section."
        icon={<HelpCircle className="w-5 h-5 text-zinc-950" />}
        iconVariant="amber"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={fetchFaqs}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 transition cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add FAQ
            </button>
          </div>
        }
      />

      <div className="space-y-3">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/80 flex items-start justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-amber-400 border border-zinc-800 uppercase">
                  {faq.category}
                </span>
                <span className="text-xs font-mono text-zinc-500">Order: {faq.sort_order}</span>
              </div>
              <h3 className="text-sm font-bold text-zinc-100">{faq.question}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{faq.answer}</p>
            </div>
            <button
              onClick={() => handleDeleteFaq(faq.id)}
              className="text-zinc-500 hover:text-rose-400 p-1.5 rounded hover:bg-zinc-900 transition cursor-pointer"
              title="Delete FAQ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#0c0d0e] border border-zinc-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-100">Add New FAQ</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFaq} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How are audio plays verified?"
                  className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Answer</label>
                <textarea
                  rows={3}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Detailed answer text..."
                  className="w-full p-3 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                  Publish FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
