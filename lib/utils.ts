import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "0";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toLocaleString();
}


export function extractAudioId(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  // Extracts ID from URLs like https://www.instagram.com/reels/audio/1617230249803125?obrf=MTJlNW9lcHJldmczYg==
  const match = trimmed.match(/(?:audio\/|audio%2F)(\d+)/i);
  if (match && match[1]) {
    return match[1];
  }
  // Fallback to pure numeric sequence if user pasted raw ID
  const cleaned = trimmed.split("?")[0].replace(/\D/g, "");
  if (cleaned.length >= 8) {
    return cleaned;
  }
  return trimmed;
}
