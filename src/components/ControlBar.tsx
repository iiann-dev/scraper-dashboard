import { motion } from 'motion/react'
import { RotateCcw } from 'lucide-react'
import { motionTokens } from '../lib/motion-tokens'
import { prettyCategory } from '../lib/types'
import type { LeadStatus } from '../lib/types'

export default function ControlBar({
  categoryFilter,
  onCategoryFilterChange,
  statusFilter,
  hotFilter,
  onToggleHotFilter,
  density,
  onToggleDensity,
  totalCount,
  hotCount,
  categoryCounts,
  onReset,
}: {
  categoryFilter: string | null
  onCategoryFilterChange: (c: string | null) => void
  statusFilter: LeadStatus | 'all'
  hotFilter: boolean
  onToggleHotFilter: () => void
  density: 'comfortable' | 'compact'
  onToggleDensity: () => void
  totalCount: number
  hotCount: number
  categoryCounts: [string, number][]
  onReset: () => void
}) {
  const hasActiveFilters =
    categoryFilter !== null || statusFilter !== 'all' || hotFilter

  return (
    <motion.div
      initial={{ opacity: 0, y: motionTokens.distance.sm }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.1,
        duration: 0.4,
        ease: motionTokens.easing.smooth,
      }}
      className="bg-surface-card p-4.5 rounded-xl border border-border shadow-sm flex flex-col gap-3.5 select-none"
    >
      {/* Quick Filter Presets Row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
            Quick Filters:
          </span>

          <motion.button
            type="button"
            onClick={() => {
              if (hotFilter) onToggleHotFilter()
              onCategoryFilterChange(null)
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
              !hotFilter && categoryFilter === null
                ? 'bg-accent text-accent-foreground font-semibold shadow-sm'
                : 'text-text-tertiary hover:text-text-primary hover:bg-surface-elevated border border-border'
            }`}
          >
            <span>All ({totalCount.toLocaleString()})</span>
          </motion.button>

          {/* Hot Opportunity Preset */}
          <motion.button
            type="button"
            onClick={onToggleHotFilter}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`px-3 py-1 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all ${
              hotFilter
                ? 'bg-amber-400 text-amber-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-amber-300 hover:bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">
              local_fire_department
            </span>
            <span>Web Pitch ({hotCount.toLocaleString()})</span>
          </motion.button>

          {/* Category Chips */}
          {categoryCounts.map(([cat, count]) => {
            const active = !hotFilter && categoryFilter === cat
            return (
              <motion.button
                key={cat}
                type="button"
                onClick={() => {
                  if (hotFilter) onToggleHotFilter()
                  onCategoryFilterChange(
                    categoryFilter === cat ? null : cat,
                  )
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={`px-3 py-1 rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-all ${
                  active
                    ? 'bg-accent text-accent-foreground font-semibold shadow-sm'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-surface-elevated border border-border'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span>
                  {prettyCategory(cat)} ({count.toLocaleString()})
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Live Scraper badge & Density */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-text-tertiary text-[11.5px]">
            <span className="material-symbols-outlined text-[16px] text-success">
              offline_bolt
            </span>
            <span>DuckDB Live Sync</span>
          </div>

          <div className="h-4 w-px bg-border hidden lg:block" />

          {/* Density toggle */}
          <div className="flex items-center gap-1 bg-surface-elevated p-0.5 rounded-lg border border-border">
            <motion.button
              type="button"
              onClick={() =>
                density !== 'comfortable' && onToggleDensity()
              }
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`p-1 rounded ${
                density === 'comfortable'
                  ? 'bg-surface-card text-accent shadow-xs'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
              title="Comfortable Row Height"
            >
              <span className="material-symbols-outlined text-[18px]">
                table_rows
              </span>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => density !== 'compact' && onToggleDensity()}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`p-1 rounded ${
                density === 'compact'
                  ? 'bg-surface-card text-accent shadow-xs'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
              title="Compact Row Height"
            >
              <span className="material-symbols-outlined text-[18px]">
                density_medium
              </span>
            </motion.button>
          </div>

          {hasActiveFilters && (
            <motion.button
              type="button"
              onClick={onReset}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-2.5 py-1 bg-surface-elevated hover:bg-surface-pop text-text-tertiary hover:text-text-primary rounded-lg text-[11.5px] font-medium border border-border flex items-center gap-1 transition-colors"
              title="Reset Filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
