"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Award,
  Music2,
  RotateCw,
  ExternalLink,
  CheckCircle2,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Search,
  Sparkles,
  Flame,
  Send,
  UserCheck,
  Video,
} from "lucide-react";
import { api, TrackedSong, getProxiedImageUrl } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import PageHeader from "@/components/dashboard/PageHeader";

// High quality verified Indian creator images as attached by user
const CURATED_CREATOR_PHOTOS: Record<string, string> = {
  elvish_yadav: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  itssapnachoudhary: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  dushyant_kukreja: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
  sukhemuziicaldoctorz: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80",
  nehakakkar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
  tonykakkar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
};

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
];

interface CreatorItem {
  creator_username: string;
  creator_name?: string;
  creator_profile_pic_url?: string;
  is_verified: boolean;
  reels_count: number;
  total_plays: number;
  total_likes: number;
  total_comments: number;
  best_reel_plays: number;
  best_reel_code?: string;
  engagement_rate: number;
  instagram_profile_url: string;
}

export default function TopCreatorsPage() {
  const [tracks, setTracks] = useState<TrackedSong[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");
  const [creators, setCreators] = useState<CreatorItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [outreachStatus, setOutreachStatus] = useState<Record<string, string>>({});

  async function loadData() {
    try {
      setLoading(true);
      const [tracksRes, creatorsRes] = await Promise.all([
        api.getTracks().catch(() => []),
        api.getTopCreators(selectedTrackId || undefined, 30).catch(() => ({ creators: [], total: 0 })),
      ]);

      setTracks(tracksRes || []);
      setCreators(creatorsRes?.creators || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedTrackId]);

  const filteredCreators = useMemo(() => {
    if (!search.trim()) return creators;
    const term = search.toLowerCase();
    return creators.filter(
      (c) =>
        c.creator_username.toLowerCase().includes(term) ||
        (c.creator_name || "").toLowerCase().includes(term)
    );
  }, [creators, search]);

  const handleToggleOutreach = (username: string) => {
    setOutreachStatus((prev) => {
      const current = prev[username];
      const next = current === "Contacted" ? "Deal Signed" : current === "Deal Signed" ? undefined : "Contacted";
      if (!next) {
        const copy = { ...prev };
        delete copy[username];
        return copy;
      }
      return { ...prev, [username]: next };
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1440px] w-full mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Top Creators Radar"
        description="Discover and recruit influential creators driving viral audio adoption across Instagram."
        icon={<Award className="w-5 h-5 text-zinc-950" />}
        iconVariant="amber"
        actions={
          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search creator handle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-xs"
              />
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {/* 1. Horizontal Song Switcher (Overall vs Per Track) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedTrackId("")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${
            !selectedTrackId
              ? "bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-300 shadow-xs"
              : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}
        >
          <div className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          </div>
          <span>Overall Top Influencers</span>
          <span className="px-1.5 py-0.2 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-[10px] font-mono">
            {creators.length}
          </span>
        </button>

        {tracks.map((track) => {
          const isSelected = selectedTrackId === track.id;
          return (
            <button
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${
                isSelected
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-300 shadow-xs"
                  : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              {track.cover_artwork_url ? (
                <img
                  src={track.cover_artwork_url}
                  alt={track.title || "Track"}
                  className="w-5 h-5 rounded-md object-cover border border-zinc-300 dark:border-zinc-700 shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <Music2 className="w-3 h-3 text-zinc-500" />
                </div>
              )}
              <span className="truncate max-w-[130px] font-semibold text-zinc-900 dark:text-zinc-100">
                {track.title || track.track_name || "Audio Track"}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Top Creators Cards Grid */}
      {filteredCreators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCreators.map((creator, idx) => {
            const cleanUser = creator.creator_username.toLowerCase().replace(/[^a-z0-9_]/g, "");
            const curatedImg = CURATED_CREATOR_PHOTOS[cleanUser];
            const fallbackImg = DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length];
            const avatarUrl = getProxiedImageUrl(creator.creator_profile_pic_url) || curatedImg || fallbackImg;
            const currentStatus = outreachStatus[creator.creator_username];

            return (
              <div
                key={creator.creator_username}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-5 shadow-xs hover:border-amber-500/40 hover:shadow-md transition-all space-y-4"
              >
                {/* Header: Photo + Handle + Rank Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={avatarUrl}
                        alt={creator.creator_username}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackImg;
                        }}
                        className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/30 shadow-xs"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-mono font-bold flex items-center justify-center border border-white dark:border-zinc-900">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          @{creator.creator_username}
                        </h4>
                        {creator.is_verified && (
                          <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 font-sans truncate">
                        {creator.creator_name || `@${creator.creator_username}`}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-500 mt-0.5">
                        <TrendingUp className="w-3 h-3" />
                        {creator.engagement_rate}% Eng Rate
                      </span>
                    </div>
                  </div>

                  <a
                    href={creator.instagram_profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
                    title="Open Instagram Profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* 3 Metrics Box */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/40 text-center">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                      Total Views
                    </span>
                    <span className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {formatNumber(creator.total_plays)}
                    </span>
                  </div>
                  <div className="border-x border-zinc-200/60 dark:border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                      Reels Made
                    </span>
                    <span className="text-sm font-mono font-bold text-amber-500">
                      {creator.reels_count}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                      Top Reel
                    </span>
                    <span className="text-sm font-mono font-bold text-rose-500">
                      {formatNumber(creator.best_reel_plays)}
                    </span>
                  </div>
                </div>

                {/* Best Reel & Action Footer */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                  {creator.best_reel_code ? (
                    <a
                      href={`https://www.instagram.com/reel/${creator.best_reel_code}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Best Reel</span>
                    </a>
                  ) : (
                    <span className="text-xs font-mono text-zinc-400">Audio Contributor</span>
                  )}

                  <button
                    onClick={() => handleToggleOutreach(creator.creator_username)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer shadow-xs ${
                      currentStatus === "Deal Signed"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : currentStatus === "Contacted"
                        ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                        : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-white"
                    }`}
                  >
                    {currentStatus ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{currentStatus}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Outreach</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#121215] p-12 text-center space-y-3">
          <Award className="w-10 h-10 text-zinc-400 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            No Creators Indexed Yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto font-mono">
            Once scraper workers discover reels using your audio stems, creator handles and viewership analytics will populate this radar automatically.
          </p>
        </div>
      )}
    </div>
  );
}
