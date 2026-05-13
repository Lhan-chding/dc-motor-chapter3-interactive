import { FoldableNote } from "./FoldableNote";

type SpeakerNotesProps = {
  notes: string[];
};

export function SpeakerNotes({ notes }: SpeakerNotesProps) {
  if (notes.length === 0) {
    return null;
  }

  return (
    <FoldableNote title="讲者备注">
      <ul className="compact-list">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </FoldableNote>
  );
}
