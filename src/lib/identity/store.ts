import { emptyAnswers, type Answers } from "./types";

// Answers live only in this browser tab (sessionStorage) and vanish when it closes.
const KEY = "offscript.answers.v2";

export function loadAnswers(): Answers | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...emptyAnswers, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}
export function saveAnswers(a: Answers) {
  try { sessionStorage.setItem(KEY, JSON.stringify(a)); } catch { /* ignore */ }
}
export function clearAnswers() {
  try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}

// Fictional sample creator (no real stats).
export const sampleAnswers: Answers = {
  ...emptyAnswers,
  name: "Maya Ren",
  publicName: "Maya Ren",
  niche: "Food",
  subNiche: "Budget home cooking",
  platforms: [{ platform: "Instagram", url: "instagram.com/maya.cooks" }, { platform: "TikTok", url: "tiktok.com/@maya.cooks" }],
  formats: ["Short-form video", "Recipes & tutorials"],
  personality: ["Calm", "Playful"],
  strengths: ["Storytelling", "Clean editing", "Honest reviews"],
  tone: "thoughtful",
  audience: "students and young professionals cooking on a budget",
  services: ["Sponsored Reels / TikToks", "Product reviews", "Recipe development"],
  contact: "hello@example.com",
  goal: "Get my first brand deals",
};
