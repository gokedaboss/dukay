import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type BacklashVerdict = "real" | "mixed" | "noise";

type AnalysisResult = {
  backstory: string;
  main_takeaway: string;
  backlash_verdict: BacklashVerdict;
  backlash_reasoning: string;
  overall_vibe: string;
  vibe_breakdown: {
    funny: number;
    positive: number;
    negative: number;
    opposing: number;
  };
  vibe_interpretation: string;
  representative_comments: string[];
  comments_section_label: string;
  agreement: string;
  disagreement: string;
  non_obvious_insights: string[];
};

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await supabase
    .from("analyses")
    .select("url, platform, analysis, created_at")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const analysis = data.analysis as AnalysisResult;
  const platform = data.platform as string;

  const platformLabel: Record<string, string> = {
    instagram: "Instagram",
    youtube: "YouTube",
    reddit: "Reddit",
    tiktok: "TikTok",
    twitter: "X (Twitter)",
    facebook: "Facebook",
    linkedin: "LinkedIn",
  };

  const backlashColor =
    analysis.backlash_verdict === "real"
      ? "bg-red-500/20 text-red-300 border-red-500/30"
      : analysis.backlash_verdict === "mixed"
      ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
      : "bg-green-500/20 text-green-300 border-green-500/30";

  return (
    <main className="min-h-screen bg-[#111111] text-white font-sans">
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-md bg-[#111111]/90 z-50">
        <a href="/" className="text-lg font-black tracking-tight text-[#FF6B00]">
          Dükay
        </a>
        <a href="/" className="bg-[#FF6B00] text-black text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition">
          Analyze a post
        </a>
      </nav>

      <section className="max-w-5xl mx-auto px-6 pt-28 pb-24 space-y-3">

        <div className="flex items-center gap-2 pb-1">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/30 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            {platformLabel[platform] || platform}
          </span>
          <span className="text-[10px] text-white/20">Shared analysis</span>
        </div>

        {analysis.backstory && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3">
              Backstory
            </p>
            <p className="text-white/80 text-base leading-relaxed">
              {analysis.backstory}
            </p>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3">
            Main Takeaway
          </p>
          <p className="text-white font-black text-2xl md:text-3xl leading-snug tracking-tight">
            {analysis.main_takeaway}
          </p>
        </div>

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
                    className="h-full bg-[#FF6B00] rounded-full"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-white/50 w-8 text-right">~{value}%</span>
              </div>
            ))}
          </div>
        </div>

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

        <div className="flex flex-col items-center gap-3 pt-6 pb-2">
          <p className="text-xs text-white/30">Want to analyze any post?</p>
          <a href="/" className="bg-[#FF6B00] text-black text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition">
            Try Dükay free →
          </a>
        </div>

      </section>
    </main>
  );
}