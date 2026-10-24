"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { MusicWaveBackground, VinylRecord, SoundWaveSVG } from "@/components/auth/music-visuals";
import { UniversalLoader } from "@/components/ui/LoadingSpinner";

function JoinWorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [isValidating, setIsValidating] = useState(true);
  const [inviteData, setInviteData] = useState<{
    valid: boolean;
    email: string;
    role: string;
    tenant_name: string;
  } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setValidationError("No invitation token provided. Please use the valid link sent by your workspace administrator.");
      setIsValidating(false);
      return;
    }

    async function checkToken() {
      try {
        setIsValidating(true);
        const data = await api.validateInvite(token);
        if (data && data.valid) {
          setInviteData(data);
        } else {
          setValidationError("This invitation code is invalid, has already been accepted, or has expired.");
        }
      } catch (err: any) {
        setValidationError(err.message || "Invalid or expired invitation token.");
      } finally {
        setIsValidating(false);
      }
    }

    checkToken();
  }, [token]);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    const cleanDigits = phoneNumber.replace(/\D/g, "");
    if (!cleanDigits || cleanDigits.length < 10) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const fullPhone = `+91${cleanDigits.slice(-10)}`;
      const res = await api.acceptInvite(
        token,
        password,
        fullName.trim(),
        fullPhone
      );

      if (!res.token && !res.access_token) {
        throw new Error(res.detail || "Could not accept invitation.");
      }

      const authToken = res.token || res.access_token;
      const user = res.user;
      const tenant = res.tenant;
      const isSuperAdmin = Boolean(user?.is_superadmin || user?.role === "superadmin");

      // Store credentials locally
      if (typeof window !== "undefined") {
        localStorage.setItem("rp_auth_token", authToken);
        localStorage.setItem("rp_user_email", user?.email || inviteData?.email || "");
        localStorage.setItem("rp_user_name", user?.full_name || fullName.trim());
        localStorage.setItem("reelspulse_token", authToken);
        localStorage.setItem("reelspulse_user", JSON.stringify(user));

        if (isSuperAdmin) {
          localStorage.setItem("rp_is_superadmin", "true");
          document.cookie = `rp_is_superadmin=true; path=/; max-age=604800; SameSite=Lax`;
        } else {
          localStorage.removeItem("rp_is_superadmin");
          document.cookie = `rp_is_superadmin=false; path=/; max-age=604800; SameSite=Lax`;
        }

        if (tenant?.id) {
          localStorage.setItem("rp_tenant_id", tenant.id);
          localStorage.setItem("rp_tenant_name", tenant.name || "");
        }
        document.cookie = `rp_session=${authToken}; path=/; max-age=604800; SameSite=Lax`;
      }

      setSuccessMsg("Invitation accepted! Welcome to the workspace. Redirecting...");
      setTimeout(() => {
        if (isSuperAdmin) {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to accept invitation. The link may have expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return <UniversalLoader fullScreen label="Verifying Invitation Code..." />;
  }

  if (validationError || !inviteData) {
    return (
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl border border-rose-500/30 bg-zinc-900/90 backdrop-blur-xl shadow-2xl text-center space-y-5">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-zinc-100">Invalid or Expired Invitation</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {validationError || "This invite link is no longer valid or has already been accepted."}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Workspace Brand Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-8 w-8">
              <Image src="/reels.png" alt="RhythmSync" width={32} height={32} className="object-contain" />
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-100">RhythmSync</span>
          </Link>
          <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20 font-bold">
            Team Invitation
          </span>
        </div>

        {/* Invitation Info Box */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono font-semibold uppercase">
            <Building2 className="w-4 h-4" />
            <span>Workspace Invitation</span>
          </div>
          <p className="text-sm font-bold text-zinc-100">
            Join <span className="text-amber-400">{inviteData.tenant_name}</span> as{" "}
            <span className="px-2 py-0.5 rounded bg-zinc-800 font-mono text-xs text-amber-300">
              {inviteData.role}
            </span>
          </p>
          <p className="text-[11px] text-zinc-400 font-mono">
            Invited email: <strong className="text-zinc-200">{inviteData.email}</strong>
          </p>
        </div>

        {/* Feedback Banners */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Account Setup Form */}
        <form onSubmit={handleAcceptInvite} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">Your Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. A&R Associate"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 pl-10 pr-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Indian Mobile Number */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-300">
              Mobile Phone Number (India) <span className="text-amber-500">*</span>
            </label>
            <div className="relative flex items-center rounded-xl border border-zinc-700 bg-zinc-800/80 focus-within:border-amber-400">
              <span className="pl-3.5 pr-2 py-2 text-xs font-mono font-bold text-zinc-400 border-r border-zinc-700">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="98765 43210"
                className="w-full bg-transparent px-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-hidden"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Confirm</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              {showPassword ? "Hide passwords" : "Show passwords"}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-semibold py-2.5 text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <VinylRecord className="h-4 w-4" />
                <span>Activating Membership...</span>
              </>
            ) : (
              <>
                <span>Accept Invite &amp; Join Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
          Already have an existing login?{" "}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-semibold">
            Sign In with Email
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="relative min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-center items-center px-4 py-12 overflow-hidden selection:bg-amber-400/30">
      <MusicWaveBackground />
      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={<UniversalLoader size="md" label="Verifying invite link..." />}>
          <JoinWorkspaceContent />
        </Suspense>
      </div>
    </div>
  );
}
