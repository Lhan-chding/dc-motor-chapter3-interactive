import { ChevronDown } from "lucide-react";

type FoldableNoteProps = {
  title: string;
  children: React.ReactNode;
  variant?: "note" | "mistake" | "formula";
};

export function FoldableNote({ title, children, variant = "note" }: FoldableNoteProps) {
  return (
    <details className={`foldable foldable--${variant}`}>
      <summary>
        <span>{title}</span>
        <ChevronDown size={18} />
      </summary>
      <div className="foldable__body">{children}</div>
    </details>
  );
}
