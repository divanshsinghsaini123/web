// apps/web/lib/api.ts

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_URL
    : "";
export const API_BASE_URL = RAW_API_URL.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");

export const API_ENDPOINTS = {
  // Authentication
  signup: `${API_BASE_URL}/api/v1/auth/signup`,
  register: `${API_BASE_URL}/api/v1/auth/signup`,
  login: `${API_BASE_URL}/api/v1/auth/login`,
  googleAuth: `${API_BASE_URL}/api/v1/auth/google`,
  sendOtp: `${API_BASE_URL}/api/v1/auth/send-otp`,
  forgotPasswordSendOtp: `${API_BASE_URL}/api/v1/auth/forgot-password/send-otp`,
  forgotPasswordReset: `${API_BASE_URL}/api/v1/auth/forgot-password/reset`,
  me: `${API_BASE_URL}/api/v1/auth/me`,
  logout: `${API_BASE_URL}/api/v1/auth/logout`,

  // Core Tracks
  tracks: `${API_BASE_URL}/api/v1/tracks`,
  trackCreate: `${API_BASE_URL}/api/v1/tracks`,
  trackDetail: (id: string) => `${API_BASE_URL}/api/v1/tracks/${id}`,
  trackScanNow: (id: string) => `${API_BASE_URL}/api/v1/tracks/${id}/scan-now`,
  trackToggle: (id: string) => `${API_BASE_URL}/api/v1/tracks/${id}/toggle`,
  trackDelete: (id: string) => `${API_BASE_URL}/api/v1/tracks/${id}`,

  // Reels Discovery & Analytics
  reels: `${API_BASE_URL}/api/v1/reels`,
  reelsOverview: `${API_BASE_URL}/api/v1/reels/overview`,
  topCreators: `${API_BASE_URL}/api/v1/reels/top-creators`,
  historicalVelocity: `${API_BASE_URL}/api/v1/reels/historical`,
  alerts: `${API_BASE_URL}/api/v1/alerts`,
  alertToggle: (id: string) => `${API_BASE_URL}/api/v1/alerts/${id}/toggle`,
  alertDelete: (id: string) => `${API_BASE_URL}/api/v1/alerts/${id}`,
  reports: `${API_BASE_URL}/api/v1/reports`,
  reportGenerate: `${API_BASE_URL}/api/v1/reports/generate`,
  reportExportCsv: (trackId?: string) => `${API_BASE_URL}/api/v1/reports/export-csv${trackId ? `?track_id=${encodeURIComponent(trackId)}` : ""}`,

  // Billing & Plans
  billingMe: `${API_BASE_URL}/api/v1/billing/me`,
  plans: `${API_BASE_URL}/api/v1/billing/plans`,
  publicPlans: `${API_BASE_URL}/api/v1/billing/plans`,
  invoices: `${API_BASE_URL}/api/v1/billing/invoices`,
  applyCoupon: `${API_BASE_URL}/api/v1/billing/apply-coupon`,
  upgrade: `${API_BASE_URL}/api/v1/billing/upgrade`,
  createOrder: `${API_BASE_URL}/api/v1/billing/create-order`,
  verifyPayment: `${API_BASE_URL}/api/v1/billing/verify-payment`,

  // Public FAQs
  publicFaqs: `${API_BASE_URL}/api/v1/faqs`,
  faqs: (category?: string) => `${API_BASE_URL}/api/v1/faqs${category ? `?category=${category}` : ""}`,

  // Team & Workspace
  team: `${API_BASE_URL}/api/v1/team/members`,
  teamInvite: `${API_BASE_URL}/api/v1/team/invite`,
  teamValidateInvite: (token: string) => `${API_BASE_URL}/api/v1/team/validate-invite?token=${encodeURIComponent(token)}`,
  teamAcceptInvite: `${API_BASE_URL}/api/v1/team/accept-invite`,
  teamMemberDelete: (id: string) => `${API_BASE_URL}/api/v1/team/members/${id}`,
  teamMemberRole: (id: string) => `${API_BASE_URL}/api/v1/team/members/${id}/role`,
  teamInviteRevoke: (id: string) => `${API_BASE_URL}/api/v1/team/invitations/${id}`,
  tenantsOnboarding: `${API_BASE_URL}/api/v1/auth/tenants/onboarding`,
  tenantProfile: `${API_BASE_URL}/api/v1/auth/tenants/profile`,
  supportTickets: `${API_BASE_URL}/api/v1/support/tickets`,
  contact: `${API_BASE_URL}/api/v1/contact`,

  // Admin
  adminOverview: `${API_BASE_URL}/api/v1/admin/overview`,
  adminCoupons: `${API_BASE_URL}/api/v1/admin/coupons`,
  adminSync: `${API_BASE_URL}/api/v1/admin/sync-all`,
  adminLogs: `${API_BASE_URL}/api/v1/admin/logs`,
  adminInvoices: `${API_BASE_URL}/api/v1/admin/invoices`,
  adminTenants: `${API_BASE_URL}/api/v1/admin/tenants`,
  adminPlans: `${API_BASE_URL}/api/v1/admin/plans`,
  adminFaqs: `${API_BASE_URL}/api/v1/admin/faqs`,
  adminInquiries: `${API_BASE_URL}/api/v1/admin/inquiries`,
  adminTickets: `${API_BASE_URL}/api/v1/admin/tickets`,
} as const;

export const ENDPOINTS = API_ENDPOINTS;

export interface PlanInfo {
  name?: string;
  tier?: string;
  max_tracks?: number;
  max_tracked_songs?: number;
  songs_used?: number;
  price_inr?: number;
  price_usd?: number;
  [key: string]: any;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  is_superadmin?: boolean;
  avatar_url?: string;
  tenant_name?: string;
  plan?: PlanInfo;
  tenant?: {
    id?: string;
    name?: string;
    slug?: string;
    plan_name?: string;
    is_onboarded?: boolean;
  };
}

export interface TrackedSong {
  id: string;
  instagram_audio_id: string;
  audio_id: string;
  title?: string;
  track_name: string;
  artist_name?: string;
  cover_artwork_url?: string;
  total_reels_count?: number;
  scraped_reels_count?: number;
  total_plays?: number;
  total_likes?: number;
  virality_score?: number;
  sync_status?: string;
  sync_interval_hours?: number;
  is_active?: boolean;
  message?: string;
  last_synced_at?: string;
  last_scraped_at?: string;
  created_at: string;
}

export interface ReelItem {
  id: string;
  reel_id?: string;
  reel_code: string;
  shortcode?: string;
  creator_username: string;
  creator_name?: string;
  creator_profile_pic_url?: string;
  creator_is_verified: boolean;
  play_count: number;
  like_count: number;
  comment_count: number;
  thumbnail_url?: string;
  video_url?: string;
  video_duration?: number;
  posted_at?: string;
  tracked_audio_id?: string;
  tracked_audio_title?: string;
  audio_name?: string;
  instagram_url?: string;
}

export interface OverviewStats {
  total_tracks?: number;
  tracked_songs_count?: number;
  max_tracks?: number;
  max_tracked_songs?: number;
  total_reels?: number;
  total_reels_scraped?: number;
  total_plays?: number;
  total_likes?: number;
  total_creators?: number;
  active_sync_runs?: number;
  plan_name?: string;
  plan_tier?: string;
  sync_runs_today?: number;
  latest_sync_time?: string;
  tenant_name?: string;
  recent_tracks?: TrackedSong[];
}

export function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("rp_auth_token") ||
      localStorage.getItem("reelspulse_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = { ...getAuthHeaders(), ...(options?.headers ?? {}) };
  try {
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { detail: text || "Invalid response from server" };
    }
    if (!res.ok) {
      const msg =
        typeof data.detail === "string"
          ? data.detail
        : data.detail?.message || data.detail?.error || data.message || `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return data as T;
  } catch (err: any) {
    if (err?.name === "TypeError" && (err?.message?.includes("fetch") || err?.message?.includes("NetworkError"))) {
      throw new Error(`Unable to connect to the backend server (${API_BASE_URL}). Please ensure API is online.`);
    }
    throw err;
  }
}

export const api = {
  // Auth (Email or Mobile Number with OTP / Password)
  login: async (
    identifierOrEmail: string,
    password?: string,
    otp?: string
  ) => {
    return apiFetch<any>(API_ENDPOINTS.login, {
      method: "POST",
      body: JSON.stringify({
        identifier: identifierOrEmail,
        email: identifierOrEmail.includes("@") ? identifierOrEmail : undefined,
        phone_number: !identifierOrEmail.includes("@") ? identifierOrEmail : undefined,
        password,
        otp,
      }),
    });
  },
  signup: async (
    fullNameOrTenant: string,
    email: string,
    password: string,
    fullNameOrCompany?: string,
    otp?: string,
    phoneNumber?: string
  ) => {
    return apiFetch<any>(API_ENDPOINTS.signup, {
      method: "POST",
      body: JSON.stringify({
        full_name: fullNameOrCompany || fullNameOrTenant,
        email,
        password,
        company_name: fullNameOrTenant,
        otp,
        phone_number: phoneNumber,
      }),
    });
  },
  sendOtp: async (
    emailOrPhone: string,
    purpose: string = "signup",
    fullName?: string
  ) => {
    const isEmail = emailOrPhone.includes("@");
    return apiFetch<any>(API_ENDPOINTS.sendOtp, {
      method: "POST",
      body: JSON.stringify({
        email: isEmail ? emailOrPhone : undefined,
        phone_number: !isEmail ? emailOrPhone : undefined,
        purpose,
        full_name: fullName,
      }),
    });
  },
  forgotPasswordSendOtp: async (email: string) => {
    return apiFetch<any>(API_ENDPOINTS.forgotPasswordSendOtp, {
      method: "POST",
      body: JSON.stringify({ email, purpose: "forgot_password" }),
    });
  },
  forgotPasswordReset: async (email: string, otp: string, newPassword: string) => {
    return apiFetch<any>(API_ENDPOINTS.forgotPasswordReset, {
      method: "POST",
      body: JSON.stringify({ email, otp, new_password: newPassword }),
    });
  },
  googleAuth: async (credential: string) => {
    return apiFetch<any>(API_ENDPOINTS.googleAuth, {
      method: "POST",
      body: JSON.stringify({ credential, id_token: credential }),
    });
  },
  getMe: async (): Promise<User | null> => {
    try {
      const res = await apiFetch<User>(API_ENDPOINTS.me);
      if (res && res.id) {
        if (typeof window !== "undefined") {
          localStorage.setItem("reelspulse_user", JSON.stringify(res));
          if (res.tenant?.name) {
            localStorage.setItem("rp_tenant_name", res.tenant.name);
          }
        }
        return res;
      }
      return null;
    } catch {
      return null;
    }
  },
  logout: async () => {
    try {
      await apiFetch<any>(API_ENDPOINTS.logout, { method: "POST" });
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("rp_auth_token");
        localStorage.removeItem("reelspulse_token");
        localStorage.removeItem("reelspulse_user");
        localStorage.removeItem("rp_user_email");
        localStorage.removeItem("rp_user_name");
        localStorage.removeItem("rp_is_superadmin");
        localStorage.removeItem("rp_tenant_id");
        localStorage.removeItem("rp_tenant_name");
        document.cookie = "rp_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "rp_is_superadmin=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    }
  },

  // Dashboard & Tracks
  getOverview: async (): Promise<OverviewStats> => {
    return apiFetch<OverviewStats>(API_ENDPOINTS.reelsOverview);
  },
  getTracks: async (): Promise<TrackedSong[]> => {
    const res = await apiFetch<any>(API_ENDPOINTS.tracks);
    if (res && Array.isArray(res.tracks)) return res.tracks;
    if (Array.isArray(res)) return res;
    return [];
  },
  addTrack: async (audioIdOrData: any, title?: string, artistName?: string) => {
    const payload =
      typeof audioIdOrData === "object"
        ? {
          instagram_audio_id: audioIdOrData.audio_id || audioIdOrData.instagram_audio_id,
          title: audioIdOrData.track_name || audioIdOrData.title,
          artist_name: audioIdOrData.artist_name,
        }
        : {
          instagram_audio_id: audioIdOrData,
          title,
          artist_name: artistName,
        };
    return apiFetch<TrackedSong>(API_ENDPOINTS.trackCreate, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  syncTrack: async (id: string) => {
    return apiFetch<any>(API_ENDPOINTS.trackScanNow(id), { method: "POST" });
  },
  scanTrackNow: async (id: string) => {
    return apiFetch<any>(API_ENDPOINTS.trackScanNow(id), { method: "POST" });
  },
  createTrack: async (audioIdOrData: any, title?: string, artistName?: string) => {
    return api.addTrack(audioIdOrData, title, artistName);
  },
  deleteTrack: async (id: string) => {
    return apiFetch<any>(API_ENDPOINTS.trackDelete(id), { method: "DELETE" });
  },
  toggleTrackStatus: async (id: string) => {
    return apiFetch<{ message: string; is_active: boolean }>(`${API_BASE_URL}/api/v1/tracks/${id}/toggle-status`, {
      method: "PATCH",
    });
  },

  // Reels & Analytics
  getReels: async (params?: {
    track_id?: string;
    min_plays?: number;
    search?: string;
    sort_by?: string;
    order?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ items: ReelItem[]; total: number; page: number; page_size: number; total_pages: number }> => {
    const query = new URLSearchParams();
    if (params?.track_id) query.set("track_id", params.track_id);
    if (params?.min_plays !== undefined) query.set("min_plays", String(params.min_plays));
    if (params?.search) query.set("search", params.search);
    if (params?.sort_by) query.set("sort_by", params.sort_by);
    if (params?.order) query.set("order", params.order);
    if (params?.page) query.set("page", String(params.page));
    if (params?.page_size) query.set("page_size", String(params.page_size));
    const qs = query.toString();
    return apiFetch<any>(`${API_ENDPOINTS.reels}${qs ? `?${qs}` : ""}`);
  },
  getTopCreators: async (trackId?: string, limit?: number): Promise<{ creators: any[]; total: number }> => {
    const query = new URLSearchParams();
    if (trackId) query.set("track_id", trackId);
    if (limit) query.set("limit", String(limit));
    const qs = query.toString();
    return apiFetch<any>(`${API_ENDPOINTS.topCreators}${qs ? `?${qs}` : ""}`);
  },
  getHistoricalVelocity: async (trackId?: string, days?: number): Promise<{ timeline: any[]; growth_rate_pct: number; total_reels: number; days: number }> => {
    const query = new URLSearchParams();
    if (trackId) query.set("track_id", trackId);
    if (days) query.set("days", String(days));
    const qs = query.toString();
    return apiFetch<any>(`${API_ENDPOINTS.historicalVelocity}${qs ? `?${qs}` : ""}`);
  },

  // Alert Rules (Stoki Architecture)
  getAlertRules: async (): Promise<{ rules: any[] }> => {
    return apiFetch<any>(API_ENDPOINTS.alerts);
  },
  createAlertRule: async (data: any): Promise<{ message: string; id: string }> => {
    return apiFetch<any>(API_ENDPOINTS.alerts, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  toggleAlertRule: async (id: string): Promise<{ message: string; is_active: boolean }> => {
    return apiFetch<any>(API_ENDPOINTS.alertToggle(id), { method: "PATCH" });
  },
  deleteAlertRule: async (id: string): Promise<{ message: string }> => {
    return apiFetch<any>(API_ENDPOINTS.alertDelete(id), { method: "DELETE" });
  },

  // Report Generation Suite (Stoki Architecture)
  getReports: async (): Promise<{ reports: any[] }> => {
    return apiFetch<any>(API_ENDPOINTS.reports);
  },
  generateReport: async (data: {
    report_name: string;
    report_type: string;
    file_format: string;
    track_id?: string;
    columns?: string[];
  }): Promise<{ message: string; report_id: string; row_count: number; download_url: string }> => {
    return apiFetch<any>(API_ENDPOINTS.reportGenerate, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Billing
  getSubscription: async () => {
    return apiFetch<any>(API_ENDPOINTS.billingMe);
  },
  getInvoices: async () => {
    return apiFetch<any[]>(API_ENDPOINTS.invoices);
  },
  redeemCoupon: async (couponCode: string) => {
    return apiFetch<any>(API_ENDPOINTS.applyCoupon, {
      method: "POST",
      body: JSON.stringify({ code: couponCode }),
    });
  },
  upgradePlan: async (planId: string, billingCycle?: string) => {
    return apiFetch<any>(API_ENDPOINTS.upgrade, {
      method: "POST",
      body: JSON.stringify({ plan_id: planId, billing_cycle: billingCycle }),
    });
  },

  // Team & Multi-Tenant Access
  getTeam: async () => {
    const res = await apiFetch<any>(API_ENDPOINTS.team);
    return res;
  },
  inviteTeamMember: async (email: string, role: string, durationHours?: number, name?: string) => {
    return apiFetch<any>(API_ENDPOINTS.teamInvite, {
      method: "POST",
      body: JSON.stringify({
        email,
        identifier: email,
        role,
        duration_hours: durationHours || 24,
        name,
      }),
    });
  },
  validateInvite: async (token: string) => {
    return apiFetch<any>(API_ENDPOINTS.teamValidateInvite(token));
  },
  acceptInvite: async (token: string, password: string, fullName?: string, phoneNumber?: string) => {
    return apiFetch<any>(API_ENDPOINTS.teamAcceptInvite, {
      method: "POST",
      body: JSON.stringify({
        token,
        password,
        full_name: fullName,
        phone_number: phoneNumber,
      }),
    });
  },
  removeTeamMember: async (memberId: string) => {
    return apiFetch<any>(API_ENDPOINTS.teamMemberDelete(memberId), { method: "DELETE" });
  },
  updateTeamMemberRole: async (memberId: string, role: string) => {
    return apiFetch<any>(API_ENDPOINTS.teamMemberRole(memberId), {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },
  revokeInvitation: async (inviteId: string) => {
    return apiFetch<any>(API_ENDPOINTS.teamInviteRevoke(inviteId), { method: "DELETE" });
  },
  getTenantProfile: async () => {
    return apiFetch<any>(API_ENDPOINTS.tenantProfile);
  },
  updateTenantProfile: async (data: any) => {
    return apiFetch<any>(API_ENDPOINTS.tenantProfile, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // Admin
  getAdminOverview: async () => {
    return apiFetch<any>(API_ENDPOINTS.adminOverview);
  },
  getAdminTenants: async () => {
    return apiFetch<any[]>(API_ENDPOINTS.adminTenants);
  },
  getAdminPlans: async () => {
    return apiFetch<any[]>(API_ENDPOINTS.adminPlans);
  },
  getAdminCoupons: async () => {
    return apiFetch<any[]>(API_ENDPOINTS.adminCoupons);
  },
  createAdminCoupon: async (codeOrData: any, discount?: number, maxUses?: number) => {
    const payload =
      typeof codeOrData === "object"
        ? codeOrData
        : { code: codeOrData, discount_percent: discount, max_uses: maxUses };
    return apiFetch<any>(API_ENDPOINTS.adminCoupons, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  triggerAdminSync: async () => {
    return apiFetch<any>(API_ENDPOINTS.adminSync, { method: "POST" });
  },
  getAdminLogs: async () => {
    return apiFetch<any[]>(API_ENDPOINTS.adminLogs);
  },
  getAdminInvoices: async () => {
    return apiFetch<any[]>(API_ENDPOINTS.adminInvoices);
  },
  overrideTenantPlan: async (tenantId: string, planTier: string) => {
    return apiFetch<any>(`${API_ENDPOINTS.adminTenants}/${tenantId}/plan`, {
      method: "POST",
      body: JSON.stringify({ plan_tier: planTier }),
    });
  },
  toggleTenantStatus: async (tenantId: string, isActive?: boolean) => {
    return apiFetch<any>(`${API_ENDPOINTS.adminTenants}/${tenantId}/status`, {
      method: "POST",
      body: JSON.stringify({ is_active: isActive ?? true }),
    });
  },
  createSupportTicket: async (payload: { category: string; title: string; description: string; page_url?: string; attachment_name?: string }) => {
    return apiFetch<any>(API_ENDPOINTS.supportTickets, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getSupportTickets: async () => {
    return apiFetch<any[]>(API_ENDPOINTS.supportTickets);
  },
  submitContact: async (payload: { full_name: string; work_email: string; company_name: string; mobile_number?: string; message: string }) => {
    return apiFetch<any>(API_ENDPOINTS.contact, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export function getProxiedImageUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("data:")) return url;
  if (url.includes("cdninstagram.com") || url.includes("fbcdn.net")) {
    return `${API_BASE_URL}/api/v1/reels/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

