import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Database, LayoutDashboard, TrendingUp, Zap } from 'lucide-react'

export default function CommandPalette({ isOpen, onClose, onNavigate }: { 
  isOpen: boolean; 
  onClose: () => void;
  onNavigate: (view: string) => void;
}) {
  const [query, setQuery] = useState('')
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        isOpen ? onClose() : null // Open logic needs to be in App.tsx
      }
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg bg-bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-surface"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 border-b border-white/5">
            <Search className="w-5 h-5 text-text-muted" />
            <input 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search leads, categories, or views..."
              className="w-full py-4 bg-transparent outline-none text-text-title text-base"
            />
            <div className="text-[10px] text-text-muted bg-bg-elevated px-2 py-0.5 rounded border border-white/5">ESC</div>
          </div>
          <div className="p-2">
            <div className="px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">Views</div>
            {[
              { id: 'leads', label: 'Directory', icon: Database },
              { id: 'kanban', label: 'Pipeline', icon: LayoutDashboard },
              { id: 'performance', label: 'Performance', icon: TrendingUp },
              { id: 'hot', label: 'Hot Leads', icon: Zap },
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent-soft text-text-body hover:text-text-title transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}