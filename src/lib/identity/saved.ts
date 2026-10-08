import type { Answers, IdentityResult } from "./types";

/**
 * Saved profiles live in this browser's localStorage only. Nothing is sent anywhere.
 * The SavedProfilesStore interface lets a cloud-backed store replace this later.
 */
export const SAVED_KEY = "offscript.savedProfiles";
export const SAVED_VERSION = 1;

export type SavedResult = IdentityResult & { handle: string };

export interface SavedProfile {
  id: string;
  name: string;
  savedAt: string; // ISO
  result: SavedResult;
  answers: Answers | null;
}

interface StoredShape { version: number; profiles: SavedProfile[] }

export type StoreOutcome<T = void> = { ok: true; value: T } | { ok: false; error: string };

export interface SavedProfilesStore {
  list(): StoreOutcome<SavedProfile[]>;
  get(id: string): SavedProfile | null;
  add(p: Omit<SavedProfile, "id" | "savedAt">): StoreOutcome<SavedProfile>;
  rename(id: string, name: string): StoreOutcome;
  remove(id: string): StoreOutcome;
}

export const NAME_MAX = 60;

function isProfile(p: unknown): p is SavedProfile {
  const x = p as SavedProfile;
  return !!x && typeof x.id === "string" && typeof x.name === "string" && typeof x.savedAt === "string"
    && !!x.result && Array.isArray(x.result.social?.bios) && typeof x.result.professional?.headline === "string"
    && typeof x.result.card?.name === "string";
}

/** Parse raw storage text; tolerates malformed data and old (bare-array) formats. */
export function parseStored(raw: string | null): SavedProfile[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    const arr = Array.isArray(data) ? data : (data as StoredShape)?.profiles;
    if (!Array.isArray(arr)) return [];
    return arr.filter(isProfile).map((p) => ({ ...p, result: { ...p.result, handle: p.result.handle ?? "" }, answers: p.answers ?? null }));
  } catch {
    return [];
  }
}

export function cleanName(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, NAME_MAX) || "Untitled profile";
}

function storage(): Storage | null {
  try { return typeof window === "undefined" ? null : window.localStorage; } catch { return null; }
}

function errMsg(e: unknown) {
  const n = (e as Error)?.name;
  if (n === "QuotaExceededError" || n === "NS_ERROR_DOM_QUOTA_REACHED") return "Your browser's storage is full. Delete a saved profile and try again.";
  return "Your browser blocked saving (private mode or storage disabled).";
}

export function createLocalStore(getStorage: () => Storage | null = storage): SavedProfilesStore {
  const read = (): StoreOutcome<SavedProfile[]> => {
    const s = getStorage();
    if (!s) return { ok: false, error: "Saving isn't available in this browser." };
    try { return { ok: true, value: parseStored(s.getItem(SAVED_KEY)) }; }
    catch (e) { return { ok: false, error: errMsg(e) }; }
  };
  const write = (profiles: SavedProfile[]): StoreOutcome => {
    const s = getStorage();
    if (!s) return { ok: false, error: "Saving isn't available in this browser." };
    try { s.setItem(SAVED_KEY, JSON.stringify({ version: SAVED_VERSION, profiles } satisfies StoredShape)); return { ok: true, value: undefined }; }
    catch (e) { return { ok: false, error: errMsg(e) }; }
  };
  return {
    list: () => {
      const r = read();
      return r.ok ? { ok: true, value: [...r.value].sort((a, b) => b.savedAt.localeCompare(a.savedAt)) } : r;
    },
    get: (id) => { const r = read(); return r.ok ? r.value.find((p) => p.id === id) ?? null : null; },
    add: (p) => {
      const r = read(); if (!r.ok) return r;
      const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const profile: SavedProfile = { id, savedAt: new Date().toISOString(), name: cleanName(p.name), result: p.result, answers: p.answers };
      const w = write([...r.value, profile]);
      return w.ok ? { ok: true, value: profile } : w;
    },
    rename: (id, name) => {
      const r = read(); if (!r.ok) return r;
      return write(r.value.map((p) => (p.id === id ? { ...p, name: cleanName(name) } : p)));
    },
    remove: (id) => {
      const r = read(); if (!r.ok) return r;
      return write(r.value.filter((p) => p.id !== id));
    },
  };
}

export const savedProfiles: SavedProfilesStore = createLocalStore();
