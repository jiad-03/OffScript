import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteFrame } from "@/components/SiteFrame";
import { NAME_MAX, savedProfiles, type SavedProfile } from "@/lib/identity/saved";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "My Saved Profiles — OffScript" },
      { name: "description", content: "Reopen, rename or delete the identity profiles saved in this browser." },
      { property: "og:title", content: "My Saved Profiles — OffScript" },
      { property: "og:description", content: "Your saved OffScript identities, kept in this browser only." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SavedPage,
});

export function PrivacyNote() {
  return (
    <p className="text-xs text-muted-foreground">
      Saved profiles are stored only in this browser on this device — not on an OffScript server and not backed up. Clearing your browser data will delete them.
    </p>
  );
}

function SavedPage() {
  const [items, setItems] = useState<SavedProfile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirming, setConfirming] = useState<string | null>(null);

  const refresh = () => {
    const r = savedProfiles.list();
    if (r.ok) { setItems(r.value); setError(null); } else { setItems([]); setError(r.error); }
  };
  useEffect(refresh, []);

  const saveName = (id: string) => {
    const r = savedProfiles.rename(id, draft);
    if (r.ok) toast.success("Renamed"); else toast.error(r.error);
    setEditing(null); refresh();
  };
  const del = (id: string) => {
    const r = savedProfiles.remove(id);
    if (r.ok) toast.success("Profile deleted"); else toast.error(r.error);
    setConfirming(null); refresh();
  };

  return (
    <SiteFrame>
      <section className="mx-auto max-w-4xl px-5 pt-12 md:px-10 md:pt-16">
        <p className="kicker text-wine">The archive</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-5xl leading-[0.95] sm:text-7xl">My saved <span className="italic">profiles.</span></h1>
          <Link to="/create" className="btn btn-primary self-start sm:self-auto">Create a new profile</Link>
        </div>
        <div className="mt-6"><PrivacyNote /></div>

        {error && <p className="mt-8 rounded-lg border border-border bg-card p-4 text-sm">{error}</p>}

        {items && items.length === 0 && !error && (
          <div className="mt-16 border-y border-border py-16 text-center">
            <p className="font-display text-3xl italic">No saved profiles yet.</p>
            <p className="mt-3 text-muted-foreground">Create an identity, then tap “Save profile” on the results page.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/create" className="btn btn-primary">Start the questionnaire</Link>
              <Link to="/results" search={{ sample: true }} className="btn btn-outline">See a sample</Link>
            </div>
          </div>
        )}

        {items && items.length > 0 && (
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {items.map((p) => (
              <li key={p.id} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  {editing === p.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); saveName(p.id); }} className="flex flex-wrap gap-2">
                      <input autoFocus value={draft} maxLength={NAME_MAX} onChange={(e) => setDraft(e.target.value)} aria-label="Profile name"
                        className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 font-display text-xl" />
                      <button type="submit" className="btn btn-primary">Save</button>
                      <button type="button" className="btn btn-quiet" onClick={() => setEditing(null)}>Cancel</button>
                    </form>
                  ) : (
                    <Link to="/results" search={{ saved: p.id }} className="font-display text-2xl hover:text-wine sm:text-3xl">{p.name}</Link>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.result.card.name} · Saved {new Date(p.savedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                {confirming === p.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm">Delete this profile?</span>
                    <button className="btn btn-primary" onClick={() => del(p.id)}>Delete</button>
                    <button className="btn btn-quiet" onClick={() => setConfirming(null)}>Keep</button>
                  </div>
                ) : editing !== p.id && (
                  <div className="flex flex-wrap gap-2">
                    <Link to="/results" search={{ saved: p.id }} className="btn btn-outline">Open</Link>
                    <button className="btn btn-quiet" onClick={() => { setEditing(p.id); setDraft(p.name); }}>Rename</button>
                    <button className="btn btn-quiet" onClick={() => setConfirming(p.id)}>Delete</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </SiteFrame>
  );
}
