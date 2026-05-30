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
  confidence_score?: string;
  deep_disagreement?: string;
  minority_opinion?: string;
};

const supportedPlatforms = [
  "instagram.com","youtube.com","youtu.be","reddit.com","tiktok.com",
  "x.com","twitter.com","facebook.com","linkedin.com",
];

const platformIcons = [
  { label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
  { label: "TikTok", path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
  { label: "YouTube", path: "M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" },
  { label: "X", path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" },
  { label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { label: "Reddit", path: "M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" },
  { label: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
];

const FETCH_MESSAGES = ["Fetching comments…","Loading the comment section…","Pulling in what people said…","Grabbing the conversation…","Reaching into the comments…"];
const ANALYZE_MESSAGES = ["Reading the room…","Figuring out who's actually angry…","Separating jokes from real criticism…","Checking if the backlash is real or just loud…","Finding the signal in the noise…","Looking for what most people missed…","Almost there…"];
const FETCH_STAGE_DURATION = 18000;

const errorMessages: Record<string, string> = {
  unsupported: "This link isn't supported yet. Try Instagram, TikTok, YouTube, X, Facebook, Reddit or LinkedIn.",
  private: "We couldn't read comments from this post. It may be private or restricted.",
  no_comments: "No comments found for this post. It may be too new or have comments disabled.",
  x_restricted: "X restricts comment access on most posts. Try Instagram, YouTube or Reddit for best results.",
  timeout: "This took too long. The post may have too many restrictions. Try another link.",
  default: "Something went wrong analyzing this post. Please try again.",
};

const ANON_COUNT_KEY = "dukay_anon_count";
const ANON_LIMIT = 2;

function isSupportedUrl(input: string) {
  try {
    const url = new URL(input);
    return supportedPlatforms.some((domain) => url.hostname.includes(domain));
  } catch { return false; }
}

function SignupGatePopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f0f0f] border border-white/15 rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-5">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition text-lg leading-none" aria-label="Close">✕</button>
        <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 flex items-center justify-center text-2xl">🔒</div>
        <div>
          <p className="text-white font-black text-xl mb-2">You've used your 2 free analyses</p>
          <p className="text-white/50 text-sm leading-relaxed">Create a free account to get <span className="text-white font-semibold">1 more analysis</span> — no credit card needed.</p>
        </div>
        <a href="/sign-up" className="w-full bg-[#FF6B00] text-white text-sm font-black py-3 rounded-xl hover:opacity-90 transition text-center block">Sign up free</a>
        <p className="text-white/30 text-xs">Already have an account?{" "}<a href="/sign-in" className="text-white/60 hover:text-white transition underline underline-offset-2">Sign in</a></p>
      </div>
    </div>
  );
}

function ProGatePopup({ onClose }: { onClose: () => void }) {
  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f0f0f] border border-[#FF6B00]/20 rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-5">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition text-lg leading-none" aria-label="Close">✕</button>
        <div className="w-12 h-12 rounded-full bg-[#FF6B00]/10 border border-[#FF6B00]/30 flex items-center justify-center text-2xl">⚡</div>
        <div>
          <p className="text-white font-black text-xl mb-2">You've used all 3 free analyses</p>
          <p className="text-white/50 text-sm leading-relaxed">Upgrade to Pro for <span className="text-white font-semibold">unlimited analyses</span>, Deep Dive breakdowns, and unlimited Q&A.</p>
        </div>
        <div className="w-full space-y-2">
          <button onClick={handleUpgrade} className="w-full bg-[#FF6B00] text-white text-sm font-black py-3 rounded-xl hover:opacity-90 transition">Get Pro — $9/mo</button>
          <p className="text-white/20 text-xs">Cancel anytime</p>
        </div>
        <div className="w-full border-t border-white/10 pt-4 space-y-2 text-left">
          {["Unlimited analyses","Deep Dive analysis","Unlimited Q&A per analysis","Saved history"].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <span className="text-[#FF6B00] text-xs">✓</span>
              <span className="text-white/60 text-xs">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QAPanel({ analysisId, isPro, isLight }: { analysisId: string; isPro: boolean; isLight: boolean }) {
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaAnswer, setQaAnswer] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState("");
  const [qaUsed, setQaUsed] = useState(false);

  const presetQuestions = ["Why are people mad?","What's the strongest defense?","What joke keeps repeating?"];

  const getSessionId = () => {
    let sessionId = localStorage.getItem("dukay_session");
    if (!sessionId) { sessionId = crypto.randomUUID(); localStorage.setItem("dukay_session", sessionId); }
    return sessionId;
  };

  const handleQa = async (question: string) => {
    if (!analysisId || qaLoading) return;
    setQaLoading(true); setQaError(""); setQaAnswer(""); setQaQuestion(question);
    try {
      const res = await fetch("/api/qa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ analysisId, question, sessionId: getSessionId() }) });
      const data = await res.json();
      if (data.error === "free_limit_reached") { setQaError("free_limit_reached"); }
      else if (data.error) { setQaError("Couldn't get an answer. Try again."); }
      else { setQaAnswer(data.answer); setQaUsed(true); }
    } catch { setQaError("Something went wrong."); }
    finally { setQaLoading(false); }
  };

  const handleUnlockPro = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) { window.location.href = data.url; }
    else if (data.error === "Not signed in") { localStorage.setItem("dukay_pending_checkout", "true"); window.location.href = "/sign-in"; }
  };

  // Light mode style helpers
  const cardBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)";
  const cardBorder = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const labelColor = isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
  const inputBg = isLight ? "#e5e3e0" : "rgba(255,255,255,0.05)";
  const inputBorder = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)";
  const inputText = isLight ? "#1a1a1a" : "#ffffff";
  const mutedText = isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  const accent = "#FF6B00";

  return (
    <div style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }} className="rounded-2xl p-6 space-y-5">
      <div>
        <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-1">Ask the comments</p>
        <p style={{ color: labelColor }} className="text-xs">Ask anything about what people are really saying.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {presetQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleQa(q)}
            disabled={qaLoading}
            style={{
              borderColor: qaQuestion === q && (qaLoading || !!qaAnswer) ? `${accent}80` : inputBorder,
              color: qaQuestion === q && (qaLoading || !!qaAnswer) ? accent : mutedText,
              backgroundColor: qaQuestion === q && (qaLoading || !!qaAnswer) ? `${accent}18` : "transparent",
            }}
            className="text-xs px-3 py-1.5 rounded-xl border font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {qaError !== "free_limit_reached" && (
        <div className="relative">
          <input
            type="text"
            value={qaQuestion}
            onChange={(e) => setQaQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && qaQuestion.trim()) handleQa(qaQuestion.trim()); }}
            placeholder="Or ask your own question…"
            style={{ backgroundColor: inputBg, borderColor: inputBorder, color: inputText }}
            className="w-full rounded-xl px-4 py-3 text-sm border outline-none pr-20 transition placeholder:opacity-40"
          />
          <button
            onClick={() => qaQuestion.trim() && handleQa(qaQuestion.trim())}
            disabled={!qaQuestion.trim() || qaLoading}
            style={{ backgroundColor: accent, color: "#ffffff" }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-80 disabled:opacity-40 transition"
          >
            Ask
          </button>
        </div>
      )}

      {qaLoading && (
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: `${accent}30`, borderTopColor: accent }} />
          <p style={{ color: labelColor }} className="text-xs">Reading the comments…</p>
        </div>
      )}

      {qaAnswer && (
        <div style={{ borderLeftColor: `${accent}60` }} className="border-l-2 pl-4">
          <p style={{ color: isLight ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)" }} className="text-sm leading-relaxed">{qaAnswer}</p>
        </div>
      )}

      {!isPro && (qaUsed || qaError === "free_limit_reached") && (
        <div style={{ borderColor: cardBorder }} className="border rounded-xl p-4 flex flex-col items-center gap-2 text-center">
          <p style={{ color: isLight ? "#1a1a1a" : "#ffffff" }} className="font-bold text-sm mb-0.5">Want the full picture?</p>
          <p style={{ color: mutedText }} className="text-xs leading-relaxed">Deep Dive analyzes broader patterns, reply chains, and lets you ask unlimited questions.</p>
          <button onClick={handleUnlockPro} style={{ backgroundColor: accent, color: "#ffffff" }} className="text-xs font-bold px-5 py-2 rounded-xl hover:opacity-80 transition">Get the Deep Dive</button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isPro, setIsPro] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStage, setLoadingStage] = useState<"fetch" | "analyze">("fetch");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [platform, setPlatform] = useState("");
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<"useful" | "not_useful" | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSignupGate, setShowSignupGate] = useState(false);
  const [showProGate, setShowProGate] = useState(false);
  const [name, setName] = useState("");
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLight = theme === "light";

  // Reusable style tokens based on theme
  const cardBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)";
  const cardBorder = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const labelColor = isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
  const bodyText = isLight ? "#1a1a1a" : "#ffffff";
  const mutedText = isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  const accent = "#FF6B00";

  useEffect(() => { return () => { if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current); }; }, []);

  useEffect(() => {
    fetch("/api/pro-status").then((res) => res.json()).then((data) => { setIsPro(data.isPro ?? false); setIsSignedIn(data.isSignedIn ?? false); if (data.isSignedIn) { fetch("/api/profile").then((r) => r.json()).then((p) => { if (p.name) setName(p.name); }).catch(() => {}); } }).catch(() => { setIsPro(false); setIsSignedIn(false); });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("dukay_theme") as "dark" | "light" | null;
    const initial = saved || "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("dukay_theme", next);
  };

  useEffect(() => {
    const pending = localStorage.getItem("dukay_pending_checkout");
    if (pending) {
      localStorage.removeItem("dukay_pending_checkout");
      fetch("/api/stripe/checkout", { method: "POST" }).then((res) => res.json()).then((data) => { if (data.url) window.location.href = data.url; });
    }
  }, []);

  const startProgressSteps = () => {
    setLoadingStage("fetch");
    let stage: "fetch" | "analyze" = "fetch";
    let index = 0;
    const shuffledFetch = [...FETCH_MESSAGES].sort(() => Math.random() - 0.5);
    const shuffledAnalyze = [...ANALYZE_MESSAGES].sort(() => Math.random() - 0.5);
    const getShuffled = () => stage === "fetch" ? shuffledFetch : shuffledAnalyze;
    setLoadingMessage(shuffledFetch[0]);
    const rotate = () => { index = (index + 1) % getShuffled().length; setLoadingMessage(getShuffled()[index]); stepTimeoutRef.current = setTimeout(rotate, 3000); };
    stepTimeoutRef.current = setTimeout(() => { stage = "analyze"; index = 0; setLoadingStage("analyze"); setLoadingMessage(shuffledAnalyze[0]); stepTimeoutRef.current = setTimeout(rotate, 3000); }, FETCH_STAGE_DURATION);
  };

  const stopProgressSteps = () => { if (stepTimeoutRef.current) { clearTimeout(stepTimeoutRef.current); stepTimeoutRef.current = null; } setLoadingMessage(""); setLoadingStage("fetch"); };

  const checkAnonLimit = (): boolean => {
    const count = parseInt(localStorage.getItem(ANON_COUNT_KEY) || "0", 10);
    if (count >= ANON_LIMIT) { setShowSignupGate(true); return false; }
    return true;
  };

  const incrementAnonCount = () => {
    const count = parseInt(localStorage.getItem(ANON_COUNT_KEY) || "0", 10);
    localStorage.setItem(ANON_COUNT_KEY, String(count + 1));
  };

  const handleAnalyze = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) { setError("Paste a link first."); return; }
    if (!isSupportedUrl(trimmedUrl)) { setError(errorMessages.unsupported); return; }
    if (!isSignedIn && !isPro) { if (!checkAnonLimit()) return; }
    setError(""); setLoading(true); setAnalysis(null); setFeedback(null); setAnalysisId(null); setCopied(false);
    startProgressSteps();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: trimmedUrl }), signal: controller.signal });
      clearTimeout(timeout);
      const data = await response.json();
      if (data.error === "free_limit_reached") { setShowProGate(true); return; }
      if (data.error) {
        const isX = trimmedUrl.includes("x.com") || trimmedUrl.includes("twitter.com");
        if (isX && data.error.includes("No comments")) { setError(errorMessages.x_restricted); }
        else if (data.error.includes("private") || data.error.includes("restricted")) { setError(errorMessages.private); }
        else if (data.error.includes("No comments")) { setError(errorMessages.no_comments); }
        else { setError(errorMessages.default); }
        return;
      }
      if (!isSignedIn && !isPro) incrementAnonCount();
      setAnalysis(data.analysis); setPlatform(data.platform || ""); setAnalysisId(data.id || null);
      if (data.isPro !== undefined) setIsPro(data.isPro);
      if (data.isSignedIn !== undefined) setIsSignedIn(data.isSignedIn);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") { setError(errorMessages.timeout); } else { setError(errorMessages.default); }
    } finally { setLoading(false); stopProgressSteps(); }
  };

  const handleShare = async () => {
    if (!analysisId) return;
    await navigator.clipboard.writeText(`${window.location.origin}/analysis/${analysisId}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (rating: "useful" | "not_useful") => {
    if (feedback) return;
    setFeedback(rating);
    try { await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, platform, rating }) }); } catch {}
  };

  const backlashColor = analysis?.backlash_verdict === "real"
    ? "bg-red-500/20 text-red-300 border-red-500/30"
    : analysis?.backlash_verdict === "mixed"
    ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
    : "bg-green-500/20 text-green-300 border-green-500/30";

  return (
    <main className="min-h-screen font-sans" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}>

      {showSignupGate && <SignupGatePopup onClose={() => setShowSignupGate(false)} />}
      {showProGate && <ProGatePopup onClose={() => setShowProGate(false)} />}

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-4 border-b backdrop-blur-md z-50" style={{ backgroundColor: "var(--nav-bg)", borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center">
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
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} style={{ borderColor: isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)", color: isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)" }} className="w-8 h-8 flex items-center justify-center rounded-lg border transition text-sm" aria-label="Toggle theme">
            {isLight ? "🌙" : "☀️"}
          </button>
          {isSignedIn ? (
            <>
              <a href="/history" style={{ color: mutedText }} className="text-xs font-semibold transition px-2 hover:opacity-80">History</a>
              <a href="/profile" style={{ backgroundColor: accent, color: "#ffffff" }} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black hover:opacity-80 transition">{name ? name.charAt(0).toUpperCase() : "?"}</a>
            </>
          ) : (
            <>
              <a href="/sign-in" style={{ color: mutedText }} className="text-xs font-semibold transition px-2">Sign in</a>
              <span className="text-lg font-black tracking-tight" style={{ color: accent }}>Dükay</span>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-28 pb-16 max-w-5xl mx-auto">
        <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-5">Comment Intelligence</p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-5 max-w-3xl" style={{ color: bodyText }}>
          See what the comments{" "}
          <span style={{ color: mutedText }}>are really saying</span>
        </h1>
        <p style={{ color: mutedText }} className="text-base font-light max-w-lg mx-auto mb-8 leading-relaxed">The comments don't lie. Stop scrolling and find out what they're really saying.</p>

        <div className="relative w-full max-w-2xl mx-auto mb-3">
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze(); }}
            placeholder="Paste a post — we'll read the comments for you..."
            style={{ backgroundColor: isLight ? "#e5e3e0" : "rgba(255,255,255,0.05)", borderColor: isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.25)", color: bodyText }}
            className="w-full rounded-2xl px-4 py-4 text-sm border outline-none pr-28 transition placeholder:opacity-40"
          />
          <button
            onClick={handleAnalyze}
            disabled={!url.trim() || loading}
            style={{ backgroundColor: accent, color: "#ffffff" }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold px-4 py-2 rounded-xl hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {loading ? "..." : "Analyze"}
          </button>
        </div>

        {error && <p className="text-xs text-red-400 mb-3 max-w-sm text-center">{error}</p>}

        <p style={{ color: isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.3)" }} className="text-xs mb-1">• No account needed to start</p>
        <p style={{ color: isLight ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.2)" }} className="text-xs italic mb-8">Designed for real conversations, not dashboards</p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <span style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase">Starting with</span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {platformIcons.map((icon) => (
              <svg key={icon.label} className="w-5 h-5 opacity-40 hover:opacity-80 transition" style={{ fill: isLight ? "#1a1a1a" : "#ffffff" }} viewBox="0 0 24 24" aria-label={icon.label} role="img">
                <path d={icon.path} />
              </svg>
            ))}
          </div>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-16 gap-4">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${accent}30`, borderTopColor: accent }} />
          <p style={{ color: `${accent}80` }} className="text-[10px] font-semibold tracking-widest uppercase">Quick Snapshot</p>
          <p style={{ color: mutedText }} className="text-sm animate-pulse">{loadingMessage}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full transition-all duration-700" style={{ backgroundColor: loadingStage === "fetch" ? accent : `${accent}40` }} />
            <div className="w-1.5 h-1.5 rounded-full transition-all duration-700" style={{ backgroundColor: loadingStage === "analyze" ? accent : (isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)") }} />
          </div>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <section className="max-w-5xl mx-auto px-6 pb-24 space-y-3">

          {platform && (
            <div className="flex items-center gap-2 pb-1">
              <span style={{ color: labelColor, backgroundColor: cardBg, borderColor: cardBorder }} className="text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border">{platform}</span>
              <span style={{ color: labelColor }} className="text-[10px]">·</span>
              <span style={{ color: isPro ? accent : `${accent}99`, backgroundColor: isPro ? `${accent}18` : `${accent}0d`, borderColor: isPro ? `${accent}50` : `${accent}28` }} className="text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full border">
                {isPro ? "Deep Dive" : "Quick Snapshot"}
              </span>
            </div>
          )}

          {analysis.backstory && (
            <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl p-6">
              <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-3">Backstory</p>
              <p style={{ color: isLight ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)" }} className="text-base leading-relaxed">{analysis.backstory}</p>
            </div>
          )}

          <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl p-6">
            <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widests uppercase mb-3">Main Takeaway</p>
            <p style={{ color: bodyText }} className="font-black text-2xl md:text-3xl leading-snug tracking-tight">{analysis.main_takeaway}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl p-5">
              <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widests uppercase mb-3">Backlash</p>
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${backlashColor}`}>{analysis.backlash_verdict.toUpperCase()}</span>
              <p style={{ color: mutedText }} className="text-sm leading-relaxed mt-3">{analysis.backlash_reasoning}</p>
            </div>
            <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl p-5">
              <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widests uppercase mb-3">Overall Vibe</p>
              <p style={{ color: bodyText }} className="font-bold text-base leading-snug">{analysis.overall_vibe}</p>
              <p style={{ color: labelColor }} className="text-xs leading-relaxed mt-2">{analysis.vibe_interpretation}</p>
            </div>
          </div>

          <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl p-5">
            <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widests uppercase mb-4">Breakdown</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {Object.entries(analysis.vibe_breakdown).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span style={{ color: mutedText }} className="text-xs font-bold uppercase w-16 shrink-0">{key}</span>
                  <div style={{ backgroundColor: isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)" }} className="flex-1 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, backgroundColor: accent }} />
                  </div>
                  <span style={{ color: mutedText }} className="text-xs font-bold w-8 text-right">~{value}%</span>
                </div>
              ))}
            </div>
          </div>

          {analysis.representative_comments && analysis.representative_comments.length > 0 && (
            <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl p-5">
              <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widests uppercase mb-4">{analysis.comments_section_label || "What people kept saying"}</p>
              <div className="space-y-3">
                {analysis.representative_comments.slice(0, 2).map((comment, i) => (
                  <div key={i} style={{ borderLeftColor: `${accent}60` }} className="border-l-2 pl-4">
                    <p style={{ color: isLight ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)" }} className="text-sm leading-relaxed italic">"{comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {analysisId && <QAPanel analysisId={analysisId} isPro={isPro} isLight={isLight} />}

          {analysisId && (
            <div className="flex justify-center pt-2">
              <button onClick={handleShare} style={{ borderColor: cardBorder, color: mutedText }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold hover:opacity-80 transition">
                {copied ? "✓ Link copied!" : "Share this analysis"}
              </button>
            </div>
          )}

          <div className="flex flex-col items-center gap-3 pt-2 pb-2">
            <p style={{ color: labelColor }} className="text-xs">Was this analysis useful?</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleFeedback("useful")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition ${feedback === "useful" ? "bg-green-500/20 border-green-500/40 text-green-600" : feedback ? "opacity-30" : ""}`}
                style={!feedback || feedback !== "useful" ? { borderColor: cardBorder, color: mutedText } : {}}
                disabled={!!feedback}
              >👍 Useful</button>
              <button
                onClick={() => handleFeedback("not_useful")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition ${feedback === "not_useful" ? "bg-red-500/20 border-red-500/40 text-red-600" : feedback ? "opacity-30" : ""}`}
                style={!feedback || feedback !== "not_useful" ? { borderColor: cardBorder, color: mutedText } : {}}
                disabled={!!feedback}
              >👎 Not useful</button>
            </div>
            {feedback && <p style={{ color: labelColor }} className="text-xs">{feedback === "useful" ? "Thanks — glad it helped." : "Thanks — we'll keep improving."}</p>}
          </div>

        </section>
      )}
    </main>
  );
}