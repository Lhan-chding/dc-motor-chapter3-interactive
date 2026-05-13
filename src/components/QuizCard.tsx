import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Quiz } from "../data/quizzes";
import { FoldableNote } from "./FoldableNote";

type QuizCardProps = {
  quiz: Quiz;
};

export function QuizCard({ quiz }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;

  return (
    <article className="quiz-card">
      <div className="quiz-card__type">{quiz.type}</div>
      <h3>{quiz.prompt}</h3>
      <div className="quiz-card__options">
        {quiz.options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={answered && index === quiz.answer ? "is-correct" : ""}
            onClick={() => setSelected(index)}
          >
            {option}
          </button>
        ))}
      </div>
      {answered ? (
        <div className="quiz-card__answer">
          <CheckCircle2 size={18} />
          <span>{quiz.explanation}</span>
        </div>
      ) : null}
      <FoldableNote title="详细推导" variant="formula">
        <ul className="compact-list">
          {quiz.detail.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </FoldableNote>
    </article>
  );
}
