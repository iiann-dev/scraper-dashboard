import { HOT_RATING_THRESHOLD, type Lead } from './types'

/** Strip everything except digits and leading + */
export function digitsOf(phone: string | null | undefined): string {
  if (!phone) return ''
  return phone.replace(/[^\d+]/g, '')
}

/** E.164-ish digits without + (wa.me / tel: friendly) */
export function bareDigits(phone: string | null | undefined): string {
  const d = digitsOf(phone).replace(/^\+/, '')
  // normalize Indonesian 08xx → 628xx
  if (d.startsWith('08')) return `62${d.slice(1)}`
  if (d.startsWith('8') && (d.length === 10 || d.length === 11 || d.length === 12)) return `62${d}`
  return d
}

/** Region guess for smart actions: ID/AU get WhatsApp, US doesn't */
export type Region = 'id' | 'au' | 'us' | 'other' | 'none'

export function guessRegion(phone: string | null | undefined): Region {
  const d = bareDigits(phone)
  if (!d) return 'none'
  if (d.startsWith('62') || d.startsWith('08')) return 'id'
  if (d.startsWith('61')) return 'au'
  if (d.startsWith('1') && d.length >= 10) return 'us'
  return 'other'
}

export function whatsappUrl(phone: string | null | undefined): string | null {
  const d = bareDigits(phone)
  if (!d) return null
  return `https://wa.me/${d}`
}

export function telUrl(phone: string | null | undefined): string | null {
  const d = digitsOf(phone)
  if (!d) return null
  return `tel:${d}`
}

export function ratingNum(rating: string | null | undefined): number | null {
  if (!rating) return null
  const n = parseFloat(rating)
  return Number.isFinite(n) ? n : null
}

export function hasWebsite(lead: Lead): boolean {
  return Boolean(lead.website && lead.website.trim() !== '')
}

export function hasPhone(lead: Lead): boolean {
  return Boolean(bareDigits(lead.phone))
}

/** Hot lead = no website + high rating (per brief: ≥ 4.5) */
export function isHot(lead: Lead): boolean {
  const r = ratingNum(lead.rating)
  return !hasWebsite(lead) && r !== null && r >= HOT_RATING_THRESHOLD
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return '—'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return '—'
  const s = Math.floor((Date.now() - then) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.floor(mo / 12)}y ago`
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Multi-word AND search across name, address, phone, category, notes */
export function matchesSearch(lead: Lead, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const hay = [lead.name, lead.address, lead.phone, lead.category, lead.notes]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return needle.split(/\s+/).every((w) => hay.includes(w))
}
