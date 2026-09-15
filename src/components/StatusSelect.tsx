import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { STATUS_ORDER, type LeadStatus } from '../lib/types'
import StatusPill, { STATUS_META } from './StatusPill'

export default function StatusSelect({
  value,
  onChange,
  disabled = false,
}: {
  value: LeadStatus
  onChange: (s: LeadStatus) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="group inline-flex items-center gap-1 rounded-lg p-0.5 transition hover:bg-white/5 disabled:opacity-60"
        title="Change status"
      >
        <StatusPill status={value} />
        <ChevronDown
          className={`h-3.5 w-3.5 text-text-tertiary transition group-hover:text-text-secondary ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-surface-card shadow-2xl animate-rise">
          {STATUS_ORDER.map((s) => {
            const meta = STATUS_META[s]
            const active = s === value
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onChange(s)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition hover:bg-white/5 ${
                  active ? 'bg-white/5' : ''
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                <meta.icon className={`h-3.5 w-3.5 ${meta.text}`} />
                <span className={active ? 'text-text-primary' : 'text-text-secondary'}>
                  {meta.label}
                </span>
                {active && <Check className="ml-auto h-3.5 w-3.5 text-accent" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
