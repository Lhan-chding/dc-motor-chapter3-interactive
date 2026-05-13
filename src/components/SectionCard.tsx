import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getFormula } from "../data/formulas";
import { SectionData } from "../data/chapter3";

type SectionCardProps = {
  section: SectionData;
};

export function SectionCard({ section }: SectionCardProps) {
  const formula = section.coreFormulas[0] ? getFormula(section.coreFormulas[0]) : null;

  return (
    <article className="section-card">
      <div className="section-card__id">{section.id}</div>
      <h3>{section.title.replace(/^3\.\d+(\.\d+)?\s*/, "")}</h3>
      <p>{section.bigQuestion}</p>
      <div className="section-card__meta">
        {formula ? <span>{formula.tag ?? "公式"}：{formula.latex.replace(/\\/g, "")}</span> : null}
        <span>{section.demo.replace("Demo", "")}</span>
      </div>
      <Link to={section.route} className="enter-button">
        进入
        <ArrowRight size={17} />
      </Link>
    </article>
  );
}
