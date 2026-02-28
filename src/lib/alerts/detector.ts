import { Market, PriceSnapshot } from '../types'

export interface PriceChange {
  marketId: string
  platform: Market['platform']
  marketTitle: string
  previousPrice: number
  currentPrice: number
  changePercent: number
}

export function detectPriceChanges(
  markets: Market[],
  snapshots: Map<string, PriceSnapshot>,
  thresholdPercent: number
): PriceChange[] {
  const changes: PriceChange[] = []

  for (const market of markets) {
    const leadPrice = market.outcomes[0]?.price ?? 0
    if (leadPrice <= 0) continue

    const key = `${market.platform}:${market.id}`
    const prev = snapshots.get(key)

    if (!prev) continue

    const changePct = Math.abs(leadPrice - prev.price) * 100
    if (changePct >= thresholdPercent) {
      changes.push({
        marketId: market.id,
        platform: market.platform,
        marketTitle: market.title,
        previousPrice: prev.price,
        currentPrice: leadPrice,
        changePercent: changePct,
      })
    }
  }

  return changes
}

export function updateSnapshots(
  markets: Market[],
  existing: Map<string, PriceSnapshot>
): Map<string, PriceSnapshot> {
  const updated = new Map(existing)

  for (const market of markets) {
    const leadPrice = market.outcomes[0]?.price ?? 0
    if (leadPrice <= 0) continue

    const key = `${market.platform}:${market.id}`
    updated.set(key, {
      marketId: market.id,
      platform: market.platform,
      price: leadPrice,
      timestamp: Date.now(),
    })
  }

  return updated
}
