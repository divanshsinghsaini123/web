"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { FAQSection } from "@/components/sections/faq";
import {
  Search,
  CheckCircle2,
  TrendingUp,
  Users,
  Layers,
  ArrowRight,
  Disc3,
  Music2,
  Sparkles,
  ExternalLink,
  Flame,
  Award,
  Link2,
  BarChart2,
  Send,
  Mail,
  MessageSquare,
  FileText,
  Bell,
  Clock,
  Check,
  FileSpreadsheet,
  Download,
  Copy,
  MessageCircle,
  Share2,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Eye,
  RefreshCw,
  Sliders,
  Calendar,
  Radio,
} from "lucide-react";
import { SoundWaveSVG } from "@/components/auth/music-visuals";
import { ButtonLoader } from "@/components/ui/LoadingSpinner";
import { extractAudioId } from "@/lib/utils";

function InstagramIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// Indian Songs & Top Indian Creators Data
interface SongShowcase {
  id: string;
  audioId: string;
  title: string;
  artist: string;
  genre: string;
  coverGradient: string;
  coverImageUrl: string;
  totalReels: string;
  velocity24h: string;
  velocityNum: number;
  viralityScore: number;
  color: string;
  dailyGraph: { day: string; h: string; count: number; active?: boolean }[];
  topCreators: {
    rank: number;
    username: string;
    displayName: string;
    avatarUrl: string;
    isVerified: boolean;
    followers: string;
    videoPlays: string;
    likes: string;
    comments: string;
    impactTag: string;
    niche: string;
  }[];
}

const FEATURED_SONGS: SongShowcase[] = [
  {
    id: "song-1",
    audioId: "1805963283917482",
    title: "Tauba Tauba",
    artist: "Karan Aujla & Vicky Kaushal",
    genre: "Punjabi Pop / Dance",
    coverGradient: "from-amber-500 via-rose-500 to-purple-600",
    coverImageUrl: "/covers/tauba-tauba.jpg",
    color: "#f59e0b",
    totalReels: "148,600",
    velocity24h: "+12,420 reels today",
    velocityNum: 12420,
    viralityScore: 99,
    dailyGraph: [
      { day: "Thu", h: "45%", count: 6200 },
      { day: "Fri", h: "60%", count: 8400 },
      { day: "Sat", h: "85%", count: 10800 },
      { day: "Sun", h: "98%", count: 13500 },
      { day: "Mon", h: "70%", count: 9800 },
      { day: "Tue", h: "80%", count: 11200 },
      { day: "Today", h: "94%", count: 12420, active: true },
    ],
    topCreators: [
      {
        rank: 1,
        username: "elvish_yadav",
        displayName: "Elvish Yadav",
        avatarUrl: "/creators/elvish-yadav.jpg",
        isVerified: true,
        followers: "15.6M",
        videoPlays: "24.8M",
        likes: "2.4M",
        comments: "48.2K",
        impactTag: "Hook Step System Trend",
        niche: "Haryana Swag & Vlogs",
      },
      {
        rank: 2,
        username: "pranjal_dahiya_official",
        displayName: "Pranjal Dahiya",
        avatarUrl: "/creators/pranjal-dahiya.jpg",
        isVerified: true,
        followers: "3.8M",
        videoPlays: "18.2M",
        likes: "1.9M",
        comments: "31.4K",
        impactTag: "Viral Dance Choreography",
        niche: "Haryanvi Dance & Stage",
      },
      {
        rank: 3,
        username: "ankit_baiyanpuria",
        displayName: "Ankit Baiyanpuria",
        avatarUrl: "/creators/ankit-baiyanpuria.jpg",
        isVerified: true,
        followers: "7.9M",
        videoPlays: "14.5M",
        likes: "1.6M",
        comments: "26.8K",
        impactTag: "75-Hard Gym Transition",
        niche: "Desi Fitness & Culture",
      },
      {
        rank: 4,
        username: "mr_faisu_07",
        displayName: "Faisal Shaikh",
        avatarUrl: "/creators/mr-faisu.jpg",
        isVerified: true,
        followers: "34.1M",
        videoPlays: "16.2M",
        likes: "1.8M",
        comments: "28.4K",
        impactTag: "Hook Step Pioneer",
        niche: "Bollywood & Dance",
      },
    ],
  },
  {
    id: "song-2",
    audioId: "839104829104",
    title: "Born to Shine",
    artist: "Diljit Dosanjh",
    genre: "Global Punjabi Anthem",
    coverGradient: "from-violet-600 via-purple-500 to-indigo-600",
    coverImageUrl: "/covers/born-to-shine.jpg",
    color: "#8b5cf6",
    totalReels: "92,400",
    velocity24h: "+7,850 reels today",
    velocityNum: 7850,
    viralityScore: 97,
    dailyGraph: [
      { day: "Thu", h: "42%", count: 4100 },
      { day: "Fri", h: "58%", count: 5400 },
      { day: "Sat", h: "78%", count: 6800 },
      { day: "Sun", h: "88%", count: 7600 },
      { day: "Mon", h: "66%", count: 5900 },
      { day: "Tue", h: "82%", count: 7100 },
      { day: "Today", h: "90%", count: 7850, active: true },
    ],
    topCreators: [
      {
        rank: 1,
        username: "elvish_yadav",
        displayName: "Elvish Yadav",
        avatarUrl: "/creators/elvish-yadav.jpg",
        isVerified: true,
        followers: "15.6M",
        videoPlays: "19.4M",
        likes: "2.1M",
        comments: "38.6K",
        impactTag: "Luxury Car Entry Trend",
        niche: "Haryana Swag & Lifestyle",
      },
      {
        rank: 2,
        username: "itssapnachoudhary",
        displayName: "Sapna Choudhary",
        avatarUrl: "/creators/sapna-choudhary.jpg",
        isVerified: true,
        followers: "5.8M",
        videoPlays: "16.8M",
        likes: "1.7M",
        comments: "24.2K",
        impactTag: "Stage Energy Dance",
        niche: "Haryanvi Folk & Stage",
      },
      {
        rank: 3,
        username: "dushyant_kukreja",
        displayName: "Dushyant Kukreja",
        avatarUrl: "/creators/dushyant-kukreja.jpg",
        isVerified: true,
        followers: "6.4M",
        videoPlays: "11.2M",
        likes: "1.2M",
        comments: "18.5K",
        impactTag: "Brothers Swag Reel",
        niche: "Family Comedy & POV",
      },
      {
        rank: 4,
        username: "ankit_baiyanpuria",
        displayName: "Ankit Baiyanpuria",
        avatarUrl: "/creators/ankit-baiyanpuria.jpg",
        isVerified: true,
        followers: "7.9M",
        videoPlays: "13.9M",
        likes: "1.5M",
        comments: "22.1K",
        impactTag: "Morning 5 AM Workout Reel",
        niche: "Desi Fitness & Culture",
      },
    ],
  },
  {
    id: "song-3",
    audioId: "694827105928",
    title: "Aaj Ki Raat (Stree 2)",
    artist: "Sachin-Jigar & Madhubanti Bagchi",
    genre: "Hindi Bollywood #1 Reels Hit",
    coverGradient: "from-rose-500 via-pink-600 to-red-500",
    coverImageUrl: "/covers/aaj-ki-raat.jpg",
    color: "#f43f5e",
    totalReels: "215,800",
    velocity24h: "+18,920 reels today",
    velocityNum: 18920,
    viralityScore: 99,
    dailyGraph: [
      { day: "Thu", h: "55%", count: 11200 },
      { day: "Fri", h: "72%", count: 14500 },
      { day: "Sat", h: "92%", count: 17800 },
      { day: "Sun", h: "100%", count: 20400 },
      { day: "Mon", h: "78%", count: 15600 },
      { day: "Tue", h: "88%", count: 17200 },
      { day: "Today", h: "95%", count: 18920, active: true },
    ],
    topCreators: [
      {
        rank: 1,
        username: "pranjal_dahiya_official",
        displayName: "Pranjal Dahiya",
        avatarUrl: "/creators/pranjal-dahiya.jpg",
        isVerified: true,
        followers: "3.8M",
        videoPlays: "28.5M",
        likes: "3.1M",
        comments: "52.4K",
        impactTag: "Hook Step Phenomenon",
        niche: "Haryanvi Dance & Glamour",
      },
      {
        rank: 2,
        username: "itssapnachoudhary",
        displayName: "Sapna Choudhary",
        avatarUrl: "/creators/sapna-choudhary.jpg",
        isVerified: true,
        followers: "5.8M",
        videoPlays: "17.4M",
        likes: "1.8M",
        comments: "27.6K",
        impactTag: "Desi Expression Reel",
        niche: "Folk Stage Dance",
      },
      {
        rank: 3,
        username: "jannatzubair29",
        displayName: "Jannat Zubair",
        avatarUrl: "/creators/jannat-zubair.jpg",
        isVerified: true,
        followers: "49.2M",
        videoPlays: "22.4M",
        likes: "2.6M",
        comments: "39.1K",
        impactTag: "Glamour Festive Transition",
        niche: "Bollywood & Acting",
      },
      {
        rank: 4,
        username: "elvish_yadav",
        displayName: "Elvish Yadav",
        avatarUrl: "/creators/elvish-yadav.jpg",
        isVerified: true,
        followers: "15.6M",
        videoPlays: "15.2M",
        likes: "1.6M",
        comments: "25.2K",
        impactTag: "Wedding Entry Group Reel",
        niche: "Haryana Swag & Vlogs",
      },
    ],
  },
  {
    id: "song-4",
    audioId: "582910482914",
    title: "Cheques",
    artist: "Shubh",
    genre: "Punjabi Trap / Wave",
    coverGradient: "from-cyan-500 via-teal-500 to-blue-600",
    coverImageUrl: "/covers/cheques.jpg",
    color: "#06b6d4",
    totalReels: "126,900",
    velocity24h: "+9,640 reels today",
    velocityNum: 9640,
    viralityScore: 96,
    dailyGraph: [
      { day: "Thu", h: "48%", count: 5200 },
      { day: "Fri", h: "64%", count: 6800 },
      { day: "Sat", h: "82%", count: 8500 },
      { day: "Sun", h: "94%", count: 9800 },
      { day: "Mon", h: "70%", count: 7400 },
      { day: "Tue", h: "84%", count: 8800 },
      { day: "Today", h: "92%", count: 9640, active: true },
    ],
    topCreators: [
      {
        rank: 1,
        username: "ankit_baiyanpuria",
        displayName: "Ankit Baiyanpuria",
        avatarUrl: "/creators/ankit-baiyanpuria.jpg",
        isVerified: true,
        followers: "7.9M",
        videoPlays: "18.2M",
        likes: "2.2M",
        comments: "34.5K",
        impactTag: "Ram Ram Bhai Sareya Ne Swag",
        niche: "Desi Fitness & Swag",
      },
      {
        rank: 2,
        username: "elvish_yadav",
        displayName: "Elvish Yadav",
        avatarUrl: "/creators/elvish-yadav.jpg",
        isVerified: true,
        followers: "15.6M",
        videoPlays: "21.4M",
        likes: "2.3M",
        comments: "41.2K",
        impactTag: "Desi Kafila Entry",
        niche: "Haryana Swag & Vlogs",
      },
      {
        rank: 3,
        username: "puravjha",
        displayName: "Purav Jha",
        avatarUrl: "/creators/purav-jha.jpg",
        isVerified: true,
        followers: "4.8M",
        videoPlays: "9.8M",
        likes: "1.1M",
        comments: "15.4K",
        impactTag: "Attitude POV Comedy",
        niche: "Parody & Satire",
      },
      {
        rank: 4,
        username: "dushyant_kukreja",
        displayName: "Dushyant Kukreja",
        avatarUrl: "/creators/dushyant-kukreja.jpg",
        isVerified: true,
        followers: "6.4M",
        videoPlays: "12.1M",
        likes: "1.3M",
        comments: "19.8K",
        impactTag: "Slowmo Gang Walk",
        niche: "Family Comedy",
      },
    ],
  },
];

// Overall Top Creators across North India (Haryana & Punjabi Music Tastemakers)
const OVERALL_TOP_CREATORS = [
  {
    rank: 1,
    username: "elvish_yadav",
    displayName: "Elvish Yadav",
    avatarUrl: "/creators/elvish-yadav.jpg",
    isVerified: true,
    totalViews: "184M",
    tracksAdopted: 48,
    velocityScore: 99,
    category: "Gurgaon, Haryana • Swag & Vlogs",
    topAudio: "Tauba Tauba & Born to Shine",
    followers: "15.6M",
  },
  {
    rank: 2,
    username: "ankit_baiyanpuria",
    displayName: "Ankit Baiyanpuria",
    avatarUrl: "/creators/ankit-baiyanpuria.jpg",
    isVerified: true,
    totalViews: "156M",
    tracksAdopted: 39,
    velocityScore: 98,
    category: "Sonipat, Haryana • Desi Fitness",
    topAudio: "Cheques & 295",
    followers: "7.9M",
  },
  {
    rank: 3,
    username: "pranjal_dahiya_official",
    displayName: "Pranjal Dahiya",
    avatarUrl: "/creators/pranjal-dahiya.jpg",
    isVerified: true,
    totalViews: "142M",
    tracksAdopted: 54,
    velocityScore: 97,
    category: "Faridabad, Haryana • Dance Queen",
    topAudio: "Aaj Ki Raat & 52 Gaj",
    followers: "3.8M",
  },
  {
    rank: 4,
    username: "itssapnachoudhary",
    displayName: "Sapna Choudhary",
    avatarUrl: "/creators/sapna-choudhary.jpg",
    isVerified: true,
    totalViews: "118M",
    tracksAdopted: 44,
    velocityScore: 95,
    category: "Rohtak, Haryana • Desi Stage Star",
    topAudio: "Born to Shine",
    followers: "5.8M",
  },
  {
    rank: 5,
    username: "dushyant_kukreja",
    displayName: "Dushyant Kukreja",
    avatarUrl: "/creators/dushyant-kukreja.jpg",
    isVerified: true,
    totalViews: "104M",
    tracksAdopted: 32,
    velocityScore: 94,
    category: "Hisar, Haryana • Comedy & POV",
    topAudio: "Tauba Tauba",
    followers: "6.4M",
  },
  {
    rank: 6,
    username: "puravjha",
    displayName: "Purav Jha",
    avatarUrl: "/creators/purav-jha.jpg",
    isVerified: true,
    totalViews: "88M",
    tracksAdopted: 27,
    velocityScore: 93,
    category: "Delhi/NCR • Parody & Satire",
    topAudio: "Cheques",
    followers: "4.8M",
  },
];

export default function LandingPage() {
  const [audioInput, setAudioInput] = useState("1805963283917482");
  const [extractedNotice, setExtractedNotice] = useState<string | null>(null);
  const [selectedSongIndex, setSelectedSongIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"sponsor" | "manager" | "owner">("sponsor");
  const [scanFrequency, setScanFrequency] = useState<"hourly" | "6h" | "daily">("hourly");
  const [isScanning, setIsScanning] = useState(false);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const [reportNotice, setReportNotice] = useState<string | null>(null);
  const [comparisonTrackIds, setComparisonTrackIds] = useState<string[]>([
    "song-1",
    "song-2",
    "song-3",
    "song-4",
  ]);

  const activeSong = FEATURED_SONGS[selectedSongIndex];

  // Auto-scroll / rotate every 3 seconds (pauses on user hover)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSelectedSongIndex((prev) => (prev + 1) % FEATURED_SONGS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Handle URL Paste & Automatic Audio ID Extraction
  const handleInputChange = (raw: string) => {
    const isUrl = raw.includes("instagram.com") || raw.includes("http") || raw.includes("audio/");
    const extracted = extractAudioId(raw);

    if (isUrl && extracted && extracted !== raw) {
      setAudioInput(extracted);
      setExtractedNotice(`Extracted Audio ID: ${extracted}`);
      setTimeout(() => setExtractedNotice(null), 4000);
    } else {
      setAudioInput(raw);
    }
  };

  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanNotice("⚡ AI Scanner executing: Crawling Instagram audio nodes across India clusters...");
    setTimeout(() => {
      setIsScanning(false);
      setScanNotice("✓ AI Scan Complete: 18,420 new reels indexed. Velocity delta recalibrated.");
      setTimeout(() => setScanNotice(null), 4500);
    }, 1800);
  };

  const handleGenerateReport = (name: string) => {
    setReportNotice(`✓ Generated ${name}! Auto-dispatched to WhatsApp & email.`);
    setTimeout(() => setReportNotice(null), 4000);
  };

  const toggleComparisonTrack = (id: string) => {
    if (comparisonTrackIds.includes(id)) {
      if (comparisonTrackIds.length > 1) {
        setComparisonTrackIds(comparisonTrackIds.filter((t) => t !== id));
      }
    } else {
      setComparisonTrackIds([...comparisonTrackIds, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-amber-400/30">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-3 sm:pt-4 md:pt-5 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (Headline & Interactive Stem Checker) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2.5 rounded-full border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-violet-500/15 pl-2 pr-4 py-1.5 text-xs sm:text-sm font-mono shadow-lg shadow-amber-500/15 backdrop-blur-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 px-3 py-1 text-xs font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="h-3.5 w-3.5 fill-zinc-950" />
                AI-POWERED
              </span>
              <span className="font-extrabold tracking-wide text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">
                Reels Audio Velocity Radar
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.08]">
              In music releases,{" "}
              <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-violet-500 bg-clip-text text-transparent">
                audio velocity
              </span>{" "}
              decides the hit.
            </h1>

            <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-lg leading-relaxed">
              Real-time creator adoption and daily Reels video plays across your catalog.
            </p>

            {/* Interactive Audio Checker Bar (Paste URL -> Auto Extract ID) */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block mb-2">
                Paste Instagram Audio URL or numerical ID:
              </span>
              <div className="relative flex items-center max-w-md rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/90 p-1.5 shadow-md focus-within:border-amber-400 transition-colors">
                <Search className="h-4 w-4 text-zinc-400 ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={audioInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Paste https://www.instagram.com/reels/audio/..."
                  className="w-full bg-transparent px-3 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden"
                />
                <Link
                  href={`/signup?audio=${encodeURIComponent(audioInput)}`}
                  className="flex items-center gap-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 px-5 py-2.5 text-xs sm:text-sm font-bold shadow-xs shrink-0 transition-all cursor-pointer"
                >
                  <Search className="h-3.5 w-3.5" />
                  Track Live
                </Link>
              </div>

              {/* Automatic Extraction Notification Badge */}
              {extractedNotice && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  <Link2 className="h-3.5 w-3.5" />
                  <span>{extractedNotice}</span>
                </div>
              )}

              {/* Sample Indian audio stems */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAudioInput("1805963283917482");
                    setSelectedSongIndex(0);
                  }}
                  className="rounded-full bg-zinc-100 dark:bg-zinc-800/80 px-3.5 py-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-amber-400/20 hover:text-amber-500 transition-colors cursor-pointer"
                >
                  1805963283917482 (Tauba Tauba - Karan Aujla)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAudioInput("839104829104");
                    setSelectedSongIndex(1);
                  }}
                  className="rounded-full bg-zinc-100 dark:bg-zinc-800/80 px-3.5 py-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-amber-400/20 hover:text-amber-500 transition-colors cursor-pointer"
                >
                  839104829104 (Born to Shine - Diljit)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAudioInput("694827105928");
                    setSelectedSongIndex(2);
                  }}
                  className="rounded-full bg-zinc-100 dark:bg-zinc-800/80 px-3.5 py-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-amber-400/20 hover:text-amber-500 transition-colors cursor-pointer"
                >
                  694827105928 (Aaj Ki Raat - Stree 2)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAudioInput("582910482914");
                    setSelectedSongIndex(3);
                  }}
                  className="rounded-full bg-zinc-100 dark:bg-zinc-800/80 px-3.5 py-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:bg-amber-400/20 hover:text-amber-500 transition-colors cursor-pointer"
                >
                  582910482914 (Cheques - Shubh)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Hero Live Metrics + Daily Reels Creation Graph) */}
          <div
            className="lg:col-span-6 space-y-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 p-6 sm:p-7 shadow-2xl backdrop-blur-md overflow-hidden">
              {/* Subtle Ambient Glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header Status + 3s Auto-scroll Indicator + Left/Right Swap Buttons */}
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-3 py-1 text-xs font-semibold">
                    Monitored Release
                  </span>
                  <span className="rounded-full border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs font-mono text-zinc-500">
                    {selectedSongIndex + 1} / {FEATURED_SONGS.length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-amber-500 font-medium">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    Auto-rotating
                  </div>

                  {/* Manual Left / Right Swap Navigation Controls */}
                  <div className="flex items-center gap-1.5 bg-zinc-200/90 dark:bg-zinc-800 p-1 rounded-full border border-zinc-300 dark:border-zinc-700 shadow-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSongIndex(
                          (prev) => (prev - 1 + FEATURED_SONGS.length) % FEATURED_SONGS.length
                        )
                      }
                      className="h-8 w-8 rounded-full bg-white dark:bg-zinc-700 hover:bg-amber-400 hover:text-zinc-950 text-zinc-800 dark:text-zinc-100 flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-90"
                      title="Previous Track (Swap Left)"
                      aria-label="Previous Track"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-[11px] font-mono font-bold text-zinc-500 px-1 hidden sm:inline">Swap</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSongIndex((prev) => (prev + 1) % FEATURED_SONGS.length)
                      }
                      className="h-8 w-8 rounded-full bg-white dark:bg-zinc-700 hover:bg-amber-400 hover:text-zinc-950 text-zinc-800 dark:text-zinc-100 flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-90"
                      title="Next Track (Swap Right)"
                      aria-label="Next Track"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Song Metric Overview */}
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs space-y-4 mt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-700 shrink-0">
                      <Image
                        src={activeSong.coverImageUrl}
                        alt={activeSong.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {activeSong.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Artist: {activeSong.artist} &bull; Audio ID: <span className="font-mono">{activeSong.audioId}</span>
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-400/10 border border-amber-400/30 px-3 py-0.5 text-xs font-semibold text-amber-500">
                    Trending #{selectedSongIndex + 1}
                  </span>
                </div>

                {/* 3 Metric Pillars */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">Reels Indexed</span>
                    <p className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {activeSong.totalReels}
                    </p>
                    <span className="text-[10px] text-emerald-500 font-semibold">{activeSong.velocity24h}</span>
                  </div>

                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">Video Plays</span>
                    <p className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">14.8M</p>
                    <span className="text-[10px] text-zinc-400">Total reach</span>
                  </div>

                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-3">
                    <span className="text-[10px] font-mono uppercase text-zinc-500">Virality Index</span>
                    <p className="text-lg font-bold font-mono text-amber-500 mt-0.5">{activeSong.viralityScore}%</p>
                    <span className="text-[10px] text-amber-500 font-medium">Accelerating</span>
                  </div>
                </div>

                {/* RESTORED: Daily Virality Growth Graph (Last 7 Days) */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                    <span className="font-medium">Daily New Reels Creation (Last 7 Days)</span>
                    <span className="font-mono text-zinc-700 dark:text-zinc-300 font-bold">{activeSong.velocity24h}</span>
                  </div>
                  <div className="flex items-end gap-2.5 h-16 pt-1">
                    {activeSong.dailyGraph.map((bar) => (
                      <div key={bar.day} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-sm h-12 flex items-end overflow-hidden">
                          <div
                            className={`w-full rounded-sm transition-all duration-300 ${
                              bar.active ? "bg-amber-400" : "bg-zinc-400 dark:bg-zinc-600 group-hover:bg-amber-400/60"
                            }`}
                            style={{ height: bar.h }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sound Wave Micro-Animation Bar */}
                <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs text-zinc-500 font-mono">Live Momentum Pulse</span>
                  <SoundWaveSVG className="w-24 h-5 opacity-80" />
                </div>
              </div>

              {/* Sub-card: Top Viral Creator Highlight */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex items-center justify-between text-xs mt-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border border-amber-400/40 shrink-0">
                    <Image
                      src={activeSong.topCreators[0].avatarUrl}
                      alt={activeSong.topCreators[0].username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        @{activeSong.topCreators[0].username}
                      </span>
                      {activeSong.topCreators[0].isVerified && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500/20" />
                      )}
                      <span className="text-[11px] text-zinc-400">({activeSong.topCreators[0].followers})</span>
                    </div>
                    <p className="text-xs text-zinc-500">{activeSong.topCreators[0].impactTag}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm text-amber-500 block">
                    {activeSong.topCreators[0].videoPlays} plays
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {activeSong.topCreators[0].likes} likes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 1: MULTI-ROLE BRAND SPONSOR & ARTIST MANAGER PORTAL
            ========================================================================= */}
        <section id="roles" className="my-10 sm:my-14 p-6 sm:p-10 rounded-3xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-500 block mb-2">
              Sponsor &amp; Manager Operations
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.12]">
              Give Brand Sponsors Live Proof.{" "}
              <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                Give Managers Full Control.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2.5">
              Verified third-party campaign audit links for sponsors, automated scan scheduling for artist managers.
            </p>

            {/* Interactive Role Switcher Tabs */}
            <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 mt-6 shadow-xs">
              <button
                type="button"
                onClick={() => setSelectedRole("sponsor")}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  selectedRole === "sponsor"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Brand Sponsor View</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("manager")}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  selectedRole === "manager"
                    ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/30"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
                }`}
              >
                <UserCheck className="h-4 w-4" />
                <span>Artist Manager Mode</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("owner")}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  selectedRole === "owner"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-md"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Label Owner (Admin)</span>
              </button>
            </div>
          </div>

          {/* Role Preview Container */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 sm:p-8 shadow-xl">
            {/* SPONSOR ROLE VIEW */}
            {selectedRole === "sponsor" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl border border-blue-500/20">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                          boAt Lifestyle &bull; Sponsored Track Campaign Audit
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">
                          Live Sponsor Telemetry
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Track: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{activeSong.title} ({activeSong.artist})</span> &bull; Access Level: Read-Only Campaign ROI Audit
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      100% Third-Party Verified Audit
                    </span>
                  </div>
                </div>

                {/* Sponsor Telemetry Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4 border border-zinc-200/80 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Total Video Plays</span>
                      <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Eye className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">24.8M</p>
                    <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3.5 w-3.5" /> +184% vs Campaign Target
                    </span>
                  </div>

                  <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4 border border-zinc-200/80 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Reels Created with Audio</span>
                      <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Flame className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold font-mono text-amber-500">{activeSong.totalReels}</p>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 block">Indexed by Instagram AI Scraper</span>
                  </div>

                  <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4 border border-zinc-200/80 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Top Influencer Partner</span>
                      <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                        <Award className="h-4 w-4" />
                      </div>
                    </div>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">@{activeSong.topCreators[0].username}</p>
                    <span className="text-[11px] text-violet-500 font-semibold block mt-1">{activeSong.topCreators[0].videoPlays} plays generated</span>
                  </div>

                  <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4 border border-zinc-200/80 dark:border-zinc-700 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold mb-1">Audit Export</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Export timestamped spreadsheet with verified links for boardroom audit.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGenerateReport("Sponsor Audit Spreadsheet")}
                      className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Audit (.xlsx)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ARTIST MANAGER MODE */}
            {selectedRole === "manager" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/20">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                          Artist Manager Operations &amp; Outreach Command
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold">
                          Full Manager Operations Active
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Schedule AI Crawls &bull; 1-Click Instagram DM Creator Outreach &bull; Generate Boardroom Reports
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full font-bold border border-zinc-200 dark:border-zinc-700">
                      Logged in: Artist Manager (Rohit Sharma)
                    </span>
                  </div>
                </div>

                {/* Notifications for scan or report actions */}
                {scanNotice && (
                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2 animate-in fade-in">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>{scanNotice}</span>
                  </div>
                )}
                {reportNotice && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{reportNotice}</span>
                  </div>
                )}

                {/* Feature 1: AI Scan Frequency & Schedule Controller (Compact & Sleek) */}
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-800/40 p-3 sm:p-3.5 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          AI Scrape Scheduler &amp; Node Crawl
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </h4>
                        <p className="text-[11px] text-zinc-500">
                          Automated scrapers index Reels audio adoption without manual intervention.
                        </p>
                      </div>
                    </div>

                    {/* Trigger Immediate Scan Button */}
                    <button
                      type="button"
                      onClick={handleTriggerScan}
                      disabled={isScanning}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 px-3 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
                    >
                      {isScanning ? (
                        <ButtonLoader className="h-3.5 w-3.5" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      <span>{isScanning ? "Scanning..." : "Trigger Instant Scan"}</span>
                    </button>
                  </div>

                  {/* Scan Frequency Selector (Compact Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setScanFrequency("hourly")}
                      className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        scanFrequency === "hourly"
                          ? "border-amber-400 bg-amber-400/10 dark:bg-amber-400/5 shadow-2xs"
                          : "border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Hourly AI Crawl</span>
                        {scanFrequency === "hourly" && <Check className="h-3 w-3 text-amber-500" />}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5">First 72 Hours Trend Wave</p>
                      <span className="text-[10px] font-mono text-emerald-500 font-semibold block mt-0.5">Next: in 14m 20s</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScanFrequency("6h")}
                      className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        scanFrequency === "6h"
                          ? "border-amber-400 bg-amber-400/10 dark:bg-amber-400/5 shadow-2xs"
                          : "border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Every 6 Hours</span>
                        {scanFrequency === "6h" && <Check className="h-3 w-3 text-amber-500" />}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Sustained Weekly Track</p>
                      <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">4 crawls/day</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScanFrequency("daily")}
                      className={`p-2 sm:p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                        scanFrequency === "daily"
                          ? "border-amber-400 bg-amber-400/10 dark:bg-amber-400/5 shadow-2xs"
                          : "border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Daily Nightly Sync</span>
                        {scanFrequency === "daily" && <Check className="h-3 w-3 text-amber-500" />}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Catalog Maintenance</p>
                      <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">12:00 AM IST</span>
                    </button>
                  </div>
                </div>

                {/* Feature 2: 1-Click Report Generation Suite (Medium Icons) */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-500" />
                    Manager On-Demand Report Generation Suite
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Report 1 */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/70 bg-white dark:bg-zinc-900 p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                          <FileSpreadsheet className="h-5.5 w-5.5" />
                        </div>
                        <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Boardroom Excel (.xlsx)</h5>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          Export complete data dump: creators, handles, followers, video plays, and 7-day velocity curves.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGenerateReport("Boardroom Excel Report (.xlsx)")}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Generate Excel (.xlsx)</span>
                      </button>
                    </div>

                    {/* Report 2 */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/70 bg-white dark:bg-zinc-900 p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-11 w-11 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center border border-emerald-600/20">
                          <MessageSquare className="h-5.5 w-5.5" />
                        </div>
                        <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">WhatsApp 24h Velocity Debrief</h5>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          Pre-formatted executive summary ready to broadcast to artist &amp; label core WhatsApp groups.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGenerateReport("WhatsApp 24h Debrief")}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Generate WhatsApp Digest</span>
                      </button>
                    </div>

                    {/* Report 3 */}
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/70 bg-white dark:bg-zinc-900 p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                          <ShieldCheck className="h-5.5 w-5.5" />
                        </div>
                        <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Sponsor ROI Audit Sheet</h5>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          Clean brand-ready telemetry proving commercial video reach for brands like boAt, Pepsi, and JBL.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleGenerateReport("Brand Sponsor ROI Audit")}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Generate Sponsor Audit</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feature 3: Influencer Outreach Queue */}
                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50/70 dark:bg-zinc-800/40 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        Top Viral Creators Queued for Manager Outreach
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                      3 High-Priority Deals Pending
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {activeSong.topCreators.slice(0, 3).map((creator) => (
                      <div
                        key={creator.username}
                        className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3.5 flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                            <Image src={creator.avatarUrl} alt={creator.username} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate block">
                              @{creator.username}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono block">
                              {creator.followers} &bull; {creator.videoPlays} plays
                            </span>
                          </div>
                        </div>

                        <a
                          href={`https://instagram.com/${creator.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90 text-white py-1.5 text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <InstagramIcon className="h-3.5 w-3.5" />
                          <span>Instagram DM Pitch</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LABEL OWNER (ADMIN) VIEW */}
            {selectedRole === "owner" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xl">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                          Label Owner &bull; Master Governance &amp; Multi-Tenant Links
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-mono text-[10px] font-bold">
                          Master Admin
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Generate time-limited audit access tokens for sponsors &bull; Revoke access anytime with zero password sharing
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGenerateReport("Sponsor Audit Link")}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 px-4 py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <span>+ Invite Brand Sponsor / Manager</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3.5 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/40">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">boAt Lifestyle (Brand Sponsor)</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">View-Only Telemetry &bull; Active (Audit Valid)</p>
                    </div>
                    <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3.5 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/40">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">Rohit Sharma (Artist Manager)</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Full Scan &amp; WhatsApp Outreach</p>
                    </div>
                    <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-3.5 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/40">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">Pepsi India Brand Desk</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Audit Invite Link Sent &bull; Awaiting Token</p>
                    </div>
                    <span className="text-amber-500 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full">Pending</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: MULTI-TRACK VELOCITY COMPARISON SECTION
            ========================================================================= */}
        <section id="compare" className="my-10 sm:my-14 p-6 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 block mb-2">
              Cross-Catalog Benchmarking
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.12]">
              Spot the Next Breakout Track{" "}
              <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500 bg-clip-text text-transparent">
                Before the Charts Do.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2.5">
              Side-by-side daily Reels compounding curves and audio velocity across your full release catalog.
            </p>

            {/* Toggle Track Comparison Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {FEATURED_SONGS.map((song) => {
                const isSelected = comparisonTrackIds.includes(song.id);
                return (
                  <button
                    key={song.id}
                    type="button"
                    onClick={() => toggleComparisonTrack(song.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800/70 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: song.color }}
                    />
                    <span>{song.title}</span>
                    {isSelected && <Check className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparative Bar Chart Matrix */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-8 shadow-xl">
            {/* Top comparison summary pills - 4 DISTINCT COLORS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  🏆
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-400 block font-semibold">Punjabi Dance Pop</span>
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Tauba Tauba (+12.4K/day)</p>
                </div>
              </div>

              <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4 flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-violet-500/20 text-violet-500 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-400 block font-semibold">Global Loyalty</span>
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Born to Shine (+7.8K/day)</p>
                </div>
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold">
                  🔥
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-400 block font-semibold">#1 Hindi Velocity</span>
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Aaj Ki Raat (+18.9K/day)</p>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-500 flex items-center justify-center font-bold">
                  📈
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-zinc-400 block font-semibold">Desi Trap Wave</span>
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Cheques (+9.6K/day)</p>
                </div>
              </div>
            </div>

            {/* Side-by-Side Day Comparison Bars */}
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span>Daily New Reels Scraped per 24h</span>
                <span>Values calibrated from Instagram Scraper engine</span>
              </div>

              {FEATURED_SONGS.filter((s) => comparisonTrackIds.includes(s.id)).map((song) => (
                <div key={song.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-xs">
                        <Image
                          src={song.coverImageUrl}
                          alt={song.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{song.title}</span>
                      <span className="text-zinc-400 font-mono text-[11px]">({song.artist})</span>
                    </div>
                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {song.velocity24h} &bull; Total: {song.totalReels}
                    </span>
                  </div>

                  {/* Day bars row */}
                  <div className="grid grid-cols-7 gap-2">
                    {song.dailyGraph.map((bar) => (
                      <div key={bar.day} className="flex flex-col items-center gap-1 group">
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-sm h-14 flex items-end p-0.5">
                          <div
                            className="w-full rounded-xs transition-all duration-300 group-hover:brightness-110"
                            style={{
                              height: bar.h,
                              backgroundColor: song.color,
                              opacity: bar.active ? 1 : 0.75,
                            }}
                          />
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] font-mono text-zinc-400 block">{bar.day}</span>
                          <span className="text-[10px] font-mono font-semibold text-zinc-600 dark:text-zinc-300 block">
                            {bar.count >= 1000 ? `${(bar.count / 1000).toFixed(1)}K` : bar.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: SONG-SPECIFIC TOP CREATORS (Auto-rotates every 3 seconds)
            ========================================================================= */}
        <section
          id="creators"
          className="my-10 sm:my-14 p-6 sm:p-10 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 shadow-sm"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-violet-500 block mb-2">
                Release Sound Champions
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.12]">
                The Creators Turning Audio into{" "}
                <span className="bg-gradient-to-r from-violet-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                  Viral Movements.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2">
                Discover the exact choreographers and trendsetters driving 10M+ views on every release.
              </p>
            </div>

            {/* Song Switcher Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {FEATURED_SONGS.map((song, idx) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => setSelectedSongIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    selectedSongIndex === idx
                      ? "bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 border border-black/10">
                    <Image src={song.coverImageUrl} alt={song.title} fill className="object-cover" />
                  </div>
                  <span>Song {idx + 1}: {song.title.split(" (")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Song Hero Banner */}
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-700 shrink-0">
                <Image
                  src={activeSong.coverImageUrl}
                  alt={activeSong.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">{activeSong.title}</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    {activeSong.genre}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  by <span className="font-semibold text-zinc-700 dark:text-zinc-300">{activeSong.artist}</span> &bull; Audio ID: <span className="font-mono text-amber-500 font-bold">{activeSong.audioId}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs sm:text-sm">
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">Total Reels</span>
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">{activeSong.totalReels}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">24h Trajectory</span>
                <span className="text-sm font-bold text-emerald-500">{activeSong.velocity24h}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">Virality Score</span>
                <span className="text-lg font-bold font-mono text-amber-500">{activeSong.viralityScore}%</span>
              </div>
            </div>
          </div>

          {/* Creators Grid for Active Song */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeSong.topCreators.map((creator) => (
              <div
                key={creator.username}
                className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-5 shadow-xs hover:border-amber-400/50 hover:shadow-xl transition-all"
              >
                {/* Rank Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-500">
                  <Award className="h-3 w-3" />
                  #{creator.rank}
                </div>

                {/* Creator Avatar & Identity */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 group-hover:border-amber-400 transition-colors shrink-0">
                    <Image
                      src={creator.avatarUrl}
                      alt={creator.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate block">
                        {creator.displayName}
                      </span>
                      {creator.isVerified && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500/20 shrink-0" />
                      )}
                    </div>
                    <span className="text-xs font-mono text-zinc-500 block truncate">
                      @{creator.username}
                    </span>
                  </div>
                </div>

                {/* Impact Highlight Tag */}
                <div className="rounded-lg bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{creator.impactTag}</span>
                </div>

                {/* Creator Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-mono">Video Reach</span>
                    <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                      {creator.videoPlays}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-mono">Likes</span>
                    <span className="font-bold font-mono text-zinc-900 dark:text-zinc-100">
                      {creator.likes}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-mono">Comments</span>
                    <span className="font-bold font-mono text-zinc-700 dark:text-zinc-300">
                      {creator.comments}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-mono">Followers</span>
                    <span className="font-bold font-mono text-zinc-700 dark:text-zinc-300">
                      {creator.followers}
                    </span>
                  </div>
                </div>

                {/* Footer Tag + 1-Click Direct DM Action */}
                <div className="mt-3 pt-2 flex items-center justify-between text-xs text-zinc-400">
                  <span className="truncate max-w-[100px]">{creator.niche}</span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`https://instagram.com/${creator.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 transition-colors"
                      title="View on Instagram"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={`https://ig.me/m/${creator.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-500 font-bold text-[11px] transition-colors border border-amber-400/20"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>1-Click DM</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: 1-CLICK CREATOR OUTREACH & PARTNERSHIP COLLABORATION (NEW)
            ========================================================================= */}
        <section id="outreach" className="my-10 sm:my-14 p-6 sm:p-10 rounded-3xl bg-purple-500/[0.02] dark:bg-purple-950/[0.10] border border-purple-500/20 shadow-sm">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-500 block mb-2">
              1-Click Talent Outreach
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.12]">
              Turn Organic Creator Hype into{" "}
              <span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Paid Collaborations.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2.5">
              Launch pre-composed Instagram DMs and contact talent managers on WhatsApp in one click.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Outreach Tool 1: Instant Instagram DM Launcher */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 space-y-4 shadow-sm hover:border-purple-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-11 w-11 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-purple-500/10 text-purple-500 px-2.5 py-0.5 rounded-full font-bold">
                    Instant IG DM
                  </span>
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Pre-Composed Pitch Templates
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                  Launch pre-filled Instagram Direct messages populated with the creator&apos;s real video plays, inviting them to official remix campaigns or sync licensing deals.
                </p>

                {/* Interactive Pitch Mock */}
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/70 p-3.5 text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/80 mt-4 font-sans leading-relaxed">
                  <p className="font-semibold text-purple-500 text-[11px] mb-1 font-mono">📨 Pre-filled DM Pitch:</p>
                  <p className="text-zinc-600 dark:text-zinc-300 italic">
                    &quot;Hey @{activeSong.topCreators[0].username}, huge love from our label for your reel on {activeSong.title} ({activeSong.topCreators[0].videoPlays} plays)! We&apos;d love to sponsor your next video &amp; feature you in our official artist campaign. Let&apos;s connect!&quot;
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://ig.me/m/${activeSong.topCreators[0].username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white py-2.5 text-xs font-bold transition-all shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Open Instagram DM with @{activeSong.topCreators[0].username}</span>
                </a>
              </div>
            </div>

            {/* Outreach Tool 2: VIP Management WhatsApp Contact */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 space-y-4 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full font-bold">
                    Agency WhatsApp
                  </span>
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  VIP Management &amp; Booking Fast-Lane
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                  Skip noisy public comment sections. Instantly connect with verified artist booking reps, agencies, and creator management on WhatsApp.
                </p>

                {/* Verified Talent Agent Card */}
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/70 p-3.5 border border-zinc-200 dark:border-zinc-700/80 mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Verified Talent Agency
                    </span>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      WhatsApp Connected
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Direct access to manage bookings for {activeSong.topCreators.length} verified creators currently trending on your release.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://wa.me/?text=Hi%2C%20we%20want%20to%20collaborate%20with%20creators%20trending%20on%20our%20audio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Message Creator Manager on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Outreach Tool 3: Influencer Roster Excel Export */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 space-y-4 shadow-sm hover:border-amber-500/50 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full font-bold">
                    1-Click Export
                  </span>
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Full Influencer Roster Export (.xlsx)
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                  Download all creators using your audio into a clean, structured Excel spreadsheet with follower counts, reel links, and bio email addresses.
                </p>

                {/* Excel Preview pill */}
                <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/70 p-3.5 border border-zinc-200 dark:border-zinc-700/80 mt-4 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between text-zinc-500 text-[11px]">
                    <span>File: creator_roster_{activeSong.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.xlsx</span>
                    <span className="text-amber-500 font-bold">142 KB</span>
                  </div>
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300">
                    Includes: Handle, Followers, Reels Plays, Engagement %, Business Email
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8,Rank,Username,Followers,Plays,Niche\n" +
                      activeSong.topCreators.map(c => `${c.rank},${c.username},${c.followers},${c.videoPlays},${c.niche}`).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `creators_${activeSong.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 py-2.5 text-xs font-bold transition-all shadow-md shadow-amber-400/20 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Creator Roster (.xlsx / CSV)</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: AUTOMATED DAILY & WEEKLY REPORTS (WhatsApp VIP Bot + Excel Dumps)
            ========================================================================= */}
        <section id="reports" className="my-10 sm:my-14 p-6 sm:p-10 rounded-3xl bg-emerald-500/[0.03] dark:bg-emerald-950/[0.12] border border-emerald-500/20 shadow-sm">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500 block mb-2">
              Automated Data Delivery
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.12]">
              Morning WhatsApp Pings &amp;{" "}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                Excel Audits While You Sleep.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2.5">
              9:00 AM daily WhatsApp digests, instant VIP creator notifications, and boardroom Excel spreadsheets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: WhatsApp VIP Bot & Morning Pulse (Telegram features unified here) */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 space-y-4 shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-bold">
                    WhatsApp Bot + VIP Alerts
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    WhatsApp Pulse &amp; Instant VIP Alerts
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                    9:00 AM daily velocity digest + instant bot notification the second a verified account or creator with &gt;500K followers drops a reel with your track stem.
                  </p>
                </div>

                {/* Realistic WhatsApp Chat Bubble Preview */}
                <div className="rounded-2xl bg-[#e5ddd5]/30 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 space-y-3 font-sans text-xs">
                  {/* Daily 9 AM digest */}
                  <div className="rounded-xl bg-white dark:bg-zinc-800 p-3 shadow-xs border-l-4 border-emerald-500">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1 font-mono">
                      <span>RhythmSync Bot &bull; 9:00 AM</span>
                      <span className="text-emerald-500 font-bold">Daily Pulse</span>
                    </div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">
                      ⚡ {activeSong.title} 24h Update:
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300 mt-0.5">
                      {activeSong.velocity24h} (Total: {activeSong.totalReels} reels)
                    </p>
                  </div>

                  {/* Real-time VIP creator ping (formerly Telegram) */}
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 shadow-xs border border-emerald-500/30">
                    <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 mb-1 font-mono">
                      <span>🚨 VIP Influencer Alert</span>
                      <span>Just now</span>
                    </div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">
                      @{activeSong.topCreators[0].username} ({activeSong.topCreators[0].followers})
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300 text-[11px] mt-0.5">
                      Just posted a reel using your audio! View &amp; 1-click DM sent.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-mono text-emerald-500 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Connected via official WhatsApp Cloud API
                </span>
              </div>
            </div>

            {/* Card 2: Automated Daily & Weekly Excel Reports (.xlsx / CSV) */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 space-y-4 shadow-xl hover:border-emerald-600/50 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-mono uppercase bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-bold">
                    Daily / Weekly Excel
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    Automated Excel (.xlsx) Dumps
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                    Boardroom-ready Microsoft Excel &amp; CSV spreadsheets delivered automatically every morning or Monday week. Complete data tables ready for A&amp;R meetings.
                  </p>
                </div>

                {/* Excel Table Mock Preview */}
                <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">weekly_velocity_audit.xlsx</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">1.8 MB</span>
                  </div>

                  <div className="space-y-1 text-[11px] pt-1">
                    <div className="grid grid-cols-3 text-zinc-400 uppercase text-[9px] pb-1">
                      <span>Handle</span>
                      <span>Followers</span>
                      <span className="text-right">Plays</span>
                    </div>
                    {activeSong.topCreators.slice(0, 3).map((c) => (
                      <div key={c.username} className="grid grid-cols-3 py-0.5 text-zinc-700 dark:text-zinc-300">
                        <span className="truncate font-semibold">@{c.username}</span>
                        <span>{c.followers}</span>
                        <span className="text-right font-bold text-amber-500">{c.videoPlays}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Auto-sent to email &amp; direct download
                </span>
              </div>
            </div>

            {/* Card 3: Slack & Team Webhook Integrations */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-6 space-y-4 shadow-xl hover:border-violet-500/50 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-12 w-12 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                    <Send className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-mono uppercase bg-violet-500/10 text-violet-500 px-3 py-1 rounded-full font-bold">
                    Slack &amp; Discord
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                    Team Webhook Milestones
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                    Never celebrate alone. Real-time webhooks post celebration milestones (10K, 50K, 100K reels indexed) straight into your company&apos;s Slack channel.
                  </p>
                </div>

                {/* Slack Mock Preview */}
                <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 font-sans text-xs space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">#music-releases</span>
                    <span className="text-[10px] text-zinc-400 font-mono">APP &bull; Today at 10:14 AM</span>
                  </div>
                  <div className="bg-violet-500/10 border-l-4 border-violet-500 p-2.5 rounded-r-lg">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">
                      🎉 Milestone Unlocked: {activeSong.title}
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400 text-[11px] mt-0.5">
                      Crossed {activeSong.totalReels} reels on Instagram! Top driver: @{activeSong.topCreators[0].username}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-mono text-violet-500 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Customizable webhook endpoints
                </span>
              </div>
            </div>
          </div>
        </section>



        {/* =========================================================================
            SECTION 5: OVERALL PLATFORM TOP CREATORS LEADERBOARD (Indian Influencers)
            ========================================================================= */}
        <section id="leaderboard" className="my-10 sm:my-14 p-6 sm:p-10 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 block mb-2">
              Creator Power Ranking
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.12]">
              The 400M+ Tastemakers{" "}
              <span className="bg-gradient-to-r from-violet-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                Commanding Reels Feeds.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2.5">
              The North Indian creators whose sound selections dictate what millions of mobile screens play daily.
            </p>
          </div>

          {/* Leaderboard Table */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono uppercase text-zinc-500">
                  <tr>
                    <th className="py-4 pl-6 pr-2">Rank</th>
                    <th className="py-4 px-4">Creator Handle</th>
                    <th className="py-4 px-4">Niche & Category</th>
                    <th className="py-4 px-4">Total Video Views</th>
                    <th className="py-4 px-4">Songs Used</th>
                    <th className="py-4 px-4">Velocity Score</th>
                    <th className="py-4 pr-6 pl-4 text-right">Top Associated Track</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {OVERALL_TOP_CREATORS.map((creator) => (
                    <tr
                      key={creator.username}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-4 pl-6 pr-2 font-mono font-bold">
                        <span
                          className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${
                            creator.rank === 1
                              ? "bg-amber-400 text-zinc-950 shadow-sm"
                              : creator.rank === 2
                              ? "bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                              : creator.rank === 3
                              ? "bg-amber-700/30 text-amber-500"
                              : "text-zinc-400"
                          }`}
                        >
                          {creator.rank}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                            <Image
                              src={creator.avatarUrl}
                              alt={creator.username}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                {creator.displayName}
                              </span>
                              {creator.isVerified && (
                                <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500/20" />
                              )}
                            </div>
                            <span className="font-mono text-xs text-zinc-500">
                              @{creator.username} &bull; {creator.followers}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {creator.category}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {creator.totalViews}
                      </td>

                      <td className="py-4 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                        {creator.tracksAdopted} releases
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-500">{creator.velocityScore}</span>
                          <div className="w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-amber-400 h-full rounded-full"
                              style={{ width: `${creator.velocityScore}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-4 pr-6 pl-4 text-right">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-xs">
                          {creator.topAudio}
                        </span>
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <a
                            href={`https://instagram.com/${creator.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
                            title="Profile"
                          >
                            <span>Profile</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <a
                            href={`https://ig.me/m/${creator.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-zinc-950 font-bold text-xs hover:bg-amber-300 transition-colors shadow-xs"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>1-Click Pitch</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION: ENTERPRISE ARCHITECTURE & WORKFLOW
            1. Daily Virality Telemetry Engine (24h Clock Scheduler)
            2. Multi-Tenant Team Delegation Graph (Admin -> Multiple Managers -> 1-Day Sponsor Pass)
            ========================================================================= */}
        <section id="features" className="my-14 sm:my-20 p-6 sm:p-10 rounded-3xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 block mb-2">
              System Architecture &amp; Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.12]">
              24-Hour Autonomous Telemetry.{" "}
              <span className="bg-gradient-to-r from-amber-500 via-violet-500 to-blue-500 bg-clip-text text-transparent">
                Multi-Tenant Team Graph.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2.5">
              Automated scraping schedules paired with granular role delegation for label heads, multiple artist managers, and 1-day guest sponsors.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* WORKFLOW PILLAR 1: DAILY VIRALITY TELEMETRY ENGINE WITH CLOCK SIGN */}
            <div className="lg:col-span-5 rounded-3xl border border-amber-500/30 bg-white dark:bg-zinc-900/90 p-6 sm:p-7 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-6">
                {/* Cadence Header with Live Clock Indicator */}
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-xs">
                      <Clock className="h-6 w-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        Daily Virality Telemetry
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono">24h Automated Scraping Cycle</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-500 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Daily 12:00 AM IST
                  </span>
                </div>

                {/* 3-Step Automated Telemetry Workflow */}
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60">
                    <div className="h-8 w-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0 font-mono shadow-xs">
                      00:00
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        Instagram Node Ingestion
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                        Crawlers index active audio IDs across Indian server clusters, parsing net new reel uploads &amp; audio tags.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60">
                    <div className="h-8 w-8 rounded-xl bg-violet-500 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono shadow-xs">
                      06:00
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        Virality Delta Recalibration
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                        Calculates daily growth curves, tags verified influencers, and flags hook-step breakouts.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono shadow-xs">
                      09:00
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        WhatsApp &amp; Excel Broadcast
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                        Instant executive morning digest dispatched to artist WhatsApp groups &amp; boardroom Excel sheets exported.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Schedule Status Badge */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Worker Status: Healthy
                </span>
                <span className="text-amber-500 font-bold">Next scan in: 14m 20s</span>
              </div>
            </div>

            {/* WORKFLOW PILLAR 2: MULTI-TENANT TEAM DELEGATION GRAPH */}
            <div className="lg:col-span-7 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-6 sm:p-7 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Multi-Tenant Team Architecture Graph
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Hierarchical access control matching ReelsPulse enterprise multi-tenant delegation.
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold px-3 py-1 self-start sm:self-auto">
                    Role-Based Access
                  </span>
                </div>

                {/* THE VISUAL TEAM GRAPH */}
                <div className="space-y-4 pt-1">
                  {/* LEVEL 1: LABEL OWNER (MASTER ADMIN) */}
                  <div className="rounded-2xl border-2 border-zinc-900 dark:border-zinc-600 bg-zinc-900 dark:bg-zinc-800 text-white p-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-bold">
                          👑
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">Label Owner &bull; Master Admin</span>
                            <span className="bg-amber-400 text-zinc-950 font-mono text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                              Full Master Access
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 mt-0.5">
                            Controls billing, master stems, and delegates custom roles with 1-click token revocation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CONNECTING BRANCH SVG */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="h-6 w-0.5 bg-gradient-to-b from-zinc-800 to-amber-500" />
                  </div>

                  {/* LEVEL 2: MULTIPLE ARTIST MANAGERS (PARALLEL CLUSTER) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3 sm:pl-6 border-l-2 border-amber-400/50">
                    {/* Manager 1 */}
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-amber-500" />
                          <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                            A&amp;R Manager (Rohit)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">
                          Operations
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-snug">
                        Schedules scans, triggers instant node crawls, and generates boardroom Excel sheets.
                      </p>
                      <span className="text-[10px] font-mono text-emerald-500 font-semibold block">
                        ✓ Can issue View-Only Guest Passes
                      </span>
                    </div>

                    {/* Manager 2 */}
                    <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-violet-500" />
                          <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                            Outreach Lead (Simran)
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-violet-500 font-bold bg-violet-500/10 px-2 py-0.5 rounded-md">
                          Partnerships
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-snug">
                        Dispatches 1-click Instagram DM pitches &amp; sync licensing deals to trending choreographers.
                      </p>
                      <span className="text-[10px] font-mono text-violet-500 font-semibold block">
                        ✓ Negotiates audio sync licenses
                      </span>
                    </div>
                  </div>

                  {/* CONNECTING BRANCH SVG TO SPONSORS */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="h-6 w-0.5 bg-gradient-to-b from-amber-500 to-blue-500" />
                  </div>

                  {/* LEVEL 3: BRAND SPONSOR VIEW-ONLY DELEGATION (1-DAY AUDIT PASS) */}
                  <div className="rounded-2xl border-2 border-blue-500/40 bg-blue-500/5 p-4 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 block">
                            Brand Sponsor: boAt Lifestyle / Pepsi
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono">
                            Temporary Guest Access &bull; Zero Password Sharing
                          </span>
                        </div>
                      </div>
                      <span className="rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold px-3 py-1 flex items-center gap-1.5 self-start sm:self-auto shadow-xs">
                        <Clock className="h-3 w-3" />
                        1-Day Audit Pass Active (Expires: 18h 42m)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                      <div className="rounded-lg bg-white dark:bg-zinc-800/80 p-2 border border-zinc-200 dark:border-zinc-700/60">
                        <span className="text-zinc-400 text-[10px] block">Permissions</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">Read-Only Telemetry</span>
                      </div>
                      <div className="rounded-lg bg-white dark:bg-zinc-800/80 p-2 border border-zinc-200 dark:border-zinc-700/60">
                        <span className="text-zinc-400 text-[10px] block">Auditing</span>
                        <span className="font-bold text-emerald-500">100% Verified Reach</span>
                      </div>
                      <div className="rounded-lg bg-white dark:bg-zinc-800/80 p-2 border border-zinc-200 dark:border-zinc-700/60 col-span-2 sm:col-span-1">
                        <span className="text-zinc-400 text-[10px] block">Export Format</span>
                        <span className="font-bold text-blue-500">Boardroom Excel (.xlsx)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-amber-400/10 via-amber-400/5 to-transparent p-10 sm:p-14 text-center my-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Start Tracking Your First Song Free
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-md mx-auto">
            1 tracked song, 24-hour scraping cadence, daily multi-platform reports, and real-time creator analytics. Zero credit card required.
          </p>
          <div className="mt-7 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-7 py-3 text-sm shadow-md shadow-amber-400/20 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-7 py-3 text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Public Homepage FAQs */}
        <div className="mt-20 pt-10 border-t border-zinc-200 dark:border-zinc-800">
          <FAQSection
            category="home"
            eyebrow="FREQUENTLY ASKED QUESTIONS"
            title="Questions About RhythmSync? We've Got Answers."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 px-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 flex items-center justify-center bg-transparent shrink-0">
              <Image
                src="/reels.png"
                alt="ReelsPulse Logo"
                width={36}
                height={36}
                className="object-contain w-full h-full"
              />
            </div>
            <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">RhythmSync</span>
            <span>&bull; Real-time Instagram Reels audio intelligence</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <Link href="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-200">Pricing</Link>
            <Link href="/contact" className="hover:text-zinc-900 dark:hover:text-zinc-200">Contact Us</Link>
            <Link href="/login" className="hover:text-zinc-900 dark:hover:text-zinc-200">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

