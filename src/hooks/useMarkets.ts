'use client'
import { useState, useEffect, useCallback } from 'react'
import { Market, Platform } from '@/lib/types'
import { fetchPolymarket } from '@/lib/platforms/polymarket'
import { fetchKalshi } from '@/lib/platforms/kalshi'
import { fetchOpinion } from '@/lib/platforms/opinion'
import { MARKET_POLL_INTERVAL } from '@/lib/constants'

export function useMarkets(platform: Platform | 'all' = 'all') {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    const results: Market[] = []
    const errors: string[] = []
    const platforms: Platform[] = platform === 'all' ? ['polymarket', 'kalshi', 'opinion'] : [platform]

    const promises = platforms.map(async (p) => {
      try {
        switch (p) {
          case 'polymarket': {
            const page1 = await fetchPolymarket(50, 0)
            const page2 = await fetchPolymarket(50, 50)
            return [...page1, ...page2]
          }
          case 'kalshi': {
            const { markets: page1, cursor: c1 } = await fetchKalshi(50)
            const { markets: page2 } = c1 ? await fetchKalshi(50, c1) : { markets: [] }
            return [...page1, ...page2]
          }
          case 'opinion': {
            const page1 = await fetchOpinion(20, 1)
            const page2 = await fetchOpinion(20, 2)
            return [...page1, ...page2]
          }
        }
      } catch (e) {
        errors.push(`${p}: ${e instanceof Error ? e.message : 'Unknown error'}`)
        return []
      }
    })

    const allResults = await Promise.allSettled(promises)

    for (const r of allResults) {
      if (r.status === 'fulfilled' && r.value) {
        results.push(...r.value)
      }
    }

    const filtered = results.filter(m => {
      if (m.status !== 'active') return false
      const leadPrice = m.outcomes[0]?.price ?? 0.5
      if (leadPrice > 0.95 || leadPrice < 0.05) return false
      return true
    })

    filtered.sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0))
    setMarkets(filtered)

    if (errors.length > 0 && results.length === 0) {
      setError(errors.join('; '))
    }

    setLoading(false)

  }, [platform])

  useEffect(() => {
    const initialId = window.setTimeout(fetchAll, 0)
    const intervalId = window.setInterval(fetchAll, MARKET_POLL_INTERVAL)
    return () => {
      window.clearTimeout(initialId)
      window.clearInterval(intervalId)
    }
  }, [fetchAll])

  return { markets, loading, error, refresh: fetchAll }
}
