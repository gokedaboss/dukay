"use client";

import { useState, useEffect, useRef } from "react";

type BacklashVerdict = "real" | "mixed" | "noise";

type AnalysisResult = {
  backstory: string;
  main_takeaway: string;
  agreement: string;
  disagreement: string;
  backlash_verdict: BacklashVerdict;
  backlash_reasoning: string;
  non_obvious_insights: string[];
  comment_patterns: string[];
  representative_comments: string[];
  comments_section_label: string;
  overall_vibe: string;
  vibe_breakdown: {
    funny: number;
    positive: number;
    negative: number;
    opposing: number;
  };
  vibe_interpretation: string;
};

const supportedPlatforms = [
  "instagram.com",
  "youtube.com",
  "youtu.be",
  "reddit.com",
  "tiktok.com",
  "x.com",
  "twitter.com",
  "facebook.com",
  "linkedin.com",
];

const platformIcons = [
  {
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "TikTok",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
  {
    label: "YouTube",
    path: "M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z",
  },
  {
    label: "X",
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
  {
    label: "Facebook",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "Reddit",
    path: "M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z",
  },
  {
    label: "LinkedIn",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
];

const loadingMessages = [
  "Fetching comments…",
  "Filtering out the noise…",
  "Finding repeated patterns…",
  "Separating jokes from real criticism…",
  "Checking if the backlash is real or just loud…",
  "Reading the vibe of the conversation…",
  "Identifying what people actually agree on…",
  "Looking for what most people missed…",
  "Checking if the criticism has substance…",
  "Reading between the lines…",
  "Figuring out who is actually angry and who is just loud…",
  "Almost there…",
  "Sorting through the chaos…",
  "Finding the signal in the noise…",
  "Working it out…",
];

const errorMessages: Record<string, string> = {
  unsupported: "This link isn't supported yet. Try Instagram, TikTok, YouTube, X, Facebook, Reddit or LinkedIn.",
  private: "We couldn't read comments from this post. It may be private or restricted.",
  no_comments: "No comments found for this post. It may be too new or have comments disabled.",
  x_restricted: "X restricts comment access on most posts. Try Instagram, YouTube or Reddit for best results.",
  timeout: "This took too long. The post may have too many restrictions. Try another link.",
  default: "Something went wrong analyzing this post. Please try again.",
};

function isSupportedUrl(input: string) {
  try {
    const url = new URL(input);
    return supportedPlatforms.some((domain) => url.hostname.includes(domain));
  } catch {
    return false;
  }
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [platform, setPlatform] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<"useful" | "not_useful" | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startLoadingMessages = () => {
    const shuffled = [...loadingMessages].sort(() => Math.random() - 0.5);
    let index = 0;
    setLoadingMessage(shuffled[0]);
    intervalRef.current = setInterval(() => {
      index = (index + 1) % shuffled.length;
      setLoadingMessage(shuffled[index]);
    }, 3000);
  };

  const stopLoadingMessages = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setLoadingMessage("");
  };

  const handleAnalyze = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Paste a link first.");
      return;
    }

    if (!isSupportedUrl(trimmedUrl)) {
      setError(errorMessages.unsupported);
      return;
    }

    setError("");
    setLoading(true);
    setAnalysis(null);
    setFeedback(null);
    startLoadingMessages();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await response.json();

      if (data.error) {
        const isX = trimmedUrl.includes("x.com") || trimmedUrl.includes("twitter.com");
        if (isX && data.error.includes("No comments")) {
          setError(errorMessages.x_restricted);
        } else if (data.error.includes("private") || data.error.includes("restricted")) {
          setError(errorMessages.private);
        } else if (data.error.includes("No comments")) {
          setError(errorMessages.no_comments);
        } else {
          setError(errorMessages.default);
        }
        return;
      }

      setAnalysis(data.analysis);
      setPlatform(data.platform || "");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setError(errorMessages.timeout);
      } else {
        setError(errorMessages.default);
      }
    } finally {
      setLoading(false);
      stopLoadingMessages();
    }
  };

  const handleFeedback = async (rating: "useful" | "not_useful") => {
    if (feedback) return;
    setFeedback(rating);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, platform, rating }),
      });
    } catch {
      // fail silently
    }
  };
  const backlashColor =
    analysis?.backlash_verdict === "real"
      ? "bg-red-500/20 text-red-300 border-red-500/30"
      : analysis?.backlash_verdict === "mixed"
      ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
      : "bg-green-500/20 text-green-300 border-green-500/30";

  return (
    <main className="min-h-screen bg-[#111111] text-white font-sans">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-md bg-[#111111]/90 z-50">
        <span className="text-lg font-black tracking-tight text-[#FF6B00]">Dükay</span>
        <button className="bg-[#FF6B00] text-black text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition">
          Analyze Free
        </button>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-28 pb-16 max-w-5xl mx-auto">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-5">
          Comment Intelligence
        </p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-5 max-w-3xl">
          See what the comments{" "}
          <span className="text-white/60">are really saying</span>
        </h1>
        <p className="text-white/50 text-base font-light max-w-lg mx-auto mb-8 leading-relaxed">
          Know if the backlash is real, mixed, or just noise — in seconds.
        </p>

        <div className="relative w-full max-w-2xl mx-auto mb-3">
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze(); }}
            placeholder="Paste a post — we'll read the comments for you..."
            className="w-full bg-white/5 border border-white/25 rounded-2xl px-4 py-4 text-sm text-white placeholder-white/40 outline-none focus:border-[#FF6B00] pr-28 transition"
          />
          <button
            onClick={handleAnalyze}
            disabled={!url.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FF6B00] text-black text-xs font-bold px-4 py-2 rounded-xl hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {loading ? "..." : "Analyze"}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-300 mb-3 max-w-sm text-center">{error}</p>
        )}

        <p className="text-xs text-white/30 mb-1">• No account needed to start</p>
        <p className="text-xs text-white/20 italic mb-8">
          Designed for real conversations, not dashboards
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/30">
            Starting with
          </span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {platformIcons.map((icon) => (
              <svg
                key={icon.label}
                className="w-5 h-5 fill-white opacity-40 hover:opacity-80 transition"
                viewBox="0 0 24 24"
                aria-label={icon.label}
                role="img"
              >
                <path d={icon.path} />
              </svg>
            ))}
          </div>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-16 gap-4">
          <div className="w-6 h-6 border-2 border-[#FF6B00]/30 border-t-[#FF6B00] rounded-full animate-spin" />
          <p className="text-sm text-white/40 animate-pulse">{loadingMessage}</p>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <section className="max-w-5xl mx-auto px-6 pb-24 space-y-3">

          {/* 0. Platform Badge */}
          {platform && (
            <div className="flex items-center gap-2 pb-1">
              <span className="text-[10px] font-semibold tracking-widest uppercase text-white/30 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                {platform}
              </span>
              <span className="text-[10px] text-white/20">Post analyzed</span>
            </div>
          )}
          {/* 0. Backstory */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3">
              Backstory
            </p>
            <p className="text-white/80 text-base leading-relaxed">
              {analysis.backstory}
            </p>
          </div>
          {/* 1. Main Takeaway */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3">
              Main Takeaway
            </p>
            <p className="text-white font-black text-2xl md:text-3xl leading-snug tracking-tight">
              {analysis.main_takeaway}
            </p>
          </div>

          {/* 2. Backlash + Overall Vibe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3">
                Backlash
              </p>
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${backlashColor}`}>
                {analysis.backlash_verdict.toUpperCase()}
              </span>
              <p className="text-white/60 text-sm leading-relaxed mt-3">
                {analysis.backlash_reasoning}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3">
                Overall Vibe
              </p>
              <p className="text-white font-bold text-base leading-snug">
                {analysis.overall_vibe}
              </p>
              <p className="text-white/40 text-xs leading-relaxed mt-2">
                {analysis.vibe_interpretation}
              </p>
            </div>
          </div>

          {/* 3. Breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-4">
              Breakdown
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {Object.entries(analysis.vibe_breakdown).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white/50 uppercase w-16 shrink-0">{key}</span>
                  <div className="flex-1 h-2.5 bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF6B00] rounded-full transition-all duration-1000"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white/50 w-8 text-right">~{value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Representative Comments */}
          {analysis.representative_comments && analysis.representative_comments.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-4">
                {analysis.comments_section_label || "What people kept saying"}
              </p>
              <div className="space-y-3">
                {analysis.representative_comments.slice(0, 2).map((comment, i) => (
                  <div key={i} className="border-l-2 border-[#FF6B00]/40 pl-4">
                    <p className="text-white/70 text-sm leading-relaxed italic">
                      "{comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Pro Section */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-2">Agreement</p>
                  <p className="text-white/70 text-sm leading-relaxed">{analysis.agreement}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-2">Disagreement</p>
                  <p className="text-white/70 text-sm leading-relaxed">{analysis.disagreement}</p>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3">Non-Obvious Insights</p>
                <ul className="space-y-2 text-white/70 text-sm leading-relaxed">
                  {analysis.non_obvious_insights.map((insight, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-white/20 shrink-0">0{i + 1}</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="absolute inset-0 backdrop-blur-md bg-[#111111]/70 flex flex-col items-center justify-center gap-2 rounded-2xl py-8">
              <span className="text-2xl">🔒</span>
              <p className="text-white font-bold text-base">Dükay Pro</p>
              <p className="text-white/40 text-xs text-center px-10 leading-relaxed max-w-xs">
                Agreement, disagreement, non-obvious insights, comment patterns and Q&A.
              </p>
              <button className="mt-3 bg-[#FF6B00] text-black text-xs font-bold px-5 py-2 rounded-xl hover:opacity-80 transition">
                Unlock Pro
              </button>
            </div>
          </div>

        {/* Feedback */}
          <div className="flex flex-col items-center gap-3 pt-4 pb-2">
            <p className="text-xs text-white/30">Was this analysis useful?</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleFeedback("useful")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition ${
                  feedback === "useful"
                    ? "bg-green-500/20 border-green-500/40 text-green-300"
                    : feedback
                    ? "opacity-30 border-white/10 text-white/30"
                    : "border-white/15 text-white/50 hover:border-white/30 hover:text-white/70"
                }`}
                disabled={!!feedback}
              >
                👍 Useful
              </button>
              <button
                onClick={() => handleFeedback("not_useful")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition ${
                  feedback === "not_useful"
                    ? "bg-red-500/20 border-red-500/40 text-red-300"
                    : feedback
                    ? "opacity-30 border-white/10 text-white/30"
                    : "border-white/15 text-white/50 hover:border-white/30 hover:text-white/70"
                }`}
                disabled={!!feedback}
              >
                👎 Not useful
              </button>
            </div>
            {feedback && (
              <p className="text-xs text-white/30">
                {feedback === "useful" ? "Thanks — glad it helped." : "Thanks — we'll keep improving."}
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}