import { describe, expect, it } from "vitest";
import { generateIdentity } from "./generator";
import { sampleAnswers } from "./store";

describe("generateIdentity", () => {
  it("does not invent experience when none was given", () => {
    const r = generateIdentity({ ...sampleAnswers, experience: "" }, 3);
    expect(r.professional.about).not.toMatch(/experience/i);
    expect(r.professional.about).not.toMatch(/\d/);
  });

  it("includes the user's own experience text when provided", () => {
    const r = generateIdentity({ ...sampleAnswers, experience: "Ran the college film club" }, 3);
    expect(r.professional.about).toContain("Ran the college film club");
  });

  it("returns three bios", () => {
    expect(generateIdentity(sampleAnswers, 1).social.bios).toHaveLength(3);
  });
});
