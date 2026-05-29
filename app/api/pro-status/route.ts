import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ isPro: false });
    }

    const { data: proUser } = await supabase
      .from("pro_users")
      .select("is_pro")
      .eq("clerk_user_id", userId)
      .single();

    return NextResponse.json({ isPro: proUser?.is_pro === true });
  } catch (error) {
    console.error("Pro status error:", error);
    return NextResponse.json({ isPro: false });
  }
}