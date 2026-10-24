"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from "@react-oauth/google";
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
  Loader2,
  KeyRound,
  ArrowLeft,
  Sparkles,
  Music,
  Disc3,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api, API_ENDPOINTS } from "@/lib/api";
import { VinylRecord, SoundWaveSVG } from "./music-visuals";

interface AuthCardProps {
  initialMode?: "signin" | "signup";
}

type AuthView = "signin" | "signup" | "otp" | "forgot";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "692980015263-ij9dhfmoqjdqnf8tolafu3l62b2glqge.apps.googleusercontent.com";

export function AuthCard({ initialMode = "signin" }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get("redirect");

  const [view, setView] = useState<AuthView>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  // Check if already authenticated on mount
  useEffect(() => {
    async function checkExistingAuth() {
      if (typeof window === "undefined") return;
      const token =
        localStorage.getItem("rp_auth_token") ||
        localStorage.getItem("reelspulse_token");
      if (!token) return;

      const user = await api.getMe();
      if (!user) {
        localStorage.removeItem("rp_auth_token");
        localStorage.removeItem("reelspulse_token");
        localStorage.removeItem("reelspulse_user");
        return;
      }

      const isSuperAdmin = Boolean(user.is_superadmin || user.role === "superadmin");
      if (isSuperAdmin) {
        router.replace(explicitRedirect?.startsWith("/admin") ? explicitRedirect : "/admin");
      } else {
        router.replace(explicitRedirect && !explicitRedirect.startsWith("/admin") ? explicitRedirect : "/dashboard");
      }
    }
    checkExistingAuth();
  }, [explicitRedirect, router]);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // OTP Verification
  const [otpCode, setOtpCode] = useState("");
  const [otpResendCountdown, setOtpResendCountdown] = useState(0);

  // Mobile Login State (Stoki pattern)
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtpCode, setLoginOtpCode] = useState("");
  const [loginOtpSent, setLoginOtpSent] = useState(false);

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (otpResendCountdown > 0) {
      const timer = setTimeout(() => setOtpResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpResendCountdown]);

  // Store tokens and perform redirect
  const handleAuthSuccess = (token: string, user: any, tenant?: any) => {
    const isSuperAdmin = Boolean(user?.is_superadmin || user?.role === "superadmin");

    if (typeof window !== "undefined") {
      localStorage.setItem("rp_auth_token", token);
      localStorage.setItem("reelspulse_token", token);
      if (user) {
        localStorage.setItem("reelspulse_user", JSON.stringify(user));
      }
      localStorage.setItem("rp_user_email", user?.email || email);
      localStorage.setItem("rp_user_name", user?.full_name || fullName);

      if (isSuperAdmin) {
        localStorage.setItem("rp_is_superadmin", "true");
        document.cookie = `rp_is_superadmin=true; path=/; max-age=604800; SameSite=Lax`;
      } else {
        localStorage.removeItem("rp_is_superadmin");
        document.cookie = `rp_is_superadmin=false; path=/; max-age=604800; SameSite=Lax`;
      }

      if (tenant) {
        localStorage.setItem("rp_tenant_id", tenant.id || "");
        localStorage.setItem("rp_tenant_name", tenant.name || tenant.company_name || "");
      }
      document.cookie = `rp_session=${token}; path=/; max-age=604800; SameSite=Lax`;
    }

    setSuccessMsg("Authenticated! Redirecting to studio...");
    setTimeout(() => {
      if (isSuperAdmin) {
        router.replace(explicitRedirect?.startsWith("/admin") ? explicitRedirect : "/admin");
      } else {
        router.replace(explicitRedirect && !explicitRedirect.startsWith("/admin") ? explicitRedirect : "/dashboard");
      }
    }, 350);
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrorMsg("Google Sign-In did not return credentials.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.googleAuth(credentialResponse.credential);
      if (!data.token && !data.access_token) {
        throw new Error(data.detail || "Google authentication failed.");
      }
      handleAuthSuccess(data.token || data.access_token, data.user, data.tenant);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initiate Sign Up (Send verification OTP)
  const handleInitiateSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    const cleanDigits = phoneNumber.replace(/\D/g, "");
    if (!cleanDigits || cleanDigits.length < 10) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await api.sendOtp(email.trim().toLowerCase(), "signup", fullName.trim());
      setView("otp");
      setOtpResendCountdown(60);
      setSuccessMsg(`Verification code sent to ${email}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP and complete sign up
  const handleVerifyOtpAndSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length < 6) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const cleanDigits = phoneNumber.replace(/\D/g, "");
      const fullPhone = `+91${cleanDigits.slice(-10)}`;
      const data = await api.signup(
        fullName.trim(),
        email.trim().toLowerCase(),
        password,
        `${fullName.trim()}'s Music`,
        otpCode.trim(),
        fullPhone
      );
      if (!data.token && !data.access_token) {
        throw new Error(data.detail || "Sign up failed.");
      }
      handleAuthSuccess(data.token || data.access_token, data.user, data.tenant);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Send Login Mobile OTP
  const handleSendLoginOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDigits = loginPhone.replace(/\D/g, "");
    if (!cleanDigits || cleanDigits.length < 10) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const fullPhone = `+91${cleanDigits.slice(-10)}`;
      await api.sendOtp(fullPhone, "login");
      setLoginOtpSent(true);
      setSuccessMsg(`6-digit verification code sent to +91 ${cleanDigits.slice(-10)}`);
      setOtpResendCountdown(60);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not dispatch mobile verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Email + Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setErrorMsg("Please enter your registered email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await api.login(email.trim().toLowerCase(), password);
      if (!data.token && !data.access_token) {
        throw new Error(data.detail || "Invalid email or password.");
      }
      handleAuthSuccess(data.token || data.access_token, data.user, data.tenant);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password: Send OTP
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await api.forgotPasswordSendOtp(forgotEmail.trim().toLowerCase());
      setForgotOtpSent(true);
      setSuccessMsg("Password reset code sent to your email.");
    } catch (err: any) {
      setErrorMsg(err.message || "Email address not recognized.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password: Reset with OTP
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp.trim() || !forgotNewPassword) {
      setErrorMsg("Please provide both the OTP and new password.");
      return;
    }
    if (forgotNewPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await api.forgotPasswordReset(forgotEmail.trim().toLowerCase(), forgotOtp.trim(), forgotNewPassword);
      setSuccessMsg("Password reset successfully! Please sign in with your new credentials.");
      setView("signin");
      setEmail(forgotEmail);
      setForgotOtpSent(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired reset code.");
    } finally {
      setIsLoading(false);
    }
  };





  return (
    <div className="w-full max-w-md mx-auto">
      {/* Container with Glassmorphism and subtle border */}
      <div className="relative rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-violet-500/5 transition-all">
        {/* Animated Sound Wave Header Accent */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-9 w-9 flex items-center justify-center bg-transparent shrink-0">
              <Image
                src="/reels.png"
                alt="ReelsPulse Logo"
                width={36}
                height={36}
                className="object-contain w-full h-full group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100 block leading-none">
                RhythmSync
              </span>
              <span className="text-[10px] font-mono uppercase text-amber-500 dark:text-amber-400 tracking-wider">
                Reels Pulse
              </span>
            </div>
          </Link>
          <SoundWaveSVG className="w-20 h-6 opacity-75" />
        </div>

        {/* Dynamic Titles */}
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {view === "signin" && "Welcome back, Creator"}
            {view === "signup" && "Track Your Music Velocity"}
            {view === "otp" && "Verify Your Email"}
            {view === "forgot" && "Reset Your Password"}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {view === "signin" && "Sign in to monitor live Instagram Reels audio virality and creators."}
            {view === "signup" && "Start tracking reels adoption for your audio stems. 1 song free forever."}
            {view === "otp" && `Enter the 6-digit confirmation code dispatched to ${email}.`}
            {view === "forgot" && "We'll send a one-time reset code to restore your account access."}
          </p>
        </div>

        {/* Feedback Alert Banners */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* =========================================================================
            VIEW 1: SIGN IN
            ========================================================================= */}
        {view === "signin" && (
          <div>
            {/* Google OAuth Provider */}
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <div className="mb-5 flex flex-col items-center">
                <div className="w-full flex justify-center [&>div]:w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setErrorMsg("Google sign-in connection timed out.")}
                    useOneTap={false}
                    theme="filled_black"
                    shape="pill"
                    text="signin_with"
                    width="100%"
                  />
                </div>
                <div className="relative my-4 w-full text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  </div>
                  <span className="relative bg-white dark:bg-zinc-900 px-3 text-[11px] font-mono uppercase text-zinc-400">
                    or continue with email
                  </span>
                </div>
              </div>
            </GoogleOAuthProvider>

            {/* Form: Email Login (Database Primary) */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Business / Artist Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="artist@label.com"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 pl-10 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-amber-500 hover:text-amber-400 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 pl-10 pr-10 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-semibold py-2.5 text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <VinylRecord className="h-4 w-4" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>




            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setView("signup");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-semibold text-amber-500 hover:text-amber-400"
              >
                Sign up free
              </button>
            </p>
          </div>
        )}

        {/* =========================================================================
            VIEW 2: SIGN UP
            ========================================================================= */}
        {view === "signup" && (
          <div>
            {/* Google OAuth Provider */}
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <div className="mb-5 flex flex-col items-center">
                <div className="w-full flex justify-center [&>div]:w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setErrorMsg("Google sign-in connection timed out.")}
                    useOneTap={false}
                    theme="filled_black"
                    shape="pill"
                    text="signup_with"
                    width="100%"
                  />
                </div>
                <div className="relative my-4 w-full text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  </div>
                  <span className="relative bg-white dark:bg-zinc-900 px-3 text-[11px] font-mono uppercase text-zinc-400">
                    or register with email
                  </span>
                </div>
              </div>
            </GoogleOAuthProvider>

            <form onSubmit={handleInitiateSignUp} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Full Name / Artist Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Kendrick Lamar or Top Dawg Ent"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 pl-10 pr-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="artist@label.com"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 pl-10 pr-3.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Mobile Phone Number (India) <span className="text-amber-500">*</span>
                </label>
                <div className="relative flex items-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 focus-within:border-amber-400 transition">
                  <span className="pl-3.5 pr-2 py-2 text-xs font-mono font-bold text-zinc-500 border-r border-zinc-200 dark:border-zinc-700">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="98765 43210"
                    className="w-full bg-transparent px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Confirm
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-semibold py-2.5 text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <VinylRecord className="h-4 w-4" />
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Verification</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-6">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setView("signin");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-semibold text-amber-500 hover:text-amber-400"
              >
                Sign in
              </button>
            </p>
          </div>
        )}

        {/* =========================================================================
            VIEW 3: OTP VERIFICATION
            ========================================================================= */}
        {view === "otp" && (
          <form onSubmit={handleVerifyOtpAndSignUp} className="space-y-5">
            <div className="flex justify-center my-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <KeyRound className="h-7 w-7" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="w-full tracking-[0.5em] text-center font-mono text-xl rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-hidden transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-semibold py-2.5 text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <VinylRecord className="h-4 w-4" />
                  <span>Verifying & Provisioning Workspace...</span>
                </>
              ) : (
                <>
                  <span>Verify & Launch Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-zinc-500 pt-2">
              <button
                type="button"
                onClick={() => setView("signup")}
                className="flex items-center gap-1 hover:text-zinc-300"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to sign up</span>
              </button>
              {otpResendCountdown > 0 ? (
                <span className="font-mono text-[11px] text-zinc-400">
                  Resend in {otpResendCountdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    api.sendOtp(email, "signup", fullName);
                    setOtpResendCountdown(60);
                    setSuccessMsg(`New code dispatched to ${email}`);
                  }}
                  className="text-amber-500 hover:text-amber-400 font-medium"
                >
                  Resend code
                </button>
              )}
            </div>
          </form>
        )}

        {/* =========================================================================
            VIEW 4: FORGOT PASSWORD (2 Steps)
            ========================================================================= */}
        {view === "forgot" && (
          <div className="space-y-4">
            {!forgotOtpSent ? (
              <form onSubmit={handleForgotSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="artist@label.com"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 pl-10 pr-3.5 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-semibold py-2.5 text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <VinylRecord className="h-4 w-4" />
                      <span>Sending Reset Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Password Reset OTP</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotReset} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    6-Digit Reset Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="w-full tracking-widest text-center font-mono text-base rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 py-2.5 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400 focus:outline-hidden transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/70 pl-10 pr-10 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-hidden transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-semibold py-2.5 text-xs shadow-md shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <VinylRecord className="h-4 w-4" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Set New Password & Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setView("signin");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Sign In</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
