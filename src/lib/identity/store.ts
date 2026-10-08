import { emptyAnswers, type Answers } from "./types";

// Answers live only in this browser tab (sessionStorage) and vanish when it closes.
const KEY = "offscript.answers";

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

export const sampleAnswers: Answers = {
  name: "Maya Ren",
  field: "UX design",
  interests: ["Film photography", "Typography", "Cooking"],
  strengths: ["Visual storytelling", "Listening", "Organising chaos"],
  personality: ["Curious", "Calm", "Playful"],
  tone: "thoughtful",
  goals: ["Land a first design role", "Build a portfolio"],
  experience: "",
};
