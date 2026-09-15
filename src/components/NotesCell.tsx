import { useState } from 'react'
import { PencilLine, StickyNote, X } from 'lucide-react'

export default function NotesCell({
  notes,
  onSave,
}: {
  notes: string | null
  onSave: (notes: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(notes ?? '')
  const [saving, setSaving] = useState(false)

  if (!editing) {
    if (notes && notes.trim()) {
      return (
        <button
          type="button"
          onClick={() => {
            setDraft(notes)
            setEditing(true)
          }}
          title={notes}
          className="group flex max-w-52 items-start gap-1.5 text-left"
        >
          <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400/70" />
          <span className="line-clamp-2 text-[12px] leading-snug text-text-tertiary transition group-hover:text-text-secondary">
            {notes}
          </span>
        </button>
      )
    }
    return (
      <button
        type="button"
        onClick={() => {
          setDraft('')
          setEditing(true)
        }}
        title="Add a note"
        className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[12px] text-text-tertiary transition hover:bg-white/5 hover:text-text-secondary"
      >
        <PencilLine className="h-3.5 w-3.5" />
        Note
      </button>
    )
  }

  const save = async () => {
    setSaving(true)
    try {
      await onSave(draft.trim())
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  return (
    <div className="w-52">
      <textarea
        autoFocus
        rows={2}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Owner asked for a quote — follow up Friday..."
        className="w-full resize-none rounded-md border border-border bg-surface-elevated px-2 py-1.5 text-[12.5px] text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
      />
      <div className="mt-1 flex gap-1">
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="rounded-md bg-accent px-2 py-0.5 text-[12px] font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-border px-2 py-0.5 text-[12px] text-text-tertiary transition hover:text-text-secondary"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
