import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from("analyses")
      .select("id, url, platform, analysis, is_pro, created_at")
      .eq("id", params.id)
      .single();

    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const platformLabels: Record<string, string> = {
      instagram: "Instagram", youtube: "YouTube", reddit: "Reddit",
      tiktok: "TikTok", twitter: "X (Twitter)", facebook: "Facebook", linkedin: "LinkedIn",
    };

    return NextResponse.json({
      analysis: data.analysis,
      platform: platformLabels[data.platform] || data.platform,
      is_pro: data.is_pro,
      created_at: data.created_at,
    });
  } catch (error) {
    console.error("Analysis fetch error:", error);
    return NextResponse.json({ error: "Failed to load analysis" }, { status: 500 });
  }
}