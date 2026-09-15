import type { LucideIcon } from 'lucide-react'
import {
  CheckCheck,
  CircleDashed,
  Flame,
  Ghost,
  HeartHandshake,
  PhoneCall,
  Timer,
  XCircle,
} from 'lucide-react'
import type { LeadStatus } from '../lib/types'

interface StatusMeta {
  label: string
  dot: string
  text: string
  bg: string
  border: string
  icon: LucideIcon
}

/**
 * Semantic status metadata.
 * Colors are defined as semantic variables that work in both light and dark themes.
 */
export const STATUS_META: Record<LeadStatus, StatusMeta> = {
  'not contacted yet': {
    label: 'Not Contacted',
    dot: 'bg-zinc-400',
    text: 'text-zinc-400',
    bg: 'bg-zinc-500/10',
    border: 'border-zinc-500/25',
    icon: CircleDashed,
  },
  contacted: {
    label: 'Contacted',
    dot: 'bg-amber-400',
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    icon: PhoneCall,
  },
  'follow up': {
    label: 'Follow Up',
    dot: 'bg-sky-400',
    text: 'text-sky-300',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/25',
    icon: Timer,
  },
  interested: {
    label: 'Interested',
    dot: 'bg-violet-400',
    text: 'text-violet-300',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/25',
    icon: HeartHandshake,
  },
  won: {
    label: 'Won',
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    icon: CheckCheck,
  },
  lost: {
    label: 'Lost',
    dot: 'bg-rose-400',
    text: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/25',
    icon: XCircle,
  },
  ghosting: {
    label: 'Ghosting',
    dot: 'bg-zinc-500',
    text: 'text-zinc-400',
    bg: 'bg-zinc-600/10',
    border: 'border-zinc-600/25',
    icon: Ghost,
  },
}

export function HotBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-orange-400/30 bg-orange-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-300 ${className}`}
    >
      <Flame className="h-3 w-3" />
      Hot
    </span>
  )
}

export default function StatusPill({
  status,
  pulse = false,
}: {
  status: LeadStatus
  pulse?: boolean
}) {
  const meta = STATUS_META[status] ?? STATUS_META['not contacted yet']
  const Icon = meta.icon
  return (
    <span
      className={`inline-flex h-[22px] items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-semibold uppercase tracking-wide ${meta.bg} ${meta.border} ${meta.text}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${pulse ? 'animate-pulse-dot' : ''}`}
      />
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  )
}
