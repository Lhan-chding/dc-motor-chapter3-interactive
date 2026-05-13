type MiniConclusionProps = {
  items: string[];
};

export function MiniConclusion({ items }: MiniConclusionProps) {
  return (
    <section className="mini-conclusion" aria-label="核心结论">
      {items.slice(0, 3).map((item, index) => (
        <div key={item} className="mini-conclusion__item">
          <span>{index + 1}</span>
          <strong>{item}</strong>
        </div>
      ))}
    </section>
  );
}
