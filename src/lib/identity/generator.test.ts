import { describe, expect, it } from "vitest";
import { generateIdentity } from "./generator";
import { sampleAnswers } from "./store";

describe("generateIdentity", () => {
  it("never invents audience numbers when none were given", () => {
    const r = generateIdentity({ ...sampleAnswers, audienceSize: "", engagement: "", collaborations: "" }, 3);
    const all = JSON.stringify([r.kit, r.pitch, r.professional, r.social]);
    expect(r.kit?.facts.audienceSize).toBe("");
    expect(all).not.toMatch(/\d+\s?(k|followers|%)/i);
  });

  it("does not invent brand collaborations", () => {
    const r = generateIdentity({ ...sampleAnswers, collaborations: "" }, 5);
    expect(r.pitch?.body).not.toMatch(/previous work/i);
  });

  it("uses the user's own collaboration and stats text verbatim", () => {
    const r = generateIdentity({ ...sampleAnswers, collaborations: "Worked with a local bakery", audienceSize: "12k on TikTok" }, 2);
    expect(r.pitch?.body).toContain("Worked with a local bakery");
    expect(r.kit?.facts.audienceSize).toBe("12k on TikTok");
  });

  it("does not promise brand deals", () => {
    const r = generateIdentity(sampleAnswers, 9);
    expect(JSON.stringify(r)).not.toMatch(/guarantee/i);
  });

  it("returns three bios", () => {
    expect(generateIdentity(sampleAnswers, 1).social.bios).toHaveLength(3);
  });
});
