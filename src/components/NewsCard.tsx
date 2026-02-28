'use client'
import { ExternalLink, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { NewsItem, Market } from '@/lib/types'
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants'

interface NewsCardProps {
  news: NewsItem
  relatedMarkets?: Market[]
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NewsCard({ news, relatedMarkets }: NewsCardProps) {
  return (
    <div className="border border-border rounded-lg p-3 sm:p-4 space-y-2 hover:border-border/80 transition-colors bg-card/50">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium leading-snug hover:underline line-clamp-2 cursor-pointer"
          >
            {news.title}
          </a>
        </div>
        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-1 rounded hover:bg-muted transition-colors cursor-pointer"
          aria-label={`Read full article: ${news.title}`}
        >
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </a>
      </div>

      {news.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{news.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-normal">
            {news.source}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeAgo(news.publishedAt)}
          </span>
        </div>

        {relatedMarkets && relatedMarkets.length > 0 && (
          <div className="flex items-center gap-1">
            {relatedMarkets.slice(0, 2).map((m) => (
              <span
                key={m.id}
                className="inline-block h-2 w-2 rounded-full"
                role="img"
                style={{ backgroundColor: PLATFORM_COLORS[m.platform] }}
                title={`Related: ${m.title} (${PLATFORM_LABELS[m.platform]})`}
                aria-label={`Related market on ${PLATFORM_LABELS[m.platform]}: ${m.title}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
