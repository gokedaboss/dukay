import Anthropic from "@anthropic-ai/sdk";
import { ApifyClient } from "apify-client";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const apify = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
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

function detectPlatform(url: string): string {
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("reddit.com")) return "reddit";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("x.com") || url.includes("twitter.com")) return "twitter";
  if (url.includes("facebook.com")) return "facebook";
  if (url.includes("linkedin.com")) return "linkedin";
  return "unknown";
}

async function fetchInstagramComments(url: string): Promise<string[]> {
  const run = await apify.actor("apify/instagram-comment-scraper").call({
    directUrls: [url],
    resultsLimit: 100,
  });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items
    .map((item: Record<string, unknown>) => {
      const text = item.text || item.comment || item.body;
      return typeof text === "string" ? text.trim() : null;
    })
    .filter((text): text is string => !!text && text.length > 3);
}

async function fetchYouTubeComments(url: string): Promise<string[]> {
  const run = await apify.actor("streamers/youtube-comments-scraper").call({
    startUrls: [{ url }],
    maxComments: 100,
  });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items
    .map((item: Record<string, unknown>) => {
      const text = item.text || item.comment || item.body;
      return typeof text === "string" ? text.trim() : null;
    })
    .filter((text): text is string => !!text && text.length > 3);
}

async function fetchRedditComments(url: string): Promise<string[]> {
  const run = await apify.actor("trudax/reddit-scraper-lite").call({
    startUrls: [{ url }],
    skipComments: false,
    maxItems: 100,
  });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items
    .map((item: Record<string, unknown>) => {
      const text = item.body || item.text || item.comment;
      return typeof text === "string" ? text.trim() : null;
    })
    .filter((text): text is string => !!text && text.length > 3);
}

async function fetchTikTokComments(url: string): Promise<string[]> {
  const run = await apify.actor("clockworks/tiktok-comments-scraper").call({
    postURLs: [url],
    maxComments: 100,
  });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items
    .map((item: Record<string, unknown>) => {
      const text = item.text || item.comment || item.body;
      return typeof text === "string" ? text.trim() : null;
    })
    .filter((text): text is string => !!text && text.length > 3);
}

async function fetchXComments(url: string): Promise<string[]> {
  const run = await apify.actor("scraper_one/x-post-replies-scraper").call({
    postUrls: [url],
    resultsLimit: 100,
  });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items
    .map((item: Record<string, unknown>) => {
      const text = item.text || item.comment || item.body || item.full_text;
      return typeof text === "string" ? text.trim() : null;
    })
    .filter((text): text is string => !!text && text.length > 3);
}

async function fetchFacebookComments(url: string): Promise<string[]> {
  const run = await apify.actor("apify/facebook-comments-scraper").call({
    startUrls: [{ url }],
    maxComments: 100,
  });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items
    .map((item: Record<string, unknown>) => {
      const text = item.message || item.text || item.comment || item.body;
      return typeof text === "string" ? text.trim() : null;
    })
    .filter((text): text is string => !!text && text.length > 3);
}

async function fetchLinkedInComments(url: string): Promise<string[]> {
  const run = await apify.actor("apimaestro/linkedin-post-comments-replies-engagements-scraper-no-cookies").call({
    postUrls: [url],
    maxComments: 100,
  });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items
    .map((item: Record<string, unknown>) => {
      const text = item.text || item.comment || item.body || item.commentText;
      return typeof text === "string" ? text.trim() : null;
    })
    .filter((text): text is string => !!text && text.length > 3);
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    const platform = detectPlatform(url);

    if (platform === "unknown") {
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
    }

    let comments: string[] = [];

    if (platform === "instagram") {
      comments = await fetchInstagramComments(url);
    } else if (platform === "youtube") {
      comments = await fetchYouTubeComments(url);
    } else if (platform === "reddit") {
      comments = await fetchRedditComments(url);
    } else if (platform === "tiktok") {
      comments = await fetchTikTokComments(url);
    } else if (platform === "twitter") {
      comments = await fetchXComments(url);
    } else if (platform === "facebook") {
      comments = await fetchFacebookComments(url);
    } else if (platform === "linkedin") {
      comments = await fetchLinkedInComments(url);
    }

    if (comments.length === 0) {
      return NextResponse.json({ error: "No comments found for this post." }, { status: 400 });
    }

    const commentsText = comments
      .slice(0, 300)
      .map((c: string, i: number) => `${i + 1}. ${c}`)
      .join("\n");

    const message = await anthropic.messages.create({
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