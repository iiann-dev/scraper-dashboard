import { motion } from 'motion/react'
import { Banknote, Users, Target, Zap } from 'lucide-react'
import { isHot, hasWebsite } from '../lib/helpers'
import type { Lead } from '../lib/types'

export default function IntelligenceSurface({ leads, pitchMode = false }: { leads: Lead[]; pitchMode?: boolean }) {
  // Pitch-mode KPIs (Priority page) — pitch-target-focused
  const hot = leads.filter(isHot).length
  const noWeb = leads.filter((l) => !hasWebsite(l)).length
  const withPhone = leads.filter((l) => l.phone).length
  const avgRating = (() => {
    const rs = leads.map((l) => {
      const n = parseFloat(l.rating ?? '')
      return Number.isFinite(n) ? n : null
    }).filter((n): n is number => n !== null)
    return rs.length ? (rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1) : '—'
  })()

  const stats = pitchMode
    ? [
        {
          title: 'Pitch Targets',
          value: hot.toLocaleString(),
          sub: 'No website · 4.5+ rating',
          icon: Zap,
          trend: 'urgent',
          trendColor: 'text-amber-400',
          iconColor: 'text-amber-400',
          iconBg: 'bg-amber-500/10 border border-amber-500/20',
        },
        {
          title: 'Callable',
          value: withPhone.toLocaleString(),
          sub: 'Leads with phone',
          icon: Target,
          trend: `${leads.length} total`,
          trendColor: 'text-text-tertiary',
          iconColor: 'text-blue-400',
          iconBg: 'bg-blue-500/10 border border-blue-500/20',
        },
        {
          title: 'Avg Rating',
          value: avgRating,
          sub: 'Hot target rating',
          icon: Banknote,
          trend: `${noWeb} no-web targets`,
          trendColor: 'text-amber-400',
          iconColor: 'text-green-400',
          iconBg: 'bg-green-500/10 border border-green-500/20',
        },
        {
          title: 'No Website',
          value: noWeb.toLocaleString(),
          sub: 'Pitch opportunity',
          icon: Users,
          trend: `${((noWeb / (leads.length || 1)) * 100).toFixed(0)}%`,
          trendColor: 'text-red-400',
          iconColor: 'text-red-400',
          iconBg: 'bg-red-500/10 border border-red-500/20',
        },
      ]
    : [
        { title: 'Opportunity Index', value: '84.2', sub: 'vs last month', icon: Target, trend: '+2.4%' },
        { title: 'Active Pipeline', value: leads.length.toLocaleString(), sub: 'Total prospects', icon: Users, trend: 'stable' },
        { title: 'Web Pitch Potential', value: noWeb.toLocaleString(), sub: 'High-value targets', icon: Banknote, trend: 'urgent' },
        { title: 'Hot Leads', value: hot.toLocaleString(), sub: 'Priority prospects', icon: Zap, trend: 'active' },
      ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="card-premium relative overflow-hidden group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2 rounded-lg ${stat.iconBg} ${stat.iconColor}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                stat.trend === 'urgent'
                  ? 'bg-red-500/10 text-red-400'
                  : stat.trend === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              {stat.trend}
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-text-muted text-[12px] uppercase font-bold tracking-wider">{stat.title}</h3>
            <div className="text-3xl font-bold text-text-primary tnum">{stat.value}</div>
            <p className={`text-[12px] ${stat.trendColor}`}>{stat.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
