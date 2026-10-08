import type { Answers, IdentityGenerator, Tone } from "./types";

// Local template generator. It ONLY recombines what the user typed or picked —
// it never adds employers, degrees, years, numbers or achievements.

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

const lower = (s: string) => s.trim().toLowerCase();
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function list(items: string[], conj = "and") {
  const a = items.map(lower).filter(Boolean);
  if (a.length <= 1) return a[0] ?? "";
  return `${a.slice(0, -1).join(", ")} ${conj} ${a[a.length - 1]}`;
}

const toneBank: Record<Tone, { openers: string[]; closers: string[]; verbs: string[] }> = {
  warm: {
    openers: ["Mostly", "Happiest when it's", "Here for"],
    closers: ["Say hi anytime.", "Glad you're here.", "Come say hello."],
    verbs: ["sharing", "making room for", "slowly falling for"],
  },
  witty: {
    openers: ["Professionally distracted by", "Running on", "Currently overthinking"],
    closers: ["Opinions are mine, typos too.", "No further questions.", "Results may vary."],
    verbs: ["over-researching", "collecting tabs about", "annoying friends about"],
  },
  bold: {
    openers: ["All in on", "Built on", "Obsessed with"],
    closers: ["Making it count.", "No half measures.", "Watch this space."],
    verbs: ["chasing", "building around", "going deep on"],
  },
  minimal: {
    openers: ["", "", ""],
    closers: ["", "", ""],
    verbs: ["", "", ""],
  },
  thoughtful: {
    openers: ["Thinking out loud about", "Quietly curious about", "Paying attention to"],
    closers: ["Learning in public.", "Still figuring it out, on purpose.", "Notes from the in-between."],
    verbs: ["exploring", "noticing", "writing my way through"],
  },
};

const motifs = ["circle", "arch", "lines", "grid"];

export const generateIdentity: IdentityGenerator = (a, seed) => {
  const r = rng(seed * 9301 + 49297);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(r() * arr.length) % arr.length] as T;
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => r() - 0.5);

  const tone: Tone = (a.tone || "warm") as Tone;
  const bank = toneBank[tone];
  const ints = shuffle(a.interests);
  const traits = shuffle(a.personality);
  const strengths = shuffle(a.strengths);
  const i1 = ints[0] ?? "ideas", i2 = ints[1] ?? ints[0] ?? "people";
  const t1 = traits[0] ?? "curious", t2 = traits[1] ?? traits[0] ?? "thoughtful";
  const s1 = strengths[0] ?? "learning fast", s2 = strengths[1] ?? strengths[0] ?? "listening";

  // ---- Social bios
  let bios: string[];
  if (tone === "minimal") {
    bios = [
      `${cap(lower(i1))}. ${cap(lower(i2))}. ${cap(lower(t1))}.`,
      `${cap(lower(t1))} · ${lower(i1)} · ${lower(s1)}`,
      `${cap(list(ints.slice(0, 3)))}.`,
    ];
  } else {
    bios = [
      `${pick(bank.openers)} ${list(ints.slice(0, 2))}. ${cap(lower(t1))}, a little ${lower(t2)}. ${pick(bank.closers)}`,
      `${cap(lower(t1))} human ${pick(bank.verbs)} ${lower(i1)}${ints[1] ? ` and ${lower(i2)}` : ""}. ${pick(bank.closers)}`,
      `${cap(list(ints.slice(0, 3)))} — that's the whole personality. Good at ${lower(s1)}. ${pick(bank.closers)}`,
    ];
  }
  bios = bios.map((b) => b.replace(/\s+/g, " ").trim());

  // ---- Usernames
  const slug = (s: string) => lower(s).replace(/[^a-z0-9]+/g, "");
  const first = slug(a.name.split(" ")[0] ?? "");
  const iw = slug(i1.split(" ")[0] ?? ""), iw2 = slug(i2.split(" ")[0] ?? ""), tw = slug(t1);
  const base = first
    ? [`${first}.${iw}`, `${first}_offscript`, `${iw}by${first}`, `${first}${tw}`, `the${first}${iw2}`, `${first}.in.${iw2}`]
    : [`${tw}.${iw}`, `${iw}and${iw2}`, `not.${tw}.enough`, `${iw}notes`, `the${tw}${iw2}`, `${iw}.offscript`];
  const usernames = Array.from(new Set(shuffle(base))).slice(0, 4).map((u) => `@${u.slice(0, 28)}`);

  // ---- Tagline
  const taglines = [
    `${cap(lower(t1))} by nature, ${lower(i1)} by choice.`,
    `Where ${lower(i1)} meets ${lower(i2)}.`,
    `${cap(lower(s1))}, with a soft spot for ${lower(i2)}.`,
    `A ${lower(t1)} take on ${lower(i1)}.`,
  ];
  const tagline = pick(taglines);

  // ---- Professional
  const field = a.field.trim();
  const goalBit = a.goals.length ? list(a.goals.slice(0, 2)) : "";
  const headline = field
    ? pick([
        `${cap(field)} | ${cap(lower(s1))} & ${lower(s2)} | Interested in ${lower(i1)}`,
        `${cap(field)} — ${cap(lower(s1))}, ${lower(s2)} and a ${lower(t1)} approach`,
      ])
    : pick([
        `${cap(lower(s1))} · ${cap(lower(s2))} · Curious about ${lower(i1)}`,
        `${cap(lower(t1))} and ${lower(t2)} | Strengths in ${lower(s1)} and ${lower(s2)}`,
      ]);

  const exp = a.experience.trim().replace(/\s+/g, " ");
  const aboutParts = [
    pick([
      `I'm ${a.name.trim() ? a.name.trim().split(" ")[0] + ", " : ""}someone people would describe as ${list(traits.slice(0, 3))}.`,
      `${a.name.trim() ? a.name.trim().split(" ")[0] + " here. " : ""}If I had to sum myself up: ${list(traits.slice(0, 3))}.`,
    ]),
    `My strengths are ${list(strengths.slice(0, 3))}${field ? `, and I'm putting them to work in ${lower(field)}` : ""}.`,
    exp ? `Relevant experience, in my own words: ${exp.replace(/\.?$/, ".")}` : "",
    `Outside of work I spend time on ${list(ints.slice(0, 3))} — it shapes how I think and what I notice.`,
    goalBit ? `Right now I'm focused on ${goalBit}.` : "",
    pick(["I'm always open to a good conversation.", "Feel free to reach out.", "Let's connect."]),
  ];
  const about = aboutParts.filter(Boolean).join(" ");

  const portfolio = [
    pick([
      `Hi — welcome. This is a collection of what I care about and how I work.`,
      `This space is part portfolio, part notebook.`,
    ]),
    `I bring ${lower(s1)} and ${lower(s2)} to everything I make${field ? `, with a focus on ${lower(field)}` : ""}.`,
    `My approach is ${lower(t1)} and ${lower(t2)}, and you'll see threads of ${list(ints.slice(0, 2))} throughout.`,
    goalBit ? `Next up: ${goalBit}.` : "",
  ].filter(Boolean).join(" ");

  return {
    social: { bios, usernames, tagline },
    professional: { headline, about, portfolio },
    card: {
      name: a.name.trim() || "Untitled Self",
      tagline,
      tags: [...ints.slice(0, 2), ...traits.slice(0, 1)].map(lower),
      motif: pick(motifs),
    },
  };
};
