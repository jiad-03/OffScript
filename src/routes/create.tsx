import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteFrame } from "@/components/SiteFrame";
import { emptyAnswers, type Answers, type Tone } from "@/lib/identity/types";
import { loadAnswers, saveAnswers } from "@/lib/identity/store";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Build your creator portfolio — OffScript" },
      { name: "description", content: "Tell us your niche, platforms, content style and what you offer brands. Stats and past collabs are optional." },
      { property: "og:title", content: "Build your creator portfolio — OffScript" },
      { property: "og:description", content: "A short questionnaire that turns into your media kit and brand pitch." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Create,
});

type ListKey = "formats" | "personality" | "strengths" | "services";

const OPTIONS: Record<ListKey, string[]> = {
  formats: ["Short-form video", "Long-form video", "Photos & carousels", "Stories", "Live streams", "Podcasts", "Blog / newsletter", "Recipes & tutorials", "Reviews & unboxings", "UGC"],
  personality: ["Calm", "Playful", "Funny", "Aesthetic", "Educational", "Raw & unfiltered", "Cosy", "High-energy", "Honest", "Polished"],
  strengths: ["Storytelling", "Clean editing", "Honest reviews", "Photography", "On-camera presence", "Scriptwriting", "Community building", "Trend spotting", "Consistency", "Fast turnaround"],
  services: ["Sponsored Reels / TikToks", "Dedicated YouTube video", "Instagram posts", "Stories", "Product reviews", "UGC for brand ads", "Recipe development", "Event appearances", "Affiliate partnerships", "Long-term ambassadorship"],
};
const NICHES = ["Fashion", "Beauty", "Food", "Fitness", "Travel", "Tech", "Gaming", "Lifestyle", "Books", "Music", "Parenting", "Finance", "Home & interiors"];
const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitch", "Pinterest", "X", "LinkedIn", "Substack", "Website"];
const GOALS = ["Get my first brand deals", "Improve my existing media kit", "Respond to a brand enquiry", "Grow into full-time creating"];

const TONES: { v: Tone; label: string; sample: string }[] = [
  { v: "warm", label: "Warm", sample: "Glad you're here." },
  { v: "witty", label: "Witty", sample: "Opinions are mine, typos too." },
  { v: "bold", label: "Bold", sample: "No half measures." },
  { v: "minimal", label: "Minimal", sample: "Food. Budget. Calm." },
  { v: "thoughtful", label: "Thoughtful", sample: "Creating in public." },
];

const STEPS = [
  { key: "basics", title: "Who's the creator?", hint: "Both optional. Your public name is what brands will see.", optional: true },
  { key: "niche", title: "What's your niche?", hint: "Your main niche is needed. A sub-niche helps brands place you.", optional: false },
  { key: "platforms", title: "Where can brands find you?", hint: "Add the platforms you post on, with profile links if you have them.", optional: true },
  { key: "formats", title: "What do you make?", hint: "Pick the content formats you actually post.", optional: false },
  { key: "personality", title: "How does your content feel?", hint: "Pick up to four words for your style.", optional: false },
  { key: "strengths", title: "What are your content strengths?", hint: "What you're genuinely good at as a creator.", optional: false },
  { key: "tone", title: "Pick a voice", hint: "How should your bios and pitch sound?", optional: false },
  { key: "audience", title: "Who watches?", hint: "All optional. Just starting out? Leave the numbers blank — we never fill them in for you.", optional: true },
  { key: "services", title: "What can you offer brands?", hint: "Optional. Pick what you'd be happy to deliver, and note any past collabs.", optional: true },
  { key: "samples", title: "Show your work", hint: "Optional. Links to your best posts, plus how brands should contact you.", optional: true },
  { key: "goal", title: "What's the goal right now?", hint: "Optional. Helps us frame your pitch.", optional: true },
] as const;

const MAX: Record<ListKey, number> = { formats: 5, personality: 4, strengths: 4, services: 6 };
const inputCls = "w-full border-b border-foreground bg-transparent py-2 outline-none placeholder:text-muted-foreground focus:border-wine";

function Create() {
  const navigate = useNavigate();
  const [a, setA] = useState<Answers>(emptyAnswers);
  const [step, setStep] = useState(0);
  const [custom, setCustom] = useState("");

  useEffect(() => { const saved = loadAnswers(); if (saved) setA(saved); }, []);
  useEffect(() => { setCustom(""); window.scrollTo({ top: 0 }); }, [step]);

  const s = STEPS[step] ?? STEPS[0];
  const isList = (k: string): k is ListKey => k in OPTIONS;

  const toggle = (k: ListKey, v: string) => setA((p) => {
    const has = p[k].includes(v);
    if (!has && p[k].length >= MAX[k]) return p;
    return { ...p, [k]: has ? p[k].filter((x) => x !== v) : [...p[k], v] };
  });
  const addCustom = (k: ListKey) => {
    const v = custom.trim().slice(0, 40);
    if (!v || a[k].includes(v)) return;
    toggle(k, v); setCustom("");
  };

  const valid = s.optional || (isList(s.key) ? a[s.key].length > 0 : s.key === "tone" ? !!a.tone : s.key === "niche" ? !!a.niche.trim() : true);
  const finish = () => { saveAnswers(a); navigate({ to: "/results" }); };
  const next = () => (step === STEPS.length - 1 ? finish() : setStep(step + 1));

  const chips = (k: ListKey) => {
    const all = Array.from(new Set([...OPTIONS[k], ...a[k]]));
    return (
      <>
        <div className="flex flex-wrap gap-2">
          {all.map((o) => <button key={o} type="button" className="chip" aria-pressed={a[k].includes(o)} onClick={() => toggle(k, o)}>{o}</button>)}
        </div>
        <form className="mt-6 flex gap-2" onSubmit={(e) => { e.preventDefault(); addCustom(k); }}>
          <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add your own…" maxLength={40} className={`flex-1 ${inputCls}`} />
          <button className="btn btn-quiet" disabled={!custom.trim() || a[k].length >= MAX[k]}>Add</button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">{a[k].length} / {MAX[k]} selected</p>
      </>
    );
  };

  return (
    <SiteFrame>
      <section className="mx-auto max-w-3xl px-5 pt-10 md:pt-16">
        <div className="flex items-center justify-between">
          <span className="kicker text-muted-foreground">Step {String(step + 1).padStart(2, "0")} of {String(STEPS.length).padStart(2, "0")}</span>
          {s.optional ? <span className="kicker text-wine">Optional</span> : <span className="kicker text-muted-foreground">Required</span>}
        </div>
        <div className="mt-3 flex gap-1">
          {STEPS.map((_, i) => <div key={i} className={`h-0.5 flex-1 ${i <= step ? "bg-foreground" : "bg-border"}`} />)}
        </div>

        <h1 className="mt-10 text-5xl leading-tight sm:text-6xl">{s.title}</h1>
        <p className="mt-3 text-muted-foreground">{s.hint}</p>

        <div className="mt-10 min-h-[220px]">
          {s.key === "basics" && (
            <div className="grid gap-8">
              <Field label="Your name" value={a.name} onChange={(v) => setA({ ...a, name: v.slice(0, 40) })} placeholder="e.g. Maya Ren" />
              <Field label="Preferred public / creator name" value={a.publicName} onChange={(v) => setA({ ...a, publicName: v.slice(0, 40) })} placeholder="e.g. Maya Cooks" />
            </div>
          )}

          {s.key === "niche" && (
            <div className="grid gap-8">
              <div>
                <Field label="Main niche" value={a.niche} onChange={(v) => setA({ ...a, niche: v.slice(0, 40) })} placeholder="e.g. Food" />
                <div className="mt-4 flex flex-wrap gap-2">
                  {NICHES.map((n) => <button key={n} type="button" className="chip" aria-pressed={a.niche === n} onClick={() => setA({ ...a, niche: n })}>{n}</button>)}
                </div>
              </div>
              <Field label="Sub-niche (optional)" value={a.subNiche} onChange={(v) => setA({ ...a, subNiche: v.slice(0, 50) })} placeholder="e.g. Budget home cooking" />
            </div>
          )}

          {s.key === "platforms" && (
            <div className="grid gap-4">
              {a.platforms.map((p, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
                  <select value={p.platform} onChange={(e) => setA({ ...a, platforms: a.platforms.map((x, j) => j === i ? { ...x, platform: e.target.value } : x) })}
                    className="rounded-md border border-border bg-background px-3 py-2">
                    {PLATFORMS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <input value={p.url} maxLength={120} placeholder="Profile link or @handle" onChange={(e) => setA({ ...a, platforms: a.platforms.map((x, j) => j === i ? { ...x, url: e.target.value } : x) })} className={`flex-1 ${inputCls}`} />
                  <button type="button" className="kicker self-end text-muted-foreground hover:text-wine sm:self-auto" onClick={() => setA({ ...a, platforms: a.platforms.filter((_, j) => j !== i) })}>Remove</button>
                </div>
              ))}
              {a.platforms.length < 6 && (
                <button type="button" className="btn btn-outline self-start" onClick={() => setA({ ...a, platforms: [...a.platforms, { platform: PLATFORMS[a.platforms.length % PLATFORMS.length] ?? "Instagram", url: "" }] })}>+ Add a platform</button>
              )}
            </div>
          )}

          {isList(s.key) && chips(s.key)}

          {s.key === "services" && (
            <Area label="Previous brand collaborations (optional)" value={a.collaborations} onChange={(v) => setA({ ...a, collaborations: v })}
              placeholder="e.g. Gifted collab with a local coffee roaster. Leave blank if none yet — that's completely fine." />
          )}

          {s.key === "tone" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {TONES.map((t) => (
                <button key={t.v} type="button" onClick={() => setA({ ...a, tone: t.v })} aria-pressed={a.tone === t.v}
                  className={`rounded-lg border p-5 text-left transition ${a.tone === t.v ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}>
                  <span className="kicker">{t.label}</span>
                  <p className="mt-2 font-display text-2xl italic">"{t.sample}"</p>
                </button>
              ))}
            </div>
          )}

          {s.key === "audience" && (
            <div className="grid gap-8">
              <Field small label="Target audience" value={a.audience} onChange={(v) => setA({ ...a, audience: v.slice(0, 120) })} placeholder="e.g. students cooking on a budget" />
              <Field small label="Audience size (your numbers)" value={a.audienceSize} onChange={(v) => setA({ ...a, audienceSize: v.slice(0, 120) })} placeholder="e.g. 4.2k on TikTok, 1.1k on Instagram" />
              <Field small label="Engagement (your numbers)" value={a.engagement} onChange={(v) => setA({ ...a, engagement: v.slice(0, 120) })} placeholder="e.g. avg. 8k views per Reel" />
            </div>
          )}

          {s.key === "samples" && (
            <div className="grid gap-8">
              <div className="grid gap-3">
                <span className="kicker text-muted-foreground">Content sample links</span>
                {[0, 1, 2].map((i) => (
                  <input key={i} value={a.samples[i] ?? ""} maxLength={160} placeholder={`Link ${i + 1}`} className={inputCls}
                    onChange={(e) => { const n = [...a.samples]; n[i] = e.target.value; setA({ ...a, samples: n }); }} />
                ))}
              </div>
              <Field small label="Preferred contact for brands" value={a.contact} onChange={(v) => setA({ ...a, contact: v.slice(0, 100) })} placeholder="e.g. hello@yourname.com or DM on Instagram" />
            </div>
          )}

          {s.key === "goal" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {GOALS.map((g) => (
                <button key={g} type="button" onClick={() => setA({ ...a, goal: a.goal === g ? "" : g })} aria-pressed={a.goal === g}
                  className={`rounded-lg border p-5 text-left font-display text-2xl transition ${a.goal === g ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}>{g}</button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
          <button className="btn btn-quiet" onClick={() => setStep(step - 1)} disabled={step === 0}>← Back</button>
          <div className="flex gap-3">
            {s.optional && <button className="kicker text-muted-foreground hover:text-foreground" onClick={next}>Skip</button>}
            <button className="btn btn-primary" onClick={next} disabled={!valid}>
              {step === STEPS.length - 1 ? "Build my portfolio" : "Continue →"}
            </button>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
}

function Field({ label, value, onChange, placeholder, small }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; small?: boolean }) {
  return (
    <label className="block">
      <span className="kicker text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`mt-2 w-full border-b border-foreground bg-transparent py-3 font-display outline-none placeholder:text-muted-foreground/50 focus:border-wine ${small ? "text-2xl" : "text-3xl"}`} />
    </label>
  );
}

function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="mt-10 block">
      <span className="kicker text-muted-foreground">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value.slice(0, 400))} rows={4} placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-border bg-card p-4 outline-none focus:border-foreground" />
      <p className="mt-2 text-right text-xs text-muted-foreground">{value.length}/400</p>
    </label>
  );
}
