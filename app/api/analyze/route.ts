import Anthropic from "@anthropic-ai/sdk";
import { ApifyClient } from "apify-client";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const PROMPT_VERSION = "1.1";
const FREE_COMMENT_LIMIT = 80;
const PRO_COMMENT_LIMIT = 200;
const FREE_USER_ANALYSIS_LIMIT = 3;
const RESET_DAYS = 30;

const SPAM_PATTERNS = [
  /^[\s\u00a0]*$/,
  /^[\p{Emoji}\s]+$/u,
  /^(.)\1{4,}$/,
  /\b(first|1st)\b/i,
  /who('?s| is) here in 20\d\d/i,
  /follow (me|back|for follow)/i,
  /check (out )?my (channel|page|profile|bio)/i,
  /sub(scribe)? (to )?my/i,
  /\b(dm|message) me\b.{0,30}(deal|offer|invest|profit)/i,
  /\b(bitcoin|crypto|nft|forex|invest(ment)?)\b.{0,60}(profit|return|earn|dm|contact)/i,
  /\b(giveaway|give away)\b.{0,60}(follow|like|comment|enter|win)/i,
  /https?:\/\/\S+/,
  /(#\w+\s*){4,}/,
  /^(lol+|lmao+|haha+|😂+|💀+|🔥+)$/i,
];

const MIN_WORDS = 2;
const seenComments = new Set<string>();

function isLowQuality(comment: string): boolean {
  const trimmed = comment.trim();
  if (trimmed.split(/\s+/).filter(Boolean).length < MIN_WORDS) return true;
  if (SPAM_PATTERNS.some((p) => p.test(trimmed))) return true;
  return false;
}

function filterComments(comments: string[]): string[] {
  seenComments.clear();
  const filtered: string[] = [];
  for (const comment of comments) {
    const trimmed = comment.trim();
    const normalized = trimmed.toLowerCase().replace(/\s+/g, " ");
    if (seenComments.has(normalized)) continue;
    seenComments.add(normalized);
    if (isLowQuality(trimmed)) continue;
    filtered.push(trimmed);
  }
  return filtered;
}

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
  "backstory": "1-2 sentences max. Infer what the original post was probably about based only on what commenters are clearly referencing. Use soft language like 'Commenters appear to be reacting to...' or 'Based on the comments, this seems to be about...'. Never invent details. If nothing clear can be inferred, say so honestly in one sentence.",
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
- Write like a sharp human, never like a corporate AI
- backstory must be 1-2 sentences maximum
- backstory must only reference what commenters clearly mention — never invent post content
- backstory must use soft inferential language, never confident assertions about the original post`;

const PRO_EXTENSION = `

This is a Deep Dive analysis. In addition to the standard JSON fields above, also include these three extra fields in your JSON response:

"confidence_score": "High confidence, Medium confidence, or Low confidence only — never a number or percentage. Follow with one plain sentence explaining why.",
"deep_disagreement": "Go deeper than the standard disagreement field. Map out the two or three distinct camps in the comments — who they are, what they believe, and why they won't agree. Be specific. 3-4 sentences.",
"minority_opinion": "The view held by a small but vocal group that the majority is ignoring or dismissing. Why are they saying it? Is there any merit to it? 2-3 sentences. If no clear minority opinion exists, say so plainly."

These three fields must appear at the end of the JSON object, after vibe_interpretation.`;

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
  const labels: Record<string, string> = { instagram: "Instagram", youtube: "YouTube", reddit: "Reddit", tiktok: "TikTok", twitter: "X (Twitter)", facebook: "Facebook", linkedin: "LinkedIn" };
  return labels[platform] || platform;
}

async function fetchInstagramComments(url: string, limit: number): Promise<string[]> {
  const run = await apify.actor("apify/instagram-comment-scraper").call({ directUrls: [url], resultsLimit: limit, sort: "top" });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items.map((item: Record<string, unknown>) => { const text = item.text || item.comment || item.body; return typeof text === "string" ? text.trim() : null; }).filter((text): text is string => !!text && text.length > 3);
}
async function fetchYouTubeComments(url: string, limit: number): Promise<string[]> {
  const run = await apify.actor("streamers/youtube-comments-scraper").call({ startUrls: [{ url }], maxComments: limit });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items.map((item: Record<string, unknown>) => { const text = item.text || item.comment || item.body; return typeof text === "string" ? text.trim() : null; }).filter((text): text is string => !!text && text.length > 3);
}
async function fetchRedditComments(url: string, limit: number): Promise<string[]> {
  const run = await apify.actor("trudax/reddit-scraper-lite").call({ startUrls: [{ url }], skipComments: false, maxItems: limit, sort: "top" });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items.map((item: Record<string, unknown>) => { const text = item.body || item.text || item.comment; return typeof text === "string" ? text.trim() : null; }).filter((text): text is string => !!text && text.length > 3);
}
async function fetchTikTokComments(url: string, limit: number): Promise<string[]> {
  const run = await apify.actor("clockworks/tiktok-comments-scraper").call({ postURLs: [url], maxComments: limit, sortBy: "likes" });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items.map((item: Record<string, unknown>) => { const text = item.text || item.comment || item.body; return typeof text === "string" ? text.trim() : null; }).filter((text): text is string => !!text && text.length > 3);
}
async function fetchXComments(url: string, limit: number): Promise<string[]> {
  const run = await apify.actor("scraper_one/x-post-replies-scraper").call({ postUrls: [url], resultsLimit: limit });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items.map((item: Record<string, unknown>) => { const text = item.text || item.comment || item.body || item.full_text; return typeof text === "string" ? text.trim() : null; }).filter((text): text is string => !!text && text.length > 3);
}
async function fetchFacebookComments(url: string, limit: number): Promise<string[]> {
  const run = await apify.actor("apify/facebook-comments-scraper").call({ startUrls: [{ url }], maxComments: limit, commentsMode: "RANKED_THREADED" });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items.map((item: Record<string, unknown>) => { const text = item.message || item.text || item.comment || item.body; return typeof text === "string" ? text.trim() : null; }).filter((text): text is string => !!text && text.length > 3);
}
async function fetchLinkedInComments(url: string, limit: number): Promise<string[]> {
  const run = await apify.actor("apimaestro/linkedin-post-comments-replies-engagements-scraper-no-cookies").call({ postIds: [url], maxResults: limit });
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items.map((item: Record<string, unknown>) => { const text = item.text || item.comment || item.body || item.commentText; return typeof text === "string" ? text.trim() : null; }).filter((text): text is string => !!text && text.length > 3);
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 });

    const platform = detectPlatform(url);
    const platformLabel = getPlatformLabel(platform);
    if (platform === "unknown") return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });

    const { userId } = await auth();
    let isPro = false;
    let isSignedIn = false;

    if (userId) {
      isSignedIn = true;
      const { data: proUser } = await supabase.from("pro_users").select("is_pro").eq("clerk_user_id", userId).single();
      isPro = proUser?.is_pro === true;
    }

    // Signed-in free user limit check with 30-day reset
    if (isSignedIn && !isPro) {
      const { data: usage } = await supabase.from("user_usage").select("analysis_count, reset_at").eq("clerk_user_id", userId).single();

      if (usage) {
        const resetAt = new Date(usage.reset_at);
        const now = new Date();
        const daysSinceReset = (now.getTime() - resetAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceReset >= RESET_DAYS) {
          // Reset count and timestamp — allow this analysis through
          await supabase.from("user_usage").update({ analysis_count: 0, reset_at: now.toISOString(), updated_at: now.toISOString() }).eq("clerk_user_id", userId);
        } else if (usage.analysis_count >= FREE_USER_ANALYSIS_LIMIT) {
          return NextResponse.json({ error: "free_limit_reached" }, { status: 403 });
        }
      } else {
        // No usage row yet — create one so future checks work
        await supabase.from("user_usage").insert({ clerk_user_id: userId, analysis_count: 0, reset_at: new Date().toISOString() });
      }
    }

    const { data: cached } = await supabase.from("analyses").select("id, analysis, prompt_version, is_pro").eq("url", url).order("created_at", { ascending: false }).limit(1).single();
    if (cached?.analysis && cached?.prompt_version === PROMPT_VERSION) {
      return NextResponse.json({ analysis: cached.analysis, platform: platformLabel, cached: true, id: cached.id, isPro: cached.is_pro ?? false, isSignedIn });
    }

    const commentLimit = isPro ? PRO_COMMENT_LIMIT : FREE_COMMENT_LIMIT;
    let comments: string[] = [];

    if (platform === "instagram") comments = await fetchInstagramComments(url, commentLimit);
    else if (platform === "youtube") comments = await fetchYouTubeComments(url, commentLimit);
    else if (platform === "reddit") comments = await fetchRedditComments(url, commentLimit);
    else if (platform === "tiktok") comments = await fetchTikTokComments(url, commentLimit);
    else if (platform === "twitter") comments = await fetchXComments(url, commentLimit);
    else if (platform === "facebook") comments = await fetchFacebookComments(url, commentLimit);
    else if (platform === "linkedin") comments = await fetchLinkedInComments(url, commentLimit);

    if (comments.length === 0) return NextResponse.json({ error: "No comments found for this post." }, { status: 400 });

    const filteredComments = filterComments(comments);
    const commentsToAnalyze = filteredComments.length >= 5 ? filteredComments : comments;
    const commentsText = commentsToAnalyze.map((c, i) => `${i + 1}. ${c}`).join("\n");
    const prompt = isPro ? `${DUKAY_PROMPT}${PRO_EXTENSION}\n\nHere are the comments to analyze:\n\n${commentsText}` : `${DUKAY_PROMPT}\n\nHere are the comments to analyze:\n\n${commentsText}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: isPro ? 1800 : 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = responseText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const analysis = JSON.parse(cleaned);

    let analysisId = null;
    try {
      const { data: saved } = await supabase.from("analyses").insert({ url, platform, comments: commentsToAnalyze, analysis, prompt_version: PROMPT_VERSION, is_pro: isPro, clerk_user_id: userId ?? null }).select("id").single();
      analysisId = saved?.id;
    } catch (dbError) { console.error("DB save error:", dbError); }

    // Increment usage for signed-in free users
    if (isSignedIn && !isPro) {
      try {
        const { data: existing } = await supabase.from("user_usage").select("analysis_count").eq("clerk_user_id", userId).single();
        if (existing) {
          await supabase.from("user_usage").update({ analysis_count: existing.analysis_count + 1, updated_at: new Date().toISOString() }).eq("clerk_user_id", userId);
        }
      } catch (usageError) { console.error("Usage tracking error:", usageError); }
    }

    return NextResponse.json({ analysis, platform: platformLabel, id: analysisId, isPro, isSignedIn });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}