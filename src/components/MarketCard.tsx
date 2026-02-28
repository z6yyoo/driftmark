'use client'
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ProbabilityBar } from './ProbabilityBar'
import { Market } from '@/lib/types'
import { PLATFORM_COLORS, PLATFORM_LABELS } from '@/lib/constants'
import { PriceSnapshot } from '@/lib/types'

interface MarketCardProps {
  market: Market
  snapshot?: PriceSnapshot
}

export function MarketCard({ market, snapshot }: MarketCardProps) {
  const leadPrice = market.outcomes[0]?.price ?? 0
  const changeFromSnapshot = snapshot ? (leadPrice - snapshot.price) * 100 : 0
  const hasChange = Math.abs(changeFromSnapshot) >= 0.1
  const platformColor = PLATFORM_COLORS[market.platform]

  return (
    <Card className="group border border-border bg-card hover:border-[var(--hover-color)] transition-colors duration-200 will-change-transform"
      style={{ '--hover-color': `${platformColor}40` } as React.CSSProperties}
    >
      <CardContent className="p-3 sm:p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium leading-snug line-clamp-2">
              {market.title}
            </h3>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={market.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-1 rounded hover:bg-muted transition-colors cursor-pointer"
                aria-label={`Open ${market.title} on ${PLATFORM_LABELS[market.platform]}`}
              >
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            </TooltipTrigger>
            <TooltipContent>View on {PLATFORM_LABELS[market.platform]}</TooltipContent>
          </Tooltip>
        </div>

        <div className="space-y-1.5">
          {market.outcomes.slice(0, 3).map((outcome, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground truncate w-20 shrink-0">
                {outcome.label}
              </span>
              <ProbabilityBar
                price={outcome.price}
                platform={market.platform}
                className="flex-1"
              />
            </div>
          ))}
          {market.outcomes.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{market.outcomes.length - 3} more outcomes
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <Badge
            variant="outline"
            className="text-xs font-normal border-current/20"
            style={{ color: platformColor }}
          >
            {PLATFORM_LABELS[market.platform]}
          </Badge>

          <div className="flex items-center gap-2">
            {hasChange && (
              <span className={`flex items-center gap-0.5 text-xs font-medium ${changeFromSnapshot > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {changeFromSnapshot > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {changeFromSnapshot > 0 ? '+' : ''}{changeFromSnapshot.toFixed(1)}%
              </span>
            )}
            {market.volume24h > 0 && (
              <span className="text-xs text-muted-foreground tabular-nums">
                ${market.volume24h >= 1000000
                  ? (market.volume24h / 1000000).toFixed(1) + 'M'
                  : market.volume24h >= 1000
                    ? (market.volume24h / 1000).toFixed(0) + 'K'
                    : Number(market.volume24h).toFixed(0)
                } 24h
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
