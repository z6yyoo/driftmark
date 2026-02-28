'use client'
import { Newspaper } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NewsCard } from './NewsCard'
import { NewsItem, Market } from '@/lib/types'
import { findRelatedMarkets } from '@/lib/news/matcher'

interface NewsSectionProps {
  news: NewsItem[]
  markets: Market[]
  loading: boolean
}

export function NewsSection({ news, markets, loading }: NewsSectionProps) {
  if (loading && news.length === 0) {
    return (
      <div className="space-y-2 pr-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-3 space-y-2 animate-pulse">
            <div className="h-4 bg-muted/50 rounded w-3/4" />
            <div className="h-3 bg-muted/30 rounded w-full" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-muted/40 rounded-full" />
              <div className="h-3 w-12 bg-muted/30 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (news.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Newspaper className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No news available</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-3 pr-2">
        {news.slice(0, 30).map((item) => (
          <NewsCard
            key={item.id}
            news={item}
            relatedMarkets={findRelatedMarkets(item, markets)}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
