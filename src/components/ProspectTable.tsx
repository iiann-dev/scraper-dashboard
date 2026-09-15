import { useMemo, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { motionTokens } from '../lib/motion-tokens'
import { ArrowUp, CheckSquare, Globe } from 'lucide-react'
import { isHot, hasPhone, hasWebsite, whatsappUrl, telUrl, timeAgo } from '../lib/helpers'
import { STATUS_ORDER, prettyCategory, type Lead, type LeadStatus } from '../lib/types'
import Stars from './Stars'
import { HotBadge } from './StatusPill'

type SortKey = 'id' | 'name' | 'rating' | 'status' | 'touched'

// Strip scraper address artifacts (concatenated business name, "Closed" suffix, etc.)
const cleanAddress = (addr: string | null | undefined): string => {
  if (!addr) return 'Address on Google Maps'
  let clean = addr
  // Strip "Closed", "Open ..." suffixes and name-address concatenation
  clean = clean.replace(/Closed\s*$/i, '').replace(/Open.*$/i, '')
  clean = clean.replace(/(.+?)\1+$/g, '$1')
  clean = clean.replace(/\s+/g, ' ').trim()
  return clean || 'Address on Google Maps'
}

const STATUS_RANK = new Map<LeadStatus, number>(STATUS_ORDER.map((s, i) => [s, i]))

const STATUS_PILLS: Record<LeadStatus, { bg: string; text: string; dot: string; label: string }> = {
  'not contacted yet': { bg: 'bg-zinc-500/10 border-zinc-500/25', text: 'text-zinc-300', dot: 'bg-zinc-400', label: 'Not Contacted' },
  contacted: { bg: 'bg-amber-500/10 border-amber-500/25', text: 'text-amber-300', dot: 'bg-amber-400', label: 'Contacted' },
  'follow up': { bg: 'bg-sky-500/10 border-sky-500/25', text: 'text-sky-300', dot: 'bg-sky-400', label: 'Follow Up' },
  interested: { bg: 'bg-violet-500/10 border-violet-500/25', text: 'text-violet-300', dot: 'bg-violet-400', label: 'Interested' },
  won: { bg: 'bg-emerald-500/10 border-emerald-500/25', text: 'text-emerald-300', dot: 'bg-emerald-400', label: 'Deal Won' },
  lost: { bg: 'bg-rose-500/10 border-rose-500/25', text: 'text-rose-300', dot: 'bg-rose-400', label: 'Lost' },
  ghosting: { bg: 'bg-zinc-600/10 border-zinc-600/25', text: 'text-zinc-400', dot: 'bg-zinc-500', label: 'Ghosting' },
}

export default function ProspectTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
  allSelected,
  someSelected,
  updatingId,
  onStatusChange,
  onOpenDrawer,
  density = 'comfortable',
}: {
  rows: Lead[]
  selected: Set<number>
  onToggle: (id: number) => void
  onToggleAll: () => void
  allSelected: boolean
  someSelected: boolean
  updatingId: number | null
  onStatusChange: (id: number, s: LeadStatus) => void
  onOpenDrawer: (lead: Lead) => void
  density?: 'comfortable' | 'compact'
}) {
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortDir, setSortDir] = useState<1 | -1>(1)
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState<number>(50)

  // Reset page to 0 when rows change (e.g. searching/filtering)
  useEffect(() => {
    setPage(0)
  }, [rows.length])

  const sorted = useMemo(() => {
    const list = [...rows]
    list.sort((a, b) => {
      switch (sortKey) {
        case 'id':
          return (a.id - b.id) * sortDir
        case 'name':
          return a.name.localeCompare(b.name) * sortDir
        case 'rating': {
          const ra = parseFloat(a.rating ?? '') || -1
          const rb = parseFloat(b.rating ?? '') || -1
          return (ra - rb) * sortDir
        }
        case 'status':
          return ((STATUS_RANK.get(a.status) ?? 99) - (STATUS_RANK.get(b.status) ?? 99)) * sortDir
        case 'touched': {
          const ta = a.last_touched_at ? new Date(a.last_touched_at).getTime() : 0
          const tb = b.last_touched_at ? new Date(b.last_touched_at).getTime() : 0
          return (ta - tb) * sortDir
        }
        default:
          return 0
      }
    })
    return list
  }, [rows, sortKey, sortDir])

  // Paginated slice for instant 60fps rendering
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const pagedRows = useMemo(() => {
    const start = safePage * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, safePage, pageSize])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1))
    } else {
      setSortKey(key)
      setSortDir(1)
    }
  }

  const py = density === 'comfortable' ? 'py-3.5' : 'py-2'

  // Pagination bounds text
  const startIdx = sorted.length > 0 ? safePage * pageSize + 1 : 0
  const endIdx = Math.min((safePage + 1) * pageSize, sorted.length)

  return (
    <motion.div
      initial={{ opacity: 0, y: motionTokens.distance.sm }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: motionTokens.duration.normal }}
      className="bg-surface-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col select-none"
    >
      {/* Table Toolbar Header */}
      <div className="px-5 py-3 bg-surface-elevated border-b border-border flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="font-display text-[15px] font-bold text-text-primary">
            Business Directory
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-dot" />
            Live Data
          </span>
        </div>
        <div className="text-[12px] text-text-tertiary font-medium tnum">
          Showing <span className="text-text-primary font-bold">{startIdx} - {endIdx}</span> of{' '}
          <span className="text-text-primary font-bold">{sorted.length.toLocaleString()}</span> places
        </div>
      </div>

      {/* Table Canvas */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[1240px]">
          <thead>
            <tr className="bg-surface-elevated text-text-tertiary text-[11.5px] font-bold uppercase tracking-wider border-b border-border">
              <th className="py-3 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) (el as HTMLInputElement).indeterminate = someSelected && !allSelected
                  }}
                  onChange={onToggleAll}
                  className="w-4 h-4 rounded accent-blue-600 bg-surface-elevated border-border cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">
                <button
                  type="button"
                  onClick={() => handleSort('id')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  <span>ID</span>
                  <span className="material-symbols-outlined text-[15px]">
                    {sortKey === 'id' ? (sortDir === 1 ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                  </span>
                </button>
              </th>
              <th className="py-3 px-4 min-w-[260px]">
                <button
                  type="button"
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  <span>Business Name & Address</span>
                  <span className="material-symbols-outlined text-[15px]">
                    {sortKey === 'name' ? (sortDir === 1 ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                  </span>
                </button>
              </th>
              <th className="py-3 px-3">Rating</th>
              <th className="py-3 px-3">Google Maps</th>
              <th className="py-3 px-4 min-w-[190px]">Website</th>
              <th className="py-3 px-4 min-w-[200px]">Contact & WhatsApp</th>
              <th className="py-3 px-3 min-w-[150px]">
                <button
                  type="button"
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors"
                >
                  <span>Pipeline Status</span>
                  <span className="material-symbols-outlined text-[15px]">
                    {sortKey === 'status' ? (sortDir === 1 ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                  </span>
                </button>
              </th>
              <th className="py-3 px-4 text-right">Detail</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60 text-[13px] text-text-secondary">
            {pagedRows.map((lead) => {
              const checked = selected.has(lead.id)
              const hot = isHot(lead)
              const web = hasWebsite(lead)
              const phone = hasPhone(lead)
              const wa = whatsappUrl(lead.phone)
              const tel = telUrl(lead.phone)
              const statusMeta = STATUS_PILLS[lead.status]
              const isDropdownOpen = activeDropdownId === lead.id

              return (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onOpenDrawer(lead)}
                  className={`hover:bg-surface-elevated/60 transition-colors group cursor-pointer ${
                    checked ? 'bg-blue-500/5' : ''
                  }`}
                >
                  {/* Checkbox */}
                  <td className={`${py} px-4 text-center`} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(lead.id)}
                      className="w-4 h-4 rounded accent-blue-600 bg-surface-elevated border-border cursor-pointer"
                    />
                  </td>

                  {/* ID */}
                  <td className={`${py} px-3 whitespace-nowrap`}>
                    <div className="flex flex-col">
                      <span className="font-mono text-[12px] font-bold text-accent">
                        #PLC-{lead.id}
                      </span>
                      <span className="text-[11px] text-text-tertiary tnum">
                        {lead.last_touched_at ? timeAgo(lead.last_touched_at) : 'Fresh'}
                      </span>
                    </div>
                  </td>

                  {/* Business Name & Address */}
                  <td className={`${py} px-4 max-w-[300px]`}>
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shrink-0 text-accent mt-0.5">
                        <span className="material-symbols-outlined text-[18px]">
                          local_cafe
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-semibold text-text-primary truncate text-[13.5px] group-hover:text-accent transition-colors"
                            title={lead.name}
                          >
                            {lead.name}
                          </span>
                          {hot && <HotBadge />}
                        </div>
                        <p
                          className="text-[11.5px] text-text-tertiary truncate mt-0.5"
                          title={cleanAddress(lead.address)}
                        >
                          {cleanAddress(lead.address)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className={`${py} px-3 whitespace-nowrap`}>
                    <Stars rating={lead.rating} />
                  </td>

                  {/* Google Maps Button */}
                  <td className={`${py} px-3 whitespace-nowrap`} onClick={(e) => e.stopPropagation()}>
                    {lead.place_url ? (
                      <a
                        href={lead.place_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface-pop text-text-secondary hover:text-text-primary border border-border text-[11.5px] font-medium transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px] text-accent">
                          explore
                        </span>
                        <span>Maps</span>
                        <span className="material-symbols-outlined text-[12px] text-text-tertiary">
                          open_in_new
                        </span>
                      </a>
                    ) : (
                      <span className="text-text-tertiary text-[12px]">—</span>
                    )}
                  </td>

                  {/* Website */}
                  <td className={`${py} px-4`} onClick={(e) => e.stopPropagation()}>
                    {web ? (
                      <div className="flex flex-col">
                        <a
                          href={
                            /^https?:\/\//i.test(lead.website!)
                              ? lead.website!
                              : `https://${lead.website}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-accent hover:underline font-medium text-[12.5px] truncate max-w-[170px]"
                          title={lead.website!}
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {lead.website!.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </span>
                        </a>
                        <span className="text-[10.5px] text-success flex items-center gap-0.5 mt-0.5">
                          <span className="material-symbols-outlined text-[11px]">
                            verified
                          </span>
                          Live Website
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11.5px]">
                          <span className="material-symbols-outlined text-[14px]">
                            link_off
                          </span>
                          No website yet
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          Pitch opportunity
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Contact & WhatsApp */}
                  <td className={`${py} px-4`} onClick={(e) => e.stopPropagation()}>
                    {phone ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[12px] font-bold text-text-primary tnum">
                          {lead.phone}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {wa && (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noreferrer"
                              className="h-6 px-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                chat
                              </span>
                              <span>Chat WA</span>
                            </a>
                          )}
                          {tel && (
                            <a
                              href={tel}
                              className="h-6 px-2 rounded-md bg-surface-elevated hover:bg-surface-pop text-text-secondary hover:text-text-primary border border-border text-[11px] font-medium flex items-center gap-1 transition-colors"
                              title={`Call ${lead.phone}`}
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                call
                              </span>
                              <span>Call</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-text-tertiary text-[12px] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">
                          phone_disabled
                        </span>
                        No phone
                      </span>
                    )}
                  </td>

                  {/* Category */}
                  <td className={`${py} px-3 whitespace-nowrap`}>
                    <span className="px-2 py-0.5 rounded-md bg-surface-elevated text-text-secondary border border-border text-[11.5px] font-medium">
                      {prettyCategory(lead.category)}
                    </span>
                  </td>

                  {/* Pipeline Status */}
                  <td className={`${py} px-3 relative whitespace-nowrap`} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={updatingId === lead.id}
                      onClick={() => setActiveDropdownId(isDropdownOpen ? null : lead.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all hover:brightness-125 ${statusMeta.bg} ${statusMeta.text} ${
                        updatingId === lead.id ? 'opacity-60 cursor-wait' : ''
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot} ${lead.status !== 'not contacted yet' ? 'animate-pulse-dot' : ''}`} />
                      <span>{updatingId === lead.id ? 'Updating...' : statusMeta.label}</span>
                      <span className="material-symbols-outlined text-[13px]">
                        expand_more
                      </span>
                    </button>

                    {/* Status Dropdown */}
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute left-0 mt-1 w-44 rounded-xl bg-surface-elevated border border-border shadow-2xl z-30 p-1 flex flex-col gap-0.5"
                      >
                        {STATUS_ORDER.map((st) => {
                          const meta = STATUS_PILLS[st]
                          const active = lead.status === st
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => {
                                onStatusChange(lead.id, st)
                                setActiveDropdownId(null)
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11.5px] font-semibold flex items-center gap-2 transition-colors ${
                                active
                                  ? 'bg-accent text-accent-foreground'
                                  : 'text-text-secondary hover:bg-surface-pop'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                              <span>{meta.label}</span>
                            </button>
                          )
                        })}
                      </motion.div>
                    )}
                  </td>

                  {/* Detail Action */}
                  <td className={`${py} px-4 text-right whitespace-nowrap`}>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-surface-elevated group-hover:bg-accent group-hover:text-accent-foreground text-text-tertiary flex items-center justify-center transition-colors ml-auto"
                      title="View Lead Details"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              )
            })}

            {pagedRows.length === 0 && (
              <tr>
                <td colSpan={10} className="py-16 text-center text-text-tertiary">
                  <CheckSquare className="mx-auto h-8 w-8 text-text-tertiary/50 mb-2" />
                  <p className="text-base font-semibold text-text-primary">
                    No places match your filters
                  </p>
                  <p className="text-[12px] text-text-tertiary mt-1">
                    Try clearing the search or adjusting category filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 bg-surface-elevated border-t border-border flex items-center justify-between gap-4 flex-wrap text-[12px] text-text-tertiary">
        <div className="flex items-center gap-3">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(0)
            }}
            className="h-8 px-2.5 rounded-lg bg-surface-pop border border-border text-text-primary text-[12px] focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
          </select>
          <span className="text-text-tertiary tnum">
            Page {safePage + 1} of {totalPages}
          </span>
        </div>

        {/* Page navigation buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="w-8 h-8 rounded-lg bg-surface-pop disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-text-secondary transition-colors"
            title="Previous Page"
          >
            <span className="material-symbols-outlined text-[16px]">
              chevron_left
            </span>
          </button>

          {/* Quick Page Jump Buttons */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pNum = i
            if (totalPages > 5 && safePage > 2) {
              pNum = safePage - 2 + i
              if (pNum >= totalPages) pNum = totalPages - 5 + i
            }
            const active = safePage === pNum
            return (
              <button
                key={pNum}
                type="button"
                onClick={() => setPage(pNum)}
                className={`w-8 h-8 rounded-lg text-[12px] font-bold transition-all ${
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-surface-pop text-text-secondary hover:bg-surface-pop'
                }`}
              >
                {pNum + 1}
              </button>
            )
          })}

          <button
            type="button"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="w-8 h-8 rounded-lg bg-surface-pop disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-text-secondary transition-colors"
            title="Next Page"
          >
            <span className="material-symbols-outlined text-[16px]">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
