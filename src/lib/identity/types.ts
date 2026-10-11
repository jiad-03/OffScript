export type Tone = "warm" | "witty" | "bold" | "minimal" | "thoughtful";

export interface PlatformLink { platform: string; url: string }

export interface Answers {
  name: string;          // creator / real name
  publicName: string;    // preferred public name or handle
  niche: string;
  subNiche: string;
  platforms: PlatformLink[];
  formats: string[];     // content formats
  personality: string[]; // content style
  strengths: string[];   // content strengths
  tone: Tone | "";
  audience: string;      // who they reach
  audienceSize: string;  // user's own numbers, verbatim
  engagement: string;    // user's own numbers, verbatim
  collaborations: string; // past brand work, verbatim
  services: string[];
  samples: string[];     // content sample links
  contact: string;
  goal: string;
}

/** Facts copied verbatim from the user's answers — never generated. */
export interface KitFacts {
  name: string;
  niche: string;
  subNiche: string;
  platforms: PlatformLink[];
  formats: string[];
  audience: string;
  audienceSize: string;
  engagement: string;
  collaborations: string;
  services: string[];
  samples: string[];
  contact: string;
}

export interface IdentityResult {
  social: { bios: string[]; usernames: string[]; tagline: string };
  professional: { headline: string; about: string; portfolio: string };
  card: { name: string; tagline: string; tags: string[]; motif: string };
  /** Optional so profiles saved before the creator update still load. */
  kit?: { intro: string; positioning: string; strengthsLine: string; facts: KitFacts };
  pitch?: { subject: string; body: string };
}

export const emptyAnswers: Answers = {
  name: "", publicName: "", niche: "", subNiche: "", platforms: [], formats: [], personality: [], strengths: [],
  tone: "", audience: "", audienceSize: "", engagement: "", collaborations: "", services: [], samples: [], contact: "", goal: "",
};

/** Generator contract — swap the local template implementation for a backend/AI one later. */
export type IdentityGenerator = (answers: Answers, seed: number) => IdentityResult;
