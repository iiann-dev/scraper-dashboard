import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import IntelligenceSurface from './components/IntelligenceSurface'
import ControlBar from './components/ControlBar'
import ProspectTable from './components/ProspectTable'
import ProspectDrawer from './components/ProspectDrawer'
import BatchActionBar from './components/BatchActionBar'
import KanbanBoard from './components/KanbanBoard'
import PerformanceView from './views/PerformanceView'
import { useLeads } from './hooks/useLeads'
import { matchesSearch, isHot } from './lib/helpers'
import { prettyCategory, type Lead, type LeadStatus, type View } from './lib/types'

const HASH_MAP: Record<string, View> = {
  '#/leads': 'leads',
  '#/kanban': 'kanban',
  '#/hot': 'hot',
  '#/performance': 'performance',
}

function getViewFromHash(): View {
  return HASH_MAP[typeof window !== 'undefined' ? window.location.hash : ''] ?? 'leads'
}

import CommandPalette from './components/CommandPalette'

export default function App() {
  const [view, setView] = useState<View>(() => getViewFromHash())
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { all, loading, error, updateStatus, bulkStatus, saveNotes } = useLeads()

  // Filter States
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [hotOnly, setHotOnly] = useState(false)
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  // Whether the current view is a pitch-only surface (Directory / Priority)
  const isPitchView = view === 'leads' || view === 'hot'


  // Selection & Drawer States
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)

  // Sync hash routing
  useEffect(() => {
    const handleHash = () => {
      const v = getViewFromHash()
      setView(v)
      if (v === 'hot') setHotOnly(true)
      else if (v === 'leads') setHotOnly(false)
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const navigate = (v: View) => {
    window.location.hash = `#/${v}`
    setView(v)
    if (v === 'hot') setHotOnly(true)
    else if (v === 'leads') setHotOnly(false)
  }

  // Categories & Counts
  const categoryCounts = useMemo<[string, number][]>(() => {
    const map = new Map<string, number>()
    for (const l of all) {
      const c = (l.category ?? 'uncategorized').trim() || 'uncategorized'
      map.set(c, (map.get(c) ?? 0) + 1)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [all])

  const hotCount = useMemo(() => all.filter(isHot).length, [all])

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return all.filter((l) => {
      // D5: Directory & Priority show only untouched leads (pitch targets).
      // Leads with an active sales status live only in Pipeline / Intelligence.
      if (isPitchView && l.status !== 'not contacted yet') return false
      if (hotOnly && !isHot(l)) return false
      if (cityFilter && l.category !== cityFilter) return false
      if (statusFilter !== 'all' && l.status !== statusFilter) return false
      if (!matchesSearch(l, search)) return false
      return true
    })
  }, [all, isPitchView, hotOnly, cityFilter, statusFilter, search])

  // Selection helpers
  const handleToggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allFilteredIds = filteredLeads.map((l) => l.id)
  const allSelected =
    allFilteredIds.length > 0 &&
    allFilteredIds.every((id) => selectedIds.has(id))
  const someSelected = allFilteredIds.some((id) => selectedIds.has(id))

  const handleToggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        for (const id of allFilteredIds) next.delete(id)
      } else {
        for (const id of allFilteredIds) next.add(id)
      }
      return next
    })
  }

  // Status Change
  const handleStatusChange = async (id: number, s: LeadStatus) => {
    setUpdatingId(id)
    try {
      await updateStatus(id, s)
      if (activeLead && activeLead.id === id) {
        setActiveLead((prev) =>
          prev ? { ...prev, status: s, last_touched_at: new Date().toISOString() } : null,
        )
      }
    } finally {
      setUpdatingId(null)
    }
  }

  // Bulk Status Change
  const handleBulkStatus = async (s: LeadStatus) => {
    if (selectedIds.size === 0) return
    setBulkBusy(true)
    try {
      await bulkStatus([...selectedIds], s)
      setSelectedIds(new Set())
    } finally {
      setBulkBusy(false)
    }
  }

  // Export CSV
  const handleExportCsv = (rowsToExport: Lead[] = filteredLeads) => {
    if (rowsToExport.length === 0) return
    const headers = [
      'ID', 'Name', 'Rating', 'Category', 'Address', 'Phone',
      'Website', 'Maps', 'Status', 'Notes', 'Last Touched',
    ]
    const rows = rowsToExport.map((l) => [
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
    link.download = `leadspot-leads-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Drawer Next/Prev Navigation
  const currentLeadIndex = activeLead
    ? filteredLeads.findIndex((l) => l.id === activeLead.id)
    : -1
  const hasPrev = currentLeadIndex > 0
  const hasNext =
    currentLeadIndex >= 0 && currentLeadIndex < filteredLeads.length - 1

  const handlePrevLead = () => {
    if (hasPrev) setActiveLead(filteredLeads[currentLeadIndex - 1])
  }

  const handleNextLead = () => {
    if (hasNext) setActiveLead(filteredLeads[currentLeadIndex + 1])
  }

  // Command Palette listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="app-container bg-bg-base text-text-body font-sans">
      <CommandPalette 
        isOpen={paletteOpen} 
        onClose={() => setPaletteOpen(false)} 
        onNavigate={navigate}
      />
      <Sidebar
        view={view}
        onNavigate={navigate}
        totalLeads={all.length}
        hotLeads={hotCount}
      />

      <div className="main-content">
        {/* Header */ }
        <Header
          search={search}
          onSearchChange={setSearch}
          cityFilter={cityFilter}
          onCityFilterChange={setCityFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onExportCsv={() => handleExportCsv(filteredLeads)}
          totalPlaces={all.length}
        />

        {/* Canvas Body */ }
        <main className="scroll-container w-full min-w-[800px] flex flex-col gap-6">
          {loading ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-28 text-text-tertiary"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 border-2 border-accent/30 border-t-accent rounded-full mb-4"
                />
                <p className="text-base font-semibold text-text-primary">
                  Loading Google Maps Leads...
                </p>
                <p className="text-xs text-text-tertiary mt-1 tnum">
                  Fetching {all.length.toLocaleString()} prospects from Supabase
                </p>
              </motion.div>
            </AnimatePresence>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-error-bg border border-error-border text-error text-center"
            >
              <p className="font-bold">Failed to load data:</p>
              <p className="text-sm mt-1">{error}</p>
            </motion.div>
          ) : (
            <>
              {/* View 1: Directory / All Places */}
              {(view === 'leads' || view === 'hot') && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-5"
                  >
                    {/* D2: IntelligenceSurface only on Priority (hot) view, pitch-themed */}
{view === 'hot' && <IntelligenceSurface leads={all} pitchMode />}

                    <ControlBar
                      categoryFilter={cityFilter}
                      onCategoryFilterChange={setCityFilter}
                      statusFilter={statusFilter}
                      hotFilter={hotOnly}
                      onToggleHotFilter={() => {
                        const next = !hotOnly
                        setHotOnly(next)
                        window.location.hash = next ? '#/hot' : '#/leads'
                        setView(next ? 'hot' : 'leads')
                      }}
                      density={density}
                      onToggleDensity={() =>
                        setDensity(
                          density === 'comfortable' ? 'compact' : 'comfortable',
                        )
                      }
                      totalCount={all.length}
                      hotCount={hotCount}
                      categoryCounts={categoryCounts}
                      onReset={() => {
                        setSearch('')
                        setCityFilter(null)
                        setStatusFilter('all')
                        setHotOnly(false)
                        window.location.hash = '#/leads'
                        setView('leads')
                      }}
                    />

                    <ProspectTable
                      rows={filteredLeads}
                      priority={view === 'hot'}
                      selected={selectedIds}
                      onToggle={handleToggle}
                      onToggleAll={handleToggleAll}
                      allSelected={allSelected}
                      someSelected={someSelected}
                      updatingId={updatingId}
                      onStatusChange={handleStatusChange}
                      onOpenDrawer={(lead) => setActiveLead(lead)}
                      density={density}
                    />
                  </motion.div>
                </AnimatePresence>
              )}

              {/* View 2: Pipeline Kanban Board */}
              {view === 'kanban' && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="kanban"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <KanbanBoard
                      leads={filteredLeads}
                      onOpenDrawer={(lead) => setActiveLead(lead)}
                    />
                  </motion.div>
                </AnimatePresence>
              )}

              {/* View 3: Sales Performance & Analytics */}
              {view === 'performance' && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="performance"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PerformanceView
                      leads={all}
                      onOpenDrawer={(lead) => setActiveLead(lead)}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="h-12 px-8 flex items-center justify-between text-[11.5px] text-text-tertiary select-none">
          <span>LeadSpot B2B Prospecting Engine · Built for Alfiano</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
            DuckDB to Supabase Real-time Sync
          </span>
        </footer>
      </div>

      {/* Slide-over Inspection Drawer */}
      <ProspectDrawer
        lead={activeLead}
        onClose={() => setActiveLead(null)}
        onUpdateStatus={handleStatusChange}
        onSaveNotes={saveNotes}
        onPrevLead={handlePrevLead}
        onNextLead={handleNextLead}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />

      {/* Floating Batch Action Bar */}
      <BatchActionBar
        selectedCount={selectedIds.size}
        onApplyStatus={handleBulkStatus}
        onExportSelected={() => {
          const selectedRows = all.filter((l) => selectedIds.has(l.id))
          handleExportCsv(selectedRows)
        }}
        onClear={() => setSelectedIds(new Set())}
        busy={bulkBusy}
      />
    </div>
  )
}
