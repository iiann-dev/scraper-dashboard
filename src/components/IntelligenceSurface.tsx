import { motion } from 'motion/react'
import { Banknote, Users, Target, Zap } from 'lucide-react'
import type { Lead } from '../lib/types'

export default function IntelligenceSurface({ leads }: { leads: Lead[] }) {
  const hot = leads.filter(l => (typeof l.rating === 'number' ? l.rating : parseFloat(l.rating as any || 0)) >= 4.5).length
  const noWeb = leads.filter(l => !l.website).length
  
  const stats = [
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
          className="card-premium glass-surface relative overflow-hidden group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-lg bg-bg-base/50 border border-white/5 text-accent">
              <stat.icon className="w-5 h-5" />
            </div>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
              stat.trend === 'urgent' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {stat.trend}
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-text-muted text-[12px] uppercase font-bold tracking-wider">{stat.title}</h3>
            <div className="text-3xl font-bold text-text-title tnum">{stat.value}</div>
            <p className="text-[12px] text-text-muted">{stat.sub}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}