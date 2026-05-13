type ConceptPillProps = {
  children: string;
  tone?: "blue" | "red" | "green" | "amber" | "purple" | "neutral";
};

export function ConceptPill({ children, tone = "neutral" }: ConceptPillProps) {
  return <span className={`concept-pill concept-pill--${tone}`}>{children}</span>;
}
