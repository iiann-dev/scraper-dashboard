import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { isHot } from '../lib/helpers'
import type { Lead, LeadStatus } from '../lib/types'

const CACHE_KEY = 'leadspot_leads_cache_v2'
const META_KEY = 'leadspot_leads_meta_v2'
const PAGE_SIZE = 1000

interface CacheMeta {
  lastSync: string
  totalCount: number
}

function loadCachedLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('[cache] Failed to read cached leads:', e)
  }
  return []
}

function saveCachedLeads(leads: Lead[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(leads))
    const meta: CacheMeta = {
      lastSync: new Date().toISOString(),
      totalCount: leads.length,
    }
    localStorage.setItem(META_KEY, JSON.stringify(meta))
  } catch (e) {
    console.warn('[cache] Failed to persist leads:', e)
  }
}

export function useLeads(hotOnly = false) {
  const [all, setAll] = useState<Lead[]>(() => loadCachedLeads())
  // If cache is present, loading starts as FALSE -> instant zero-millisecond render!
  const [loading, setLoading] = useState<boolean>(() => all.length === 0)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Full fetch helper
  const fetchFull = useCallback(async () => {
    let rows: Lead[] = []
    let from = 0
    for (;;) {
      const { data, error: err } = await supabase
        .from('leads')
        .select('*')
        .order('id', { ascending: true })
        .range(from, from + PAGE_SIZE - 1)
      if (err) throw err
      const batch = (data ?? []) as Lead[]
      rows = rows.concat(batch)
      if (batch.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }
    return rows
  }, [])

  // Smart background sync (delta sync if cache exists, otherwise full fetch)
  const syncLeads = useCallback(
    async (forceFull = false) => {
      setIsSyncing(true)
      setError(null)
      try {
        const cachedMetaRaw = localStorage.getItem(META_KEY)
        const cachedMeta: CacheMeta | null = cachedMetaRaw ? JSON.parse(cachedMetaRaw) : null

        if (!forceFull && cachedMeta?.lastSync && all.length > 0) {
          // Check if any leads have been touched or pushed since last sync
          const { data: modified, error: deltaErr } = await supabase
            .from('leads')
            .select('*')
            .or(`last_touched_at.gt.${cachedMeta.lastSync},pushed_at.gt.${cachedMeta.lastSync}`)

          if (!deltaErr && modified && modified.length > 0) {
            // Merge updated rows
            const deltaMap = new Map<number, Lead>(modified.map((l: Lead) => [l.id, l]))
            setAll((prev) => {
              const updated = prev.map((l) => deltaMap.get(l.id) ?? l)
              // check for any new ids
              const existingIds = new Set(prev.map((l) => l.id))
              for (const m of modified) {
                if (!existingIds.has(m.id)) updated.push(m)
              }
              updated.sort((a, b) => a.id - b.id)
              saveCachedLeads(updated)
              return updated
            })
          } else if (!deltaErr && modified && modified.length === 0) {
            // No changes, update meta timestamp
            cachedMeta.lastSync = new Date().toISOString()
            localStorage.setItem(META_KEY, JSON.stringify(cachedMeta))
          } else {
            // Delta error or count mismatch fallback -> do full fetch
            const fresh = await fetchFull()
            setAll(fresh)
            saveCachedLeads(fresh)
          }
        } else {
          // First time or forced refresh
          const fresh = await fetchFull()
          setAll(fresh)
          saveCachedLeads(fresh)
        }
      } catch (e) {
        console.error('[sync] Sync error:', e)
        if (all.length === 0) {
          setError(e instanceof Error ? e.message : 'Failed to load leads')
        }
      } finally {
        setLoading(false)
        setIsSyncing(false)
      }
    },
    [all.length, fetchFull],
  )

  useEffect(() => {
    syncLeads()
  }, [syncLeads])

  // Real-time updates subscription from Supabase
  useEffect(() => {
    const channel = supabase
      .channel('leads-live-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads' }, (payload) => {
        const next = payload.new as Lead
        setAll((prev) => {
          const updated = prev.map((l) => (l.id === next.id ? { ...l, ...next } : l))
          saveCachedLeads(updated)
          return updated
        })
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        const next = payload.new as Lead
        setAll((prev) => {
          const updated = [...prev, next].sort((a, b) => a.id - b.id)
          saveCachedLeads(updated)
          return updated
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Optimistic UI updates
  const updateStatus = useCallback(async (id: number, status: LeadStatus) => {
    const now = new Date().toISOString()
    // 1. Immediate optimistic UI update
    setAll((prev) => {
      const updated = prev.map((l) => (l.id === id ? { ...l, status, last_touched_at: now } : l))
      saveCachedLeads(updated)
      return updated
    })

    // 2. Persist to Supabase
    const { error: err } = await supabase
      .from('leads')
      .update({ status, last_touched_at: now })
      .eq('id', id)

    if (err) {
      console.error('[status] Failed to update lead status:', err)
      throw err
    }
  }, [])

  const bulkStatus = useCallback(async (ids: number[], status: LeadStatus) => {
    if (ids.length === 0) return
    const now = new Date().toISOString()
    const idSet = new Set(ids)

    // 1. Immediate optimistic UI update
    setAll((prev) => {
      const updated = prev.map((l) => (idSet.has(l.id) ? { ...l, status, last_touched_at: now } : l))
      saveCachedLeads(updated)
      return updated
    })

    // 2. Persist to Supabase
    const { error: err } = await supabase
      .from('leads')
      .update({ status, last_touched_at: now })
      .in('id', ids)

    if (err) {
      console.error('[bulk] Failed bulk status update:', err)
      throw err
    }
  }, [])

  const saveNotes = useCallback(async (id: number, notes: string) => {
    // 1. Immediate optimistic UI update
    setAll((prev) => {
      const updated = prev.map((l) => (l.id === id ? { ...l, notes } : l))
      saveCachedLeads(updated)
      return updated
    })

    // 2. Persist to Supabase
    const { error: err } = await supabase.from('leads').update({ notes }).eq('id', id)
    if (err) {
      console.error('[notes] Failed to update lead notes:', err)
      throw err
    }
  }, [])

  const categories = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of all) {
      const c = (l.category ?? 'uncategorized').trim() || 'uncategorized'
      map.set(c, (map.get(c) ?? 0) + 1)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [all])

  const leads = useMemo(() => (hotOnly ? all.filter(isHot) : all), [all, hotOnly])

  return {
    leads,
    all,
    loading,
    isSyncing,
    error,
    refetch: () => syncLeads(true),
    updateStatus,
    bulkStatus,
    saveNotes,
    categories,
  }
}
