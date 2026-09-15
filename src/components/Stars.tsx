import { Star } from 'lucide-react'
import { ratingNum } from '../lib/helpers'

export default function Stars({
  rating,
  className = '',
}: {
  rating: string | null
  className?: string
}) {
  const r = ratingNum(rating)
  if (r === null)
    return (
      <span className={`text-xs text-text-tertiary ${className}`}>—</span>
    )
  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      title={`Rated ${rating}`}
    >
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="tnum text-[13px] font-semibold text-text-primary">
        {r.toFixed(1)}
      </span>
    </span>
  )
}
