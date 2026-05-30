"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type HistoryItem = {
  id: string;
  url: string;
  platform: string;
  created_at: string;
  analysis: { main_takeaway: string; backlash_verdict: string; };
};

const platformLabels: Record<string, string> = {
  instagram: "Instagram", youtube: "YouTube", reddit: "Reddit",
  tiktok: "TikTok", twitter: "X (Twitter)", facebook: "Facebook", linkedin: "LinkedIn",
};

const platformIcons: Record<string, string> = {
  instagram: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  youtube: "M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z",
  reddit: "M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z",
  tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  twitter: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function verdictStyle(verdict: string) {
  if (verdict === "real") return { bg: "rgba(239,68,68,0.15)", color: "#ef4444", border: "rgba(239,68,68,0.3)" };
  if (verdict === "mixed") return { bg: "rgba(249,115,22,0.15)", color: "#f97316", border: "rgba(249,115,22,0.3)" };
  return { bg: "rgba(34,197,94,0.15)", color: "#22c55e", border: "rgba(34,197,94,0.3)" };
}

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [initial, setInitial] = useState("?");

  const isLight = theme === "light";
  const bg = isLight ? "#f5f4f2" : "#111111";
  const navBg = isLight ? "rgba(245,244,242,0.92)" : "rgba(17,17,17,0.9)";
  const cardBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)";
  const cardBorder = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const bodyText = isLight ? "#1a1a1a" : "#ffffff";
  const mutedText = isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  const labelColor = isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
  const accent = "#FF6B00";

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("dukay_theme", next);
  };

  useEffect(() => {
    const saved = localStorage.getItem("dukay_theme") as "dark" | "light" | null;
    setTheme(saved || "dark");
  }, []);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((data) => {
      if (data.name) setInitial(data.name.charAt(0).toUpperCase());
    }).catch(() => {});

    fetch("/api/history").then((res) => res.json()).then((data) => {
      if (data.redirect) { router.push("/sign-in"); return; }
      setItems(data.items || []);
    }).catch(() => setItems([])).finally(() => setLoading(false));
  }, [router]);

  return (
    <main style={{ backgroundColor: bg, color: bodyText, minHeight: "100vh" }}>
      <nav style={{ backgroundColor: navBg, borderColor: cardBorder }} className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-4 border-b backdrop-blur-md z-50">
        <div className="flex items-center">
          <a href="/">
            <svg width="32" height="32" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
              {isLight ? (<><rect width="160" height="160" rx="28" fill="#E8621A"/><text x="80" y="128" fontFamily="Arial Black, Arial, sans-serif" fontSize="96" fontWeight="700" fill="#1a1a1a" textAnchor="middle">D</text><circle cx="122" cy="38" r="10" fill="#1a1a1a"/><circle cx="122" cy="38" r="17" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.5"/><circle cx="122" cy="38" r="24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.25"/></>) : (<><rect width="160" height="160" rx="28" fill="#1a1a1a"/><text x="80" y="128" fontFamily="Arial Black, Arial, sans-serif" fontSize="96" fontWeight="700" fill="#E8621A" textAnchor="middle">D</text><circle cx="122" cy="38" r="10" fill="#E8621A"/><circle cx="122" cy="38" r="17" fill="none" stroke="#E8621A" strokeWidth="2" opacity="0.5"/><circle cx="122" cy="38" r="24" fill="none" stroke="#E8621A" strokeWidth="1.5" opacity="0.25"/></>)}
            </svg>
          </a>
        </div>
        <span style={{ color: accent }} className="absolute left-1/2 -translate-x-1/2 text-lg font-black tracking-tight">Dükay</span>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} style={{ borderColor: isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)", color: isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)" }} className="w-8 h-8 flex items-center justify-center rounded-lg border transition text-sm" aria-label="Toggle theme">
            {isLight ? "🌙" : "☀️"}
          </button>
          <a href="/history" style={{ color: accent }} className="text-xs font-bold px-2">History</a>
          <a href="/profile" style={{ backgroundColor: accent, color: "#ffffff" }} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black hover:opacity-80 transition">{initial}</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-24">
        <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-2">Your analyses</p>
        <h1 style={{ color: bodyText }} className="text-3xl font-black tracking-tight mb-8">History</h1>

        {loading && (
          <div className="flex items-center gap-3 py-12 justify-center">
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: `${accent}30`, borderTopColor: accent }} />
            <p style={{ color: mutedText }} className="text-sm">Loading your analyses…</p>
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <p style={{ color: bodyText }} className="font-bold text-lg">No analyses yet</p>
            <p style={{ color: mutedText }} className="text-sm">Paste a post link on the home page to get started.</p>
            <a href="/" style={{ backgroundColor: accent, color: "#ffffff" }} className="mt-2 text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition">Analyze something</a>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const verdict = verdictStyle(item.analysis?.backlash_verdict || "noise");
              const iconPath = platformIcons[item.platform] || platformIcons.instagram;
              return (
                <button key={item.id} onClick={() => router.push(`/analysis/${item.id}`)}
                  style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                  className="w-full border rounded-2xl px-5 py-4 flex items-center gap-4 text-left hover:opacity-80 transition cursor-pointer"
                >
                  <div style={{ backgroundColor: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)" }} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" style={{ fill: isLight ? "#1a1a1a" : "#ffffff", opacity: 0.7 }} viewBox="0 0 24 24"><path d={iconPath} /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: bodyText }} className="text-sm font-semibold leading-snug truncate">{item.analysis?.main_takeaway || "Analysis"}</p>
                    <p style={{ color: labelColor }} className="text-xs mt-0.5">{platformLabels[item.platform] || item.platform} · {formatDate(item.created_at)}</p>
                  </div>
                  <span style={{ backgroundColor: verdict.bg, color: verdict.color, borderColor: verdict.border }} className="text-[10px] font-black px-2.5 py-1 rounded-full border shrink-0 uppercase">{item.analysis?.backlash_verdict || "—"}</span>
                  <span style={{ color: labelColor }} className="text-sm shrink-0">→</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}