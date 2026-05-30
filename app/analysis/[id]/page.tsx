"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type AnalysisResult = {
  backstory: string;
  main_takeaway: string;
  backlash_verdict: string;
  backlash_reasoning: string;
  overall_vibe: string;
  vibe_breakdown: { funny: number; positive: number; negative: number; opposing: number };
  vibe_interpretation: string;
  representative_comments: string[];
  comments_section_label: string;
  confidence_score?: string;
  deep_disagreement?: string;
  minority_opinion?: string;
};

export default function AnalysisPage() {
  const { id } = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [platform, setPlatform] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [copied, setCopied] = useState(false);

  const isLight = theme === "light";
  const bg = isLight ? "#f5f4f2" : "#111111";
  const navBg = isLight ? "rgba(245,244,242,0.92)" : "rgba(17,17,17,0.9)";
  const cardBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)";
  const cardBorder = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const bodyText = isLight ? "#1a1a1a" : "#ffffff";
  const mutedText = isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  const labelColor = isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
  const accent = "#FF6B00";

  useEffect(() => {
    const saved = localStorage.getItem("dukay_theme") as "dark" | "light" | null;
    setTheme(saved || "dark");
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/analysis/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) { router.push("/"); return; }
        setAnalysis(data.analysis);
        setPlatform(data.platform || "");
        setIsPro(data.is_pro || false);
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const backlashColor = analysis?.backlash_verdict === "real"
    ? "bg-red-500/20 text-red-400 border-red-500/30"
    : analysis?.backlash_verdict === "mixed"
    ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
    : "bg-green-500/20 text-green-400 border-green-500/30";

  if (loading) return (
    <main style={{ backgroundColor: bg, minHeight: "100vh" }} className="flex items-center justify-center">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${accent}30`, borderTopColor: accent }} />
    </main>
  );

  if (!analysis) return null;

  return (
    <main style={{ backgroundColor: bg, color: bodyText, minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{ backgroundColor: navBg, borderColor: cardBorder }} className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-4 border-b backdrop-blur-md z-50">
        <div className="flex items-center">
          <a href="/">
            <svg width="32" height="32" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
              {isLight ? (
                <>
                  <rect width="160" height="160" rx="28" fill="#E8621A"/>
                  <text x="80" y="128" fontFamily="Arial Black, Arial, sans-serif" fontSize="96" fontWeight="700" fill="#1a1a1a" textAnchor="middle">D</text>
                  <circle cx="122" cy="38" r="10" fill="#1a1a1a"/>
                  <circle cx="122" cy="38" r="17" fill="none" stroke="#1a1a1a" strokeWidth="2" opacity="0.5"/>
                  <circle cx="122" cy="38" r="24" fill="none" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.25"/>
                </>
              ) : (
                <>
                  <rect width="160" height="160" rx="28" fill="#1a1a1a"/>
                  <text x="80" y="128" fontFamily="Arial Black, Arial, sans-serif" fontSize="96" fontWeight="700" fill="#E8621A" textAnchor="middle">D</text>
                  <circle cx="122" cy="38" r="10" fill="#E8621A"/>
                  <circle cx="122" cy="38" r="17" fill="none" stroke="#E8621A" strokeWidth="2" opacity="0.5"/>
                  <circle cx="122" cy="38" r="24" fill="none" stroke="#E8621A" strokeWidth="1.5" opacity="0.25"/>
                </>
              )}
            </svg>
          </a>
        </div>
        <span style={{ color: accent }} className="absolute left-1/2 -translate-x-1/2 text-lg font-black tracking-tight">Dükay</span>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} style={{ color: mutedText }} className="text-xs font-semibold hover:opacity-80 transition">← Back</button>
        </div>
      </nav>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-6 pt-28 pb-24 space-y-3">

        {/* Platform + type badge */}
        {platform && (
          <div className="flex items-center gap-2 pb-1">
            <span style={{ color: labelColor, backgroundColor: cardBg, borderColor: cardBorder }} className="text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border">{platform}</span>
            <span style={{ color: labelColor }} className="text-[10px]">·</span>
            <span style={{ color: isPro ? accent : `${accent}99`, backgroundColor: isPro ? `${accent}18` : `${accent}0d`, borderColor: isPro ? `${accent}50` : `${accent}28` }} className="text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border">
              {isPro ? "Deep Dive" : "Quick Snapshot"}
            </span>
          </div>
        )}

        {/* Backstory */}
        {analysis.backstory && (
          <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl p-6">
            <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-3">Backstory</p>
            <p style={{ color: isLight ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)" }} className="text-base leading-relaxed">{analysis.backstory}</p>
          </div>
        )}

        {/* Main Takeaway */}
        <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl p-6">
          <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-3">Main Takeaway</p>
          <p style={{ color: bodyText }} className="font-black text-2xl md:text-3xl leading-snug tracking-tight">{analysis.main_takeaway}</p>
        </div>

        {/* Backlash + Vibe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl p-5">
            <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-3">Backlash</p>
            <span className={`text-xs font-black px-3 py-1 rounded-full border ${backlashColor}`}>{(analysis.backlash_verdict || "noise").toUpperCase()}</span>
            <p style={{ color: mutedText }} className="text-sm leading-relaxed mt-3">{analysis.backlash_reasoning}</p>
          </div>
          <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl p-5">
            <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-3">Overall Vibe</p>
            <p style={{ color: bodyText }} className="font-bold text-base leading-snug">{analysis.overall_vibe}</p>
            <p style={{ color: labelColor }} className="text-xs leading-relaxed mt-2">{analysis.vibe_interpretation}</p>
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl p-5">
          <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-4">Breakdown</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {Object.entries(analysis.vibe_breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <span style={{ color: mutedText }} className="text-xs font-bold uppercase w-16 shrink-0">{key}</span>
                <div style={{ backgroundColor: isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)" }} className="flex-1 h-2.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: accent }} />
                </div>
                <span style={{ color: mutedText }} className="text-xs font-bold w-8 text-right">~{value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Representative Comments */}
        {analysis.representative_comments?.length > 0 && (
          <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl p-5">
            <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-4">{analysis.comments_section_label || "What people kept saying"}</p>
            <div className="space-y-3">
              {analysis.representative_comments.slice(0, 2).map((comment, i) => (
                <div key={i} style={{ borderLeftColor: `${accent}60` }} className="border-l-2 pl-4">
                  <p style={{ color: isLight ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)" }} className="text-sm leading-relaxed italic">"{comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pro Deep Dive */}
        {isPro && analysis.confidence_score && (
          <div style={{ backgroundColor: isLight ? "rgba(255,107,0,0.06)" : "rgba(255,107,0,0.05)", borderColor: `${accent}30` }} className="border rounded-2xl p-5 space-y-4">
            <p style={{ color: `${accent}b0` }} className="text-[10px] font-semibold tracking-widest uppercase">Deep Dive</p>
            <div>
              <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-2">Confidence</p>
              <p style={{ color: isLight ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)" }} className="text-sm leading-relaxed">{analysis.confidence_score}</p>
            </div>
            {analysis.deep_disagreement && (
              <div>
                <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-2">The Real Split</p>
                <p style={{ color: isLight ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)" }} className="text-sm leading-relaxed">{analysis.deep_disagreement}</p>
              </div>
            )}
            {analysis.minority_opinion && (
              <div>
                <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-2">The Minority Take</p>
                <p style={{ color: isLight ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)" }} className="text-sm leading-relaxed">{analysis.minority_opinion}</p>
              </div>
            )}
          </div>
        )}

        {/* Share */}
        <div className="flex justify-center pt-2">
          <button onClick={handleShare} style={{ borderColor: cardBorder, color: mutedText }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold hover:opacity-80 transition">
            {copied ? "✓ Link copied!" : "Share this analysis"}
          </button>
        </div>

      </section>
    </main>
  );
}