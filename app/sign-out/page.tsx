"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    signOut().then(() => router.push("/"));
  }, [signOut, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#111111" }}>
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,107,0,0.3)", borderTopColor: "#FF6B00" }} />
    </div>
  );
}