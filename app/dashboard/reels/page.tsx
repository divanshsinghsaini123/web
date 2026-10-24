"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Video,
  Play,
  Heart,
  MessageCircle,
  ExternalLink,
  Search,
  CheckCircle2,
  Filter,
  RotateCw,
  X,
  Music2,
  Sparkles,
  TrendingUp,
  Share2,
  Clock,
  LayoutGrid,
  List,
  Eye,
  SlidersHorizontal,
  Flame,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { api, ReelItem, TrackedSong, getProxiedImageUrl } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import PageHeader from "@/components/dashboard/PageHeader";

// Sample verified creator avatars for fallback enrichment
const CREATOR_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
];

const REEL_THUMBNAILS = [
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80",
];

export default function ReelsExplorerPage() {
  const searchParams = useSearchParams();
  const trackIdParam = searchParams.get("track_id") || "";

  const [reels, setReels] = useState<ReelItem[]>([]);
  const [tracks, setTracks] = useState<TrackedSong[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState(trackIdParam);
  const [searchCreator, setSearchCreator] = useState("");
  const [minPlays, setMinPlays] = useState<number>(0);
  const [sortBy, setSortBy] = useState("play_count");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  // Selected reel for the interactive inspection window
  const [activeReel, setActiveReel] = useState<ReelItem | null>(null);
  const [playerMode, setPlayerMode] = useState<"direct" | "embed">("direct");

  async function loadData() {
    try {
      setLoading(true);
      const [reelsRes, tracksRes] = await Promise.all([
        api.getReels({
          track_id: selectedTrackId || undefined,
          page,
          page_size: 24,
          min_plays: minPlays || undefined,
          search: searchCreator || undefined,
          sort_by: sortBy,
        }).catch(() => ({ items: [], total: 0 })),
        api.getTracks().catch(() => []),
      ]);

      const items = reelsRes?.items || [];
      setReels(items);
      setTotalCount(reelsRes?.total || items.length);
      setTracks(tracksRes || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedTrackId, minPlays, sortBy, page]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    loadData();
  }

  const selectedTrack = useMemo(() => {
    return tracks.find((t) => t.id === selectedTrackId);
  }, [tracks, selectedTrackId]);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1440px] w-full mx-auto">
      {/* Compact Header */}
      <PageHeader
        title="Instagram Reels Explorer"
        description="Browse and play indexed Instagram Reels across all your tracked audio stems."
        icon={<Video className="w-5 h-5 text-zinc-950" />}
        iconVariant="amber"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100 dark:bg-zinc-900">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Animated Rectangular Generate Report Button */}
            <Link
              href={`/dashboard/reports${selectedTrackId ? `?track_id=${selectedTrackId}` : ""}`}
              className="relative group overflow-hidden inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-1.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-emerald-500/25 transition-all duration-300 ring-1 ring-emerald-400/50"
              title="Generate customized Excel / CSV spreadsheet export"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <FileSpreadsheet className="w-4 h-4 text-emerald-100 shrink-0" />
              <span className="font-semibold">Generate Report</span>
            </Link>

            <button
              onClick={() => loadData()}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-500" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {/* 1. Horizontal Song Switcher Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-500 px-1">
          <span>Filter by Audio Stem:</span>
          <span>{totalCount} total reels indexed</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* All Songs Pill */}
          <button
            onClick={() => {
              setSelectedTrackId("");
              setPage(1);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${
              !selectedTrackId
                ? "bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-300 shadow-xs"
                : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center shrink-0">
              <Music2 className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            </div>
            <span>All Catalog Songs</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-[10px] font-mono">
              {tracks.reduce((acc, t) => acc + (t.scraped_reels_count || t.total_reels_count || 0), 0)}
            </span>
          </button>

          {/* Individual Song Pills */}
          {tracks.map((track, idx) => {
            const isSelected = selectedTrackId === track.id;
            return (
              <button
                key={track.id}
                onClick={() => {
                  setSelectedTrackId(track.id);
                  setPage(1);
                }}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-900 dark:text-amber-300 shadow-xs"
                    : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {track.cover_artwork_url ? (
                  <img
                    src={track.cover_artwork_url}
                    alt={track.title || "Track"}
                    className="w-6 h-6 rounded-md object-cover shrink-0 border border-zinc-300 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Music2 className="w-3 h-3 text-zinc-500" />
                  </div>
                )}
                <div className="flex flex-col text-left max-w-[140px]">
                  <span className="truncate text-xs font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
                    {track.title || track.track_name || "Untitled Audio"}
                  </span>
                  <span className="truncate text-[10px] text-zinc-400 leading-tight">
                    {track.artist_name || "Instagram Audio"}
                  </span>
                </div>
                <span className="px-1.5 py-0.2 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-[10px] font-mono">
                  {track.scraped_reels_count || track.total_reels_count || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sleek Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#121215] p-3 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search creator handle or reel shortcode..."
            value={searchCreator}
            onChange={(e) => setSearchCreator(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Min Plays Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-zinc-500">Min Plays:</span>
            <select
              value={minPlays}
              onChange={(e) => {
                setMinPlays(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="0">All Plays</option>
              <option value="1000">&gt; 1,000 Plays</option>
              <option value="10000">&gt; 10,000 Plays</option>
              <option value="50000">&gt; 50,000 Plays</option>
              <option value="100000">&gt; 100,000 Plays</option>
              <option value="1000000">&gt; 1M (Viral)</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-zinc-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 text-xs font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              <option value="play_count">Most Plays</option>
              <option value="like_count">Most Likes</option>
              <option value="comment_count">Most Comments</option>
              <option value="posted_at">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Grid View: Vertical Reel Cards */}
      {viewMode === "grid" ? (
        reels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {reels.map((reel, idx) => {
              const fallbackThumb = REEL_THUMBNAILS[idx % REEL_THUMBNAILS.length];
              const thumbUrl = getProxiedImageUrl(reel.thumbnail_url) || fallbackThumb;
              const fallbackAvatar = CREATOR_AVATARS[idx % CREATOR_AVATARS.length];
              const avatarUrl = getProxiedImageUrl(reel.creator_profile_pic_url) || fallbackAvatar;

              return (
                <div
                  key={reel.id || idx}
                  onClick={() => setActiveReel(reel)}
                  className="group relative flex flex-col rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Vertical Reel Thumbnail (9:16 Aspect Preview) */}
                  <div className="relative aspect-[9/14] w-full overflow-hidden bg-zinc-900">
                    <img
                      src={thumbUrl}
                      alt={`Reel by ${reel.creator_username}`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackThumb;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Play Button Hover Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-medium">
                        <Eye className="w-3 h-3 text-amber-400" />
                        {formatNumber(reel.play_count)}
                      </span>
                      {reel.video_duration && (
                        <span className="px-1.5 py-0.5 rounded bg-black/60 text-zinc-300 text-[9px] font-mono">
                          {Math.round(reel.video_duration)}s
                        </span>
                      )}
                    </div>

                    {/* Bottom Metadata inside thumbnail */}
                    <div className="absolute bottom-2 left-2 right-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={avatarUrl}
                          alt={reel.creator_username}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackAvatar;
                          }}
                          className="w-5 h-5 rounded-full object-cover border border-white/40 shrink-0"
                        />
                        <span className="text-xs font-semibold text-white truncate drop-shadow-sm">
                          @{reel.creator_username}
                        </span>
                        {reel.creator_is_verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 fill-sky-400/20" />
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-400 fill-rose-400/30" />
                          {formatNumber(reel.like_count)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-zinc-300" />
                          {formatNumber(reel.comment_count)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Bar */}
                  <div className="p-2.5 flex items-center justify-between text-[11px] font-mono bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="truncate text-zinc-500 font-sans max-w-[90px]" title={reel.tracked_audio_title || "Track"}>
                      {reel.tracked_audio_title || "Audio Track"}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:underline">
                      Watch &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#121215] p-12 text-center space-y-3">
            <Video className="w-10 h-10 text-zinc-400 mx-auto" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              No Reels Indexed Yet
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto font-mono">
              The scraper worker is indexing Instagram Reels for your tracked songs. Once finished, discovered videos will appear here automatically.
            </p>
          </div>
        )
      ) : (
        /* Table View with Large High-Contrast Typography */
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#121215] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4 font-bold">Reel / Creator</th>
                  <th className="px-5 py-4 font-bold">Audio Stem</th>
                  <th className="px-5 py-4 font-bold">Plays</th>
                  <th className="px-5 py-4 font-bold">Likes</th>
                  <th className="px-5 py-4 font-bold">Comments</th>
                  <th className="px-5 py-4 font-bold">Engagement</th>
                  <th className="px-5 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {reels.map((reel, idx) => {
                  const fallbackAvatar = CREATOR_AVATARS[idx % CREATOR_AVATARS.length];
                  const avatarUrl = getProxiedImageUrl(reel.creator_profile_pic_url) || fallbackAvatar;
                  const eng = reel.play_count > 0 ? (((reel.like_count + reel.comment_count) / reel.play_count) * 100).toFixed(1) : "0.0";

                  return (
                    <tr
                      key={reel.id || idx}
                      onClick={() => setActiveReel(reel)}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarUrl}
                            alt={reel.creator_username}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fallbackAvatar;
                            }}
                            className="w-10 h-10 rounded-full object-cover border-2 border-zinc-300 dark:border-zinc-700 shrink-0 shadow-xs"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-zinc-950 dark:text-zinc-50">
                              @{reel.creator_username}
                              {reel.creator_is_verified && (
                                <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                              )}
                            </div>
                            <span className="text-xs font-mono font-semibold text-zinc-400">
                              {reel.shortcode || reel.reel_code}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm sm:text-base text-zinc-800 dark:text-zinc-200 font-bold">
                        {reel.tracked_audio_title || "Audio Track"}
                      </td>
                      <td className="px-5 py-4 font-mono font-black text-base sm:text-lg text-zinc-950 dark:text-zinc-50">
                        {formatNumber(reel.play_count)}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-sm sm:text-base text-zinc-700 dark:text-zinc-300">
                        {formatNumber(reel.like_count)}
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-sm sm:text-base text-zinc-700 dark:text-zinc-300">
                        {formatNumber(reel.comment_count)}
                      </td>
                      <td className="px-5 py-4 font-mono font-black text-sm sm:text-base text-amber-500">
                        {eng}%
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveReel(reel);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-black text-xs sm:text-sm font-mono font-bold transition-all shadow-xs cursor-pointer"
                        >
                          Play Reel &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Interactive Reel Inspection & Autoplay Window (Modal Dialog) */}
      {activeReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setActiveReel(null)}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left Side: Video Player */}
            <div className="md:w-1/2 bg-black flex items-center justify-center relative min-h-[460px] md:min-h-[580px] overflow-hidden">
              {/* Player Mode Switcher */}
              <div className="absolute top-3 left-3 z-30 flex items-center gap-1 rounded-lg bg-black/80 backdrop-blur-md p-1 border border-white/10 text-[10px] font-mono text-white shadow-md">
                <button
                  type="button"
                  onClick={() => setPlayerMode("direct")}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    playerMode === "direct"
                      ? "bg-amber-500 text-zinc-950 font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Direct Video Player
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerMode("embed")}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    playerMode === "embed"
                      ? "bg-amber-500 text-zinc-950 font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Instagram Embed
                </button>
              </div>

              {playerMode === "direct" ? (
                <video
                  src={`http://127.0.0.1:8008/api/v1/reels/${activeReel.reel_code}/video-stream`}
                  poster={activeReel.thumbnail_url}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full max-h-[560px] object-contain"
                />
              ) : (
                <div className="relative w-full h-full min-h-[460px] md:min-h-[580px] flex items-center justify-center bg-black">
                  <iframe
                    src={`https://www.instagram.com/p/${activeReel.reel_code}/embed/captioned/`}
                    className="w-full h-full min-h-[460px] md:min-h-[580px] border-0 bg-black"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                    scrolling="no"
                  />
                  {/* Quick fallback switch button if iframe is blocked by Instagram cross-origin restrictions */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center pointer-events-none">
                    <button
                      type="button"
                      onClick={() => setPlayerMode("direct")}
                      className="pointer-events-auto px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-mono font-medium hover:bg-amber-500 hover:text-black transition-colors cursor-pointer shadow-lg"
                    >
                      Black screen? Switch to Direct Video Player
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Rich Metadata Panel */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
              <div className="space-y-5">
                {/* Creator Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={getProxiedImageUrl(activeReel.creator_profile_pic_url) || CREATOR_AVATARS[0]}
                      alt={activeReel.creator_username}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = CREATOR_AVATARS[0];
                      }}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                          @{activeReel.creator_username}
                        </h4>
                        {activeReel.creator_is_verified && (
                          <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 font-sans">
                        {activeReel.creator_name || activeReel.creator_username}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://www.instagram.com/${activeReel.creator_username}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Total Plays
                    </span>
                    <div className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {formatNumber(activeReel.play_count)}
                    </div>
                    <span className="text-[10px] text-emerald-500 font-mono font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Top Decile Reach
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Likes
                    </span>
                    <div className="text-xl font-mono font-bold text-rose-500">
                      {formatNumber(activeReel.like_count)}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {formatNumber(activeReel.comment_count)} comments
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Engagement Rate
                    </span>
                    <div className="text-xl font-mono font-bold text-amber-500">
                      {activeReel.play_count > 0
                        ? (((activeReel.like_count + activeReel.comment_count) / activeReel.play_count) * 100).toFixed(2)
                        : "0.00"}%
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">Industry avg: 2.4%</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Reel ID / Code
                    </span>
                    <div className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {activeReel.reel_code}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {activeReel.video_duration ? `${Math.round(activeReel.video_duration)} seconds` : "Standard Reel"}
                    </span>
                  </div>
                </div>

                {/* Tracked Audio Information */}
                <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold">
                    <Music2 className="w-3.5 h-3.5" />
                    <span>Tracked Audio Stem</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {activeReel.tracked_audio_title || "Monitored Song"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Discovered through automated scan worker
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <a
                  href={`https://www.instagram.com/reel/${activeReel.reel_code}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open on Instagram</span>
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://www.instagram.com/reel/${activeReel.reel_code}/`);
                    alert("Reel Instagram URL copied to clipboard!");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs cursor-pointer"
                >
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
