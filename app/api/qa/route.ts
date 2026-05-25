import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { analysisId, question } = await request.json();

    if (!analysisId || !question) {
      return NextResponse.json({ error: "Missing analysisId or question" }, { status: 400 });
    }

    const { data } = await supabase
      .from("analyses")
      .select("analysis, comments")
      .eq("id", analysisId)
      .single();

    if (!data) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const commentsText = (data.comments as string[])
      .slice(0, 150)
      .map((c, i) => `${i + 1}. ${c}`)
      .join("\n");

    const analysisText = JSON.stringify(data.analysis, null, 2);

    const prompt = `You are Dükay — a sharp, culturally aware comment reader.

A user has already seen an analysis of a social media comment section. They are now asking a follow-up question about it.

Your job: answer ONLY based on the stored comments and analysis below. Do not invent, speculate, or go beyond what the data supports. If the data does not support the answer, say so plainly in one sentence.

Tone rules:
- Answer like a smart friend, not an AI analyst
- Short and direct — 2-4 sentences max unless the question genuinely needs more
- Plain language only, no jargon
- Never say "based on the data" or "the analysis shows" — just answer naturally
- If there's nothing to support the answer, say: "The comments don't really get into that."

STORED ANALYSIS:
${analysisText}

SAMPLED COMMENTS:
${commentsText}

USER QUESTION: ${question}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const answer =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Q&A error:", error);
    return NextResponse.json({ error: "Q&A failed. Please try again." }, { status: 500 });
  }
}