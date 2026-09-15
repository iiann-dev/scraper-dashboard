import { Flame, Globe, Phone, Users, type LucideIcon } from 'lucide-react'
import { hasPhone, hasWebsite, isHot } from '../lib/helpers'
import type { Lead } from '../lib/types'

interface Card {
  label: string
  value: number
  sub?: string
  icon: LucideIcon
  tone: string
}

export default function StatsHeader({ leads }: { leads: Lead[] }) {
  const total = leads.length
  const hot = leads.filter(isHot).length
  const withWeb = leads.filter(hasWebsite).length
  const withPhone = leads.filter(hasPhone).length

  const cards: Card[] = [
    { label: 'Total Leads', value: total, icon: Users, tone: 'text-text-primary' },
    {
      label: 'Hot Leads',
      value: hot,
      sub: 'no web · 4.5+',
      icon: Flame,
      tone: 'text-orange-300',
    },
    { label: 'Has Website', value: withWeb, icon: Globe, tone: 'text-sky-300' },
    { label: 'Has Phone', value: withPhone, icon: Phone, tone: 'text-accent' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon
        return (
          <div
            key={c.label}
            className="animate-rise rounded-xl border border-border bg-surface-elevated p-4"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                {c.label}
              </p>
              <Icon className={`h-4 w-4 ${c.tone}`} />
            </div>
            <p
              className={`tnum mt-1 font-display text-3xl font-bold ${c.tone}`}
            >
              {c.value.toLocaleString()}
            </p>
            {c.sub ? (
              <p className="mt-0.5 text-[12px] text-text-tertiary">
                {c.sub}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
