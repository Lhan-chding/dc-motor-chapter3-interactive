import { BookOpen, Presentation } from "lucide-react";

export type StudyMode = "lecture" | "study";

type ModeToggleProps = {
  mode: StudyMode;
  onChange: (mode: StudyMode) => void;
};

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle" aria-label="讲解模式和学习模式切换">
      <button
        className={mode === "lecture" ? "is-active" : ""}
        type="button"
        onClick={() => onChange("lecture")}
        aria-pressed={mode === "lecture"}
        title="讲解模式"
      >
        <Presentation size={18} />
        讲解
      </button>
      <button
        className={mode === "study" ? "is-active" : ""}
        type="button"
        onClick={() => onChange("study")}
        aria-pressed={mode === "study"}
        title="学习模式"
      >
        <BookOpen size={18} />
        学习
      </button>
    </div>
  );
}
