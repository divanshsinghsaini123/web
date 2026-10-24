"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Upload,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Sparkles,
  Users,
  Music2,
  ShieldCheck,
  Check,
  Lock,
} from "lucide-react";
import { api, User } from "@/lib/api";
import PageHeader from "@/components/dashboard/PageHeader";

const INDUSTRY_CATEGORIES = [
  "Music Label / F&B",
  "Beauty & Personal Care",
  "Health & Wellness",
  "Home & Essentials",
  "Electronics",
  "Other",
];

const CATALOG_TIERS = [
  { value: "1-5", label: "1-5 Songs", desc: "Emerging Artists" },
  { value: "6-20", label: "6-20 Songs", desc: "Active Creators" },
  { value: "21-100", label: "21-100 Songs", desc: "Indie Labels" },
  { value: "100+", label: "100+ Songs", desc: "Commercial Catalog" },
];

const TEAM_SIZES = [
  { value: "Solo", label: "Solo Artist", desc: "Independent Creator" },
  { value: "2-5", label: "2-5 Squad", desc: "Management & Prod" },
  { value: "6-15", label: "6-15 Team", desc: "Music Agency" },
  { value: "15+", label: "15+ Enterprise", desc: "Media Publisher" },
];

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("Music Label / F&B");
  const [catalogTier, setCatalogTier] = useState("1-5");
  const [teamSize, setTeamSize] = useState("Solo");
  const [isOnboarded, setIsOnboarded] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const [profile, me] = await Promise.all([
          api.getTenantProfile().catch(() => null),
          api.getMe().catch(() => null),
        ]);

        if (me) {
          setCurrentUser(me);
          const role = (me.role || "OWNER").toUpperCase();
          if (role === "VIEWER" || role === "COLLABORATOR" || role === "SPONSOR") {
            router.replace("/dashboard");
            return;
          }
        }

        if (profile) {
          setCompanyName(profile.company_name || profile.name || "");
          setWebsiteUrl(profile.website_url || "");
          setContactEmail(profile.email || me?.email || "");
          setPhoneNumber(profile.phone_number || "");
          setCategory(profile.industry_category || "Music Label / F&B");
          setCatalogTier(profile.organization_size || "1-5");
          setTeamSize(profile.team_size || "Solo");
          setIsOnboarded(profile.is_onboarded ?? true);
        } else if (me) {
          setCompanyName(me.tenant?.name || `${me.full_name || "Creator"}'s Workspace`);
          setContactEmail(me.email || "");
          setIsOnboarded(me.tenant?.is_onboarded ?? true);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setErrorNotice("Workspace / Company name is required.");
      return;
    }

    setSaving(true);
    setSuccessNotice(null);
    setErrorNotice(null);

    try {
      await api.updateTenantProfile({
        company_name: companyName.trim(),
        website_url: websiteUrl.trim() || null,
        phone_number: phoneNumber.trim() || null,
        industry_category: category,
        organization_size: catalogTier,
        team_size: teamSize,
        mark_completed: true,
      });

      // Update cached storage
      const cached = localStorage.getItem("reelspulse_user");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.tenant) {
            parsed.tenant.name = companyName.trim();
            localStorage.setItem("reelspulse_user", JSON.stringify(parsed));
          }
        } catch {}
      }

      setSuccessNotice("Workspace settings saved successfully.");
      setIsOnboarded(true);
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      setErrorNotice(err.message || "Failed to update workspace settings.");
    } finally {
      setSaving(false);
    }
  };

  const userRole = (currentUser?.role || "OWNER").toUpperCase();
  const canEdit = userRole === "OWNER" || userRole === "ADMIN";

  const monogram = (companyName || "Workspace")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Header matching Stoki */}
      <PageHeader
        title="Workspace & Organization Settings"
        description="Manage your organization profile, target dark-store platforms, and automated stockout alerts."
        icon={<Building2 className="w-5 h-5 text-indigo-400" />}
        iconVariant="indigo"
        badge={
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Setup: Completed</span>
          </span>
        }
      />

      {successNotice && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {!canEdit && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-medium">
          <Lock className="w-4 h-4 shrink-0" />
          <span>
            Logged in as <strong>{userRole}</strong> (Read-Only). Workspace settings can only be altered by the Workspace Owner or Admin.
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-10">
        {/* SECTION 1: ORGANIZATION PROFILE */}
        <div className="space-y-6 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0d0e] p-6 md:p-8 shadow-xs">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="h-5 w-5 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-900 dark:text-zinc-100 uppercase">
              SECTION 1: ORGANIZATION PROFILE
            </h3>
          </div>

          {/* Logo & Avatar */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Workspace Avatar / Brand Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-mono font-bold text-lg shadow-sm">
                {monogram}
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Change Logo</span>
                </button>
                <p className="text-[11px] text-zinc-500 font-sans">
                  Recommended size: 256x256 PNG or SVG (max 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Divansh Singh's Workspace"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-emerald-500/50 transition"
                />
              </div>
            </div>

            {/* Website URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Website URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://acmebrands.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-emerald-500/50 transition"
                />
              </div>
            </div>

            {/* Contact Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Primary Contact Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  readOnly
                  value={contactEmail}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-900/40 text-xs font-medium text-zinc-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-zinc-500">Primary account identifier (read-only).</p>
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-emerald-500/50 transition font-mono"
                />
              </div>
            </div>
          </div>

          {/* Industry Category Pills matching Stoki */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Industry Category
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500 text-zinc-950 font-bold shadow-sm"
                        : "border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2: TEAM & PORTFOLIO SCALE */}
        <div className="space-y-6 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c0d0e] p-6 md:p-8 shadow-xs">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="h-5 w-5 rounded-md bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
            </div>
            <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-900 dark:text-zinc-100 uppercase">
              SECTION 2: TEAM &amp; PORTFOLIO SCALE
            </h3>
          </div>

          {/* Catalog Size Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Catalog / Song Tracking Capacity Target
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATALOG_TIERS.map((tier) => {
                const isSelected = catalogTier === tier.value;
                return (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => setCatalogTier(tier.value)}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <span className="block font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      {tier.label}
                    </span>
                    <span className="text-[10px] text-zinc-500">{tier.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Team Size Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Workspace Team Scale
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TEAM_SIZES.map((sz) => {
                const isSelected = teamSize === sz.value;
                return (
                  <button
                    key={sz.value}
                    type="button"
                    onClick={() => setTeamSize(sz.value)}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/10 text-purple-400 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <span className="block font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      {sz.label}
                    </span>
                    <span className="text-[10px] text-zinc-500">{sz.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {canEdit ? (
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? "Saving Changes..." : "Save Workspace Settings"}</span>
            </button>
          ) : (
            <div className="text-xs font-mono text-zinc-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Settings Locked (Owner/Admin Only)</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
