import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import { Quiz } from "../data/quizzes";
import { FoldableNote } from "./FoldableNote";

type QuizCardProps = {
  quiz: Quiz;
  number: number;
};

export function QuizCard({ quiz, number }: QuizCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const correct = selected === quiz.answer;
  const feedbackId = `${quiz.id}-feedback`;

  return (
    <article className="quiz-sheet-question" aria-labelledby={`${quiz.id}-prompt`}>
      <header className="quiz-sheet-question-header">
        <span className="quiz-sheet-question-number">{number}.</span>
        <span className="quiz-sheet-question-type">{quiz.type}</span>
      </header>
      <h3 id={`${quiz.id}-prompt`}>{quiz.prompt}</h3>
      <div className="quiz-sheet-options" role="group" aria-label={`第 ${number} 题选项`}>
        {quiz.options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrectOption = answered && index === quiz.answer;
          const className = [
            "quiz-sheet-option",
            isSelected && correct ? "quiz-sheet-option-is-correct" : "",
            isSelected && !correct ? "quiz-sheet-option-is-incorrect" : "",
            isCorrectOption && !isSelected ? "quiz-sheet-option-is-answer" : ""
          ].filter(Boolean).join(" ");

          return (
            <button
              key={option}
              type="button"
              className={className}
              aria-pressed={isSelected}
              aria-describedby={answered ? feedbackId : undefined}
              disabled={answered}
              onClick={() => setSelected(index)}
            >
              <span className="quiz-sheet-option-letter">{String.fromCharCode(65 + index)}.</span>
              <span className="quiz-sheet-option-text">{option}</span>
              {isSelected && correct ? <CheckCircle2 size={18} aria-label="正确" /> : null}
              {isSelected && !correct ? <XCircle size={18} aria-label="错误" /> : null}
              {isCorrectOption && !isSelected ? <span className="quiz-sheet-answer-mark">正确答案</span> : null}
            </button>
          );
        })}
      </div>

      {answered ? (
        <div
          id={feedbackId}
          className={`quiz-sheet-feedback ${correct ? "quiz-sheet-feedback-is-correct" : "quiz-sheet-feedback-is-incorrect"}`}
          role="alert"
        >
          {correct ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <div>
            <strong>{correct ? "回答正确" : "回答错误"}</strong>
            <p>{quiz.optionFeedback[selected]}</p>
            {!correct ? (
              <p>正确答案：{String.fromCharCode(65 + quiz.answer)}. {quiz.options[quiz.answer]}。{quiz.explanation}</p>
            ) : null}
          </div>
          <button type="button" className="quiz-sheet-retry" onClick={() => setSelected(null)}>
            <RotateCcw size={16} />
            重做本题
          </button>
        </div>
      ) : null}

      <div className="quiz-sheet-derivation">
        <FoldableNote title="查看详细推导" variant="formula">
          <ol className="quiz-sheet-derivation-steps">
            {quiz.detail.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </FoldableNote>
      </div>
    </article>
  );
}
