import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ redirect: "/sign-in" });

    const { data, error } = await supabase
      .from("analyses")
      .select("id, url, platform, created_at, analysis")
      .eq("clerk_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ items: data || [] });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json({ items: [] });
  }
}