import type { Answers, IdentityGenerator, Tone } from "./types";

// Local TEMPLATE generator (not AI). It only recombines what the user typed or picked —
// it never adds follower counts, engagement stats, brand partners, credentials or numbers.

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
  warm: { openers: ["Sharing", "Making", "Here for"], closers: ["Say hi anytime.", "Glad you're here.", "DMs open."], verbs: ["sharing", "making", "talking about"] },
  witty: { openers: ["Professionally distracted by", "Running on", "Currently overthinking"], closers: ["Opinions are mine, typos too.", "No further questions.", "Results may vary."], verbs: ["over-researching", "making too many videos about", "annoying my camera roll with"] },
  bold: { openers: ["All in on", "Built on", "Obsessed with"], closers: ["Making it count.", "No half measures.", "Watch this space."], verbs: ["going deep on", "building around", "chasing"] },
  minimal: { openers: ["", "", ""], closers: ["", "", ""], verbs: ["", "", ""] },
  thoughtful: { openers: ["Thinking out loud about", "Quietly documenting", "Paying attention to"], closers: ["Creating in public.", "Still figuring it out, on purpose.", "Notes from behind the camera."], verbs: ["exploring", "documenting", "unpacking"] },
};

const motifs = ["circle", "arch", "lines", "grid"];

export const generateIdentity: IdentityGenerator = (a, seed) => {
  const r = rng(seed * 9301 + 49297);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(r() * arr.length) % arr.length] as T;
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => r() - 0.5);

  const tone: Tone = (a.tone || "warm") as Tone;
  const bank = toneBank[tone];
  const niche = a.niche.trim() || "content";
  const sub = a.subNiche.trim();
  const topics = [niche, sub].filter(Boolean);
  const formats = shuffle(a.formats);
  const traits = shuffle(a.personality);
  const strengths = shuffle(a.strengths);
  const f1 = formats[0] ?? "content";
  const t1 = traits[0] ?? "honest", t2 = traits[1] ?? traits[0] ?? "relatable";
  const s1 = strengths[0] ?? "storytelling", s2 = strengths[1] ?? strengths[0] ?? "consistency";
  const display = (a.publicName.trim() || a.name.trim());
  const firstName = display.split(" ")[0] ?? "";
  const focus = sub ? `${lower(niche)} (${lower(sub)})` : lower(niche);

  // ---- Social bios
  let bios: string[];
  if (tone === "minimal") {
    bios = [
      `${cap(lower(niche))}${sub ? `. ${cap(lower(sub))}` : ""}. ${cap(lower(t1))}.`,
      `${cap(lower(niche))} · ${lower(f1)} · ${lower(s1)}`,
      `${cap(list(topics))}. ${cap(list(formats.slice(0, 2)))}.`,
    ];
  } else {
    bios = [
      `${pick(bank.openers)} ${list(topics)}. ${cap(lower(t1))}, a little ${lower(t2)}. ${pick(bank.closers)}`,
      `${cap(lower(t1))} creator ${pick(bank.verbs)} ${focus}${formats.length ? ` through ${list(formats.slice(0, 2))}` : ""}. ${pick(bank.closers)}`,
      `${cap(list(topics))} — ${lower(s1)} first. ${pick(bank.closers)}`,
    ];
  }
  bios = bios.map((b) => b.replace(/\s+/g, " ").trim());

  // ---- Usernames
  const slug = (s: string) => lower(s).replace(/[^a-z0-9]+/g, "");
  const first = slug(firstName);
  const nw = slug(niche.split(" ")[0] ?? ""), sw = slug((sub || niche).split(" ")[0] ?? ""), tw = slug(t1);
  const base = first
    ? [`${first}.${nw}`, `${first}creates`, `${nw}by${first}`, `${first}${tw}`, `the${first}${sw}`, `${first}.on.${sw}`]
    : [`${tw}.${nw}`, `${nw}and${sw}`, `${nw}notes`, `the${tw}${sw}`, `${nw}.offscript`, `${sw}studio`];
  const usernames = Array.from(new Set(shuffle(base))).slice(0, 4).map((u) => `@${u.slice(0, 28)}`);

  const tagline = pick([
    `${cap(lower(t1))} ${focus}, made with care.`,
    `${cap(lower(niche))}, told ${lower(t1)}.`,
    `${cap(lower(s1))} for ${lower(niche)} lovers.`,
    `A ${lower(t1)} take on ${lower(sub || niche)}.`,
  ]);

  // ---- Platform bios & headline
  const headline = pick([
    `${cap(lower(niche))} creator${sub ? ` · ${cap(lower(sub))}` : ""} | ${cap(lower(s1))} & ${lower(s2)}`,
    `${cap(lower(niche))} creator making ${list(formats.slice(0, 2)) || "content"} | Open to brand collaborations`,
  ]);
  const about = [
    `${display ? `I'm ${firstName}, a` : "I'm a"} ${lower(niche)} creator${sub ? ` focused on ${lower(sub)}` : ""}.`,
    formats.length ? `I make ${list(formats.slice(0, 3))} with a ${lower(t1)}, ${lower(t2)} feel.` : "",
    `What I bring: ${list(strengths.slice(0, 3)) || "honest, consistent content"}.`,
    a.audience.trim() ? `My content is for ${a.audience.trim().replace(/\.$/, "")}.` : "",
    pick(["Open to thoughtful brand partnerships.", "Always happy to talk collaborations.", "Let's make something good together."]),
  ].filter(Boolean).join(" ");
  const portfolio = [
    pick([`Welcome — this is a snapshot of my work as a ${lower(niche)} creator.`, `This page is part portfolio, part introduction.`]),
    `My content is ${lower(t1)} and ${lower(t2)}, built on ${lower(s1)} and ${lower(s2)}.`,
    a.services.length ? `I work with brands on ${list(a.services.slice(0, 3))}.` : "",
  ].filter(Boolean).join(" ");

  // ---- Media kit (suggested wording + verbatim facts)
  const intro = pick([
    `${display || "This creator"} makes ${list(formats.slice(0, 2)) || "content"} about ${focus}, with a ${lower(t1)} and ${lower(t2)} style.`,
    `${display ? `${display} is a` : "A"} ${lower(t1)} ${lower(niche)} creator${sub ? ` with a focus on ${lower(sub)}` : ""}, known for ${lower(s1)}.`,
  ]);
  const positioning = pick([
    `A ${lower(t1)} voice in ${lower(niche)}${sub ? `, specialising in ${lower(sub)}` : ""}.`,
    `${cap(lower(sub || niche))} content that feels ${lower(t1)}, not scripted.`,
  ]);
  const strengthsLine = strengths.length
    ? `Brands get ${list(strengths.slice(0, 3))}${formats.length ? `, delivered as ${list(formats.slice(0, 2))}` : ""}.`
    : "";

  // ---- Brand pitch draft (no guarantees, no invented numbers)
  const sign = display || "[Your name]";
  const pitchLines = [
    `Hi [Brand name] team,`,
    ``,
    `I'm ${sign}, a ${lower(niche)} creator${sub ? ` focused on ${lower(sub)}` : ""}${a.platforms[0]?.platform ? ` on ${list(a.platforms.map((p) => p.platform).slice(0, 3))}` : ""}. My content is ${lower(t1)} and ${lower(t2)}${formats.length ? `, mostly ${list(formats.slice(0, 2))}` : ""}.`,
    ``,
    `I think there's a natural fit with [Brand name] because [one specific reason you love the brand or product].${a.audience.trim() ? ` My audience is ${a.audience.trim().replace(/\.$/, "")}.` : ""}`,
    ``,
    a.services.length ? `I'd love to explore ${list(a.services.slice(0, 3), "or")} together.` : `I'd love to explore a collaboration that suits you.`,
    a.collaborations.trim() ? `Previous work, in brief: ${a.collaborations.trim().replace(/\.?$/, ".")}` : "",
    ``,
    `Happy to share my media kit and ideas. Thanks for reading!`,
    ``,
    sign + (a.contact.trim() ? `\n${a.contact.trim()}` : ""),
  ];
  const pitch = {
    subject: pick([`Collaboration idea: ${sign} × [Brand name]`, `${cap(lower(niche))} creator — partnership enquiry`]),
    body: pitchLines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n"),
  };

  return {
    social: { bios, usernames, tagline },
    professional: { headline, about: about.replace(/\s+/g, " "), portfolio },
    card: {
      name: display || "Untitled Creator",
      tagline,
      tags: [niche, ...(sub ? [sub] : []), ...formats.slice(0, 1)].map(lower).slice(0, 3),
      motif: pick(motifs),
    },
    kit: {
      intro, positioning, strengthsLine,
      facts: {
        name: display, niche: a.niche.trim(), subNiche: sub, platforms: a.platforms.filter((p) => p.url.trim() || p.platform.trim()),
        formats: a.formats, audience: a.audience.trim(), audienceSize: a.audienceSize.trim(), engagement: a.engagement.trim(),
        collaborations: a.collaborations.trim(), services: a.services, samples: a.samples.filter((s) => s.trim()), contact: a.contact.trim(),
      },
    },
    pitch,
  };
};
