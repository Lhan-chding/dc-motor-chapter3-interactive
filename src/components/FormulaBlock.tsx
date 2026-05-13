import katex from "katex";
import { ChevronDown } from "lucide-react";
import { Formula } from "../data/formulas";

type FormulaBlockProps = {
  latex: string;
  title?: string;
  meaning?: string;
  tag?: string;
  symbols?: string[];
};

export function FormulaBlock({ latex, title, meaning, tag, symbols = [] }: FormulaBlockProps) {
  const html = katex.renderToString(latex, {
    throwOnError: false,
    displayMode: true,
    strict: false
  });

  return (
    <article className="formula-block">
      <div className="formula-block__top">
        {title ? <strong>{title}</strong> : null}
        {tag ? <span>{tag}</span> : null}
      </div>
      <div className="formula-block__math" dangerouslySetInnerHTML={{ __html: html }} />
      {meaning ? <p>{meaning}</p> : null}
      {symbols.length > 0 ? (
        <details className="formula-block__details">
          <summary>
            符号表
            <ChevronDown size={16} />
          </summary>
          <ul>
            {symbols.map((symbol) => (
              <li key={symbol}>{symbol}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </article>
  );
}

export function FormulaCard({ formula }: { formula: Formula }) {
  return (
    <div className="formula-strip__card">
      <FormulaBlock
        latex={formula.latex}
        meaning={formula.meaning}
        tag={formula.tag}
        symbols={formula.usedIn.map((id) => `用于 ${id}`)}
      />
      <div className="formula-strip__tags">
        {formula.usedIn.map((id) => (
          <span key={id}>{id}</span>
        ))}
      </div>
    </div>
  );
}
