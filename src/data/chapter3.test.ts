import { describe, expect, it } from "vitest";
import { allSections } from "./chapter3";
import { formulas } from "./formulas";

const formulaIds = new Set(formulas.map((formula) => formula.id));

describe("chapter3 data", () => {
  it("keeps each section concise for lecture layout", () => {
    for (const section of allSections) {
      expect(section.takeaways.length).toBeLessThanOrEqual(3);
      for (const takeaway of section.takeaways) {
        expect(takeaway.length).toBeLessThanOrEqual(24);
      }
      for (const concept of section.briefConcepts) {
        expect(concept.oneLine.length).toBeLessThanOrEqual(40);
      }
    }
  });

  it("uses valid formula references and routes", () => {
    for (const section of allSections) {
      expect(section.route).toBe(`/section/${section.id}`);
      expect(section.coreFormulas.length).toBeGreaterThan(0);
      for (const formulaId of section.coreFormulas) {
        expect(formulaIds.has(formulaId), `${section.id} references ${formulaId}`).toBe(true);
      }
    }
  });
});
