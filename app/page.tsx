"use client";

import { useState } from "react";

const fakeAnalysis = {
  main_takeaway:
    "The crowd is largely entertained but a vocal minority is pushing back with legitimate points worth understanding.",
  agreement:
    "Most people agree the original post was bold and entertaining. They appreciate the confidence even if they disagree with the take.",
  disagreement:
    "A significant group disputes the core claim — not out of hate but from lived experience that contradicts it directly.",
  backlash_verdict: "mixed",
  backlash_reasoning:
    "The backlash has real substance. Several high-liked comments cite specific counter-examples. It's not just noise — there's a genuine debate happening here.",
  non_obvious_insights: [
    "The people pushing back hardest are not haters — they're people who tried the same thing and got different results.",
    "The humor in the comments is actually a coping mechanism — people are laughing because the topic hits close to home.",
  ],
  comment_patterns: [
    "Multiple commenters are referencing the same counter-example independently — suggesting it's a widely known contradiction.",
    'The phrase "it depends" appears in many forms across the thread — people are resisting the binary framing of the original post.',
  ],
  overall_vibe: "Mostly entertained with pockets of genuine debate",
  vibe_breakdown: {
    funny: "~40%",
    positive: "~30%",
    negative: "~15%",
    opposing: "~15%",
  },
  vibe_interpretation:
    "Humor dominates because the post invited strong reactions. The negative and opposing camps are small but unusually articulate — their comments are getting disproportionate likes.",
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<typeof fakeAnalysis | null>(null);

  const handleAnalyze = () => {
    if (!url.trim()) return;
    setLoading(true);
    setAnalysis(null);
    setTimeout(() => {
      setLoading(false);
      setAnalysis(fakeAnalysis);
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-[#111111] text-white font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-5 py-4 border-b border-white/10 backdrop-blur-md bg-[#111111]/90 z-50">
        <span className="text-lg font-black tracking-tight">Dükay</span>
        <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition">
          Analyze Free
        </button>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center text-center px-5 pt-28 pb-16">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-5">
          Comment Intelligence
        </p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-5 max-w-2xl">
          See what the comments{" "}
          <span className="text-white/40">are really saying</span>
        </h1>
        <p className="text-white/60 text-base font-light max-w-sm md:max-w-md mx-auto mb-8 leading-relaxed">
          Know if the backlash is real, mixed, or just noise. Separate genuine
          opinions from empty outrage — in seconds.
        </p>

        {/* Paste Bar */}
        <div className="relative w-full max-w-lg mx-auto mb-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="Paste a post — we'll read the comments for you..."
            className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-sm text-white placeholder-white/50 outline-none focus:border-white/40 pr-28"
          />
          <button
            onClick={handleAnalyze}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-black text-xs font-bold px-4 py-2 rounded-xl hover:opacity-80 transition"
          >
            {loading ? "..." : "Analyze"}
          </button>
        </div>

        <p className="text-xs text-white/30 mb-1">• No account needed to start</p>
        <p className="text-xs text-white/20 italic mb-8">
          Designed for real conversations, not dashboards
        </p>

        {/* Platform Icons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/40">
            Starting with
          </span>
          <div className="flex items-center gap-4">
            {[
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
            ].map((icon) => (
              <svg
                key={icon.label}
                className="w-5 h-5 fill-white opacity-50 hover:opacity-90 transition"
                viewBox="0 0 24 24"
                aria-label={icon.label}
              >
                <path d={icon.path} />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="max-w-xl mx-auto px-5 pb-20 space-y-4">
          {/* Overall Vibe */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-2">
              Overall Vibe
            </p>
            <p className="text-white font-semibold text-base leading-snug">
              {analysis.overall_vibe}
            </p>
          </div>

          {/* Vibe Breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-4">
              Breakdown
            </p>
            {Object.entries(analysis.vibe_breakdown).map(([key, val]) => (
              <div key={key} className="flex items-center gap-3 mb-3 last:mb-0">
                <span className="text-xs text-white/40 uppercase w-16 shrink-0">
                  {key}
                </span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: val }}
                  />
                </div>
                <span className="text-xs text-white/60 w-8 text-right">
                  {val}
                </span>
              </div>
            ))}
            <p className="text-xs text-white/40 mt-4 leading-relaxed">
              {analysis.vibe_interpretation}
            </p>
          </div>

          {/* Main Takeaway */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-2">
              Main Takeaway
            </p>
            <p className="text-white text-sm leading-relaxed">
              {analysis.main_takeaway}
            </p>
          </div>

          {/* Backlash Verdict */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-2">
              Backlash
            </p>
            <span
              className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${
                analysis.backlash_verdict === "real"
                  ? "bg-red-500/20 text-red-400"
                  : analysis.backlash_verdict === "mixed"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {analysis.backlash_verdict.toUpperCase()}
            </span>
            <p className="text-white/60 text-sm leading-relaxed">
              {analysis.backlash_reasoning}
            </p>
          </div>

          {/* Agreement & Disagreement */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-2">
                Agreement
              </p>
              <p className="text-white/70 text-sm leading-relaxed">
                {analysis.agreement}
              </p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-2">
                Disagreement
              </p>
              <p className="text-white/70 text-sm leading-relaxed">
                {analysis.disagreement}
              </p>
            </div>
          </div>

          {/* Non Obvious Insights */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3">
              Non-Obvious Insights
            </p>
            <ul className="space-y-3">
              {analysis.non_obvious_insights.map((insight, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/70 leading-relaxed">
                  <span className="text-white/30 shrink-0">0{i + 1}</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Comment Patterns */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3">
              Comment Patterns
            </p>
            <ul className="space-y-3">
              {analysis.comment_patterns.map((pattern, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/70 leading-relaxed">
                  <span className="text-white/30 shrink-0">0{i + 1}</span>
                  {pattern}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}