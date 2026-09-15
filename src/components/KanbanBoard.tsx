import { useMemo } from 'react'
import { motion } from 'motion/react'
import { motionTokens } from '../lib/motion-tokens'
import { isHot, hasWebsite, whatsappUrl, telUrl, timeAgo } from '../lib/helpers'
import { STATUS_ORDER, prettyCategory, type Lead, type LeadStatus } from '../lib/types'
import { HotBadge } from './StatusPill'

// Strip scraper address artifacts from compact Kanban cards
const cleanAddressCompact = (addr: string | null | undefined): string => {
  if (!addr) return 'Location on Maps'
  let clean = addr
    .replace(/Closed\s*$/i, '')
    .replace(/Open.*?$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
  return clean || 'Location on Maps'
}

const COLUMN_CONFIG: Record<
  LeadStatus,
  { label: string; dot: string; border: string }
> = {
  'not contacted yet': {
    label: 'New Import / Not Contacted',
    dot: 'bg-zinc-400',
    border: 'border-zinc-500/20',
  },
  contacted: {
    label: 'Contacted / Pitch Sent',
    dot: 'bg-amber-400',
    border: 'border-amber-500/20',
  },
  'follow up': {
    label: 'Follow-up / Call Later',
    dot: 'bg-sky-400',
    border: 'border-sky-500/20',
  },
  interested: {
    label: 'Interested / Demo Web',
    dot: 'bg-violet-400',
    border: 'border-violet-500/20',
  },
  won: {
    label: 'Closed Won / Partner',
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/20',
  },
  lost: {
    label: 'Lost / Not Interested',
    dot: 'bg-rose-400',
    border: 'border-rose-500/20',
  },
  ghosting: {
    label: 'Ghosting / No Response',
    dot: 'bg-zinc-500',
    border: 'border-zinc-500/20',
  },
}

export default function KanbanBoard({
  leads,
  onOpenDrawer,
}: {
  leads: Lead[]
  onOpenDrawer: (lead: Lead) => void
}) {
  const grouped = useMemo(() => {
    const map = new Map<LeadStatus, Lead[]>()
    for (const s of STATUS_ORDER) map.set(s, [])
    for (const l of leads) {
      const list = map.get(l.status)
      if (list) list.push(l)
    }
    return map
  }, [leads])

  const totalTouched = leads.filter((l) => l.status !== 'not contacted yet').length
  const wonCount = (grouped.get('won') ?? []).length
  const winRate = totalTouched > 0 ? ((wonCount / totalTouched) * 100).toFixed(1) : '0'

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* Pipeline Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Deals',
            value: `${totalTouched.toLocaleString()}`,
            sub: 'In Sales Funnel',
            icon: 'hub',
            iconColor: 'text-blue-400',
            iconBg: 'bg-blue-500/10 border border-blue-500/20',
          },
          {
            label: 'Win Rate',
            value: `${winRate}%`,
            sub: 'Conversion target',
            icon: 'verified',
            iconColor: 'text-emerald-400',
            iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
          },
          {
            label: 'Closed Won Deals',
            value: `${wonCount.toLocaleString()}`,
            sub: 'Active Partners',
            icon: 'handshake',
            iconColor: 'text-emerald-400',
            iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
          },
          {
            label: 'Not Yet Touched',
            value: `${(grouped.get('not contacted yet') ?? []).length.toLocaleString()}`,
            sub: 'Ready for pitching',
            icon: 'queue',
            iconColor: 'text-amber-400',
            iconBg: 'bg-amber-500/10 border border-amber-500/20',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: motionTokens.distance.md }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: motionTokens.duration.normal }}
            className="p-4 rounded-xl bg-surface-card border border-border flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary block">
                {stat.label}
              </span>
              <span className="font-display text-2xl font-bold text-text-primary mt-1 block tnum">
                {stat.value}
              </span>
              <span className="text-[11.5px] text-text-tertiary">{stat.sub}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}>
              <span className="material-symbols-outlined text-[22px]">{stat.icon}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Kanban Board Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 select-none snap-x">
        {STATUS_ORDER.map((st) => {
          const col = COLUMN_CONFIG[st]
          const list = grouped.get(st) ?? []

          return (
            <motion.div
              key={st}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + STATUS_ORDER.indexOf(st) * 0.1, duration: 0.4 }}
              className={`flex flex-col flex-1 min-w-[320px] max-w-[340px] rounded-xl border ${col.border} bg-surface-card p-3.5 shadow-sm snap-start`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                  <span className="font-display text-[13.5px] font-bold text-text-primary capitalize truncate max-w-[210px]">
                    {col.label}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-surface-elevated text-text-secondary text-[11px] font-bold border border-border tnum">
                  {list.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="flex flex-col gap-2.5 flex-1 min-h-[500px] overflow-y-auto max-h-[calc(100dvh-320px)] pr-0.5">
                {list.slice(0, 100).map((lead, idx) => {
                  const hot = isHot(lead)
                  const web = hasWebsite(lead)
                  const wa = whatsappUrl(lead.phone)
                  const tel = telUrl(lead.phone)

                  return (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      onClick={() => onOpenDrawer(lead)}
                      className="p-3.5 bg-surface-elevated hover:bg-surface-pop rounded-xl border border-border hover:border-accent/40 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-surface-pop text-text-tertiary text-[11px] font-semibold border border-border">
                          {prettyCategory(lead.category)}
                        </span>
                        <span className="font-mono text-[11px] text-accent font-bold">
                          #PLC-{lead.id}
                        </span>
                      </div>

                      <h4 className="font-bold text-text-primary text-[13.5px] leading-snug group-hover:text-accent transition-colors">
                        {lead.name}
                      </h4>

                      <div className="flex items-center gap-1 text-[11.5px] text-text-tertiary truncate">
                        <span className="material-symbols-outlined text-[14px]">
                          location_on
                        </span>
                        <span className="truncate">
                          {cleanAddressCompact(lead.address)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {lead.rating && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-bold">
                            ★ {lead.rating}
                          </span>
                        )}
                        {!web ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[11px] font-semibold">
                            No Website
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
                            Has Website
                          </span>
                        )}
                        {hot && <HotBadge />}
                      </div>

                      {lead.notes && (
                        <p className="text-[11.5px] text-text-tertiary italic line-clamp-1 bg-surface-elevated px-2 py-1 rounded border border-border/50">
                          "{lead.notes}"
                        </p>
                      )}

                      {/* Card Footer Actions */}
                      <div className="pt-2 border-t border-border flex items-center justify-between mt-1" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[11px] text-text-tertiary">
                          {lead.last_touched_at ? timeAgo(lead.last_touched_at) : 'Fresh'}
                        </span>
                        <div className="flex items-center gap-1">
                          {wa && (
                            <a
                              href={wa}
                              target="_blank"
                              rel="noreferrer"
                              className="w-6 h-6 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-colors"
                              title="Chat WhatsApp"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                chat
                              </span>
                            </a>
                          )}
                          {tel && (
                            <a
                              href={tel}
                              className="w-6 h-6 rounded-md bg-surface-pop hover:bg-surface-elevated text-text-secondary hover:text-text-primary border border-border flex items-center justify-center transition-colors"
                              title="Call"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                call
                              </span>
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {list.length === 0 && (
                  <div className="h-40 rounded-xl border border-dashed border-border flex items-center justify-center text-[12px] text-text-tertiary">
                    Empty
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
