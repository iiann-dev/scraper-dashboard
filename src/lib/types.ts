export type LeadStatus =
  | 'not contacted yet'
  | 'contacted'
  | 'follow up'
  | 'interested'
  | 'won'
  | 'lost'
  | 'ghosting'

export interface Lead {
  id: number
  name: string
  rating: string | null
  category: string | null
  address: string | null
  website: string | null
  place_url: string | null
  phone: string | null
  tags: string[] | null
  status: LeadStatus
  notes: string | null
  last_touched_at: string | null
  pushed_at: string | null
}

/** Pipeline sort order — matches real sales funnel */
export const STATUS_ORDER: LeadStatus[] = [
  'not contacted yet',
  'contacted',
  'follow up',
  'interested',
  'won',
  'lost',
  'ghosting',
]

export const TERMINAL_STATUSES: LeadStatus[] = ['won', 'lost', 'ghosting']

export const HOT_RATING_THRESHOLD = 4.5

export type View = 'leads' | 'kanban' | 'hot' | 'performance'

export const CATEGORY_LABELS: Record<string, string> = {
  'cafe sydney': 'Cafe Sydney',
  'cafe sby': 'Cafe Surabaya',
  'cafe nyc': 'Cafe NYC',
  'cafe texas': 'Cafe Texas',
}

export function prettyCategory(cat: string | null): string {
  if (!cat) return 'Uncategorized'
  return CATEGORY_LABELS[cat] ?? cat
}

/** Region labels for the scraper — displayed to the user */
export const REGION_LABELS: Record<string, string> = {
  'cafe sydney': 'Sydney',
  'cafe sby': 'Surabaya',
  'cafe nyc': 'New York',
  'cafe texas': 'Texas',
}

export function regionLabel(cat: string | null): string {
  if (!cat) return 'Unknown'
  return REGION_LABELS[cat] ?? 'Unknown'
}
