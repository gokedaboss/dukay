"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [daysUntilReset, setDaysUntilReset] = useState<number | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const isLight = theme === "light";
  const bg = isLight ? "#f5f4f2" : "#111111";
  const navBg = isLight ? "rgba(245,244,242,0.92)" : "rgba(17,17,17,0.9)";
  const cardBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)";
  const cardBorder = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const rowBorder = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)";
  const bodyText = isLight ? "#1a1a1a" : "#ffffff";
  const mutedText = isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  const labelColor = isLight ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)";
  const accent = "#FF6B00";
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  useEffect(() => {
    const saved = localStorage.getItem("dukay_theme") as "dark" | "light" | null;
    setTheme(saved || "dark");
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/pro-status").then((r) => r.json()),
    ]).then(([profile, pro]) => {
      if (profile.error) { router.push("/sign-in"); return; }
      setName(profile.name || "User");
      setEmail(profile.email || "");
      setIsPro(pro.isPro || false);
      if (pro.daysUntilReset !== undefined && pro.daysUntilReset !== null) {
        setDaysUntilReset(Number(pro.daysUntilReset));
      }
    }).catch(() => router.push("/sign-in"))
    .finally(() => setLoading(false));
  }, [router]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("dukay_theme", next);
  };

  const handleUpgrade = async () => {
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const handleSignOut = () => { window.location.href = "/sign-out"; };

  const Row = ({ label, value, onClick, danger, accent: isAccent }: { label: string; value?: string; onClick?: () => void; danger?: boolean; accent?: boolean }) => (
    <button onClick={onClick} style={{ borderBottomColor: rowBorder, color: danger ? "#ef4444" : isAccent ? accent : bodyText }} className="w-full flex items-center justify-between py-4 border-b text-left hover:opacity-70 transition last:border-b-0">
      <span className="text-sm font-medium">{label}</span>
      {value && <span style={{ color: mutedText }} className="text-sm">{value}</span>}
      {!value && <span style={{ color: danger ? "#ef4444" : isAccent ? accent : mutedText }} className="text-sm">→</span>}
    </button>
  );

  if (loading) return (
    <main style={{ backgroundColor: bg, minHeight: "100vh" }} className="flex items-center justify-center">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: `${accent}30`, borderTopColor: accent }} />
    </main>
  );

  return (
    <main style={{ backgroundColor: bg, color: bodyText, minHeight: "100vh" }}>
      {/* Nav */}
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
          <button onClick={toggleTheme} style={{ borderColor: isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)", color: isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)" }} className="w-8 h-8 flex items-center justify-center rounded-lg border transition text-sm">{isLight ? "🌙" : "☀️"}</button>
          <a href="/history" style={{ color: mutedText }} className="text-xs font-semibold hover:opacity-80 transition px-2">History</a>
          <a href="/profile" style={{ backgroundColor: accent, color: "#ffffff" }} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black hover:opacity-80 transition">{initial}</a>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-md mx-auto px-6 pt-28 pb-24">

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div style={{ backgroundColor: accent, color: "#ffffff" }} className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black">{initial}</div>
          <div className="text-center">
            <p style={{ color: bodyText }} className="font-black text-xl">{name}</p>
            <p style={{ color: mutedText }} className="text-sm">{email}</p>
          </div>
          <span style={{ backgroundColor: isPro ? `${accent}18` : "rgba(0,0,0,0.06)", color: isPro ? accent : mutedText, borderColor: isPro ? `${accent}40` : cardBorder }} className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border">
            {isPro ? "Pro" : "Free plan"}
          </span>
        </div>

        {/* Account */}
        <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-2">Account</p>
        <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl px-5 mb-6">
          <Row label="Name" value={name} onClick={() => window.location.href = "/user-profile"} />
          <Row label="Email" value={email} onClick={() => window.location.href = "/user-profile"} />
          <Row label="Password & Security" onClick={() => window.location.href = "/user-profile"} />
        </div>

        {/* Preferences */}
        <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-2">Preferences</p>
        <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl px-5 mb-6">
          <button onClick={toggleTheme} style={{ borderBottomColor: rowBorder, color: bodyText }} className="w-full flex items-center justify-between py-4 border-b text-left hover:opacity-70 transition last:border-b-0">
            <span className="text-sm font-medium">Theme</span>
            <span style={{ color: mutedText }} className="text-sm flex items-center gap-2">{isLight ? "Light" : "Dark"} <span>{isLight ? "🌙" : "☀️"}</span></span>
          </button>
        </div>

        {/* Subscription */}
        <p style={{ color: labelColor }} className="text-[10px] font-semibold tracking-widest uppercase mb-2">Subscription</p>
        <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl px-5 mb-6">
          {isPro ? (
            <div className="py-4">
              <p style={{ color: bodyText }} className="text-sm font-medium">Dükay Pro</p>
              <p style={{ color: mutedText }} className="text-xs mt-0.5">Unlimited analyses · Deep Dive · Unlimited Q&A</p>
            </div>
          ) : (
            <>
              <div className="py-4" style={{ borderBottomColor: rowBorder, borderBottomWidth: 1 }}>
                <p style={{ color: bodyText }} className="text-sm font-medium">Free plan</p>
                <p style={{ color: mutedText }} className="text-xs mt-0.5">3 analyses · Quick Snapshot only</p>
              {daysUntilReset !== null && (<p style={{ color: labelColor }} className="text-xs mt-1">{daysUntilReset === 0 ? "Resets today" : `Resets in ${daysUntilReset} day${daysUntilReset === 1 ? "" : "s"}`}</p>)}
              </div>
              <Row label="Upgrade to Pro" onClick={handleUpgrade} accent />
            </>
          )}
        </div>

        {/* Sign out */}
        <div style={{ backgroundColor: cardBg, borderColor: cardBorder }} className="border rounded-2xl px-5">
          <Row label="Sign out" onClick={handleSignOut} danger />
        </div>

      </div>
    </main>
  );
}