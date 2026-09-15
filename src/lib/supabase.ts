import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_KEY as string | undefined

if (!url || !key) {
  console.warn('[supabase] Missing VITE_SUPABASE_URL / VITE_SUPABASE_KEY — dashboard will run on empty data.')
}

export const supabase = createClient(url ?? '', key ?? '')
