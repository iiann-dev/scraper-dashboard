import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { motionTokens } from '../lib/motion-tokens'
import { Download, Search } from 'lucide-react'
import { isHot, whatsappUrl, telUrl, timeAgo } from '../lib/helpers'
import { STATUS_ORDER, prettyCategory, type Lead, type LeadStatus } from '../lib/types'
import { STATUS_META } from '../components/StatusPill'
import Stars from '../components/Stars'

const PIPELINE_STAGES: LeadStatus[] = STATUS_ORDER.filter(
  (s) => s !== 'not contacted yet',
)

export default function PerformanceView({
  leads,
  onOpenDrawer,
}: {
  leads: Lead[]
  onOpenDrawer: (lead: Lead) => void
}) {
  const [activeStageTab, setActiveStageTab] = useState<LeadStatus | 'all'>('all')
  const [searchFilter, setSearchFilter] = useState('')

  // Touched leads (already contacted by sales)
  const touchedLeads = useMemo(
    () => leads.filter((l) => l.status !== 'not contacted yet'),
    [leads],
  )

  const stageCounts = useMemo(() => {
    const map = new Map<LeadStatus, number>()
    for (const s of STATUS_ORDER) map.set(s, 0)
    for (const l of leads) map.set(l.status, (map.get(l.status) ?? 0) + 1)
    return map
  }, [leads])

  const totalTouched = touchedLeads.length
  const wonCount = stageCounts.get('won') ?? 0
  const conversionRate =
    totalTouched > 0 ? ((wonCount / totalTouched) * 100).toFixed(1) : '0'

  // Filtered list of leads for the detailed pipeline section
  const displayedLeads = useMemo(() => {
    const q = searchFilter.trim().toLowerCase()
    return touchedLeads.filter((l) => {
      if (activeStageTab !== 'all' && l.status !== activeStageTab) return false
      if (!q) return true
      return (
        l.name.toLowerCase().includes(q) ||
        (!!l.address && l.address.toLowerCase().includes(q)) ||
        (!!l.category && l.category.toLowerCase().includes(q)) ||
        (!!l.notes && l.notes.toLowerCase().includes(q)) ||
        (!!l.phone && l.phone.includes(q))
      )
    })
  }, [touchedLeads, activeStageTab, searchFilter])

  const exportTouchedCsv = () => {
    if (touchedLeads.length === 0) return
    const headers = [
      'ID', 'Name', 'Rating', 'Category', 'Address', 'Phone',
      'Website', 'Maps', 'Status', 'Notes', 'Last Touched',
    ]
    const rows = touchedLeads.map((l) => [
      `#PLC-${l.id}`,
      `"${l.name.replace(/"/g, '""')}"`,
      l.rating ?? '',
      prettyCategory(l.category),
      `"${(l.address ?? '').replace(/"/g, '""')}"`,
      l.phone ?? '',
      l.website ?? '',
      l.place_url ?? '',
      l.status,
      `"${(l.notes ?? '').replace(/"/g, '""')}"`,
      l.last_touched_at ?? '',
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sales-performance-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: motionTokens.distance.sm }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionTokens.duration.normal }}
      className="flex flex-col gap-6 select-none"
    >
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
              Executive Analytics
            </span>
            <span className="w-1 h-1 rounded-full bg-text-tertiary" />
            <span className="text-[11px] font-semibold text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
              Live Performance Tracking
            </span>
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-text-primary tracking-tight">
            Sales Performance & Analytics
          </h1>
          <p className="text-[13px] text-text-tertiary mt-1 max-w-2xl">
            Track all prospect data processed, deal conversion rates, and
            sales interaction history.
          </p>
        </div>

        <motion.button
          type="button"
          onClick={exportTouchedCsv}
          disabled={touchedLeads.length === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="h-10 px-4 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground text-[13px] font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-40 shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV ({totalTouched})</span>
        </motion.button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Places Scraped',
            value: leads.length.toLocaleString(),
            sub: 'Google Maps Places',
            subColor: 'text-text-tertiary',
            icon: 'explore',
            iconBg: 'bg-blue-500/10 border border-blue-500/20',
            iconColor: 'text-blue-400',
            badge: '100% Sync',
            badgeColor: 'bg-success-bg text-success border border-success-border',
            barColor: 'bg-blue-400',
            delay: 0,
          },
          {
            label: 'Sales-Touched Leads',
            value: totalTouched.toLocaleString(),
            sub: `${leads.length > 0 ? ((totalTouched / leads.length) * 100).toFixed(1) : 0}% coverage`,
            subColor: 'text-accent',
            icon: 'contact_phone',
            iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
            iconColor: 'text-emerald-400',
            badge: 'Active',
            badgeColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
            barColor: 'bg-emerald-400',
            delay: 0.1,
          },
          {
            label: 'Win Rate',
            value: `${conversionRate}%`,
            sub: 'Deal conversion',
            subColor: 'text-text-tertiary',
            icon: 'handshake',
            iconBg: 'bg-violet-500/10 border border-violet-500/20',
            iconColor: 'text-violet-400',
            badge: `${wonCount} Won`,
            badgeColor: 'bg-success-bg text-success border border-success-border',
            barColor: 'bg-violet-400',
            barWidth: `${conversionRate}%`,
            delay: 0.2,
          },
          {
            label: 'Hot Untouched',
            value: leads.filter((l) => l.status === 'not contacted yet' && isHot(l)).length.toLocaleString(),
            sub: 'No web · 4.5+',
            subColor: 'text-amber-400',
            icon: 'local_fire_department',
            iconBg: 'bg-amber-500/10 border-amber-500/30 border',
            iconColor: 'text-amber-400',
            badge: 'Tier-1',
            badgeColor: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
            barColor: 'bg-amber-400',
            barWidth: '65%',
            delay: 0.3,
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: motionTokens.distance.md }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay, duration: 0.4 }}
            className="bg-surface-card rounded-xl p-5 border border-border shadow-sm flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}>
                  <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                </div>
                <span className="text-[12px] font-bold text-text-tertiary">
                  {stat.label}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${stat.badgeColor}`}
              >
                {stat.badge}
              </span>
            </div>

            <div className="mt-3">
              <div className="font-display text-3xl font-bold text-text-primary tracking-tight tnum">
                {stat.value}
              </div>
              <div className="flex items-center justify-between text-text-tertiary text-[11.5px] mt-1">
                <span>{stat.sub}</span>
                <span className={stat.subColor}>{stat.sub}</span>
              </div>
            </div>

            <div className="mt-3 w-full bg-surface-pop h-1.5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${stat.barColor}`}
                initial={{ width: 0 }}
                animate={{ width: stat.barWidth ?? '100%' }}
                transition={{
                  duration: 0.6,
                  ease: motionTokens.easing.smooth,
                  delay: stat.delay + 0.2,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stage Breakdown Progress Bars */}
      <motion.div
        initial={{ opacity: 0, y: motionTokens.distance.md }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: motionTokens.duration.normal }}
        className="bg-surface-card p-5 rounded-xl border border-border shadow-sm flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold uppercase tracking-wider text-text-tertiary">
            Pipeline Stage Distribution
          </span>
          <span className="text-[12px] text-text-tertiary">
            {totalTouched} prospects being processed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PIPELINE_STAGES.map((st) => {
            const count = stageCounts.get(st) ?? 0
            const pct =
              totalTouched > 0
                ? ((count / totalTouched) * 100).toFixed(1)
                : '0'
            const badge = STATUS_META[st]
            const active = activeStageTab === st

            return (
              <motion.button
                key={st}
                type="button"
                onClick={() =>
                  setActiveStageTab(activeStageTab === st ? 'all' : st)
                }
                whileHover={{ y: -1, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all text-left ${
                  active
                    ? 'bg-surface-elevated border-accent shadow-md'
                    : 'bg-surface-elevated border-border hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`} />
                    <span className="text-[13px] font-bold text-text-primary capitalize">
                      {badge.label}
                    </span>
                  </div>
                  <span className="font-display text-base font-bold text-text-primary tnum">
                    {count}
                  </span>
                </div>
                <div className="w-full bg-surface-pop h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${badge.dot}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.5,
                      ease: motionTokens.easing.smooth,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-text-tertiary mt-2">
                  <span>Pipeline contribution</span>
                  <span className="font-bold text-text-secondary tnum">
                    {pct}%
                  </span>
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Detailed Pipeline Leads Section */}
      <motion.div
        initial={{ opacity: 0, y: motionTokens.distance.md }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: motionTokens.duration.normal }}
        className="bg-surface-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col"
      >
        {/* Toolbar Header */}
        <div className="p-5 bg-surface-elevated border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-bold text-text-primary flex items-center gap-2">
              <span>Prospects in Pipeline</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-bold tnum">
                {displayedLeads.length} places
              </span>
            </h3>
            <p className="text-[12px] text-text-tertiary mt-0.5 max-w-lg">
              All prospects that have been contacted and their current status
              (e.g. Cafe Rohe, Cafe Bestro, etc.).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Tabs */}
            <motion.button
              type="button"
              onClick={() => setActiveStageTab('all')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                activeStageTab === 'all'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-surface-pop text-text-tertiary hover:text-text-primary'
              }`}
            >
              All Touched ({totalTouched})
            </motion.button>
            {PIPELINE_STAGES.map((st) => (
              <motion.button
                key={st}
                type="button"
                onClick={() =>
                  setActiveStageTab(activeStageTab === st ? 'all' : st)
                }
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors capitalize ${
                  activeStageTab === st
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-surface-pop text-text-tertiary hover:text-text-primary'
                }`}
              >
                {st} ({stageCounts.get(st) ?? 0})
              </motion.button>
            ))}
          </div>
        </div>

        {/* Search within pipeline */}
        <div className="p-4 border-b border-border bg-surface-elevated">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search within pipeline..."
              className="h-9 w-full rounded-lg border border-border bg-surface-pop pl-9 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Leads Cards Grid inside Pipeline */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 max-h-[640px] overflow-y-auto">
          {displayedLeads.map((lead, idx) => {
            const badge = STATUS_META[lead.status]
            const wa = whatsappUrl(lead.phone)
            const tel = telUrl(lead.phone)

            return (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02, duration: 0.2 }}
                onClick={() => onOpenDrawer(lead)}
                className="p-4 rounded-xl bg-surface-elevated border border-border hover:border-accent/40 hover:bg-surface-pop transition-all cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 ${badge.bg} ${badge.border} ${badge.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                    <span className="font-mono text-[11px] text-accent font-bold tnum">
                      #PLC-{lead.id}
                    </span>
                  </div>

                  <h4 className="font-bold text-text-primary text-[14px] mt-2 group-hover:text-accent transition-colors leading-snug">
                    {lead.name}
                  </h4>

                  <p className="text-[12px] text-text-tertiary truncate mt-0.5">
                    {prettyCategory(lead.category)} · {lead.address || 'Location on Maps'}
                  </p>

                  {lead.rating && <Stars rating={lead.rating} />}

                  {lead.notes && (
                    <div className="mt-2.5 p-2 rounded-lg bg-surface-pop border border-border text-[11.5px] text-text-tertiary">
                      <span className="text-violet-400 font-semibold block mb-0.5 text-[10.5px] uppercase">
                        Sales Notes:
                      </span>
                      <p className="line-clamp-2">"{lead.notes}"</p>
                    </div>
                  )}
                </div>

                <div
                  className="pt-2.5 border-t border-border flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] text-text-tertiary tnum">
                    {lead.last_touched_at ? timeAgo(lead.last_touched_at) : '—'}
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
                        <span>WA</span>
                      </a>
                    )}
                    {tel && (
                      <a
                        href={tel}
                        className="h-6 px-2 rounded-md bg-surface-pop hover:bg-surface-elevated text-text-secondary hover:text-text-primary border border-border text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          call
                        </span>
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}

          {displayedLeads.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-tertiary">
              <span className="material-symbols-outlined text-3xl mb-1 block text-text-tertiary/50">
                inbox
              </span>
              <p className="text-[13px] font-medium text-text-primary">
                No prospects in this status yet.
              </p>
              <p className="text-[11.5px] text-text-tertiary mt-0.5">
                Change prospect status from the main table or Kanban board to
                see them here.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
