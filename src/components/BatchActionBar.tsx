import { motion, AnimatePresence } from 'motion/react'
import { springs } from '../lib/motion-tokens'
import { CheckCircle, Download, X } from 'lucide-react'
import { STATUS_ORDER, type LeadStatus } from '../lib/types'
import { STATUS_META } from './StatusPill'

export default function BatchActionBar({
  selectedCount,
  onApplyStatus,
  onExportSelected,
  onClear,
  busy = false,
}: {
  selectedCount: number
  onApplyStatus: (s: LeadStatus) => void
  onExportSelected: () => void
  onClear: () => void
  busy?: boolean
}) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={springs.gentle}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-surface-card border border-border shadow-2xl shadow-black/80 backdrop-blur-xl">
            {/* Left Count */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-blue-500/10 text-accent border border-blue-500/30 px-3 py-1 rounded-lg">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span className="text-[13px] font-bold tnum">
                  {selectedCount.toLocaleString()} places selected
                </span>
              </div>
              <span className="text-text-tertiary text-[12px] hidden md:inline">
                Bulk Sales Actions:
              </span>
            </div>

            {/* Right Status Actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {STATUS_ORDER.filter((s) => s !== 'not contacted yet').map(
                (st) => {
                  const meta = STATUS_META[st]
                  return (
                    <motion.button
                      key={st}
                      type="button"
                      disabled={busy}
                      onClick={() => onApplyStatus(st)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={springs.snappy}
                      className={`h-8 px-2.5 rounded-lg text-[11.5px] font-semibold border transition-all disabled:opacity-50 ${meta.bg} ${meta.border} ${meta.text} hover:brightness-125`}
                    >
                      {meta.label}
                    </motion.button>
                  )
                },
              )}

              <div className="w-px h-6 bg-border mx-1" />

              <motion.button
                type="button"
                onClick={onExportSelected}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-8 px-3 rounded-lg bg-accent text-accent-foreground text-[11.5px] font-semibold flex items-center gap-1 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={onClear}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-8 w-8 rounded-lg bg-surface-elevated text-text-tertiary hover:text-text-primary hover:bg-surface-pop flex items-center justify-center transition-colors ml-1"
                title="Clear Selection"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
