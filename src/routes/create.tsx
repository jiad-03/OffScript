import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteFrame } from "@/components/SiteFrame";
import { emptyAnswers, type Answers, type Tone } from "@/lib/identity/types";
import { loadAnswers, saveAnswers } from "@/lib/identity/store";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create your identity — OffScript" },
      { name: "description", content: "A short, honest questionnaire about your interests, strengths, personality, tone and goals." },
      { property: "og:title", content: "Create your identity — OffScript" },
      { property: "og:description", content: "Answer a few honest questions to build your social and professional online identity." },
    ],
  }),
  component: Create,
});

type ListKey = "interests" | "strengths" | "personality" | "goals";

const OPTIONS: Record<ListKey, string[]> = {
  interests: ["Music", "Film", "Photography", "Fashion", "Gaming", "Books", "Cooking", "Fitness", "Travel", "Tech", "Art", "Design", "Climate", "Coffee", "Writing", "Football"],
  strengths: ["Communication", "Problem solving", "Creativity", "Listening", "Organising chaos", "Writing", "Visual storytelling", "Research", "Leadership", "Learning fast", "Empathy", "Attention to detail"],
  personality: ["Curious", "Calm", "Playful", "Ambitious", "Introverted", "Outgoing", "Thoughtful", "Direct", "Sensitive", "Spontaneous", "Grounded", "Witty"],
  goals: ["Build a portfolio", "Land a first role", "Switch careers", "Grow a personal brand", "Find collaborators", "Start freelancing", "Make friends online", "Share my work"],
};

const TONES: { v: Tone; label: string; sample: string }[] = [
  { v: "warm", label: "Warm", sample: "Glad you're here." },
  { v: "witty", label: "Witty", sample: "Opinions are mine, typos too." },
  { v: "bold", label: "Bold", sample: "No half measures." },
  { v: "minimal", label: "Minimal", sample: "Film. Type. Calm." },
  { v: "thoughtful", label: "Thoughtful", sample: "Learning in public." },
];

const STEPS = [
  { key: "basics", title: "First, the basics", hint: "Both optional. Leave blank to stay anonymous.", optional: true },
  { key: "interests", title: "What are you into?", hint: "Pick up to five, or add your own.", optional: false },
  { key: "strengths", title: "What are you genuinely good at?", hint: "Things friends or colleagues would agree with.", optional: false },
  { key: "personality", title: "How would people describe you?", hint: "Pick up to four.", optional: false },
  { key: "tone", title: "Pick a voice", hint: "How should your words sound?", optional: false },
  { key: "goals", title: "What are you working toward?", hint: "Pick any that apply.", optional: true },
  { key: "experience", title: "Anything relevant you've done?", hint: "Projects, jobs, clubs, volunteering. We'll use your words exactly — and never add anything you didn't write.", optional: true },
] as const;

const MAX: Record<ListKey, number> = { interests: 5, strengths: 4, personality: 4, goals: 3 };

function Create() {
  const navigate = useNavigate();
  const [a, setA] = useState<Answers>(emptyAnswers);
  const [step, setStep] = useState(0);
  const [custom, setCustom] = useState("");

  useEffect(() => { const saved = loadAnswers(); if (saved) setA(saved); }, []);
  useEffect(() => { setCustom(""); window.scrollTo({ top: 0 }); }, [step]);

  const s = STEPS[step];
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

  const valid =
    s.optional ||
    (isList(s.key) ? a[s.key].length > 0 : s.key === "tone" ? !!a.tone : true);

  const finish = () => { saveAnswers(a); navigate({ to: "/results" }); };
  const next = () => (step === STEPS.length - 1 ? finish() : setStep(step + 1));

  return (
    <SiteFrame>
      <section className="mx-auto max-w-3xl px-5 pt-10 md:pt-16">
        <div className="flex items-center justify-between">
          <span className="kicker text-muted-foreground">Chapter {String(step + 1).padStart(2, "0")} of {String(STEPS.length).padStart(2, "0")}</span>
          {s.optional && <span className="kicker text-wine">Optional</span>}
        </div>
        <div className="mt-3 flex gap-1">
          {STEPS.map((_, i) => <div key={i} className={`h-0.5 flex-1 ${i <= step ? "bg-foreground" : "bg-border"}`} />)}
        </div>

        <h1 className="mt-10 text-5xl leading-tight sm:text-6xl">{s.title}</h1>
        <p className="mt-3 text-muted-foreground">{s.hint}</p>

        <div className="mt-10 min-h-[220px]">
          {s.key === "basics" && (
            <div className="grid gap-8">
              <Field label="Your name (or what you go by)" value={a.name} onChange={(v) => setA({ ...a, name: v.slice(0, 40) })} placeholder="e.g. Maya" />
              <Field label="Field or role you're heading toward" value={a.field} onChange={(v) => setA({ ...a, field: v.slice(0, 50) })} placeholder="e.g. UX design, marketing, nursing" />
            </div>
          )}

          {isList(s.key) && (() => {
            const k = s.key;
            const all = Array.from(new Set([...OPTIONS[k], ...a[k]]));
            return (
              <>
                <div className="flex flex-wrap gap-2">
                  {all.map((o) => (
                    <button key={o} type="button" className="chip" aria-pressed={a[k].includes(o)} onClick={() => toggle(k, o)}>{o}</button>
                  ))}
                </div>
                <form className="mt-6 flex gap-2" onSubmit={(e) => { e.preventDefault(); addCustom(k); }}>
                  <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add your own…" maxLength={40}
                    className="flex-1 border-b border-foreground bg-transparent py-2 outline-none placeholder:text-muted-foreground focus:border-wine" />
                  <button className="btn btn-quiet" disabled={!custom.trim() || a[k].length >= MAX[k]}>Add</button>
                </form>
                <p className="mt-3 text-xs text-muted-foreground">{a[k].length} / {MAX[k]} selected</p>
              </>
            );
          })()}

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

          {s.key === "experience" && (
            <div>
              <textarea value={a.experience} onChange={(e) => setA({ ...a, experience: e.target.value.slice(0, 400) })} rows={5}
                placeholder="e.g. Ran my university's photography society for a year"
                className="w-full rounded-lg border border-border bg-card p-4 outline-none focus:border-foreground" />
              <p className="mt-2 text-right text-xs text-muted-foreground">{a.experience.length}/400</p>
            </div>
          )}
        </div>

        <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
          <button className="btn btn-quiet" onClick={() => setStep(step - 1)} disabled={step === 0}>← Back</button>
          <div className="flex gap-3">
            {s.optional && <button className="kicker text-muted-foreground hover:text-foreground" onClick={next}>Skip</button>}
            <button className="btn btn-primary" onClick={next} disabled={!valid}>
              {step === STEPS.length - 1 ? "Reveal my identity" : "Continue →"}
            </button>
          </div>
        </div>
      </section>
    </SiteFrame>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="kicker text-muted-foreground">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-2 w-full border-b border-foreground bg-transparent py-3 font-display text-3xl outline-none placeholder:text-muted-foreground/50 focus:border-wine" />
    </label>
  );
}
