import { Market } from '../types'

const MAX_REASONABLE_SPREAD = 0.5
const ILLIQUID_ASK_THRESHOLD = 0.95
const LOW_PRICE_ASK_CEILING = 0.5
const VALID_PRICE_MIN = 0.001
const VALID_PRICE_MAX = 0.999

function getPolymarketPrice(m: Record<string, unknown>): number {
  const bid = m.bestBid as number | null
  const ask = m.bestAsk as number | null
  const spread = (bid != null && ask != null) ? ask - bid : 1

  if (bid != null && ask != null && spread < MAX_REASONABLE_SPREAD) {
    return (bid + ask) / 2
  }
  if (bid != null && bid > 0 && bid < 1) return bid
  if (ask != null && ask > 0 && ask < ILLIQUID_ASK_THRESHOLD) return ask
  if (ask != null && ask >= ILLIQUID_ASK_THRESHOLD && (bid == null || bid === 0)) return 0

  const rawPrices = m.outcomePrices as string | null
  if (rawPrices && rawPrices !== '[]') {
    try {
      const p = JSON.parse(rawPrices)
      const yesPrice = parseFloat(p[0] || '0')
      if (yesPrice > VALID_PRICE_MIN && yesPrice < VALID_PRICE_MAX) return yesPrice
    } catch { /* ignore */ }
  }
  if (bid === 0 && ask === 1) return 0
  if (ask != null && ask > 0 && ask < LOW_PRICE_ASK_CEILING) return ask
  return 0
}

export async function fetchPolymarket(limit: number, offset: number): Promise<Market[]> {
  const res = await fetch(
    `/api/polymarket?endpoint=events&active=true&closed=false&limit=${limit}&offset=${offset}&order=volume24hr&ascending=false`
  )
  if (!res.ok) throw new Error('Failed to fetch Polymarket data')
  const events = await res.json()
  if (!Array.isArray(events)) return []

  const markets: Market[] = []
  for (const event of events) {
    if (!event.markets || event.markets.length === 0) continue
    const hasOpenMarkets = event.markets.some((m: Record<string, unknown>) => !m.closed)
    if (!hasOpenMarkets) continue

    const primaryMarket = event.markets[0]
    let outcomes: { label: string; price: number; tokenId?: string }[] = []

    try {
      const labels = JSON.parse(primaryMarket.outcomes || '[]')
      const prices = JSON.parse(primaryMarket.outcomePrices || '[]')
      const tokens = JSON.parse(primaryMarket.clobTokenIds || '[]')

      if (event.markets.length > 1) {
        const activeSubMarkets = event.markets.filter((m: Record<string, unknown>) => !m.closed)
        const marketsToUse = activeSubMarkets.length > 0 ? activeSubMarkets : event.markets

        outcomes = marketsToUse.map((m: Record<string, unknown>) => {
          const t = JSON.parse((m.clobTokenIds as string) || '[]')
          const price = getPolymarketPrice(m)
          return {
            label: (m.groupItemTitle as string) || (m.question as string) || 'Option',
            price,
            tokenId: t[0] as string,
          }
        })
        const seen = new Map<string, number>()
        outcomes = outcomes.filter((o, i) => {
          const key = o.label
          if (seen.has(key)) {
            const prevIdx = seen.get(key)!
            if (outcomes[prevIdx].price === 0 && o.price > 0) outcomes[prevIdx] = o
            return false
          }
          seen.set(key, i)
          return true
        })
        outcomes.sort((a, b) => b.price - a.price)
      } else {
        outcomes = labels.map((label: string, i: number) => ({
          label,
          price: parseFloat(prices[i] || '0'),
          tokenId: tokens[i],
        }))
      }
    } catch {
      outcomes = [{ label: 'Yes', price: 0.5 }, { label: 'No', price: 0.5 }]
    }

    markets.push({
      id: String(event.id),
      platform: 'polymarket',
      title: event.title,
      description: event.description,
      imageUrl: event.image,
      url: `https://polymarket.com/event/${event.slug}`,
      outcomes,
      volume: event.volume || 0,
      volume24h: event.volume24hr || 0,
      liquidity: event.liquidity || 0,
      status: 'active',
      createdAt: event.startDate,
      endDate: event.endDate,
      slug: event.slug,
      extra: {
        conditionId: primaryMarket.conditionId,
        clobTokenIds: primaryMarket.clobTokenIds,
      },
    })
  }
  return markets
}
