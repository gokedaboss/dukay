import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    return NextResponse.json({
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      email: user.emailAddresses?.[0]?.emailAddress || "",
      imageUrl: user.imageUrl || null,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}