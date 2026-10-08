export type Tone = "warm" | "witty" | "bold" | "minimal" | "thoughtful";

export interface Answers {
  name: string;
  field: string;
  interests: string[];
  strengths: string[];
  personality: string[];
  tone: Tone | "";
  goals: string[];
  experience: string;
}

export interface IdentityResult {
  social: { bios: string[]; usernames: string[]; tagline: string };
  professional: { headline: string; about: string; portfolio: string };
  card: { name: string; tagline: string; tags: string[]; motif: string };
}

export const emptyAnswers: Answers = {
  name: "", field: "", interests: [], strengths: [], personality: [], tone: "", goals: [], experience: "",
};

/** Generator contract — swap the local implementation for a backend/AI one later. */
export type IdentityGenerator = (answers: Answers, seed: number) => IdentityResult;
