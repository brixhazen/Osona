import { useState } from "react";
import { type Resident, type ResidentClinicalData, type NoteType, type NursingNote } from "@/lib/mock/clinical";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

const NOTE_FILTERS: (NoteType | "all")[] = ["all", "shift", "clinical", "physician", "family"];

const TYPE_STYLES: Record<NoteType, string> = {
  shift: "bg-primary/10 text-primary border-primary/20",
  clinical: "bg-warning/10 text-warning border-warning/20",
  physician: "bg-success/10 text-success border-success/20",
  family: "bg-muted/50 text-muted-foreground border-border",
};

interface Props {
  resident: Resident;
  data: ResidentClinicalData;
  onAddNote: (n: NursingNote) => void;
}

export function NotesTab({ data, onAddNote }: Props) {
  const [filter, setFilter] = useState<NoteType | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [noteType, setNoteType] = useState<NoteType>("shift");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  function handleSave() {
    if (!subject.trim() || !body.trim()) return;
    const now = new Date();
    const newNote: NursingNote = {
      id: `note-new-${Date.now()}`,
      type: noteType,
      subject: subject.trim(),
      body: body.trim(),
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      author: "Current User",
      authorRole: "RN",
    };
    onAddNote(newNote);
    setSubject("");
    setBody("");
    setNoteType("shift");
    setShowForm(false);
  }

  const filtered = data.notes.filter((n) => filter === "all" || n.type === filter);
  const sorted = [...filtered].sort(
    (a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
  );

  return (
    <div className="space-y-4">
      {/* Add note form */}
      {showForm && (
        <div className="rounded-lg border border-primary/25 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Add Note</p>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X size={15} />
            </button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(["shift", "clinical", "physician", "family"] as NoteType[]).map((t) => (
              <button
                key={t}
                onClick={() => setNoteType(t)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium border capitalize transition-colors",
                  noteType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject..."
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Note body..."
            rows={4}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded text-xs border border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!subject.trim() || !body.trim()}
              className="px-3 py-1.5 rounded text-xs bg-primary text-primary-foreground font-medium disabled:opacity-40"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Filter bar + add button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {NOTE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize",
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "All Notes" : f}
              {f !== "all" && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  ({data.notes.filter((n) => n.type === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium"
          >
            <Plus size={13} />
            Add Note
          </button>
        )}
      </div>

      <div className="space-y-3">
        {sorted.map((note) => (
          <div key={note.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium capitalize", TYPE_STYLES[note.type])}>
                    {note.type}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {note.date} · {note.time}
                  </span>
                </div>
                <h4 className="font-semibold text-sm">{note.subject}</h4>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{note.body}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-[11px] text-muted-foreground">{note.author} · {note.authorRole}</span>
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">No notes match this filter.</p>
        )}
      </div>
    </div>
  );
}
