'use client'
import { MarketCard } from './MarketCard'
import { Market, PriceSnapshot } from '@/lib/types'

interface MarketGridProps {
  markets: Market[]
  loading: boolean
  error: string | null
  snapshots: Record<string, PriceSnapshot>
}

export function MarketGrid({ markets, loading, error, snapshots }: MarketGridProps) {
  if (loading && markets.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-3 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="h-4 bg-muted/50 rounded w-3/4" />
              <div className="h-4 w-4 bg-muted/30 rounded" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-3 bg-muted/40 rounded w-20" />
                <div className="h-2.5 bg-muted/30 rounded-full flex-1" />
                <div className="h-3 bg-muted/40 rounded w-10" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 bg-muted/40 rounded w-24" />
                <div className="h-2.5 bg-muted/20 rounded-full flex-1" />
                <div className="h-3 bg-muted/40 rounded w-10" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 bg-muted/40 rounded w-16" />
                <div className="h-2.5 bg-muted/15 rounded-full flex-1" />
                <div className="h-3 bg-muted/40 rounded w-10" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="h-4 w-20 bg-muted/30 rounded-full" />
              <div className="h-3 w-16 bg-muted/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && markets.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    )
  }

  if (markets.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">No markets found in this range.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {markets.map((market, idx) => (
        <MarketCard
          key={`${market.platform}:${market.id}:${idx}`}
          market={market}
          snapshot={snapshots[`${market.platform}:${market.id}`]}
        />
      ))}
    </div>
  )
}
