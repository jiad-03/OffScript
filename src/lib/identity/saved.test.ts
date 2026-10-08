import { describe, expect, it } from "vitest";
import { createLocalStore, parseStored, SAVED_KEY } from "./saved";
import { generateIdentity } from "./generator";
import { sampleAnswers } from "./store";

function mem(): Storage {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), clear: () => m.clear(), key: () => null, get length() { return m.size; } } as Storage;
}
const result = { ...generateIdentity(sampleAnswers, 1), handle: "@maya" };

describe("saved profiles store", () => {
  it("adds, renames and deletes", () => {
    const s = mem(); const store = createLocalStore(() => s);
    const a = store.add({ name: "  My creative identity ", result, answers: sampleAnswers });
    expect(a.ok && a.value.name).toBe("My creative identity");
    const id = a.ok ? a.value.id : "";
    store.rename(id, "Pro");
    expect(store.get(id)?.name).toBe("Pro");
    store.remove(id);
    expect(store.list()).toEqual({ ok: true, value: [] });
  });
  it("ignores malformed data", () => {
    expect(parseStored("{not json")).toEqual([]);
    expect(parseStored(JSON.stringify({ version: 1, profiles: [{ id: 1 }] }))).toEqual([]);
  });
  it("reports quota errors without throwing", () => {
    const s = mem(); s.setItem = () => { const e = new Error("full"); e.name = "QuotaExceededError"; throw e; };
    const r = createLocalStore(() => s).add({ name: "x", result, answers: null });
    expect(r.ok).toBe(false);
  });
  it("reports unavailable storage", () => {
    expect(createLocalStore(() => null).list().ok).toBe(false);
  });
  it("uses a versioned key", () => {
    const s = mem(); createLocalStore(() => s).add({ name: "x", result, answers: null });
    expect(JSON.parse(s.getItem(SAVED_KEY)!).version).toBe(1);
  });
});
