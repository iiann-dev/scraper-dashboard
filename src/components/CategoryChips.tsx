import { motion } from 'motion/react'
import { springs } from '../lib/motion-tokens'
import { prettyCategory } from '../lib/types'

export default function CategoryChips({
  categories,
  active,
  onChange,
  total,
}: {
  categories: [string, number][]
  active: string | null
  onChange: (c: string | null) => void
  total: number
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <motion.button
        type="button"
        onClick={() => onChange(null)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`rounded-full border px-3 py-1 text-[13px] font-medium transition ${
          active === null
            ? 'border-accent/60 bg-accent/10 text-accent'
            : 'border-border bg-surface-elevated text-text-tertiary hover:border-border hover:text-text-primary'
        }`}
      >
        All <span className="tnum ml-1 opacity-70">{total.toLocaleString()}</span>
      </motion.button>
      {categories.map(([cat, count]) => (
        <motion.button
          key={cat}
          type="button"
          onClick={() => onChange(active === cat ? null : cat)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={springs.snappy}
          className={`rounded-full border px-3 py-1 text-[13px] font-medium transition ${
            active === cat
              ? 'border-accent/60 bg-accent/10 text-accent'
              : 'border-border bg-surface-elevated text-text-tertiary hover:border-border hover:text-text-primary'
          }`}
        >
          {prettyCategory(cat)}{' '}
          <span className="tnum ml-1 opacity-70">
            {count.toLocaleString()}
          </span>
        </motion.button>
      ))}
    </div>
  )
}
