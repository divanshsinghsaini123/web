import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ui/DynamicIslandToast";
import { FloatingSupportBot } from "@/components/FloatingSupportBot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RhythmSync | Instagram Reels Audio Velocity & Virality Tracking",
  description: "Track audio velocity, daily creator adoption, and viral video momentum on Instagram Reels.",
  icons: {
    icon: [
      { url: "/reels-cropped.png", sizes: "any" },
      { url: "/reels.png" },
    ],
    apple: "/reels-cropped.png",
    shortcut: "/reels-cropped.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#fdfdfd] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased transition-colors duration-200`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            {children}
            <FloatingSupportBot />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
