import { Market } from '../types'

export async function fetchKalshi(limit: number, cursor?: string): Promise<{ markets: Market[]; cursor?: string }> {
  let url = `/api/kalshi?endpoint=events&status=open&limit=${limit}&with_nested_markets=true`
  if (cursor) url += `&cursor=${cursor}`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch Kalshi data')
  const data = await res.json()

  const markets: Market[] = []
  for (const event of data.events || []) {
    const eventMarkets = event.markets || []
    if (eventMarkets.length === 0) continue

    const primary = eventMarkets[0]
    let outcomes: { label: string; price: number; tokenId?: string }[]

    if (eventMarkets.length === 1) {
      const yesBid = primary.yes_bid_dollars ? parseFloat(primary.yes_bid_dollars) : (primary.yes_bid || 0) / 100
      const yesAsk = primary.yes_ask_dollars ? parseFloat(primary.yes_ask_dollars) : (primary.yes_ask || 0) / 100
      const yesPrice = (yesBid > 0 && yesAsk > 0) ? (yesBid + yesAsk) / 2 : (yesAsk || yesBid || 0.5)
      outcomes = [
        { label: 'Yes', price: yesPrice, tokenId: primary.ticker },
        { label: 'No', price: 1 - yesPrice, tokenId: primary.ticker },
      ]
    } else {
      outcomes = eventMarkets.slice(0, 10).map((m: Record<string, unknown>) => {
        const bid = m.yes_bid_dollars ? parseFloat(m.yes_bid_dollars as string) : ((m.yes_bid as number) || 0) / 100
        const ask = m.yes_ask_dollars ? parseFloat(m.yes_ask_dollars as string) : ((m.yes_ask as number) || 0) / 100
        const price = (bid > 0 && ask > 0) ? (bid + ask) / 2 : (ask || bid || 0)
        const label = (m.yes_sub_title as string) || (m.subtitle as string) || (m.title as string) || 'Option'
        return { label: label.length > 60 ? label.substring(0, 57) + '...' : label, price, tokenId: m.ticker as string }
      })
    }

    const totalVolume = eventMarkets.reduce((s: number, m: Record<string, unknown>) => s + ((m.volume as number) || 0), 0)

    markets.push({
      id: event.event_ticker,
      platform: 'kalshi',
      title: event.title + (event.sub_title ? ` - ${event.sub_title}` : ''),
      category: event.category,
      url: `https://kalshi.com/markets/${event.event_ticker}`,
      outcomes,
      volume: totalVolume,
      volume24h: eventMarkets.reduce((s: number, m: Record<string, unknown>) => s + ((m.volume_24h as number) || 0), 0),
      liquidity: eventMarkets.reduce((s: number, m: Record<string, unknown>) => s + (parseFloat((m.liquidity_dollars as string) || '0')), 0),
      status: 'active',
      endDate: primary.close_time,
      slug: event.event_ticker,
      extra: { seriesTicker: event.series_ticker, primaryTicker: primary.ticker },
    })
  }

  return { markets, cursor: data.cursor }
}
