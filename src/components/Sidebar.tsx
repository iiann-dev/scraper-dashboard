import { motion } from 'motion/react'
import { 
  Database, 
  LayoutDashboard, 
  TrendingUp, 
  Zap, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react'
import { useTheme } from '../lib/theme'
import type { View } from '../lib/types'

export default function Sidebar({
  view,
  onNavigate,
  totalLeads,
  hotLeads,
}: {
  view: View
  onNavigate: (v: View) => void
  totalLeads: number
  hotLeads: number
}) {
  const { theme, toggleTheme } = useTheme()

  const items = [
    { id: 'leads', label: 'Directory', icon: Database, color: 'text-blue-400' },
    { id: 'kanban', label: 'Pipeline', icon: LayoutDashboard, color: 'text-indigo-400' },
    { id: 'performance', label: 'Intelligence', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'hot', label: 'Priority', icon: Zap, color: 'text-amber-400' },
  ]

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-bg-base border-r border-white/5 flex flex-col z-50">
      <div className="p-8">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20 transition-transform group-hover:scale-110">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-title leading-tight">LeadSpot</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold">Workspace</p>
          </div>
        </div>
      </div>

      {/* Scrollable nav — grows to fill space, never clips the footer block */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-1 pb-2">
        {items.map((item) => {
          const active = view === item.id || (item.id === 'leads' && view === 'hot' && false)
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as View)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                active 
                  ? 'bg-accent-soft text-text-title' 
                  : 'text-text-body hover:bg-white/5 hover:text-text-title'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-accent' : 'text-text-muted'}`} />
              <span className="text-[13px] font-medium">{item.label}</span>
              {active && (
                <motion.div 
                  layoutId="active-pill"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Pinned footer block — shrink-0 so it never gets clipped on short viewports */}
      <div className="shrink-0 px-6 py-8 space-y-6">
        <div className="p-4 rounded-2xl bg-bg-surface border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-text-muted">Database</span>
            <span className="text-[11px] font-mono text-text-title bg-white/5 px-1.5 py-0.5 rounded uppercase">Live</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-body">Total Leads</span>
              <span className="font-bold text-text-title tnum">{totalLeads.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-body">High Intent</span>
              <span className="font-bold text-accent tnum">{hotLeads.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-muted hover:text-text-title hover:bg-white/5 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-[12px] font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-muted hover:text-text-title hover:bg-white/5 transition-all">
            <Settings className="w-4 h-4" />
            <span className="text-[12px] font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all">
            <LogOut className="w-4 h-4" />
            <span className="text-[12px] font-medium">Logout</span>
          </button>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-indigo-400 flex items-center justify-center text-white text-[11px] font-bold shadow-lg shadow-accent/20">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-title leading-none">Alfiano S.</span>
            <span className="text-[10px] text-text-muted mt-1">Lead Architect</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
