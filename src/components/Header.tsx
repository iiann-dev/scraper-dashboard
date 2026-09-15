import { Search, Download } from 'lucide-react'
import type { LeadStatus } from '../lib/types'

export default function Header({
  search,
  onSearchChange,
  onExportCsv,
}: {
  search: string
  onSearchChange: (q: string) => void
  cityFilter: string | null
  onCityFilterChange: (c: string | null) => void
  statusFilter: LeadStatus | 'all'
  onStatusFilterChange: (s: LeadStatus | 'all') => void
  onExportCsv: () => void
  totalPlaces?: number
}) {
  return (
    <header className="fixed top-0 left-64 right-0 h-20 bg-bg-base/80 backdrop-blur-md border-b border-white/5 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search leads..."
            className="w-full h-10 pl-10 pr-20 bg-bg-surface text-text-title rounded-xl border border-white/5 focus:border-accent focus:outline-none transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 bg-bg-elevated px-1.5 py-0.5 rounded text-[10px] font-mono text-text-muted border border-white/5">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onExportCsv}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-soft text-white rounded-xl shadow-lg shadow-accent/20 transition-all font-medium text-[13px]"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>
    </header>
  )
}