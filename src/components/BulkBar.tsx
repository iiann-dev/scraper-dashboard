import { X } from 'lucide-react'
import { STATUS_ORDER, type LeadStatus } from '../lib/types'
import { STATUS_META } from './StatusPill'

export default function BulkBar({
  count,
  onApply,
  onClear,
  busy = false,
}: {
  count: number
  onApply: (s: LeadStatus) => void
  onClear: () => void
  busy?: boolean
}) {
  if (count === 0) return null
  return (
    <div className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 animate-rise">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface-card/95 px-4 py-3 shadow-2xl shadow-black/70 backdrop-blur">
        <span className="tnum text-sm font-semibold text-text-primary">
          {count.toLocaleString()} selected
        </span>
        <span className="text-[12px] text-text-tertiary">Mark as:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_ORDER.filter((s) => s !== 'not contacted yet').map((s) => {
            const meta = STATUS_META[s]
            return (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => onApply(s)}
                className={`rounded-full border px-2.5 py-1 text-[12px] font-semibold transition disabled:opacity-50 ${meta.bg} ${meta.border} ${meta.text} hover:brightness-125`}
              >
                {meta.label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={onClear}
          title="Clear selection"
          className="ml-auto rounded-md p-1.5 text-text-tertiary transition hover:bg-white/5 hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
