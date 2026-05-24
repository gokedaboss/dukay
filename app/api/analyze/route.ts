import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DUKAY_PROMPT = `You are Dükay, a comment intelligence engine.

You will be given a set of comments from a social media post. Your job is to analyze them and return a structured insight that tells the user exactly what is happening in this conversation.

Be sharp. Be specific. Do not be generic. Every insight must be grounded in the actual comments — not assumptions.

Return your analysis in this exact JSON format and nothing else — no preamble, no markdown, just raw JSON:

{
  "main_takeaway": "One sharp sentence that captures the dominant mood or narrative of the comment section.",
  "agreement": "What the majority of people clearly agree on — include WHAT they are saying and WHY they are saying it.",
  "disagreement": "What is genuinely being disputed — include WHAT people disagree on and WHY. If there is no real disagreement, say so honestly.",
  "backlash_verdict": "real or mixed or noise",
  "backlash_reasoning": "One or two sentences explaining why the backlash is real, mixed, or just noise.",
  "non_obvious_insights": [
    "First insight a casual scroller would completely miss.",
    "Second insight that reveals something deeper about why people are reacting this way."
  ],
  "comment_patterns": [
    "Describe a repeated joke, phrase, or behavioral trend observed across multiple comments.",
    "Describe a second pattern if one exists."
  ],
  "overall_vibe": "One short sentence describing the dominant tone of the comments.",
  "vibe_breakdown": {
    "funny": 40,
    "positive": 30,
    "negative": 15,
    "opposing": 15
  },
  "vibe_interpretation": "A short explanation of what the breakdown actually means. Do not restate the numbers — interpret them."
}

Rules:
- Never be vague or generic
- Never fabricate comments that were not in the data
- Agreement and disagreement must include both WHAT and WHY
- Each section must introduce new information — do not repeat the same idea
- Identify and prioritize repeated patterns over isolated comments
- If no strong pattern exists, say so clearly
- Vibe percentages must be whole numbers that sum to 100
- Analyze comments in their original language but output insights in English
- Interpret tone within the cultural context of the language used
- Write like a sharp confident human — not a corporate AI`;

export async function POST(request: NextRequest) {
  try {
    const { comments } = await request.json();

    if (!comments || !Array.isArray(comments) || comments.length === 0) {
      return NextResponse.json(
        { error: "No comments provided" },
        { status: 400 }
      );
    }

    const commentsText = comments
      .slice(0, 300)
      .map((c: string, i: number) => `${i + 1}. ${c}`)
      .join("\n");

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `${DUKAY_PROMPT}\n\nHere are the comments to analyze:\n\n${commentsText}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const cleaned = responseText
  .replace(/^```json\s*/i, "")
  .replace(/^```\s*/i, "")
  .replace(/```\s*$/i, "")
  .trim();

const analysis = JSON.parse(cleaned);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}