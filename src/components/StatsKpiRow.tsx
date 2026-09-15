import { motion } from 'motion/react'
import { motionTokens, springs } from '../lib/motion-tokens'
import {
  Banknote,
  BarChart3,
  Phone,
  ShoppingBag,
  Users,
} from 'lucide-react'
import { isHot, hasPhone } from '../lib/helpers'
import type { Lead } from '../lib/types'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  bgColor: string
  trend?: React.ReactNode
  bar?: { width: string; color: string }
  badge?: React.ReactNode
  delay?: number
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  trend,
  bar,
  badge,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: motionTokens.distance.md }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springs.gentle, delay }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="rounded-xl border border-border bg-surface-card p-4.5 shadow-sm flex flex-col justify-between group transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
          {label}
        </span>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-accent ${bgColor}`}
        >
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-display text-2xl lg:text-3xl font-bold text-text-primary tracking-tight tnum">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {badge && badge}
      </div>

      {trend && <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px]">
        {trend}
      </div>}

      {bar && (
        <div className="mt-2.5 w-full bg-surface-pop h-1.5 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${bar.color}`}
            initial={{ width: 0 }}
            animate={{ width: bar.width }}
            transition={{ duration: 0.6, ease: motionTokens.easing.smooth }}
          />
        </div>
      )}
    </motion.div>
  )
}

export default function StatsKpiRow({ leads }: { leads: Lead[] }) {
  const total = leads.length
  const withPhone = leads.filter(hasPhone).length
  const hot = leads.filter(isHot).length
  const touched = leads.filter((l) => l.status !== 'not contacted yet').length
  const won = leads.filter((l) => l.status === 'won').length

  const phonePct = total > 0 ? ((withPhone / total) * 100).toFixed(0) : '0'
  const touchedPct =
    total > 0 ? ((touched / total) * 100).toFixed(0) : '0'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        label="Total Places Saved"
        value={total}
        icon={ShoppingBag}
        iconColor="text-blue-400"
        bgColor="bg-blue-500/10 border border-blue-500/20"
        trend={
          <span className="flex items-center text-success font-bold">
            <BarChart3 className="h-3.5 w-3.5 mr-1" /> +142 this week
          </span>
        }
        delay={0}
      />

      <StatCard
        label="Ready to Contact (Phone/WhatsApp)"
        value={withPhone}
        icon={Phone}
        iconColor="text-emerald-400"
        bgColor="bg-emerald-500/10 border border-emerald-500/20"
        bar={{ width: `${phonePct}%`, color: 'bg-emerald-400' }}
        delay={0.1}
      />

      <StatCard
        label="Sales-Touched Leads"
        value={touched}
        icon={Users}
        iconColor="text-blue-400"
        bgColor="bg-blue-500/10 border border-blue-500/20"
        badge={
          <span className="text-[12px] font-bold text-success bg-success-bg px-2 py-0.5 rounded-full border border-success-border">
            {won} Won
          </span>
        }
        bar={{ width: `${touchedPct}%`, color: 'bg-blue-400' }}
        delay={0.2}
      />

      <StatCard
        label="Web Pitch Opportunities"
        value={hot}
        icon={Banknote}
        iconColor="text-amber-400"
        bgColor="bg-amber-500/10 border-amber-500/30 border"
        badge={
          <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
            Tier-1
          </span>
        }
        trend={
          <span className="text-text-tertiary font-medium">
            No website · Rating 4.5+
          </span>
        }
        delay={0.3}
      />
    </div>
  )
}
