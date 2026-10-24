"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Clock,
  CheckCircle2,
  Building2,
  Search,
  RotateCw,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  Key,
  ShieldAlert,
  ChevronDown,
  X,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { api, User } from "@/lib/api";
import { UniversalLoader } from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/dashboard/PageHeader";

interface MemberItem {
  id: string;
  user_id?: string;
  name?: string;
  full_name?: string;
  email: string;
  role: string;
  phone_number?: string;
  joined_at?: string;
  is_sponsor?: boolean;
}

interface InvitationItem {
  id: string;
  email: string;
  role: string;
  token: string;
  status: string;
  created_at?: string;
  expires_at?: string;
  is_expired?: boolean;
  invite_url: string;
}

export default function TeamAccessPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [sponsorDuration, setSponsorDuration] = useState<number>(24);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const callerRole = (currentUser?.role || "OWNER").toUpperCase();
  const isOwner = callerRole === "OWNER";
  const isAdmin = callerRole === "ADMIN" || isOwner;
  const isManager = callerRole === "MANAGER";
  const isViewer = callerRole === "VIEWER" || callerRole === "COLLABORATOR" || callerRole === "SPONSOR";

  useEffect(() => {
    loadTeamData();
  }, []);

  async function loadTeamData() {
    try {
      setLoading(true);
      const [teamRes, u] = await Promise.all([
        api.getTeam().catch((err) => {
          if (err?.message?.includes("403") || err?.status === 403) {
            router.replace("/dashboard");
          }
          return null;
        }),
        api.getMe().catch(() => null),
      ]);

      if (u) {
        setCurrentUser(u);
        const uRole = (u.role || "OWNER").toUpperCase();
        if (uRole === "VIEWER" || uRole === "COLLABORATOR" || uRole === "SPONSOR") {
          router.replace("/dashboard");
          return;
        }
      }

      if (teamRes) {
        setMembers(teamRes.members || []);
        setInvitations(teamRes.invitations || []);
        setWorkspaceName(teamRes.workspace_name || u?.tenant_name || "Workspace");
      }
    } finally {
      setLoading(false);
    }
  }

  const openInviteModal = (defaultRole: string = "VIEWER") => {
    // If manager, default to viewer since manager cannot invite manager/admin
    const initialRole = isManager ? "VIEWER" : defaultRole;
    setRole(initialRole);
    setEmail("");
    setFullName("");
    setSponsorDuration(24);
    setCreatedInviteUrl(null);
    setNotification(null);
    setIsInviteOpen(true);
  };

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setNotification({ type: "error", message: "Please provide a valid email address." });
      return;
    }

    if (isManager && (role === "MANAGER" || role === "ADMIN" || role === "OWNER")) {
      setNotification({ type: "error", message: "Managers can only invite Viewers/Collaborators." });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);
    setCreatedInviteUrl(null);

    try {
      const res = await api.inviteTeamMember(
        cleanEmail,
        role,
        role === "SPONSOR" ? sponsorDuration : 24,
        fullName.trim() || undefined
      );

      const fullUrl = `${window.location.origin}${res.invite_url}`;
      setCreatedInviteUrl(fullUrl);

      setNotification({
        type: "success",
        message: `Invitation email sent to ${cleanEmail}!`,
      });

      await loadTeamData();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Failed to dispatch email invitation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRemoveMember = async (member: MemberItem) => {
    const targetRole = (member.role || "MEMBER").toUpperCase();
    if (isManager && (targetRole === "MANAGER" || targetRole === "ADMIN" || targetRole === "OWNER")) {
      alert("Managers can only remove Viewers/Collaborators.");
      return;
    }

    if (!confirm(`Are you sure you want to remove ${member.full_name || member.email} from this workspace?`)) {
      return;
    }

    setActionLoadingId(member.id);
    try {
      await api.removeTeamMember(member.id);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
    } catch (err: any) {
      alert(err.message || "Failed to remove member");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateRole = async (member: MemberItem, newRole: string) => {
    if (!isAdmin) {
      alert("Only Workspace Owners and Admins can modify member roles.");
      return;
    }

    setActionLoadingId(member.id);
    try {
      await api.updateTeamMemberRole(member.id, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update member role");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRevokeInvite = async (invitation: InvitationItem) => {
    const targetRole = (invitation.role || "MEMBER").toUpperCase();
    if (isManager && (targetRole === "MANAGER" || targetRole === "ADMIN" || targetRole === "OWNER")) {
      alert("Managers can only revoke Viewer/Collaborator invitations.");
      return;
    }

    if (!confirm(`Revoke invitation for ${invitation.email}?`)) return;

    setActionLoadingId(invitation.id);
    try {
      await api.revokeInvitation(invitation.id);
      setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
    } catch (err: any) {
      alert(err.message || "Failed to revoke invitation");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    const name = (m.full_name || m.name || "").toLowerCase();
    const email = (m.email || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || name.includes(q) || email.includes(q);
    if (!matchesSearch) return false;
    if (roleFilter !== "all" && (m.role || "").toUpperCase() !== roleFilter.toUpperCase()) return false;
    return true;
  });

  if (loading) {
    return <UniversalLoader fullScreen label="Loading Workspace Team Roster..." />;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#121214]">
      <div className="p-6 md:p-8 space-y-6 max-w-[1440px] w-full mx-auto">
      {/* Page Header matching Stoki */}
      <PageHeader
        title="Team & Access Delegation"
        description="Manage workspace team members, operational permissions, and brand collaborator access."
        icon={<Users className="w-5 h-5 text-white" />}
        iconVariant="indigo"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30">
            {workspaceName || "Active Workspace"}
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={loadTeamData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
              <span>Refresh</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => openInviteModal("MANAGER")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Invite Manager</span>
              </button>
            )}

            <button
              onClick={() => openInviteModal("VIEWER")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Collaborator</span>
            </button>
          </div>
        }
      />

      {/* Search and Role Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team members by name or email..."
              className="w-full h-9 pl-9 pr-3 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0d0e] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-3 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0d0e] text-zinc-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="VIEWER">Collaborator / Viewer</option>
            <option value="SPONSOR">Brand Sponsor</option>
          </select>
        </div>

        <div className="text-xs font-mono text-zinc-500 text-right">
          Total Members: <strong className="text-zinc-900 dark:text-zinc-100">{members.length}</strong>
        </div>
      </div>

      {/* ACTIVE TEAM MEMBERS TABLE (Stoki Design) */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0d0e] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/60 text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Joined Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500 font-mono text-xs">
                    No team members found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const memberRole = (member.role || "MEMBER").toUpperCase();
                  const isCurrent = member.id === currentUser?.id;
                  const isTargetAdmin = memberRole === "OWNER" || memberRole === "ADMIN";
                  const isTargetManager = memberRole === "MANAGER";

                  // Permissions check:
                  // Admin can remove manager/viewer, change role.
                  // Manager can only remove viewer.
                  const canDelete =
                    !isCurrent &&
                    (isAdmin || (isManager && !isTargetAdmin && !isTargetManager));

                  const canChangeRole = isAdmin && !isCurrent && memberRole !== "OWNER";

                  const initial = (member.full_name || member.email || "U")[0].toUpperCase();

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors"
                    >
                      {/* User Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              <span>{member.full_name || member.email.split("@")[0]}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="py-3.5 px-4">
                        {canChangeRole ? (
                          <select
                            value={memberRole}
                            disabled={actionLoadingId === member.id}
                            onChange={(e) => handleUpdateRole(member, e.target.value)}
                            className="px-2 py-1 rounded-md text-[11px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 cursor-pointer"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="VIEWER">COLLABORATOR</option>
                            <option value="SPONSOR">SPONSOR</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              memberRole === "OWNER"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                                : memberRole === "ADMIN"
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                                : memberRole === "MANAGER"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {memberRole === "VIEWER" ? "COLLABORATOR" : memberRole}
                          </span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Active</span>
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">
                        {member.joined_at || "Member"}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 text-right">
                        {canDelete ? (
                          <button
                            onClick={() => handleRemoveMember(member)}
                            disabled={actionLoadingId === member.id}
                            title="Remove member"
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-600">
                            {isCurrent ? "Self" : "Protected"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PENDING / ACTIVE INVITATIONS SECTION */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0d0e] p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending Invitation Passes ({invitations.length})</span>
            </h3>
            <p className="text-[11px] text-zinc-500 font-sans">
              Single-use invitation tokens. Automatically invalidated once accepted.
            </p>
          </div>
        </div>

        {invitations.length === 0 ? (
          <div className="py-6 text-center text-zinc-500 font-mono text-xs">
            No active invitation tokens pending acceptance.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {invitations.map((inv) => {
              const fullLink = typeof window !== "undefined" ? `${window.location.origin}${inv.invite_url}` : inv.invite_url;
              const isAccepted = inv.status === "ACCEPTED";
              const isExpired = inv.is_expired || inv.status === "EXPIRED" || inv.status === "REVOKED";

              const targetRole = (inv.role || "MEMBER").toUpperCase();
              const canRevoke =
                !isAccepted &&
                !isExpired &&
                (isAdmin || (isManager && targetRole !== "OWNER" && targetRole !== "ADMIN" && targetRole !== "MANAGER"));

              return (
                <div
                  key={inv.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                        {inv.email}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {targetRole}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                          isAccepted
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : isExpired
                            ? "bg-zinc-500/10 text-zinc-500 border border-zinc-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500">
                      Created: {inv.created_at || "Recent"} · Expires: {inv.expires_at || "24h"}
                    </div>
                  </div>

                  {!isAccepted && !isExpired && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(fullLink)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40 bg-zinc-50 dark:bg-zinc-900 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                        <span>Copy Join Link</span>
                      </button>

                      {canRevoke && (
                        <button
                          onClick={() => handleRevokeInvite(inv)}
                          disabled={actionLoadingId === inv.id}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 text-[11px] font-mono text-rose-400 transition cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CLEAN INVITE MODAL (Stoki Style) */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#0c0d0e] border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {role === "MANAGER" ? "Invite Operations Manager" : "Invite Brand Collaborator"}
                </h3>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {notification && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  notification.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
            )}

            {createdInviteUrl && (
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Single-Use Join Link</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdInviteUrl}
                    className="flex-1 bg-transparent text-[11px] font-mono text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
                  />
                  <button
                    onClick={() => copyToClipboard(createdInviteUrl)}
                    className="p-1.5 rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Business Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collaborator@company.com"
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Access Level / Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden cursor-pointer"
                >
                  {isAdmin && <option value="MANAGER">Manager (Operational Control)</option>}
                  <option value="VIEWER">Collaborator (View-Only Song Telemetry)</option>
                  <option value="SPONSOR">Brand Sponsor (24-Hour Audit Pass)</option>
                </select>
              </div>

              {role === "SPONSOR" && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                    Pass Validity
                  </label>
                  <select
                    value={sponsorDuration}
                    onChange={(e) => setSponsorDuration(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden cursor-pointer"
                  >
                    <option value={24}>24 Hours (1 Day Audit)</option>
                    <option value={48}>48 Hours (2 Days Audit)</option>
                    <option value={168}>7 Days (1 Week Audit)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-xs transition"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  <span>{isSubmitting ? "Sending..." : "Dispatch Invitation"}</span>
                </button>
              </div>
            </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
