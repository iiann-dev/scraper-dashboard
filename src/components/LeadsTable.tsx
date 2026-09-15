import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, CheckSquare } from 'lucide-react'
import { isHot, timeAgo } from '../lib/helpers'
import { STATUS_ORDER, prettyCategory, type Lead, type LeadStatus } from '../lib/types'
import ActionButtons from './ActionButtons'
import NotesCell from './NotesCell'
import Stars from './Stars'
import StatusPill, { HotBadge } from './StatusPill'
import StatusSelect from './StatusSelect'

type SortKey = 'id' | 'name' | 'rating' | 'status' | 'touched'

const STATUS_RANK = new Map<LeadStatus, number>(
  STATUS_ORDER.map((s, i) => [s, i]),
)

function sortLeads(rows: Lead[], key: SortKey, dir: 1 | -1): Lead[] {
  const arr = [...rows]
  arr.sort((a, b) => {
    switch (key) {
      case 'id':
        return (a.id - b.id) * dir
      case 'name':
        return a.name.localeCompare(b.name) * dir
      case 'rating': {
        const ra = parseFloat(a.rating ?? '') || -1
        const rb = parseFloat(b.rating ?? '') || -1
        return (ra - rb) * dir
      }
      case 'status':
        return (
          (STATUS_RANK.get(a.status) ?? 99) - (STATUS_RANK.get(b.status) ?? 99)
        ) * dir
      case 'touched': {
        const ta = a.last_touched_at
          ? new Date(a.last_touched_at).getTime()
          : 0
        const tb = b.last_touched_at
          ? new Date(b.last_touched_at).getTime()
          : 0
        return (ta - tb) * dir
      }
      default:
        return 0
    }
  })
  return arr
}

function Th({
  label,
  sortKey,
  active,
  dir,
  onSort,
  className = '',
}: {
  label: string
  sortKey?: SortKey
  active?: boolean
  dir?: 1 | -1
  onSort?: (k: SortKey) => void
  className?: string
}) {
  if (!sortKey) {
    return (
      <th
        className={`px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-tertiary ${className}`}
      >
        {label}
      </th>
    )
  }
  return (
    <th className={`px-3 py-2.5 ${className}`}>
      <button
        type="button"
        onClick={() => onSort?.(sortKey)}
        className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition hover:text-text-secondary ${
          active ? 'text-accent' : 'text-text-tertiary'
        }`}
      >
        {label}
        {active ? (
          dir === 1 ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </button>
    </th>
  )
}

export default function LeadsTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
  allSelected,
  someSelected,
  updatingId,
  onStatusChange,
  onNotesSave,
  showHot = false,
}: {
  rows: Lead[]
  selected: Set<number>
  onToggle: (id: number) => void
  onToggleAll: () => void
  allSelected: boolean
  someSelected: boolean
  updatingId: number | null
  onStatusChange: (id: number, s: LeadStatus) => void
  onNotesSave: (id: number, notes: string) => Promise<void>
  showHot?: boolean
}) {
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortDir, setSortDir] = useState<1 | -1>(1)

  const sorted = useMemo(
    () => sortLeads(rows, sortKey, sortDir),
    [rows, sortKey, sortDir],
  )

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === 1 ? -1 : 1))
    else {
      setSortKey(k)
      setSortDir(1)
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-card">
      <table className="w-full min-w-280 border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-surface-elevated">
            <th className="w-10 px-3 py-2.5">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el)
                    (el as HTMLInputElement).indeterminate =
                      someSelected && !allSelected
                }}
                onChange={onToggleAll}
                title="Select all on this page"
                className="h-4 w-4 cursor-pointer rounded border-border bg-surface-elevated accent-emerald-500"
              />
            </th>
            <Th label="No" sortKey="id" active={sortKey === 'id'} dir={sortDir} onSort={handleSort} />
            <Th label="Place" sortKey="name" active={sortKey === 'name'} dir={sortDir} onSort={handleSort} />
            <Th label="Rating" sortKey="rating" active={sortKey === 'rating'} dir={sortDir} onSort={handleSort} />
            <Th label="Contact" />
            <Th label="Status" sortKey="status" active={sortKey === 'status'} dir={sortDir} onSort={handleSort} />
            <Th label="Note" />
            <Th label="Touched" sortKey="touched" active={sortKey === 'touched'} dir={sortDir} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((lead) => {
            const hot = showHot || isHot(lead)
            const checked = selected.has(lead.id)
            return (
              <tr
                key={lead.id}
                className={`border-b border-border/60 transition last:border-0 hover:bg-surface-elevated/60 ${
                  checked ? 'bg-blue-500/5' : ''
                }`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(lead.id)}
                    className="h-4 w-4 cursor-pointer rounded border-border bg-surface-elevated accent-emerald-500"
                  />
                </td>
                <td className="tnum whitespace-nowrap px-3 py-3 text-[13px] text-text-tertiary">
                  {lead.id}
                </td>
                <td className="max-w-56 px-3 py-3">
                  <div className="flex items-center gap-2">
                    <p
                      className="truncate text-sm font-semibold text-text-primary"
                      title={lead.name}
                    >
                      {lead.name}
                    </p>
                    {hot ? <HotBadge /> : null}
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-text-tertiary" title={lead.address ?? ''}>
                    {prettyCategory(lead.category)}
                    {lead.address ? ` · ${lead.address.slice(0, 48)}` : ''}
                  </p>
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <Stars rating={lead.rating} />
                </td>
                <td className="max-w-72 px-3 py-3">
                  <ActionButtons lead={lead} />
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  {updatingId === lead.id ? (
                    <StatusPill status={lead.status} pulse />
                  ) : (
                    <StatusSelect
                      value={lead.status}
                      onChange={(s) => onStatusChange(lead.id, s)}
                    />
                  )}
                </td>
                <td className="px-3 py-3">
                  <NotesCell
                    notes={lead.notes}
                    onSave={(n) => onNotesSave(lead.id, n)}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-[12px] text-text-tertiary tnum">
                  {lead.last_touched_at ? timeAgo(lead.last_touched_at) : '—'}
                </td>
              </tr>
            )
          })}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={8} className="px-3 py-12 text-center">
                <CheckSquare className="mx-auto h-8 w-8 text-text-tertiary" />
                <p className="mt-2 text-sm text-text-tertiary">
                  No leads match your filters
                </p>
                <p className="mt-0.5 text-[12px] text-text-tertiary/70">
                  Try clearing search or category filters
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
