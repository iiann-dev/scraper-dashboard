import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { motionTokens } from '../lib/motion-tokens'
import BulkBar from '../components/BulkBar'
import CategoryChips from '../components/CategoryChips'
import LeadsTable from '../components/LeadsTable'
import SearchBar from '../components/SearchBar'
import StatusPill from '../components/StatusPill'
import StatsHeader from '../components/StatsHeader'
import { useLeads } from '../hooks/useLeads'
import { matchesSearch } from '../lib/helpers'
import { STATUS_ORDER, type LeadStatus } from '../lib/types'

const PAGE_SIZE = 50

export default function LeadsView({ hotOnly = false }: { hotOnly?: boolean }) {
  const { leads, loading, error, updateStatus, saveNotes, bulkStatus } = useLeads(hotOnly)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [page, setPage] = useState(0)

  const categories = useMemo<[string, number][]>(() => {
    const m = new Map<string, number>()
    for (const l of leads) {
      const c = (l.category ?? 'uncategorized').trim() || 'uncategorized'
      m.set(c, (m.get(c) ?? 0) + 1)
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [leads])

  const presentStatuses = useMemo<LeadStatus[]>(() => {
    const set = new Set<LeadStatus>(leads.map((l) => l.status))
    return STATUS_ORDER.filter((s) => set.has(s))
  }, [leads])

  const filtered = useMemo(
    () =>
      leads.filter(
        (l) =>
          (statusFilter === 'all' || l.status === statusFilter) &&
          (category === null || l.category === category) &&
          matchesSearch(l, search),
      ),
    [leads, statusFilter, category, search],
  )

  useEffect(() => {
    setPage(0)
  }, [search, category, statusFilter, hotOnly])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const pageRows = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  )

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const pageIds = pageRows.map((r) => r.id)
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const someSelected = pageIds.some((id) => selected.has(id))
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })

  const handleStatus = async (id: number, s: LeadStatus) => {
    setUpdatingId(id)
    try {
      await updateStatus(id, s)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleBulk = async (s: LeadStatus) => {
    if (selected.size === 0) return
    setBulkBusy(true)
    try {
      await bulkStatus([...selected], s)
      setSelected(new Set())
    } finally {
      setBulkBusy(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: motionTokens.distance.sm }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionTokens.duration.normal }}
      className="flex flex-col gap-4"
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          {hotOnly ? 'Hot Leads' : 'All Leads'}
        </h1>
        <p className="mt-0.5 text-sm text-text-tertiary">
          {hotOnly
            ? 'No website and rated 4.5+ — your best pitch targets'
            : 'Every scraped place, ready for your sales team'}
        </p>
      </div>

      <StatsHeader leads={leads} />

      <div className="flex flex-col gap-3">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryChips
          categories={categories}
          active={category}
          onChange={(c) => setCategory(c)}
          total={leads.length}
        />
        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            type="button"
            onClick={() => setStatusFilter('all')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`rounded-full border px-3 py-1 text-[13px] font-medium transition ${
              statusFilter === 'all'
                ? 'border-accent/60 bg-accent/10 text-accent'
                : 'border-border bg-surface-elevated text-text-tertiary hover:text-text-primary'
            }`}
          >
            All Statuses
          </motion.button>
          {presentStatuses.map((s) => (
            <motion.button
              key={s}
              type="button"
              onClick={() =>
                setStatusFilter(statusFilter === s ? 'all' : s)
              }
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-full transition ${
                statusFilter === s
                  ? 'ring-2 ring-accent/50'
                  : 'opacity-80 hover:opacity-100'
              }`}
              title={`Filter: ${s}`}
            >
              <StatusPill status={s} />
            </motion.button>
          ))}
        </div>
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-border bg-surface-elevated p-12 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent"
          />
          <p className="mt-3 text-sm text-text-tertiary">Loading leads…</p>
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-error-border bg-error-bg p-6 text-center"
        >
          <p className="text-sm font-semibold text-error">
            Could not load leads
          </p>
          <p className="mt-1 text-[13px] text-text-tertiary">{error}</p>
        </motion.div>
      ) : (
        <>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="tnum text-[13px] text-text-tertiary"
          >
            {filtered.length.toLocaleString()} result{filtered.length === 1 ? '' : 's'}
            {pages > 1 ? ` · page ${safePage + 1} of ${pages}` : ''}
          </motion.p>
          <LeadsTable
            rows={pageRows}
            selected={selected}
            onToggle={toggle}
            onToggleAll={toggleAll}
            allSelected={allSelected}
            someSelected={someSelected}
            updatingId={updatingId}
            onStatusChange={handleStatus}
            onNotesSave={saveNotes}
            showHot={hotOnly}
          />
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <motion.button
                type="button"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-[13px] text-text-tertiary transition hover:text-text-primary disabled:opacity-40"
              >
                ← Prev
              </motion.button>
              <span className="tnum text-[13px] text-text-tertiary">
                {safePage + 1} / {pages}
              </span>
              <motion.button
                type="button"
                disabled={safePage >= pages - 1}
                onClick={() => setPage(safePage + 1)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-[13px] text-text-tertiary transition hover:text-text-primary disabled:opacity-40"
              >
                Next →
              </motion.button>
            </div>
          )}
        </>
      )}

      <BulkBar
        count={selected.size}
        onApply={handleBulk}
        onClear={() => setSelected(new Set())}
        busy={bulkBusy}
      />
    </motion.div>
  )
}
