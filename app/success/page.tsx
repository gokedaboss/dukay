import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-black text-[#FF6B00]">You're Pro now.</h1>
      <p className="text-white/50 text-sm">Unlimited Q&A is unlocked. Go analyze something.</p>
      <Link
        href="/"
        className="bg-[#FF6B00] text-black text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition"
      >
        Back to Dükay
      </Link>
    </main>
  );
}