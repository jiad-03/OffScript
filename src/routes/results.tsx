import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteFrame } from "@/components/SiteFrame";
import { IdentityCard } from "@/components/IdentityCard";
import { generateIdentity } from "@/lib/identity/generator";
import { loadAnswers, sampleAnswers } from "@/lib/identity/store";
import { NAME_MAX, savedProfiles, type SavedResult } from "@/lib/identity/saved";
import type { Answers } from "@/lib/identity/types";

export const Route = createFileRoute("/results")({
  validateSearch: (s: Record<string, unknown>): { sample?: boolean; saved?: string } => ({
    ...(s["sample"] === true || s["sample"] === "true" ? { sample: true } : {}),
    ...(typeof s["saved"] === "string" && s["saved"] ? { saved: s["saved"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Your identity — OffScript" },
      { name: "description", content: "Your social bios, usernames, LinkedIn headline, About section and identity card." },
      { property: "og:title", content: "Your identity — OffScript" },
      { property: "og:description", content: "Social and professional identity, written from your own answers." },
    ],
  }),
  component: Results,
});

type Status = "loading" | "empty" | "ready" | "error" | "missing";

function copy(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success("Copied"), () => toast.error("Couldn't copy — select and copy manually."));
}

function Results() {
  const { sample, saved } = Route.useSearch();
  const [answers, setAnswers] = useState<Answers | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [seeds, setSeeds] = useState({ social: 1, pro: 1, card: 1 });
  const [savedResult, setSavedResult] = useState<SavedResult | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [profileName, setProfileName] = useState("My creative identity");
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    setSavedResult(null); setSavedName(null); setSavedKey(null); setSaveOpen(false);
    if (saved) {
      const p = savedProfiles.get(saved);
      if (!p) { setStatus("missing"); return; }
      setSavedResult(p.result); setSavedName(p.name); setAnswers(p.answers);
      setSeeds({ social: 1, pro: 1, card: 1 });
      setStatus("ready"); return;
    }
    const a = sample ? sampleAnswers : loadAnswers();
    if (!a || !a.interests.length) { setStatus("empty"); return; }
    setAnswers(a);
    const base = Math.floor(Math.random() * 1000) + 1;
    setSeeds({ social: base, pro: base + 1, card: base + 2 });
    setStatus("loading");
    const t = setTimeout(() => setStatus("ready"), 700);
    return () => clearTimeout(t);
  }, [sample, saved]);

  const generated = useMemo(() => {
    if (!answers) return null;
    try {
      const social = generateIdentity(answers, seeds.social).social;
      const professional = generateIdentity(answers, seeds.pro).professional;
      const card = generateIdentity(answers, seeds.card);
      return { social, professional, card: card.card, handle: card.social.usernames[0] } as SavedResult;
    } catch { return null; }
  }, [answers, seeds]);

  // A saved profile shows exactly what was saved; regenerating a section swaps in fresh text for that section.
  const result = useMemo<SavedResult | null>(() => {
    if (!savedResult) return generated;
    if (!generated) return savedResult;
    return {
      social: seeds.social === 1 ? savedResult.social : generated.social,
      professional: seeds.pro === 1 ? savedResult.professional : generated.professional,
      card: seeds.card === 1 ? savedResult.card : generated.card,
      handle: seeds.card === 1 ? savedResult.handle : generated.handle,
    };
  }, [savedResult, generated, seeds]);

  const resultKey = result ? JSON.stringify(result) : "";
  const alreadySaved = savedKey === resultKey || (!!savedResult && seeds.social === 1 && seeds.pro === 1 && seeds.card === 1);

  useEffect(() => { if (status === "ready" && !result) setStatus("error"); }, [status, result]);

  const regen = (k: keyof typeof seeds) => setSeeds((s) => ({ ...s, [k]: s[k] + 7 }));

  const saveProfile = () => {
    if (!result || alreadySaved) return;
    const r = savedProfiles.add({ name: profileName, result, answers: sample ? null : answers });
    if (r.ok) { setSavedKey(resultKey); setSaveOpen(false); toast.success(`Saved “${r.value.name}” in this browser`); }
    else toast.error(r.error);
  };

  const saveImage = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
      const link = document.createElement("a");
      link.download = "offscript-identity.png"; link.href = url; link.click();
      toast.success("Card saved");
    } catch { toast.error("Couldn't save the image. Try again."); }
    finally { setSaving(false); }
  };

  const share = async () => {
    if (!result) return;
    const text = `${result.card.name} — ${result.card.tagline}`;
    try {
      if (cardRef.current && navigator.share) {
        const { toBlob } = await import("html-to-image");
        const blob = await toBlob(cardRef.current, { pixelRatio: 3 });
        const file = blob && new File([blob], "offscript-identity.png", { type: "image/png" });
        if (file && navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text }); return; }
        await navigator.share({ text }); return;
      }
      copy(text);
    } catch (e) { if ((e as Error).name !== "AbortError") copy(text); }
  };

  if (status === "missing") return (
    <SiteFrame>
      <section className="mx-auto max-w-xl px-5 pt-24 text-center">
        <p className="kicker text-wine">Not found</p>
        <h1 className="mt-4 text-5xl">This profile isn't saved here.</h1>
        <p className="mt-4 text-muted-foreground">It may have been deleted, or saved in a different browser or device.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/saved" className="btn btn-primary">My saved profiles</Link>
          <Link to="/create" className="btn btn-outline">Create a new one</Link>
        </div>
      </section>
    </SiteFrame>
  );

  if (status === "empty") return (
    <SiteFrame>
      <section className="mx-auto max-w-xl px-5 pt-24 text-center">
        <p className="kicker text-wine">Blank page</p>
        <h1 className="mt-4 text-5xl">Nothing written yet.</h1>
        <p className="mt-4 text-muted-foreground">Answer a few questions and your identity will appear here.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/create" className="btn btn-primary">Start the questionnaire</Link>
          <Link to="/results" search={{ sample: true }} className="btn btn-outline">See a sample</Link>
        </div>
      </section>
    </SiteFrame>
  );

  if (status === "error") return (
    <SiteFrame>
      <section className="mx-auto max-w-xl px-5 pt-24 text-center">
        <h1 className="text-5xl">Something went off script.</h1>
        <p className="mt-4 text-muted-foreground">We couldn't write your results. Your answers are safe — try again.</p>
        <div className="mt-8 flex justify-center gap-3">
          <button className="btn btn-primary" onClick={() => { regen("social"); setStatus("ready"); }}>Try again</button>
          <Link to="/create" className="btn btn-outline">Edit answers</Link>
        </div>
      </section>
    </SiteFrame>
  );

  if (status === "loading" || !result) return (
    <SiteFrame>
      <section className="mx-auto max-w-6xl px-5 pt-16 md:px-10">
        <p className="kicker animate-pulse text-wine">Setting the type…</p>
        <div className="mt-6 h-16 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />)}
        </div>
      </section>
    </SiteFrame>
  );

  return (
    <SiteFrame>
      <section className="mx-auto max-w-6xl px-5 pt-12 md:px-10 md:pt-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="kicker text-wine">{savedName ? `Saved edition · ${savedName}` : sample ? "Sample edition" : "Your edition"}</p>
            <h1 className="mt-4 text-5xl leading-[0.95] sm:text-7xl">{result.card.name ? `${result.card.name.split(" ")[0]}, ` : ""}<span className="italic">off script.</span></h1>
          </div>
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            {alreadySaved
              ? <Link to="/saved" className="btn btn-outline">✓ Saved · View all</Link>
              : <button className="btn btn-primary" onClick={() => setSaveOpen((o) => !o)}>Save profile</button>}
            {saved ? <Link to="/saved" className="btn btn-outline">← Saved profiles</Link> : <Link to="/create" className="btn btn-outline">← Edit answers</Link>}
          </div>
        </div>
        {saveOpen && !alreadySaved && (
          <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }} className="mt-6 rounded-lg border border-border bg-card p-5">
            <label className="kicker text-wine" htmlFor="profile-name">Name this profile</label>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input id="profile-name" autoFocus value={profileName} maxLength={NAME_MAX} onChange={(e) => setProfileName(e.target.value)}
                className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 font-display text-xl" />
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-quiet" onClick={() => setSaveOpen(false)}>Cancel</button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Saved only in this browser on this device — not on our servers and not backed up. Clearing browser data deletes it.</p>
          </form>
        )}
      </section>

      {/* Social */}
      <section className="mx-auto mt-16 max-w-6xl px-5 md:px-10">
        <SectionHead n="I" title="Social identity" onRegen={() => regen("social")} />
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="kicker mb-4 text-muted-foreground">Three bios</p>
            <ol className="divide-y divide-border border-y border-border">
              {result.social.bios.map((b, i) => (
                <li key={i} className="flex gap-4 py-5">
                  <span className="font-display text-2xl italic text-wine">{i + 1}</span>
                  <p className="flex-1 font-display text-2xl leading-snug">{b}</p>
                  <CopyBtn text={b} />
                </li>
              ))}
            </ol>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <p className="kicker mb-3 text-muted-foreground">Username ideas</p>
                <ul className="space-y-2">
                  {result.social.usernames.map((u) => (
                    <li key={u}><button onClick={() => copy(u)} className="text-lg hover:text-wine" title="Copy">{u}</button></li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">Tap to copy. Check availability on each platform.</p>
              </div>
              <div>
                <p className="kicker mb-3 text-muted-foreground">Tagline</p>
                <p className="font-display text-3xl italic leading-tight">{result.social.tagline}</p>
                <div className="mt-3"><CopyBtn text={result.social.tagline} /></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="mx-auto max-w-sm">
              <IdentityCard ref={cardRef} {...result.card} handle={result.handle} />
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button className="btn btn-quiet" onClick={() => copy(`${result.card.name} — ${result.card.tagline}\n${result.card.tags.join(" · ")}`)}>Copy text</button>
                <button className="btn btn-quiet" onClick={share}>Share</button>
                <button className="btn btn-quiet" onClick={saveImage} disabled={saving}>{saving ? "Saving…" : "Save image"}</button>
                <button className="btn btn-quiet" onClick={() => regen("card")}>New style</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional */}
      <section className="mx-auto mt-24 max-w-6xl px-5 md:px-10">
        <SectionHead n="II" title="Professional identity" onRegen={() => regen("pro")} />
        <div className="grid gap-6 md:grid-cols-2">
          <ProCard label="LinkedIn headline" text={result.professional.headline} big className="md:col-span-2" />
          <ProCard label="About section" text={result.professional.about} />
          <ProCard label="Portfolio introduction" text={result.professional.portfolio} />
        </div>
        <p className="mt-6 text-xs text-muted-foreground">Written only from your answers — no invented jobs, qualifications or achievements. Read it through and make it yours.</p>
      </section>
    </SiteFrame>
  );
}

function SectionHead({ n, title, onRegen }: { n: string; title: string; onRegen: () => void }) {
  return (
    <div className="mb-8 flex items-end justify-between border-b border-foreground pb-3">
      <h2 className="text-3xl sm:text-5xl"><span className="mr-3 italic text-wine">{n}.</span>{title}</h2>
      <button className="btn btn-quiet" onClick={onRegen}>↻ Regenerate</button>
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  return <button className="kicker self-start text-muted-foreground hover:text-wine" onClick={() => copy(text)}>Copy</button>;
}

function ProCard({ label, text, big, className = "" }: { label: string; text: string; big?: boolean; className?: string }) {
  return (
    <article className={`rounded-lg border border-border bg-card p-6 sm:p-8 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="kicker text-wine">{label}</p>
        <CopyBtn text={text} />
      </div>
      <p className={`mt-4 ${big ? "font-display text-3xl leading-snug sm:text-4xl" : "leading-relaxed"}`}>{text}</p>
    </article>
  );
}
