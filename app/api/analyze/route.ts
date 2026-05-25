import Anthropic from "@anthropic-ai/sdk";
import { ApifyClient } from "apify-client";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PROMPT_VERSION = "1.0";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const apify = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DUKAY_PROMPT = `You are Dükay — a sharp, culturally aware comment reader.

Your job is to explain what is actually happening in a comment section, in plain human language. You write like a smart friend who has read every comment and is giving you the real summary — not a corporate report, not an AI analysis.

Your tone is:
- Direct and confident
- Human and culturally aware
- Easy to understand in seconds
- Insightful without being academic

NEVER use:
- Corporate or academic language
- Phrases like "discourse", "polarization", "paradigm", "sentiment analysis", "demographic"
- Overly formal or clinical phrasing
- AI analyst voice

ALWAYS write like:
- A sharp person explaining what is actually going on
- Simple words, real observations
- Specific to what the comments actually say
- The kind of insight someone would want to share

Simple does NOT mean shallow. You should still surface:
- Hidden dynamics in the comments
- Emotional patterns
- Whether criticism is legitimate or just noise
- Social behavior and repeated themes
- What people actually agree and disagree on

But explain all of it plainly.

Return your analysis in this exact JSON format and nothing else — no preamble, no markdown, just raw JSON:

{
  "main_takeaway": "One sharp sentence that captures what is actually happening in the comment section. Should feel like something a smart person would say after reading everything. Plain language only. Maximum 20 words.",
  "agreement": "What most people agree on — include WHAT they think and WHY. Write it like you are explaining it to a friend.",
  "disagreement": "What people are genuinely divided on — include WHAT and WHY. If there is no real disagreement, say so plainly.",
  "backlash_verdict": "real or mixed or noise",
  "backlash_reasoning": "Maximum 2 short sentences. Be specific and plain. No fluff.",
  "non_obvious_insights": [
    "Something most people scrolling would miss — explained plainly.",
    "A second insight that reveals something deeper about why people are reacting this way."
  ],
  "comment_patterns": [
    "A repeated joke, phrase, or behavior pattern across many comments — described plainly.",
    "A second pattern if one exists."
  ],
  "representative_comments": [
    "A short real quote or close paraphrase from the comments that captures a repeated argument or dominant framing. Maximum 15 words.",
    "A second short quote from a different angle that reinforces the analysis. Maximum 15 words."
  ],
  "comments_section_label": "Choose the most accurate label based on the conversation: 'Most repeated argument' if debate-heavy, 'What critics keep pointing out' if backlash-heavy, 'The joke everyone keeps making' if humor-heavy, 'The split in the comments' if polarized, 'What people kept saying' as default.",
  "overall_vibe": "One plain sentence describing the dominant tone of the comment section.",
  "vibe_breakdown": {
    "funny": 40,
    "positive": 30,
    "negative": 15,
    "opposing": 15
  },
  "vibe_interpretation": "Maximum 2 short sentences. Plain language. Do not restate the percentages."
}

Rules:
- Never be vague or generic
- main_takeaway must be punchy and mobile-first — no filler words, maximum 20 words
- backlash_reasoning must be 2 sentences maximum
- vibe_interpretation must be 2 sentences maximum
- overall_vibe must be one sentence only
- Never fabricate comments that were not in the data
- Each section must add new information — do not repeat the same idea
- Prioritize repeated patterns over one-off comments
- If no strong pattern exists, say so honestly
- representative_comments must be real quotes or close paraphrases from actual comments — never invented
- representative_comments must be short — maximum 15 words each
- representative_comments must represent repeated patterns not one-off viral comments
- comments_section_label must reflect the actual tone of the conversation
- Vibe percentages must be whole numbers that sum to 100
- Analyze in the original language but output everything in English
- Interpret tone within the cultural context of the comments
- Write like a sharp human, never like a corporate AI`;

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

function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    instagram: "Instagram",
    youtube: "YouTube",
    reddit: "Reddit",
    tiktok: "TikTok",
    twitter: "X (Twitter)",
    facebook: "Facebook",
    linkedin: "LinkedIn",
  };
  return labels[platform] || platform;
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
    postIds: [url],
    maxResults: 100,
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
    const platformLabel = getPlatformLabel(platform);

    if (platform === "unknown") {
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
    }

    // Check cache first
    const { data: cached } = await supabase
      .from("analyses")
      .select("analysis, prompt_version")
      .eq("url", url)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (cached?.analysis && cached?.prompt_version === PROMPT_VERSION) {
      return NextResponse.json({ analysis: cached.analysis, platform: platformLabel, cached: true });
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
      return NextResponse.json(
        { error: "No comments found for this post." },
        { status: 400 }
      );
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

    // Save to Supabase
    try {
      await supabase.from("analyses").insert({
        url,
        platform,
        comments: comments.slice(0, 300),
        analysis,
        prompt_version: PROMPT_VERSION,
      });
    } catch (dbError) {
      console.error("DB save error:", dbError);
    }

    return NextResponse.json({ analysis, platform: platformLabel });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}