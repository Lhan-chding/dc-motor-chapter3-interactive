import { formulas } from "../data/formulas";
import { FormulaCard } from "./FormulaBlock";

export function FormulaStrip() {
  return (
    <section className="home-section" aria-labelledby="formula-strip-title">
      <div className="section-heading">
        <p className="eyebrow">Formula Strip</p>
        <h2 id="formula-strip-title">全章核心公式速览</h2>
      </div>
      <div className="formula-strip" tabIndex={0} aria-label="横向滚动公式速览">
        {formulas.map((formula) => (
          <FormulaCard key={formula.id} formula={formula} />
        ))}
      </div>
    </section>
  );
}
