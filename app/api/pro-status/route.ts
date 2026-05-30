import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ isPro: false, isSignedIn: false });

    const { data: proUser } = await supabase.from("pro_users").select("is_pro").eq("clerk_user_id", userId).single();
    const isPro = proUser?.is_pro === true;

    // Get reset countdown for free users
    let daysUntilReset: number | null = null;
    if (!isPro) {
      const { data: usage } = await supabase.from("user_usage").select("reset_at").eq("clerk_user_id", userId).single();
      if (usage?.reset_at) {
        const resetAt = new Date(usage.reset_at);
        const nextReset = new Date(resetAt.getTime() + 30 * 24 * 60 * 60 * 1000);
        const now = new Date();
        daysUntilReset = Math.max(0, Math.ceil((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }
    }

    return NextResponse.json({ isPro, isSignedIn: true, daysUntilReset });
  } catch (error) {
    console.error("Pro status error:", error);
    return NextResponse.json({ isPro: false, isSignedIn: false });
  }
}