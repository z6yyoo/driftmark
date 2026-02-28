import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { RSS_FEEDS } from '@/lib/news/rss-feeds'

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'MarketAlertMonitor/1.0' },
})

interface CachedNews {
  items: Array<{
    id: string
    title: string
    description: string
    url: string
    source: string
    publishedAt: string
    category?: string
  }>
  timestamp: number
}

let cache: CachedNews | null = null
const CACHE_TTL = 5 * 60 * 1000

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.items, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  }

  const allItems: CachedNews['items'] = []

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url)
        return (parsed.items || []).slice(0, 15).map((item) => ({
          id: item.guid || item.link || `${feed.name}-${item.title}`,
          title: item.title || '',
          description: (item.contentSnippet || item.content || '').slice(0, 300),
          url: item.link || '',
          source: feed.name,
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          category: feed.category,
        }))
      } catch {
        return []
      }
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value)
    }
  }

  allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const uniqueItems = allItems.filter((item, index, self) =>
    index === self.findIndex(t => t.title === item.title)
  ).slice(0, 100)

  cache = { items: uniqueItems, timestamp: Date.now() }

  return NextResponse.json(uniqueItems, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  })
}
